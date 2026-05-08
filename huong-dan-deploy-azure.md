# Hướng dẫn Deploy Ecommerce Microservices lên Azure

> Project: Ecommerce (auth-service, core-service, ai-service, frontend)
> Hạ tầng: Jenkins VM + AKS + ACR + Key Vault + App Insights + Terraform
> Chiến lược: Blue-Green Deployment
> Domain: `haadtech.shop` (frontend) | `api.haadtech.shop` (backend API)

---

## Tổng quan kiến trúc triển khai

```
Developer (VS Code)
    → git push main (GitHub)
        → Jenkins (haadtech-jenkins-vm) tự động:
            1. Pull code
            2. Load secrets từ Azure Key Vault
            3. Sync K8s Secrets
            4. Run tests (auth + core)
            5. Build Docker images (Python FastAPI cho AI)
            6. Push images → haadtechacr2026 (ACR)
            7. Deploy Blue/Green → haadtech-aks (AKS)
            8. Build + deploy frontend → App Service
        → Azure Monitor + App Insights giám sát
```

### Mapping Azure Resources

| Resource | Tên | Vai trò |
|---|---|---|
| Kubernetes Service | haadtech-aks | Chạy backend microservices (Blue-Green) |
| Container Registry | haadtechacr2026 | Lưu Docker images |
| App Service | haadtech-web-2026 | Host frontend (React static) |
| App Service Plan | haadtech-asp | Plan cho App Service |
| Virtual Machine | haadtech-jenkins-vm | Jenkins + Docker |
| Key Vault | haadtechkv2026IS402 | Lưu secrets (DB URLs, JWT, API keys) |
| Application Insights | haadtech-appinsights | Monitoring |
| Log Analytics | haadtech-law | Logging tập trung |
| Public IP | haadtech-jenkins-pip | IP cho Jenkins VM |

### Cổng dịch vụ

| Service | Cổng ngoài (Service K8s) | Cổng container |
|---|---|---|
| auth-service | 3001 | 3001 (Node.js) |
| core-service | 3003 | 3003 (Node.js) |
| ai-service | 3002 | **8000** (Python FastAPI) |
| frontend | 80 | 80 (nginx) |

> **Lưu ý AI Service:** Container Python FastAPI lắng nghe port **8000**. K8s Service ánh xạ `3002 → 8000`. Ingress vẫn dùng `3002` như cũ, không cần đổi.

---

## PHẦN 1: CẤU HÌNH AZURE KEY VAULT

Key Vault lưu **tất cả** secrets — Jenkins đọc từ đây, không hardcode bất kỳ giá trị nào.

### Bước 1.1: Thêm secrets vào Key Vault

SSH vào Jenkins VM hoặc dùng Azure CLI (Cloud Shell):

```bash
# Login Azure CLI (nếu chưa)
az login

# ── Auth Service ──────────────────────────────────────────────────────────
az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "auth-database-url" \
  --value "postgresql://user:pass@host/auth_db?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "jwt-secret" \
  --value "your-jwt-secret-min-32-chars"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "jwt-refresh-secret" \
  --value "your-jwt-refresh-secret-min-32-chars"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "smtp-user" \
  --value "your-email@gmail.com"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "smtp-pass" \
  --value "your-gmail-app-password"

# ── Core Service ──────────────────────────────────────────────────────────
az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "core-database-url" \
  --value "postgresql://user:pass@host/neondb?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "stripe-secret-key" \
  --value "sk_test_your_stripe_key"

# ── AI Service (Python FastAPI) ───────────────────────────────────────────
az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "ai-database-url" \
  --value "postgresql://user:pass@host/ai_db?sslmode=require"

az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "groq-api-key" \
  --value "gsk_your_groq_api_key"

# ── ACR credentials ───────────────────────────────────────────────────────
az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "acr-username" \
  --value "haadtechacr2026"

ACR_PASS=$(az acr credential show --name haadtechacr2026 --query "passwords[0].value" -o tsv)
az keyvault secret set --vault-name haadtechkv2026IS402 \
  --name "acr-password" \
  --value "$ACR_PASS"
```

### Bước 1.2: Cấp quyền Managed Identity cho Jenkins VM

