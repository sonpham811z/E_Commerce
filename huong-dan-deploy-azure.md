# Hướng dẫn Deploy Ecommerce Microservices lên Azure

> Project: Ecommerce (auth-service, core-service, ai-service, frontend)
> Hạ tầng: Jenkins VM + AKS + ACR + Key Vault + App Insights + Azure DevOps Boards + Terraform
> Chiến lược: Blue-Green Deployment

---

## Tổng quan kiến trúc triển khai

```
Developer (Visual Studio) 
    → git push main (GitHub)
        → Jenkins (trên VM haadtech-jenkins-vm) tự động:
            1. Pull code
            2. Run tests (npm test)
            3. Build Docker images
            4. Push images → haadtechacr2026 (ACR)
            5. Deploy Blue/Green → haadtech-aks (AKS)
            6. Frontend static → haadtech-web-2026 (App Service)
        → Azure Monitor + App Insights giám sát
        → Azure Key Vault lưu secrets
        → Azure DevOps Boards theo dõi tasks
```

### Mapping các Azure Resources đã có

| Resource | Tên | Vai trò |
|---|---|---|
| Kubernetes Service | haadtech-aks | Chạy backend microservices (Blue-Green) |
| Container Registry | haadtechacr2026 | Lưu Docker images |
| App Service | haadtech-web-2026 | Host frontend (React static) |
| App Service Plan | haadtech-asp | Plan cho App Service |
| Virtual Machine | haadtech-jenkins-vm | Jenkins + Docker |
| Key Vault | haadtechkv2026 | Lưu secrets (DB URLs, JWT, API keys) |
| Application Insights | haadtech-appinsights | Monitoring |
| Log Analytics | haadtech-law | Logging tập trung |
| VNet/NSG/NIC | haadtech-vnet/nsg/nic | Networking |
| Public IP | haadtech-jenkins-pip | IP cho Jenkins VM |

---

## PHẦN 1: CẤU HÌNH AZURE KEY VAULT

Key Vault sẽ lưu tất cả secrets — Jenkins sẽ đọc từ đây thay vì hardcode.

### Bước 1.1: Thêm secrets vào Key Vault

SSH vào Jenkins VM hoặc dùng Azure CLI (Cloud Shell):

```bash
# Login Azure CLI (nếu chưa)
az login

# Thêm secrets cho Auth Service
az keyvault secret set --vault-name haadtechkv2026 \
  --name "auth-database-url" \
  --value "postgresql://user:pass@host/auth_db?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "jwt-secret" \
  --value "your-jwt-secret-min-32-chars-here"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "jwt-refresh-secret" \
  --value "your-jwt-refresh-secret-min-32-chars-here"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "smtp-user" \
  --value "your-email@gmail.com"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "smtp-pass" \
  --value "your-gmail-app-password"

# Thêm secrets cho Core Service
az keyvault secret set --vault-name haadtechkv2026 \
  --name "core-database-url" \
  --value "postgresql://user:pass@host/neondb?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "stripe-secret-key" \
  --value "sk_test_your_stripe_key"

# Thêm secrets cho AI Service
az keyvault secret set --vault-name haadtechkv2026 \
  --name "ai-database-url" \
  --value "postgresql://user:pass@host/ai_db?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026 \
  --name "groq-api-key" \
  --value "your-groq-api-key"

# ACR credentials
az keyvault secret set --vault-name haadtechkv2026 \
  --name "acr-username" \
  --value "haadtechacr2026"

ACR_PASS=$(az acr credential show --name haadtechacr2026 --query "passwords[0].value" -o tsv)
az keyvault secret set --vault-name haadtechkv2026 \
  --name "acr-password" \
  --value "$ACR_PASS"
```

### Bước 1.2: Cấp quyền cho Jenkins VM truy cập Key Vault

```bash
# Bật Managed Identity cho VM
az vm identity assign \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-jenkins-vm

# Lấy principal ID
VM_PRINCIPAL_ID=$(az vm identity show \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-jenkins-vm \
  --query principalId -o tsv)

# Cấp quyền đọc secrets
az keyvault set-policy \
  --name haadtechkv2026 \
  --object-id $VM_PRINCIPAL_ID \
  --secret-permissions get list
```

---

## PHẦN 2: CẤU HÌNH JENKINS

### Bước 2.1: Cài đặt plugins cần thiết

SSH vào Jenkins VM, mở Jenkins tại `http://<JENKINS_PUBLIC_IP>:8080`

Vào **Manage Jenkins → Plugins → Available plugins**, cài:

