<p align="center">
  <a href="https://www.uit.edu.vn/" title="Trường Đại học Công nghệ Thông tin" style="border: none;">
    <img src="https://i.imgur.com/WmMnSRt.png" alt="UIT Logo" width="200">
  </a>
</p>

<h1 align="center"><b>ĐIỆN TOÁN ĐÁM MÂY</b></h1>
<h2 align="center">Quản lý Website Thương mại điện tử trên Azure</h2>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Microsoft%20Azure-0078D4?style=flat-square&logo=microsoftazure" alt="Azure">
  <img src="https://img.shields.io/badge/Orchestration-Kubernetes%20(AKS)-326CE5?style=flat-square&logo=kubernetes" alt="AKS">
  <img src="https://img.shields.io/badge/CI%2FCD-Jenkins-D24939?style=flat-square&logo=jenkins" alt="Jenkins">
  <img src="https://img.shields.io/badge/Strategy-Blue--Green%20Deployment-2ECC71?style=flat-square" alt="Blue-Green">
  <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC?style=flat-square&logo=terraform" alt="Terraform">
</p>

---

## Thông tin đồ án

| Mục | Nội dung |
|-----|----------|
| **Tên đồ án** | Quản lý Website Thương mại điện tử trên Azure |
| **Môn học** | Điện toán đám mây |
| **Trường** | Đại học Công nghệ Thông tin – ĐHQG TP.HCM |
| **Năm học** | 2025 – 2026 |

---

## Thành viên thực hiện

| Họ và tên | MSSV |
|-----------|------|
| Huỳnh Trần Anh Thư | 23521535|
| Phạm Thái Sơn | 23521361|
| Phạm Gia Quyền |23521323|
| Đặng Thiên Ân | 23520003|

---

##  Mục tiêu đồ án

Đồ án xây dựng và triển khai hệ thống thương mại điện tử theo kiến trúc **microservices** trên nền tảng **Microsoft Azure**, với các mục tiêu chính:

- Ứng dụng các dịch vụ Azure cloud vào hệ thống thực tế (AKS, ACR, Key Vault, App Insights...)
- Triển khai CI/CD tự động với **Jenkins** và chiến lược **Blue-Green Deployment** đảm bảo zero-downtime
- Quản lý secrets tập trung qua **Azure Key Vault**, không hardcode credentials
- Giám sát hệ thống real-time với **Azure Application Insights** và **Log Analytics**
- Quản lý hạ tầng theo mô hình **Infrastructure as Code** với Terraform
- Theo dõi tiến độ dự án với **Azure DevOps Boards**

---

##  Công nghệ & Azure Resources

### Backend Microservices

| Service | Công nghệ | Port | Vai trò |
|---------|-----------|------|---------|
| `auth-service` | Node.js | 3001 | Xác thực JWT, quản lý người dùng |
| `core-service` | Node.js | 3003 | Sản phẩm, đơn hàng, thanh toán Stripe |
| `ai-service` | Node.js | 3002 | Gợi ý AI với Groq (llama3-8b-8192) |

### Frontend

| Công nghệ | Mô tả |
|-----------|-------|
| ReactJS (Vite) | Single Page Application |
| Azure App Service | Hosting static build |

### Azure Infrastructure

| Resource | Tên | Vai trò |
|----------|-----|---------|
| Azure Kubernetes Service | `haadtech-aks` | Chạy backend microservices (Blue-Green) |
| Azure Container Registry | `haadtechacr2026` | Lưu Docker images |
| Azure App Service | `haadtech-web-2026` | Host frontend React |
| App Service Plan | `haadtech-asp` | Plan cho App Service |
| Virtual Machine | `haadtech-jenkins-vm` | Jenkins CI/CD server + Docker |
| Azure Key Vault | `haadtechkv2026` | Lưu secrets (DB URLs, JWT, API keys) |
| Application Insights | `haadtech-appinsights` | Monitoring & tracing |
| Log Analytics Workspace | `haadtech-law` | Logging tập trung |
| VNet / NSG / NIC | `haadtech-vnet/nsg/nic` | Networking |
| Public IP | `haadtech-jenkins-pip` | IP public cho Jenkins VM |

---

##  Kiến trúc hệ thống