```bash
RESOURCE_GROUP="HAADTechRG_IS402"

# Bật Managed Identity cho VM
az vm identity assign \
  --resource-group $RESOURCE_GROUP \
  --name haadtech-jenkins-vm

# Lấy principal ID
VM_PRINCIPAL_ID=$(az vm identity show \
  --resource-group $RESOURCE_GROUP \
  --name haadtech-jenkins-vm \
  --query principalId -o tsv)

# Cấp quyền đọc secrets
az keyvault set-policy \
  --name haadtechkv2026IS402 \
  --object-id $VM_PRINCIPAL_ID \
  --secret-permissions get list

echo "✅ VM Principal ID: $VM_PRINCIPAL_ID"
```

---

## PHẦN 2: CẤU HÌNH JENKINS

### Bước 2.1: Cài đặt plugins cần thiết

SSH vào Jenkins VM, mở `http://<JENKINS_PUBLIC_IP>:8080`

Vào **Manage Jenkins → Plugins → Available plugins**, cài:

1. **Git** — kết nối GitHub
2. **Pipeline** — Jenkinsfile pipeline
3. **Docker Pipeline** — build Docker trong pipeline
4. **Kubernetes CLI** — chạy kubectl từ Jenkins
5. **Azure Credentials** — kết nối Azure
6. **NodeJS** — cài Node.js cho build frontend và test auth/core
7. **Blue Ocean** (tuỳ chọn) — UI pipeline đẹp hơn

Sau khi cài, restart Jenkins.

### Bước 2.2: Cấu hình NodeJS Tool

Vào **Manage Jenkins → Tools → NodeJS → Add NodeJS**:
- Name: `NodeJS-20`
- Version: `20.x`
- Install automatically: ✅

> Python **không** cần cài trong Jenkins vì AI service được build bên trong Docker image. Jenkins chỉ gọi `docker build`.

### Bước 2.3: Cấu hình Credentials

Vào **Manage Jenkins → Credentials → System → Global → Add Credentials**:

**GitHub PAT (để pull code):**
- Kind: Username with password
- Username: `your-github-username`
- Password: GitHub Personal Access Token
- ID: `github-credentials`

> ACR credentials **không** cần thêm vào Jenkins nữa — pipeline tự đọc từ Key Vault qua Managed Identity.

### Bước 2.4: Cài kubectl + kết nối AKS

SSH vào Jenkins VM:

```bash
# Cài kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Kết nối AKS
az aks get-credentials \
  --resource-group HAADTechRG_IS402 \
  --name haadtech-aks \
  --admin

# Kiểm tra
kubectl get nodes
```

### Bước 2.5: Gắn ACR với AKS (một lần duy nhất)

```bash
az aks update \
  --resource-group HAADTechRG_IS402 \
  --name haadtech-aks \
  --attach-acr haadtechacr2026
```

---

## PHẦN 3: CẤU HÌNH KUBERNETES (AKS) — BLUE-GREEN DEPLOYMENT

### Bước 3.1: Tạo Namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### Bước 3.2: Cài cert-manager (Let's Encrypt TLS)

```bash
# Cài cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.4/cert-manager.yaml

# Chờ cert-manager ready
kubectl wait --namespace cert-manager \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/instance=cert-manager \
  --timeout=120s

# Tạo ClusterIssuer cho Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: thaisonpham243@gmail.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

### Bước 3.3: Cài Nginx Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s

# Lấy External IP của Ingress (đợi 1-2 phút)
kubectl get svc -n ingress-nginx ingress-nginx-controller
```

### Bước 3.4: Cấu hình DNS

Sau khi có External IP của Ingress controller:

```bash
INGRESS_IP=$(kubectl get svc -n ingress-nginx ingress-nginx-controller \
  -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
echo "Ingress IP: $INGRESS_IP"
```

Vào nhà cung cấp DNS (Namecheap, Cloudflare, GoDaddy…):

| Bản ghi | Host | Giá trị | TTL |
|---|---|---|---|
| A | `api` | `<INGRESS_IP>` | 300 |
| A | `@` hoặc `www` | IP App Service | 300 |

> **Lưu ý:** `api.haadtech.shop` trỏ vào AKS Ingress. `haadtech.shop` trỏ vào Azure App Service.

### Bước 3.5: Tạo K8s Secrets từ Key Vault