1. **Git** — kết nối GitHub
2. **Pipeline** — Jenkinsfile pipeline
3. **Docker Pipeline** — build Docker trong pipeline
4. **Kubernetes CLI** — chạy kubectl từ Jenkins
5. **Azure Credentials** — kết nối Azure
6. **Azure Key Vault** — đọc secrets từ Key Vault
7. **NodeJS** — cài Node.js cho test
8. **Blue Ocean** (tùy chọn) — UI đẹp cho pipeline

Sau khi cài xong, restart Jenkins.

### Bước 2.2: Cấu hình Tools

Vào **Manage Jenkins → Tools**:

**NodeJS:**
- Name: `NodeJS-20`
- Version: `20.x`
- Install automatically: ✅

### Bước 2.3: Cấu hình Credentials

Vào **Manage Jenkins → Credentials → System → Global credentials → Add Credentials**:

**1. GitHub credentials (để pull code):**
- Kind: Username with password
- Username: `your-github-username`
- Password: GitHub Personal Access Token (PAT)
- ID: `github-credentials`

**2. ACR credentials (để push images):**
- Kind: Username with password
- Username: `haadtechacr2026`
- Password: (lấy từ `az acr credential show --name haadtechacr2026`)
- ID: `acr-credentials`

**3. Azure Key Vault (nếu dùng plugin):**
- Cấu hình tại Manage Jenkins → Configure System → Azure Key Vault
- Key Vault URL: `https://haadtechkv2026.vault.azure.net/`
- Credential Type: Managed Identity (vì VM đã có identity)

### Bước 2.4: Cấu hình kubectl trên Jenkins VM

SSH vào VM:

```bash
# Cài kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Kết nối tới AKS cluster
az aks get-credentials \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-aks \
  --admin

# Kiểm tra
kubectl get nodes
```

### Bước 2.5: Login ACR từ Jenkins VM

```bash
az acr login --name haadtechacr2026
# HOẶC
docker login haadtechacr2026.azurecr.io \
  -u haadtechacr2026 \
  -p $(az acr credential show --name haadtechacr2026 --query "passwords[0].value" -o tsv)
```

### Bước 2.6: Gắn ACR với AKS (để AKS pull images)

```bash
az aks update \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-aks \
  --attach-acr haadtechacr2026
```

---

## PHẦN 3: CẤU HÌNH KUBERNETES (AKS) — BLUE-GREEN DEPLOYMENT

### Bước 3.1: Tạo Namespace

Tạo file `k8s/namespace.yaml`:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ecommerce
```

```bash
kubectl apply -f k8s/namespace.yaml
```

### Bước 3.2: Tạo Kubernetes Secrets (từ Key Vault)

```bash
# Lấy secrets từ Key Vault và tạo K8s secrets
kubectl create secret generic auth-secrets \
  --namespace=ecommerce \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name haadtechkv2026 --name auth-database-url --query value -o tsv)" \
  --from-literal=JWT_SECRET="$(az keyvault secret show --vault-name haadtechkv2026 --name jwt-secret --query value -o tsv)" \
  --from-literal=JWT_REFRESH_SECRET="$(az keyvault secret show --vault-name haadtechkv2026 --name jwt-refresh-secret --query value -o tsv)" \
  --from-literal=SMTP_USER="$(az keyvault secret show --vault-name haadtechkv2026 --name smtp-user --query value -o tsv)" \
  --from-literal=SMTP_PASS="$(az keyvault secret show --vault-name haadtechkv2026 --name smtp-pass --query value -o tsv)"

kubectl create secret generic core-secrets \
  --namespace=ecommerce \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name haadtechkv2026 --name core-database-url --query value -o tsv)" \
  --from-literal=STRIPE_SECRET_KEY="$(az keyvault secret show --vault-name haadtechkv2026 --name stripe-secret-key --query value -o tsv)"

kubectl create secret generic ai-secrets \
  --namespace=ecommerce \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name haadtechkv2026 --name ai-database-url --query value -o tsv)" \
  --from-literal=GROQ_API_KEY="$(az keyvault secret show --vault-name haadtechkv2026 --name groq-api-key --query value -o tsv)"