```
Developer (Visual Studio)
    └─► git push → GitHub (main branch)
            └─► Webhook → Jenkins VM (haadtech-jenkins-vm)
                    ├─ [1] Checkout code & detect Blue/Green slot
                    ├─ [2] npm test (auth-service, core-service)
                    ├─ [3] Docker build images
                    ├─ [4] Push images → haadtechacr2026 (ACR)
                    ├─ [5] Deploy to new slot (AKS)
                    ├─ [6] Smoke test trên slot mới
                    ├─ [7] Switch traffic Blue ↔ Green
                    └─ [8] Scale down old slot
                            ├─► haadtech-aks (AKS) — Blue-Green
                            │       ├─ auth-service  :3001
                            │       ├─ ai-service    :3002
                            │       └─ core-service  :3003
                            │               └─ Nginx Ingress Controller
                            └─► haadtech-web-2026 (App Service) — Frontend
```

### Luồng request người dùng

```
User / Browser
    └─► https://haadtech-web-2026.azurewebsites.net  (React SPA)
            └─► Nginx Ingress (External IP)
                    ├─ /api/auth/*  → auth-service:3001
                    ├─ /api/ai/*   → ai-service:3002
                    └─ /api/*      → core-service:3003
```

---

## 🚀 CI/CD Pipeline — Blue-Green Deployment

Dự án áp dụng chiến lược **Blue-Green Deployment** để đảm bảo **zero-downtime** khi deploy.

### Nguyên lý hoạt động

```
          ┌─────────────┐        ┌─────────────┐
Traffic ──►  BLUE (active) │  hoặc │ GREEN (active)│◄── Traffic
          │  replicas: 1 │        │  replicas: 1  │
          └─────────────┘        └───────────────┘
                │                        │
          GREEN (standby)          BLUE (standby)
          replicas: 0              replicas: 0
```

### Các bước Jenkins Pipeline

| Stage | Mô tả |
|-------|-------|
| `Checkout` | Pull code, xác định slot hiện tại (blue/green) |
| `Test` | Chạy `npm test` cho auth-service và core-service |
| `Build` | Build Docker images với tag `blue`/`green` + `build-{BUILD_NUMBER}` |
| `Push to ACR` | Push images lên `haadtechacr2026.azurecr.io` |
| `Deploy new slot` | Scale up deployment mới, cập nhật image |
| `Smoke Test` | Test `/health` endpoint trực tiếp trên pod mới |
| `Switch Traffic` | `kubectl patch svc` chuyển selector sang slot mới |
| `Scale Down` | Scale down slot cũ về `replicas: 0` |
| `Frontend` | Build React với Ingress IP, deploy lên App Service |

### Rollback tự động

Nếu pipeline thất bại ở bất kỳ bước nào, Jenkins tự động switch traffic về slot cũ và scale down slot lỗi.

---

## 🔐 Bảo mật — Azure Key Vault

Toàn bộ secrets được lưu trong **Azure Key Vault** (`haadtechkv2026`), không hardcode trong code hay Dockerfile.

| Secret Name | Dịch vụ |
|-------------|---------|
| `auth-database-url` | PostgreSQL cho auth-service |
| `jwt-secret` | JWT signing key |
| `smtp-user` / `smtp-pass` | Gmail SMTP |
| `core-database-url` | PostgreSQL cho core-service |
| `stripe-secret-key` | Thanh toán Stripe |
| `ai-database-url` | PostgreSQL cho ai-service |
| `groq-api-key` | Groq AI API |
| `acr-username` / `acr-password` | Đăng nhập ACR |

Jenkins VM truy cập Key Vault qua **Managed Identity** (không cần lưu credential).

---

## Monitoring & Observability

- **Application Insights** (`haadtech-appinsights`): thu thập request traces, exceptions, performance metrics từ cả 3 backend services
- **Log Analytics** (`haadtech-law`): tập trung logs từ toàn bộ AKS cluster (Container Insights)
- Tích hợp SDK `applicationinsights` vào mỗi Node.js service

---

## Cấu trúc thư mục

```
Project_dtdm/
├── backend/
│   ├── auth-service/        # Node.js — Auth & JWT
│   ├── core-service/        # Node.js — Products, Orders, Stripe
│   └── ai-service/          # Node.js — Groq AI chatbot
├── Ecommerce_Website/       # ReactJS (Vite)
│   └── public/
│       └── web.config       # SPA routing cho App Service
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── auth-service.yaml    # Blue + Green deployments
│   ├── core-service.yaml
│   ├── ai-service.yaml
│   └── ingress.yaml
├── infrastructure/
│   └── terraform/
│       └── main.tf          # IaC toàn bộ Azure resources
└── Jenkinsfile              # CI/CD pipeline definition
```