```bash
VAULT="haadtechkv2026IS402"
NS="ecommerce"

kubectl delete secret auth-secrets  -n $NS --ignore-not-found
kubectl create secret generic auth-secrets \
  --namespace=$NS \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name $VAULT --name auth-database-url --query value -o tsv)" \
  --from-literal=JWT_SECRET="$(az keyvault secret show --vault-name $VAULT --name jwt-secret --query value -o tsv)" \
  --from-literal=JWT_REFRESH_SECRET="$(az keyvault secret show --vault-name $VAULT --name jwt-refresh-secret --query value -o tsv)" \
  --from-literal=SMTP_USER="$(az keyvault secret show --vault-name $VAULT --name smtp-user --query value -o tsv)" \
  --from-literal=SMTP_PASS="$(az keyvault secret show --vault-name $VAULT --name smtp-pass --query value -o tsv)"

kubectl delete secret core-secrets -n $NS --ignore-not-found
kubectl create secret generic core-secrets \
  --namespace=$NS \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name $VAULT --name core-database-url --query value -o tsv)" \
  --from-literal=STRIPE_SECRET_KEY="$(az keyvault secret show --vault-name $VAULT --name stripe-secret-key --query value -o tsv)"

kubectl delete secret ai-secrets -n $NS --ignore-not-found
kubectl create secret generic ai-secrets \
  --namespace=$NS \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name $VAULT --name ai-database-url --query value -o tsv)" \
  --from-literal=GROQ_API_KEY="$(az keyvault secret show --vault-name $VAULT --name groq-api-key --query value -o tsv)"

echo "✅ K8s secrets created"
```

### Bước 3.6: Apply ConfigMap và Ingress

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/ingress.yaml
```

Nội dung `k8s/configmap.yaml` hiện tại đã đúng:

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
  ALLOWED_ORIGINS: "https://haadtech.shop,https://www.haadtech.shop"
  FRONTEND_URL: "https://haadtech.shop"
  GROQ_MODEL: "llama3-8b-8192"
  GROQ_MAX_TOKENS: "1024"
  MAX_CHAT_HISTORY: "50"
  # ... (các giá trị còn lại giữ nguyên)
```

Nội dung `k8s/ingress.yaml` hiện tại đã đúng với TLS và cert-manager:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ecommerce-ingress
  namespace: ecommerce
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "300"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://haadtech.shop"
    nginx.ingress.kubernetes.io/enable-cors: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - api.haadtech.shop
    secretName: api-haadtech-tls    # cert-manager tự tạo
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
              number: 3002    # K8s Service 3002 → container 8000
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: core-service
            port:
              number: 3003
```

### Bước 3.7: Apply tất cả K8s manifests (lần đầu)

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

## PHẦN 4: DOCKER IMAGE CHO AI SERVICE (Python FastAPI)

### Cấu trúc thư mục

```
backend/ai-service/
├── Dockerfile          ← Python image (không dùng Node.js)
├── requirements.txt
├── chatbot/
│   ├── app/main.py     ← FastAPI entrypoint
│   ├── api/            ← chat, suggest, products, upload
│   ├── config/setting.py
│   ├── llm/            ← LangChain Groq client + RAG
│   ├── vectorstore/    ← ChromaDB / FAISS
│   ├── ingestion/      ← Document loader
│   ├── utils/
│   └── data/raw/       ← ecommerce_knowledge.md
└── suggest/            ← Rule engine, scoring, cross-sell
```

### Dockerfile (hiện tại trong repo)

```dockerfile
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgomp1 \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p chatbot/vectorstore/chromadb chatbot/data/raw logs \
    && chmod -R 777 chatbot/vectorstore chatbot/data logs

RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# WORKDIR quan trọng: uvicorn chạy từ thư mục chatbot/
# để "from api import ..." và "from suggest import ..." resolve đúng
WORKDIR /app/chatbot

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=15s --start-period=120s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Build thủ công (để kiểm tra)

```bash
cd backend/ai-service
docker build -t haadtechacr2026.azurecr.io/ai-service:blue .
docker run --rm -p 8000:8000 \
  -e GROQ_API_KEY="gsk_xxx" \
  -e CORE_SERVICE_URL="http://host.docker.internal:3003" \
  -e ALLOWED_ORIGINS="http://localhost:5173" \
  haadtechacr2026.azurecr.io/ai-service:blue

# Test
curl http://localhost:8000/health
```