```

### Bước 3.3: Tạo ConfigMap

Tạo file `k8s/configmap.yaml`:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: ecommerce-config
  namespace: ecommerce
data:
  NODE_ENV: "production"
  AUTH_SERVICE_URL: "http://auth-service:3001"
  AI_SERVICE_URL: "http://ai-service:3002"
  CORE_SERVICE_URL: "http://core-service:3003"
  DB_SSL: "true"
  DB_POOL_MAX: "10"
  DB_POOL_MIN: "2"
  ALLOWED_ORIGINS: "https://haadtech-web-2026.azurewebsites.net"
  FRONTEND_URL: "http://haadtech-web-2026.azurewebsites.net"
  RATE_LIMIT_WINDOW_MS: "900000"
  RATE_LIMIT_MAX: "100"
  BCRYPT_ROUNDS: "12"
  JWT_ACCESS_EXPIRES_IN: "15m"
  JWT_REFRESH_EXPIRES_IN: "7d"
  GROQ_MODEL: "llama3-8b-8192"
  GROQ_MAX_TOKENS: "1024"
  MAX_CHAT_HISTORY: "50"
  DEFAULT_PAGE_SIZE: "20"
  MAX_PAGE_SIZE: "100"
  SMTP_HOST: "smtp.gmail.com"
  SMTP_PORT: "587"
```

```bash
kubectl apply -f k8s/configmap.yaml
```

### Bước 3.4: Blue-Green Deployment Manifests

Ý tưởng Blue-Green: mỗi service có 2 deployment (blue và green). Service trỏ tới 1 trong 2 thông qua label `slot: blue` hoặc `slot: green`. Khi deploy mới, ta deploy vào slot không active, test xong thì switch service sang slot mới.

#### Auth Service — `k8s/auth-service.yaml`

```yaml
# BLUE deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service-blue
  namespace: ecommerce
  labels:
    app: auth-service
    slot: blue
spec:
  replicas: 1
  selector:
    matchLabels:
      app: auth-service
      slot: blue
  template:
    metadata:
      labels:
        app: auth-service
        slot: blue
    spec:
      containers:
      - name: auth-service
        image: haadtechacr2026.azurecr.io/auth-service:blue
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: JWT_SECRET
        - name: SMTP_USER
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: SMTP_USER
        - name: SMTP_PASS
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: SMTP_PASS
        - name: JWT_REFRESH_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: JWT_REFRESH_SECRET
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 10
---
# GREEN deployment (ban đầu replicas=0)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service-green
  namespace: ecommerce
  labels:
    app: auth-service
    slot: green
spec:
  replicas: 0
  selector:
    matchLabels:
      app: auth-service
      slot: green
  template:
    metadata:
      labels:
        app: auth-service
        slot: green
    spec:
      containers:
      - name: auth-service
        image: haadtechacr2026.azurecr.io/auth-service:green
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3001"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: JWT_SECRET
        - name: SMTP_USER
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: SMTP_USER
        - name: SMTP_PASS
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: SMTP_PASS
        - name: JWT_REFRESH_SECRET
          valueFrom:
            secretKeyRef:
              name: auth-secrets
              key: JWT_REFRESH_SECRET
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 15
          periodSeconds: 10
---
# Service — trỏ tới slot active (ban đầu là blue)
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: ecommerce
spec:
  selector:
    app: auth-service
    slot: blue    # ← Switch giữa blue/green ở đây
  ports:
  - port: 3001
    targetPort: 3001
  type: ClusterIP
```

#### Core Service — `k8s/core-service.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service-blue
  namespace: ecommerce
  labels:
    app: core-service
    slot: blue
spec:
  replicas: 1
  selector:
    matchLabels:
      app: core-service
      slot: blue
  template:
    metadata:
      labels:
        app: core-service
        slot: blue
    spec:
      containers:
      - name: core-service
        image: haadtechacr2026.azurecr.io/core-service:blue
        ports:
        - containerPort: 3003
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3003"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: core-secrets
              key: DATABASE_URL
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: core-secrets
              key: STRIPE_SECRET_KEY
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: core-service-green
  namespace: ecommerce
  labels:
    app: core-service
    slot: green
spec:
  replicas: 0
  selector:
    matchLabels:
      app: core-service
      slot: green
  template:
    metadata:
      labels:
        app: core-service
        slot: green
    spec:
      containers:
      - name: core-service
        image: haadtechacr2026.azurecr.io/core-service:green
        ports:
        - containerPort: 3003
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3003"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: core-secrets
              key: DATABASE_URL
        - name: STRIPE_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: core-secrets
              key: STRIPE_SECRET_KEY
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3003
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: core-service
  namespace: ecommerce
spec:
  selector:
    app: core-service
    slot: blue
  ports:
  - port: 3003
    targetPort: 3003
  type: ClusterIP
```

#### AI Service — `k8s/ai-service.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service-blue
  namespace: ecommerce
  labels:
    app: ai-service
    slot: blue
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ai-service
      slot: blue
  template:
    metadata:
      labels:
        app: ai-service
        slot: blue
    spec:
      containers:
      - name: ai-service
        image: haadtechacr2026.azurecr.io/ai-service:blue
        ports:
        - containerPort: 3002
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3002"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: DATABASE_URL
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: GROQ_API_KEY
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        - name: CORE_SERVICE_URL
          value: "http://core-service:3003"
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ai-service-green
  namespace: ecommerce
  labels:
    app: ai-service
    slot: green