---

##  Hướng dẫn triển khai

### Yêu cầu

- Azure CLI đã login (`az login`)
- `kubectl` đã cài và kết nối AKS (`az aks get-credentials`)
- Docker đang chạy trên Jenkins VM
- ACR đã gắn với AKS (`az aks update --attach-acr`)

### Deploy lần đầu

```bash
# 1. Tạo K8s namespace & config
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml

# 2. Tạo Kubernetes Secrets từ Key Vault
kubectl create secret generic auth-secrets --namespace=ecommerce \
  --from-literal=DATABASE_URL="$(az keyvault secret show --vault-name haadtechkv2026 --name auth-database-url --query value -o tsv)" \
  --from-literal=JWT_SECRET="$(az keyvault secret show --vault-name haadtechkv2026 --name jwt-secret --query value -o tsv)"

# 3. Cài Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# 4. Deploy services
kubectl apply -f k8s/auth-service.yaml
kubectl apply -f k8s/core-service.yaml
kubectl apply -f k8s/ai-service.yaml
kubectl apply -f k8s/ingress.yaml

# 5. Kiểm tra
kubectl get all -n ecommerce
kubectl get ingress -n ecommerce
```

### Switch Blue-Green thủ công

```bash
# Switch toàn bộ services sang slot green
for SVC in auth-service core-service ai-service; do
  kubectl patch svc $SVC -n ecommerce \
    -p '{"spec":{"selector":{"app":"'$SVC'","slot":"green"}}}'
done
```

### Kiểm tra health

```bash
# Port forward để test local
kubectl port-forward svc/auth-service 3001:3001 -n ecommerce &
curl http://localhost:3001/health
# Expected: {"status":"ok"}
```

---

## Troubleshooting

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `ImagePullBackOff` | AKS chưa gắn ACR | `az aks update --attach-acr haadtechacr2026` |
| `CrashLoopBackOff` | Lỗi app hoặc sai env | `kubectl logs <pod> -n ecommerce` |
| `Database connection failed` | Secret sai | `kubectl get secret auth-secrets -n ecommerce -o jsonpath='{.data.DATABASE_URL}' \| base64 -d` |
| Ingress `EXTERNAL-IP` pending | Quota hoặc chưa ready | Đợi 2–3 phút, kiểm tra `kubectl get svc -n ingress-nginx` |

---

## Azure DevOps Boards

Tiến độ dự án được theo dõi tại **Azure DevOps Project: `Ecommerce-DTDM`** với các Epic:

- `CI/CD Pipeline Setup` — Jenkins, webhook, Jenkinsfile
- `Kubernetes Deployment` — Blue-Green manifests, Ingress
- `Monitoring` — App Insights, Container Insights, alerts
- `Frontend Deployment` — React build, App Service, SPA routing

---

## Infrastructure as Code

Toàn bộ Azure resources được định nghĩa trong `infrastructure/terraform/main.tf`, bao gồm: Resource Group, ACR, AKS, Key Vault, App Service, Application Insights, Log Analytics, VNet.

```bash
cd infrastructure/terraform
terraform init
terraform plan
terraform apply
```

> **Lưu ý:** Với resources đã tồn tại, dùng `terraform import` để đưa vào quản lý Terraform.

---

## Hướng phát triển

- [ ] Tích hợp **Azure API Management** làm API Gateway
- [ ] Triển khai **Horizontal Pod Autoscaler** (HPA) trên AKS
- [ ] Mở rộng AI service với thêm models (Groq, OpenAI)
- [ ] Cấu hình **Azure Front Door** cho CDN và WAF
- [ ] Thêm **Canary Deployment** bên cạnh Blue-Green
- [ ] Tối ưu chi phí với **Azure Cost Management**

---

## Liên hệ

Mọi thắc mắc vui lòng liên hệ nhóm thực hiện qua Issues của repository.

---

<p align="center">
  <b>© 2026 – UIT Cloud Computing Project · Điện toán đám mây · ĐHQG TP.HCM</b>
</p>