> **Lưu ý thời gian khởi động:** Container tải sentence-transformers model và ChromaDB khi start. Mất khoảng **60–90 giây** trước khi pod Ready. K8s manifest đã cấu hình `initialDelaySeconds: 60` cho readiness probe.

---

## PHẦN 5: DEPLOY THỦ CÔNG LẦN ĐẦU

Thứ tự bắt buộc khi deploy lần đầu (trước khi Jenkins pipeline chạy):

### Phase 1 — Hạ tầng K8s

```bash
kubectl apply -f k8s/namespace.yaml
```

### Phase 2 — K8s Secrets + ConfigMap

```bash
# (Chạy lệnh từ Bước 3.5 ở trên)
kubectl apply -f k8s/configmap.yaml
```

### Phase 3 — Build & Push Docker images (tag :blue)

Trên Jenkins VM (hoặc máy có Docker + az login):

```bash
ACR="haadtechacr2026.azurecr.io"
az acr login --name haadtechacr2026

# Auth service
docker build -t $ACR/auth-service:blue ./backend/auth-service
docker push $ACR/auth-service:blue

# Core service
docker build -t $ACR/core-service:blue ./backend/core-service
docker push $ACR/core-service:blue

# AI service (Python — build lâu hơn ~5-10 phút lần đầu do tải ML libs)
docker build -t $ACR/ai-service:blue ./backend/ai-service
docker push $ACR/ai-service:blue
```

### Phase 4 — Apply K8s Deployments

```bash
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/core-service.yaml
kubectl apply -f k8s/ai-service.yaml

# Kiểm tra pods (ai-service mất 60-90s mới Ready)
kubectl get pods -n ecommerce -w
```

### Phase 5 — Cài Ingress + TLS

```bash
# (Đã cài Nginx Ingress Controller và cert-manager ở Bước 3.2, 3.3)
kubectl apply -f k8s/ingress.yaml

# Kiểm tra cert-manager đang cấp TLS
kubectl get certificate -n ecommerce
kubectl describe certificate api-haadtech-tls -n ecommerce
```

> Cert-manager mất 2–5 phút để cấp chứng chỉ Let's Encrypt. Chờ `READY = True`.

### Phase 6 — Kiểm tra giao tiếp services

```bash
# Port-forward để test local
kubectl port-forward svc/auth-service 3001:3001 -n ecommerce &
kubectl port-forward svc/core-service 3003:3003 -n ecommerce &
kubectl port-forward svc/ai-service 3002:8000 -n ecommerce &

# Test auth
curl http://localhost:3001/health

# Test core
curl http://localhost:3003/health

# Test AI (Python FastAPI — qua port-forward 3002 → container 8000)
curl http://localhost:3002/health
# Expected: {"status":"healthy","model_type":"groq","llm_configured":true}

# Test chat endpoint
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"chuột gaming dưới 500k","use_rag":true}'
```

### Phase 7 — Build & Deploy Frontend

```bash
cd Ecommerce_Website

# Tạo .env với domain thật
cat > .env << 'EOF'
VITE_AUTH_SERVICE_URL=https://api.haadtech.shop/api/auth
VITE_AI_SERVICE_URL=https://api.haadtech.shop/api/ai
VITE_CORE_SERVICE_URL=https://api.haadtech.shop/api
EOF

npm ci && npm run build

# Deploy lên App Service
cd dist && zip -r ../frontend.zip . && cd ..
az webapp deploy \
  --resource-group HAADTechRG_IS402 \
  --name haadtech-web-2026 \
  --src-path frontend.zip \
  --type zip
```

---

## PHẦN 6: CẤU HÌNH GITHUB WEBHOOK → JENKINS

### Bước 6.1: Tạo Webhook

1. Vào GitHub repo → **Settings → Webhooks → Add webhook**
2. Payload URL: `http://<JENKINS_PUBLIC_IP>:8080/github-webhook/`
3. Content type: `application/json`
4. Events: **Just the push event**
5. Active: ✅

### Bước 6.2: Tạo Jenkins Pipeline Job