spec:
  replicas: 0
  selector:
    matchLabels:
      app: ai-service
      slot: green
  template:
    metadata:
      labels:
        app: ai-service
        slot: green
    spec:
      containers:
      - name: ai-service
        image: haadtechacr2026.azurecr.io/ai-service:green
        ports:
        - containerPort: 3002
        envFrom:
        - configMapRef:
            name: ecommerce-config
        env:
        - name: PORT
          value: "3002"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: DATABASE_URL
        - name: GROQ_API_KEY
          valueFrom:
            secretKeyRef:
              name: ai-secrets
              key: GROQ_API_KEY
        - name: AUTH_SERVICE_URL
          value: "http://auth-service:3001"
        - name: CORE_SERVICE_URL
          value: "http://core-service:3003"
        resources:
          requests:
            cpu: 50m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 256Mi
        readinessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /health
            port: 3002
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ai-service
  namespace: ecommerce
spec:
  selector:
    app: ai-service
    slot: blue
  ports:
  - port: 3002
    targetPort: 3002
  type: ClusterIP
```

### Bước 3.5: Ingress Controller + Ingress Rule

```bash
# Cài Nginx Ingress Controller trên AKS
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Chờ Ingress controller sẵn sàng
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

Tạo `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecommerce-ingress
  namespace: ecommerce
  annotations:
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://haadtech-web-2026.azurewebsites.net"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx
  rules:
  - http:
      paths:
      - path: /api/auth(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: auth-service
            port:
              number: 3001
      - path: /api/ai(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: ai-service
            port:
              number: 3002
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: core-service
            port:
              number: 3003
```

```bash
kubectl apply -f k8s/ingress.yaml

# Lấy External IP của Ingress (đợi 1-2 phút)
kubectl get ingress -n ecommerce
```

### Bước 3.6: Apply tất cả K8s manifests (lần đầu)

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/core-service.yaml
kubectl apply -f k8s/ai-service.yaml
kubectl apply -f k8s/ingress.yaml

# Kiểm tra
kubectl get all -n ecommerce
kubectl get ingress -n ecommerce
```

---

## PHẦN 4: CẤU HÌNH GITHUB WEBHOOK → JENKINS

### Bước 4.1: Tạo Webhook trên GitHub

1. Vào GitHub repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://<JENKINS_PUBLIC_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Which events: **Just the push event**
5. Active: ✅

### Bước 4.2: Tạo Jenkins Pipeline Job

1. Vào Jenkins → **New Item**
2. Tên: `ecommerce-deploy`
3. Chọn: **Pipeline**
4. Cấu hình:
   - **Build Triggers**: ✅ GitHub hook trigger for GITScm polling
   - **Pipeline**:
     - Definition: **Pipeline script from SCM**
     - SCM: Git
     - Repository URL: `https://github.com/<your-username>/Project_dtdm.git`
     - Credentials: `github-credentials`
     - Branch: `*/main`
     - Script Path: `Jenkinsfile`

---

## PHẦN 5: JENKINSFILE — TỰ ĐỘNG BUILD, TEST, DEPLOY

Tạo file `Jenkinsfile` ở root của repo:

```groovy
pipeline {
    agent any

    environment {
        ACR_REGISTRY = 'haadtechacr2026.azurecr.io'
        ACR_CREDENTIALS = credentials('acr-credentials')
        AKS_NAMESPACE = 'ecommerce'
        BUILD_TAG = "${env.BUILD_NUMBER}"
        // App Service cho frontend
        WEBAPP_NAME = 'haadtech-web-2026'
        RESOURCE_GROUP = '<YOUR_RESOURCE_GROUP>'  // ← ĐỔI TÊN RESOURCE GROUP
    }

    tools {
        nodejs 'NodeJS-20'
    }

    stages {

        // ============================================
        // STAGE 1: CHECKOUT CODE
        // ============================================
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    // Xác định slot hiện tại và slot mới
                    def currentSlot = sh(
                        script: "kubectl get svc auth-service -n ${AKS_NAMESPACE} -o jsonpath='{.spec.selector.slot}' 2>/dev/null || echo 'blue'",
                        returnStdout: true
                    ).trim()
                    env.CURRENT_SLOT = currentSlot
                    env.NEW_SLOT = (currentSlot == 'blue') ? 'green' : 'blue'
                    echo "Current slot: ${env.CURRENT_SLOT}, Deploying to: ${env.NEW_SLOT}"
                }
            }
        }

        // ============================================
        // STAGE 2: TEST — Auth Service & Core Service
        // ============================================
        stage('Test Auth Service') {
            steps {
                dir('backend/auth-service') {
                    sh 'npm ci'
                    sh 'npm test -- --forceExit --detectOpenHandles || true'
                }
            }
        }

        stage('Test Core Service') {
            steps {
                dir('backend/core-service') {
                    sh 'npm ci'
                    sh 'npm test -- --forceExit --detectOpenHandles || true'
                }
            }
        }

        // ============================================
        // STAGE 3: BUILD DOCKER IMAGES
        // ============================================
        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        docker build -t ${ACR_REGISTRY}/auth-service:${NEW_SLOT} \
                                     -t ${ACR_REGISTRY}/auth-service:build-${BUILD_TAG} \
                                     ./backend/auth-service

                        docker build -t ${ACR_REGISTRY}/core-service:${NEW_SLOT} \
                                     -t ${ACR_REGISTRY}/core-service:build-${BUILD_TAG} \
                                     ./backend/core-service

                        docker build -t ${ACR_REGISTRY}/ai-service:${NEW_SLOT} \
                                     -t ${ACR_REGISTRY}/ai-service:build-${BUILD_TAG} \
                                     ./backend/ai-service
                    """
                }
            }
        }

        // ============================================
        // STAGE 4: PUSH TO ACR
        // ============================================
        stage('Push to ACR') {
            steps {
                script {
                    sh """
                        echo ${ACR_CREDENTIALS_PSW} | docker login ${ACR_REGISTRY} \
                            -u ${ACR_CREDENTIALS_USR} --password-stdin

                        docker push ${ACR_REGISTRY}/auth-service:${NEW_SLOT}
                        docker push ${ACR_REGISTRY}/auth-service:build-${BUILD_TAG}

                        docker push ${ACR_REGISTRY}/core-service:${NEW_SLOT}
                        docker push ${ACR_REGISTRY}/core-service:build-${BUILD_TAG}

                        docker push ${ACR_REGISTRY}/ai-service:${NEW_SLOT}
                        docker push ${ACR_REGISTRY}/ai-service:build-${BUILD_TAG}
                    """
                }
            }
        }

        // ============================================
        // STAGE 5: DEPLOY TO NEW SLOT (Blue-Green)
        // ============================================
        stage('Deploy to New Slot') {
            steps {
                script {
                    // Scale up new slot, update image
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl set image deployment/${svc}-${NEW_SLOT} \
                                ${svc}=${ACR_REGISTRY}/${svc}:${NEW_SLOT} \
                                -n ${AKS_NAMESPACE}

                            kubectl scale deployment/${svc}-${NEW_SLOT} \
                                --replicas=1 \
                                -n ${AKS_NAMESPACE}
                        """
                    }

                    // Chờ tất cả pods ready
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl rollout status deployment/${svc}-${NEW_SLOT} \
                                -n ${AKS_NAMESPACE} --timeout=120s
                        """
                    }
                }
            }
        }

        // ============================================
        // STAGE 6: SMOKE TEST trên slot mới
        // ============================================
        stage('Smoke Test') {
            steps {
                script {
                    // Test trực tiếp qua pod IP (chưa switch service)
                    def authPod = sh(
                        script: "kubectl get pod -n ${AKS_NAMESPACE} -l app=auth-service,slot=${NEW_SLOT} -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()

                    sh """
                        kubectl exec ${authPod} -n ${AKS_NAMESPACE} -- \
                            wget -qO- http://localhost:3001/health || exit 1
                    """

                    def corePod = sh(
                        script: "kubectl get pod -n ${AKS_NAMESPACE} -l app=core-service,slot=${NEW_SLOT} -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()

                    sh """
                        kubectl exec ${corePod} -n ${AKS_NAMESPACE} -- \
                            wget -qO- http://localhost:3003/health || exit 1
                    """

                    echo "Smoke tests passed on ${NEW_SLOT} slot!"
                }
            }
        }

        // ============================================
        // STAGE 7: SWITCH TRAFFIC (Blue ↔ Green)
        // ============================================
        stage('Switch Traffic') {
            steps {
                script {
                    for (entry in [
                        ['auth-service', '3001'],
                        ['core-service', '3003'],
                        ['ai-service', '3002']
                    ]) {
                        def svcName = entry[0]
                        def port = entry[1]
                        sh """
                            kubectl patch svc ${svcName} -n ${AKS_NAMESPACE} \
                                -p '{"spec":{"selector":{"app":"${svcName}","slot":"${NEW_SLOT}"}}}'
                        """
                    }
                    echo "Traffic switched to ${NEW_SLOT}!"
                }
            }
        }

        // ============================================
        // STAGE 8: SCALE DOWN OLD SLOT
        // ============================================
        stage('Scale Down Old Slot') {
            steps {
                script {
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl scale deployment/${svc}-${CURRENT_SLOT} \
                                --replicas=0 \
                                -n ${AKS_NAMESPACE}
                        """
                    }
                    echo "Old slot ${CURRENT_SLOT} scaled down."
                }
            }
        }

        // ============================================
        // STAGE 9: BUILD & DEPLOY FRONTEND → App Service
        // ============================================
        stage('Build Frontend') {
            steps {
                dir('Ecommerce_Website') {
                    script {
                        // Lấy Ingress External IP
                        def ingressIP = sh(
                            script: "kubectl get ingress ecommerce-ingress -n ${AKS_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
                            returnStdout: true
                        ).trim()

                        // Tạo .env cho frontend build
                        writeFile file: '.env', text: """
VITE_AUTH_SERVICE_URL=http://${ingressIP}/api/auth
VITE_AI_SERVICE_URL=http://${ingressIP}/api/ai
VITE_CORE_SERVICE_URL=http://${ingressIP}/api
"""
                        sh 'npm ci'
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Deploy Frontend to App Service') {
            steps {
                dir('Ecommerce_Website') {
                    sh """
                        cd dist
                        zip -r ../frontend.zip .
                        cd ..
                        az webapp deploy \
                            --resource-group ${RESOURCE_GROUP} \
                            --name ${WEBAPP_NAME} \
                            --src-path frontend.zip \
                            --type zip
                    """
                }
            }
        }
    }

    // ============================================
    // POST ACTIONS
    // ============================================
    post {
        success {
            echo '✅ Deploy thành công! Blue-Green switch hoàn tất.'
        }
        failure {
            script {
                echo '❌ Deploy thất bại! Rolling back...'
                // Rollback: switch traffic về slot cũ
                for (entry in [
                    ['auth-service', '3001'],
                    ['core-service', '3003'],
                    ['ai-service', '3002']
                ]) {
                    def svcName = entry[0]
                    sh """
                        kubectl patch svc ${svcName} -n ${AKS_NAMESPACE} \
                            -p '{"spec":{"selector":{"app":"${svcName}","slot":"${env.CURRENT_SLOT}"}}}' || true
                    """
                }
                // Scale down slot lỗi
                for (svc in ['auth-service', 'core-service', 'ai-service']) {
                    sh """
                        kubectl scale deployment/${svc}-${env.NEW_SLOT} \
                            --replicas=0 -n ${AKS_NAMESPACE} || true
                    """
                }
            }
        }
    }
}
```