1. Vào Jenkins → **New Item** → **Pipeline**
2. Tên: `ecommerce-deploy`
3. Cấu hình:
   - **Build Triggers**: ✅ GitHub hook trigger for GITScm polling
   - **Pipeline → Definition**: Pipeline script from SCM
   - SCM: Git
   - Repository URL: `https://github.com/<your-username>/Project_dtdm.git`
   - Credentials: `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

---

## PHẦN 7: JENKINSFILE — CI/CD PIPELINE

File `Jenkinsfile` trong repo thực hiện 12 stages:

| Stage | Mô tả |
|---|---|
| 1. Checkout | Pull code |
| 2. Load Secrets | Đọc 10 secrets từ Key Vault qua Managed Identity |
| 3. Determine Slot | Xác định Blue/Green slot hiện tại |
| 4. Sync K8s Secrets | Tạo/cập nhật K8s Secrets từ Key Vault |
| 5. Test Auth | `npm test` auth-service |
| 6. Test Core | `npm test` core-service |
| 7. Build Docker | Build 3 images (Python cho AI) |
| 8. Push to ACR | Push images lên Azure Container Registry |
| 9. Deploy to Slot | Scale up slot mới, chờ Ready (AI timeout 300s) |
| 10. Smoke Test | Health check auth (3001), core (3003), AI (8000) |
| 11. Switch Traffic | Chuyển K8s Service sang slot mới |
| 12. Build Frontend | Build React với domain thật, deploy App Service |

### Lưu ý quan trọng về AI Service trong Jenkinsfile

```groovy
// AI service timeout = 300s (Python cần tải model)
kubectl rollout status deployment/ai-service-${NEW_SLOT} \
    -n ${AKS_NAMESPACE} --timeout=300s

// Smoke test AI dùng Python (không dùng wget)
kubectl exec ${aiPod} -n ${AKS_NAMESPACE} -- \
    python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

// Frontend build dùng domain thật
VITE_AUTH_SERVICE_URL=https://api.haadtech.shop/api/auth
VITE_AI_SERVICE_URL=https://api.haadtech.shop/api/ai
VITE_CORE_SERVICE_URL=https://api.haadtech.shop/api
```

---

## PHẦN 8: CẤU HÌNH FRONTEND TRÊN APP SERVICE

### Bước 8.1: Cấu hình SPA routing

Tạo file `Ecommerce_Website/public/web.config` (Vite copy vào dist/):

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

### Bước 8.2: Cấu hình custom domain trên App Service (tuỳ chọn)

```bash
# Thêm custom domain haadtech.shop vào App Service
az webapp config hostname add \
  --resource-group HAADTechRG_IS402 \
  --webapp-name haadtech-web-2026 \
  --hostname haadtech.shop

# Bật HTTPS
az webapp config ssl bind \
  --resource-group HAADTechRG_IS402 \
  --name haadtech-web-2026 \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```

---

## PHẦN 9: AZURE MONITOR + APPLICATION INSIGHTS

### Bước 9.1: Tích hợp App Insights vào Node.js services

```bash
cd backend/auth-service && npm install applicationinsights
cd backend/core-service && npm install applicationinsights
```

Thêm vào **dòng đầu tiên** của `src/app.js` (auth + core):

```javascript
if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  const appInsights = require('applicationinsights');
  appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
    .setAutoCollectRequests(true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .start();
}
```

### Bước 9.2: Thêm connection string vào ConfigMap

```bash
APP_INSIGHTS_CONN=$(az monitor app-insights component show \
  --app haadtech-appinsights \
  --resource-group HAADTechRG_IS402 \
  --query connectionString -o tsv)

kubectl patch configmap ecommerce-config -n ecommerce \
  --type merge \
  -p "{\"data\":{\"APPLICATIONINSIGHTS_CONNECTION_STRING\":\"${APP_INSIGHTS_CONN}\"}}"
```

### Bước 9.3: Bật Container Insights cho AKS

```bash
az aks enable-addons \
  --resource-group HAADTechRG_IS402 \
  --name haadtech-aks \
  --addons monitoring \
  --workspace-resource-id $(az monitor log-analytics workspace show \
      --resource-group HAADTechRG_IS402 \
      --workspace-name haadtech-law \
      --query id -o tsv)
```

---

## PHẦN 10: TERRAFORM — INFRASTRUCTURE AS CODE

```hcl
# infrastructure/terraform/main.tf
terraform {
  required_providers {
    azurerm = { source = "hashicorp/azurerm", version = "~> 3.0" }
  }
}