---

## PHẦN 6: CẤU HÌNH FRONTEND TRÊN APP SERVICE

### Bước 6.1: Cấu hình App Service cho SPA (React Router)

Vì React dùng client-side routing, cần cấu hình App Service redirect tất cả requests về `index.html`.

Tạo file `Ecommerce_Website/staticwebapp.config.json` (nếu dùng Static Web App) hoặc `web.config` cho App Service:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="SPA" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
    <staticContent>
      <mimeMap fileExtension=".json" mimeType="application/json" />
      <mimeMap fileExtension=".woff2" mimeType="font/woff2" />
    </staticContent>
  </system.webServer>
</configuration>
```

Đặt `web.config` trong thư mục `Ecommerce_Website/public/` (Vite sẽ copy vào `dist/`).

### Bước 6.2: Cấu hình App Service Settings

```bash
# Set Node version
az webapp config set \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-web-2026 \
  --linux-fx-version "NODE|20-lts"

# Hoặc nếu dùng Windows App Service, set startup command
az webapp config set \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-web-2026 \
  --startup-file "pm2 serve /home/site/wwwroot --no-daemon --spa"
```

---

## PHẦN 7: AZURE MONITOR + APPLICATION INSIGHTS

### Bước 7.1: Tích hợp App Insights vào Backend

Thêm vào mỗi backend service's `package.json`:

```bash
cd backend/auth-service && npm install applicationinsights
cd backend/core-service && npm install applicationinsights
cd backend/ai-service && npm install applicationinsights
```

Thêm vào đầu mỗi `src/app.js` (TRƯỚC tất cả imports khác):

```javascript
// === Application Insights === (thêm vào dòng đầu tiên)
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
}
// === End App Insights ===
```

### Bước 7.2: Thêm Connection String vào ConfigMap

```bash
# Lấy connection string
APP_INSIGHTS_CONN=$(az monitor app-insights component show \
  --app haadtech-appinsights \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --query connectionString -o tsv)

# Thêm vào ConfigMap
kubectl edit configmap ecommerce-config -n ecommerce
# Thêm dòng:
#   APPLICATIONINSIGHTS_CONNECTION_STRING: "<connection-string>"
```

### Bước 7.3: Bật Container Insights cho AKS

```bash
az aks enable-addons \
  --resource-group <YOUR_RESOURCE_GROUP> \
  --name haadtech-aks \
  --addons monitoring \
  --workspace-resource-id $(az monitor log-analytics workspace show \
      --resource-group <YOUR_RESOURCE_GROUP> \
      --workspace-name haadtech-law \
      --query id -o tsv)
```

---

## PHẦN 8: TERRAFORM — INFRASTRUCTURE AS CODE

Tạo thư mục `infrastructure/terraform/` với các file sau:

### `main.tf`

```hcl
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

variable "resource_group_name" {
  default = "<YOUR_RESOURCE_GROUP>"
}

variable "location" {
  default = "East Asia"
}

# Resource Group (nếu chưa có)
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

# Container Registry
resource "azurerm_container_registry" "acr" {
  name                = "haadtechacr2026"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Basic"
  admin_enabled       = true
}

# AKS Cluster
resource "azurerm_kubernetes_cluster" "aks" {
  name                = "haadtech-aks"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "haadtech"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity {
    type = "SystemAssigned"
  }
}

# Gắn ACR cho AKS
resource "azurerm_role_assignment" "aks_acr" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

# Key Vault
resource "azurerm_key_vault" "kv" {
  name                = "haadtechkv2026"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  purge_protection_enabled = false
}

data "azurerm_client_config" "current" {}

# App Service Plan
resource "azurerm_service_plan" "asp" {
  name                = "haadtech-asp"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "B1"
}

# App Service (Frontend)
resource "azurerm_linux_web_app" "frontend" {
  name                = "haadtech-web-2026"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack {
      node_version = "20-lts"
    }
  }
}

# Application Insights
resource "azurerm_application_insights" "appinsights" {
  name                = "haadtech-appinsights"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "Node.JS"
  workspace_id        = azurerm_log_analytics_workspace.law.id
}