provider "azurerm" { features {} }

variable "resource_group_name" { default = "HAADTechRG_IS402" }
variable "location"            { default = "East Asia" }

resource "azurerm_container_registry" "acr" {
  name                = "haadtechacr2026"
  resource_group_name = var.resource_group_name
  location            = var.location
  sku                 = "Basic"
  admin_enabled       = true
}

resource "azurerm_kubernetes_cluster" "aks" {
  name                = "haadtech-aks"
  location            = var.location
  resource_group_name = var.resource_group_name
  dns_prefix          = "haadtech"

  default_node_pool {
    name       = "default"
    node_count = 2
    vm_size    = "Standard_B2s"
  }

  identity { type = "SystemAssigned" }
}

resource "azurerm_role_assignment" "aks_acr" {
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id
  role_definition_name = "AcrPull"
  scope                = azurerm_container_registry.acr.id
}

resource "azurerm_key_vault" "kv" {
  name                     = "haadtechkv2026IS402"
  location                 = var.location
  resource_group_name      = var.resource_group_name
  tenant_id                = data.azurerm_client_config.current.tenant_id
  sku_name                 = "standard"
  purge_protection_enabled = false
}

data "azurerm_client_config" "current" {}

resource "azurerm_service_plan" "asp" {
  name                = "haadtech-asp"
  location            = var.location
  resource_group_name = var.resource_group_name
  os_type             = "Linux"
  sku_name            = "B1"
}

resource "azurerm_linux_web_app" "frontend" {
  name                = "haadtech-web-2026"
  location            = var.location
  resource_group_name = var.resource_group_name
  service_plan_id     = azurerm_service_plan.asp.id

  site_config {
    application_stack { node_version = "20-lts" }
  }
}
```

> Vì hạ tầng đã tạo, dùng `terraform import` để import resources hiện có.

---

## PHẦN 11: THỨ TỰ THỰC HIỆN — CHECKLIST ĐẦY ĐỦ

### Phase 1 — Chuẩn bị Azure

- [ ] SSH vào Jenkins VM, kiểm tra Docker (`docker version`) và Jenkins (`systemctl status jenkins`)
- [ ] Cài kubectl trên Jenkins VM
- [ ] `az aks get-credentials --resource-group HAADTechRG_IS402 --name haadtech-aks --admin`
- [ ] `az acr login --name haadtechacr2026`
- [ ] `az aks update --attach-acr haadtechacr2026` (gắn ACR với AKS)
- [ ] Thêm tất cả 10 secrets vào Key Vault (`az keyvault secret set ...`)
- [ ] Cấp Managed Identity cho Jenkins VM truy cập Key Vault

### Phase 2 — Kubernetes Setup

- [ ] `kubectl apply -f k8s/namespace.yaml`
- [ ] Cài cert-manager
- [ ] Tạo ClusterIssuer `letsencrypt-prod`
- [ ] Cài Nginx Ingress Controller
- [ ] Lấy Ingress External IP → cấu hình DNS `api.haadtech.shop → IP`
- [ ] Tạo K8s Secrets (từ Key Vault)
- [ ] `kubectl apply -f k8s/configmap.yaml`

### Phase 3 — Deploy thủ công lần đầu

- [ ] Build + push `auth-service:blue` lên ACR
- [ ] Build + push `core-service:blue` lên ACR
- [ ] Build + push `ai-service:blue` lên ACR (**Python image, build ~5–10 phút**)
- [ ] `kubectl apply -f k8s/auth-service.yaml`
- [ ] `kubectl apply -f k8s/core-service.yaml`
- [ ] `kubectl apply -f k8s/ai-service.yaml`
- [ ] `kubectl get pods -n ecommerce -w` — chờ tất cả Running/Ready
- [ ] `kubectl apply -f k8s/ingress.yaml`
- [ ] `kubectl get certificate -n ecommerce` — chờ TLS `READY=True`

### Phase 4 — Test Services

- [ ] `curl https://api.haadtech.shop/api/auth/health`
- [ ] `curl https://api.haadtech.shop/api/health` (core)
- [ ] `curl https://api.haadtech.shop/api/ai/health` → `{"status":"healthy","llm_configured":true}`
- [ ] Test chat: `curl -X POST https://api.haadtech.shop/api/ai/api/chat -d '{"message":"..."}'`

### Phase 5 — Deploy Frontend

- [ ] Build React với env `VITE_*_URL=https://api.haadtech.shop/api/...`
- [ ] `az webapp deploy ...` lên App Service
- [ ] Truy cập `https://haadtech.shop` kiểm tra giao diện và gọi API thành công

### Phase 6 — Cấu hình CI/CD Jenkins

- [ ] Cài Jenkins plugins (Git, Pipeline, Docker Pipeline, Kubernetes CLI, NodeJS)
- [ ] Tạo credential `github-credentials`
- [ ] Tạo GitHub webhook
- [ ] Tạo Pipeline job `ecommerce-deploy` trỏ vào `Jenkinsfile`
- [ ] Test: push commit vào `main` → Jenkins tự chạy pipeline
- [ ] Kiểm tra Blue-Green switch thành công

### Phase 7 — Monitoring

- [ ] Tích hợp Application Insights vào auth + core services
- [ ] Thêm connection string vào ConfigMap
- [ ] Bật Container Insights cho AKS
- [ ] Kiểm tra logs trên Azure Portal

---

## KIỂM TRA SAU KHI DEPLOY

```bash
# Tất cả pods đang chạy
kubectl get pods -n ecommerce

# Ingress và TLS
kubectl get ingress -n ecommerce
kubectl get certificate -n ecommerce

# Test từng service qua domain
curl https://api.haadtech.shop/api/auth/health
curl https://api.haadtech.shop/api/health
curl https://api.haadtech.shop/api/ai/health

# Test AI chatbot
curl -X POST https://api.haadtech.shop/api/ai/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"tìm chuột gaming dưới 500k","use_rag":true,"conversation_history":[]}'
```

---

## SCRIPT BLUE-GREEN SWITCH THỦ CÔNG

```bash
#!/bin/bash
# switch-slot.sh <new_slot>   (blue | green)
NEW_SLOT=$1
NAMESPACE=ecommerce

for SVC in auth-service core-service ai-service; do
    kubectl patch svc $SVC -n $NAMESPACE \
        -p "{\"spec\":{\"selector\":{\"app\":\"$SVC\",\"slot\":\"$NEW_SLOT\"}}}"
    echo "Switched $SVC → $NEW_SLOT"
done

kubectl get svc -n $NAMESPACE
```

---

## TROUBLESHOOTING

### AI Service không start (CrashLoopBackOff / OOMKilled)

```bash
kubectl logs -n ecommerce -l app=ai-service --tail=100
kubectl describe pod -n ecommerce -l app=ai-service
```

Nguyên nhân thường gặp:
- **OOMKilled**: Tăng memory limit trong `k8s/ai-service.yaml` (hiện tại 1536Mi, tăng lên 2048Mi nếu cần)
- **GROQ_API_KEY rỗng**: Kiểm tra `kubectl get secret ai-secrets -n ecommerce -o jsonpath='{.data.GROQ_API_KEY}' | base64 -d`
- **SQLite quá cũ**: Image đã cài sqlite3 đủ mới, nếu vẫn lỗi thêm `pysqlite3-binary` vào requirements.txt

### AI Service timeout trong Jenkinsfile

```bash
# Xem log pod đang khởi động
kubectl logs -n ecommerce deployment/ai-service-green -f
```

Nếu thường xuyên timeout, tăng `--timeout` trong Jenkinsfile từ 300s lên 420s.

### Ingress không có External IP

```bash
kubectl get svc -n ingress-nginx
# Nếu EXTERNAL-IP = <pending> quá 5 phút → kiểm tra quota IP của subscription Azure
```

### TLS cert không được cấp

```bash
kubectl describe certificaterequest -n ecommerce
kubectl describe order -n ecommerce
# Lỗi thường: DNS chưa trỏ đúng hoặc firewall block port 80 (ACME challenge dùng HTTP-01)
```

### ACR Pull Error (ImagePullBackOff)

```bash
az aks check-acr \
  --name haadtech-aks \
  --resource-group HAADTechRG_IS402 \
  --acr haadtechacr2026.azurecr.io
```

### Database Connection Error

```bash
# Kiểm tra secret
kubectl get secret ai-secrets -n ecommerce \
  -o jsonpath='{.data.DATABASE_URL}' | base64 -d
```