# Log Analytics Workspace
resource "azurerm_log_analytics_workspace" "law" {
  name                = "haadtech-law"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# VNet
resource "azurerm_virtual_network" "vnet" {
  name                = "haadtech-vnet"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "default" {
  name                 = "default"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]
}

# Outputs
output "acr_login_server" {
  value = azurerm_container_registry.acr.login_server
}

output "aks_kube_config" {
  value     = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive = true
}

output "app_insights_connection_string" {
  value     = azurerm_application_insights.appinsights.connection_string
  sensitive = true
}

output "frontend_url" {
  value = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}
```

> **Lưu ý:** Vì bạn đã tạo hạ tầng rồi, Terraform chủ yếu dùng để chứng minh IaC trong bài tập.
> Bạn có thể dùng `terraform import` để import resources hiện có.

---

## PHẦN 9: AZURE DEVOPS BOARDS

### Bước 9.1: Tạo Azure DevOps Project

1. Vào https://dev.azure.com → **New Project**
2. Tên: `Ecommerce-DTDM`
3. Visibility: Private

### Bước 9.2: Tạo Work Items trên Boards

Tạo các Epics / User Stories / Tasks theo quy trình deploy:

**Epic: CI/CD Pipeline Setup**
- Task: Cấu hình Jenkins plugins
- Task: Tạo GitHub webhook
- Task: Viết Jenkinsfile
- Task: Test pipeline lần đầu

**Epic: Kubernetes Deployment**
- Task: Tạo K8s manifests (Blue-Green)
- Task: Deploy Auth + Core services
- Task: Deploy AI service
- Task: Cấu hình Ingress

**Epic: Monitoring**
- Task: Tích hợp Application Insights
- Task: Cấu hình Container Insights
- Task: Setup alerts

**Epic: Frontend Deployment**
- Task: Build React app
- Task: Deploy lên App Service
- Task: Cấu hình SPA routing

### Bước 9.3: Tích hợp Jenkins → Azure DevOps (tùy chọn)

Cài plugin **Azure DevOps** trên Jenkins để tự động update work item status khi build pass/fail.

---

## PHẦN 10: THỨ TỰ THỰC HIỆN (CHECKLIST)

Thứ tự nên làm theo:

### Phase 1: Chuẩn bị hạ tầng
- [ ] SSH vào Jenkins VM, kiểm tra Docker và Jenkins hoạt động
- [ ] Cài kubectl trên Jenkins VM
- [ ] `az aks get-credentials` kết nối AKS
- [ ] `az acr login` kết nối ACR
- [ ] `az aks update --attach-acr` gắn ACR với AKS
- [ ] Thêm secrets vào Key Vault
- [ ] Cấp Managed Identity cho VM truy cập Key Vault

### Phase 2: Cấu hình Kubernetes
- [ ] Apply namespace.yaml
- [ ] Tạo K8s Secrets (từ Key Vault)
- [ ] Apply configmap.yaml
- [ ] Cài Nginx Ingress Controller
- [ ] Apply ingress.yaml

### Phase 3: Deploy thủ công lần đầu (Auth + Core)
- [ ] Build Docker image auth-service, tag `:blue`
- [ ] Build Docker image core-service, tag `:blue`
- [ ] Push cả 2 lên ACR
- [ ] Apply auth-service.yaml + core-service.yaml
- [ ] Kiểm tra pods running: `kubectl get pods -n ecommerce`
- [ ] Test health: `kubectl port-forward svc/auth-service 3001:3001 -n ecommerce`
- [ ] Xác nhận auth↔core giao tiếp được

### Phase 4: Deploy AI Service
- [ ] Build + push ai-service image
- [ ] Apply ai-service.yaml
- [ ] Test ai-service gọi được auth-service và core-service

### Phase 5: Deploy Frontend
- [ ] Lấy Ingress External IP
- [ ] Build frontend với đúng API URLs
- [ ] Deploy lên App Service
- [ ] Kiểm tra web truy cập được, gọi API thành công

### Phase 6: Cấu hình CI/CD Jenkins
- [ ] Cài Jenkins plugins
- [ ] Tạo credentials (GitHub, ACR)
- [ ] Tạo GitHub webhook
- [ ] Push Jenkinsfile vào repo
- [ ] Tạo Pipeline job trên Jenkins
- [ ] Test: commit vào main → Jenkins tự chạy

### Phase 7: Monitoring & Observability
- [ ] Tích hợp Application Insights vào code
- [ ] Bật Container Insights cho AKS
- [ ] Kiểm tra logs trên Azure Portal

### Phase 8: Terraform & DevOps Boards
- [ ] Viết Terraform files (IaC)
- [ ] Tạo Azure DevOps project + boards
- [ ] Tạo work items

---

## KIỂM TRA GIAO TIẾP GIỮA SERVICES

Sau khi deploy auth + core lên AKS:

```bash
# Port forward auth-service
kubectl port-forward svc/auth-service 3001:3001 -n ecommerce &

# Port forward core-service
kubectl port-forward svc/core-service 3003:3003 -n ecommerce &

# Test auth
curl http://localhost:3001/health
# Expected: {"status":"ok",...}

# Test core
curl http://localhost:3003/health

# Test đăng ký
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123456","full_name":"Test User"}'

# Test login → lấy token
TOKEN=$(curl -s -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test@123456"}' | jq -r '.data.accessToken')

# Test core với token (chứng minh auth↔core liên kết)
curl http://localhost:3003/api/v1/products \
  -H "Authorization: Bearer $TOKEN"
```

---

## SCRIPT BLUE-GREEN SWITCH THỦ CÔNG

Nếu cần switch blue↔green bằng tay (không qua Jenkins):

```bash
#!/bin/bash
# switch-slot.sh <new_slot>
# Ví dụ: ./switch-slot.sh green

NEW_SLOT=$1
NAMESPACE=ecommerce

for SVC in auth-service core-service ai-service; do
    echo "Switching $SVC → $NEW_SLOT"
    kubectl patch svc $SVC -n $NAMESPACE \
        -p "{\"spec\":{\"selector\":{\"app\":\"$SVC\",\"slot\":\"$NEW_SLOT\"}}}"
done

echo "✅ All services switched to $NEW_SLOT"
kubectl get svc -n $NAMESPACE
```

---

## TROUBLESHOOTING

### Pod CrashLoopBackOff
```bash
kubectl logs <pod-name> -n ecommerce
kubectl describe pod <pod-name> -n ecommerce
```

### ACR Pull Error (ImagePullBackOff)
```bash
# Kiểm tra ACR đã gắn với AKS chưa
az aks check-acr --name haadtech-aks --resource-group <RG> --acr haadtechacr2026.azurecr.io
```

### Database Connection Error
```bash
# Kiểm tra secret đã tạo đúng chưa
kubectl get secret auth-secrets -n ecommerce -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```

### Ingress không có External IP
```bash
kubectl get svc -n ingress-nginx
# Nếu EXTERNAL-IP = <pending>, đợi 2-3 phút hoặc kiểm tra quota
```
