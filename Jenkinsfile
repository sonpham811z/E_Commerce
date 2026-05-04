// ─── Pipeline — GitHub → ACR → AKS ───────────────────────────────────────────
//
// One-time AKS setup (run once manually before first pipeline run):
//   1. Link ACR to AKS (so pods can pull images without imagePullSecrets):
//        az aks update --name aks-ecommerce \
//          --resource-group rg-ecommerce-prod \
//          --attach-acr ecommerceacr2026
//
//   2. Install nginx ingress controller:
//        helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
//        helm install ingress-nginx ingress-nginx/ingress-nginx \
//          --namespace ingress-nginx --create-namespace
//
//   3. Get the ingress public IP and set it as APP_DOMAIN credential:
//        kubectl get svc ingress-nginx-controller -n ingress-nginx
//
// Required Jenkins credentials (Manage Jenkins > Credentials > Global):
//   AZURE_SP_ID         Azure Service Principal App ID
//   AZURE_SP_SECRET     Azure Service Principal Secret
//   AZURE_TENANT_ID     Azure Tenant ID
//   AZURE_SUB_ID        Azure Subscription ID
//   APP_DOMAIN          Public IP or hostname of the AKS ingress
//                       (e.g. "20.1.2.3" or "haadtech.eastus.cloudapp.azure.com")
//   AUTH_DATABASE_URL   Neon PostgreSQL connection string for auth-service
//   AI_DATABASE_URL     Neon PostgreSQL connection string for ai-service
//   CORE_DATABASE_URL   Neon PostgreSQL connection string for core-service
//   GROQ_API_KEY        Groq API key
//   JWT_SECRET          JWT signing secret
//   JWT_REFRESH_SECRET  JWT refresh signing secret
//   SMTP_USER           Gmail address used to send emails
//   SMTP_PASS           Gmail app password
//   STRIPE_SECRET_KEY   Stripe secret key

pipeline {
  agent any

  environment {
    ACR_NAME           = 'ecommerceacr2026'
    ACR_SERVER         = "${ACR_NAME}.azurecr.io"
    AKS_RESOURCE_GROUP = 'rg-ecommerce-prod'
    AKS_CLUSTER_NAME   = 'aks-ecommerce'
    K8S_NAMESPACE      = 'ecommerce'

    // Azure credentials
    AZURE_SP_ID     = credentials('AZURE_SP_ID')
    AZURE_SP_SECRET = credentials('AZURE_SP_SECRET')
    AZURE_TENANT_ID = credentials('AZURE_TENANT_ID')
    AZURE_SUB_ID    = credentials('AZURE_SUB_ID')

    // Public hostname / IP of the AKS ingress load balancer
    APP_DOMAIN = credentials('APP_DOMAIN')

    // Sensitive backend config — stored in Jenkins, pushed to k8s Secrets at deploy time
    AUTH_DATABASE_URL  = credentials('AUTH_DATABASE_URL')
    AI_DATABASE_URL    = credentials('AI_DATABASE_URL')
    CORE_DATABASE_URL  = credentials('CORE_DATABASE_URL')
    GROQ_API_KEY       = credentials('GROQ_API_KEY')
    JWT_SECRET         = credentials('JWT_SECRET')
    JWT_REFRESH_SECRET = credentials('JWT_REFRESH_SECRET')
    SMTP_USER          = credentials('SMTP_USER')
    SMTP_PASS          = credentials('SMTP_PASS')
    STRIPE_SECRET_KEY  = credentials('STRIPE_SECRET_KEY')

    // Vite bakes these into the JS bundle at build time.
    // All three point to the same ingress — routing is done by path prefix.
    VITE_AUTH_SERVICE_URL = "http://${APP_DOMAIN}"
    VITE_CORE_SERVICE_URL = "http://${APP_DOMAIN}"
    VITE_AI_SERVICE_URL   = "http://${APP_DOMAIN}"

    // Unique image tag per build (e.g. "42-a1b2c3d")
    IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT.take(7)}"
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timeout(time: 30, unit: 'MINUTES')
    disableConcurrentBuilds()
  }

  stages {

    // ── 1. Checkout ──────────────────────────────────────────────────────────
    stage('Checkout') {
      steps {
        checkout scm
        echo "Branch: ${env.BRANCH_NAME}  |  Commit: ${GIT_COMMIT.take(7)}"
      }
    }

    // ── 2. Test ──────────────────────────────────────────────────────────────
    stage('Test') {
      parallel {
        stage('auth-service') {
          steps {
            dir('backend/auth-service') {
              sh 'npm ci --prefer-offline && npm test -- --ci --forceExit'
            }
          }
        }
        stage('core-service') {
          steps {
            dir('backend/core-service') {
              sh 'npm ci --prefer-offline && npm test -- --ci --forceExit'
            }
          }
        }
        stage('ai-service') {
          steps {
            dir('backend/ai-service') {
              sh 'npm ci --prefer-offline && npm test -- --ci --forceExit'
            }
          }
        }
      }
    }

    // ── 3. Azure login + ACR auth ────────────────────────────────────────────
    stage('Azure Login') {
      steps {
        sh '''
          az login --service-principal \
            --username "$AZURE_SP_ID" \
            --password "$AZURE_SP_SECRET" \
            --tenant   "$AZURE_TENANT_ID" \
            --output none

          az account set --subscription "$AZURE_SUB_ID"
          az acr login --name "$ACR_NAME"
        '''
      }
    }

    // ── 4. Build & Push ──────────────────────────────────────────────────────
    stage('Build & Push') {
      parallel {

        stage('auth-service') {
          steps {
            sh '''
              docker build \
                -t "$ACR_SERVER/auth-service:$IMAGE_TAG" \
                -t "$ACR_SERVER/auth-service:latest" \
                ./backend/auth-service
              docker push "$ACR_SERVER/auth-service:$IMAGE_TAG"
              docker push "$ACR_SERVER/auth-service:latest"
            '''
          }
        }

        stage('core-service') {
          steps {
            sh '''
              docker build \
                -t "$ACR_SERVER/core-service:$IMAGE_TAG" \
                -t "$ACR_SERVER/core-service:latest" \
                ./backend/core-service
              docker push "$ACR_SERVER/core-service:$IMAGE_TAG"
              docker push "$ACR_SERVER/core-service:latest"
            '''
          }
        }

        stage('ai-service') {
          steps {
            sh '''
              docker build \
                -t "$ACR_SERVER/ai-service:$IMAGE_TAG" \
                -t "$ACR_SERVER/ai-service:latest" \
                ./backend/ai-service
              docker push "$ACR_SERVER/ai-service:$IMAGE_TAG"
              docker push "$ACR_SERVER/ai-service:latest"
            '''
          }
        }

        stage('frontend') {
          steps {
            sh '''
              docker build \
                -f Ecommerce_Website/docker/frontend/Dockerfile \
                --build-arg VITE_AUTH_SERVICE_URL="$VITE_AUTH_SERVICE_URL" \
                --build-arg VITE_CORE_SERVICE_URL="$VITE_CORE_SERVICE_URL" \
                --build-arg VITE_AI_SERVICE_URL="$VITE_AI_SERVICE_URL" \
                -t "$ACR_SERVER/frontend:$IMAGE_TAG" \
                -t "$ACR_SERVER/frontend:latest" \
                ./Ecommerce_Website
              docker push "$ACR_SERVER/frontend:$IMAGE_TAG"
              docker push "$ACR_SERVER/frontend:latest"
            '''
          }
        }

      }
    }

    // ── 5. Deploy to AKS ─────────────────────────────────────────────────────
    // Runs only on the main branch to prevent accidental deploys from feature branches.
    stage('Deploy to AKS') {
      when { branch 'main' }
      steps {
        sh '''
          # Pull AKS credentials into ~/.kube/config
          az aks get-credentials \
            --resource-group "$AKS_RESOURCE_GROUP" \
            --name           "$AKS_CLUSTER_NAME" \
            --overwrite-existing

          # ── Namespace ──────────────────────────────────────────────────────
          kubectl apply -f k8s/namespace.yaml

          # ── ConfigMap (non-sensitive config) ───────────────────────────────
          # Created dynamically so APP_DOMAIN-based values are always up to date.
          kubectl create configmap ecommerce-config \
            --from-literal=NODE_ENV="production" \
            --from-literal=DB_SSL="true" \
            --from-literal=AUTH_SERVICE_URL="http://auth-service:3001" \
            --from-literal=CORE_SERVICE_URL="http://core-service:3003" \
            --from-literal=AI_SERVICE_URL="http://ai-service:3002" \
            --from-literal=ALLOWED_ORIGINS="http://$APP_DOMAIN" \
            --from-literal=JWT_ACCESS_EXPIRES_IN="15m" \
            --from-literal=JWT_REFRESH_EXPIRES_IN="7d" \
            --from-literal=BCRYPT_ROUNDS="12" \
            --from-literal=SMTP_HOST="smtp.gmail.com" \
            --from-literal=SMTP_PORT="587" \
            --from-literal=EMAIL_FROM="noreply@ecommerce.com" \
            --from-literal=GROQ_MODEL="llama3-8b-8192" \
            --from-literal=GROQ_MAX_TOKENS="1024" \
            --from-literal=MAX_CHAT_HISTORY="50" \
            --from-literal=DEFAULT_PAGE_SIZE="20" \
            --from-literal=MAX_PAGE_SIZE="100" \
            --from-literal=RATE_LIMIT_WINDOW_MS="900000" \
            --from-literal=RATE_LIMIT_MAX="100" \
            -n "$K8S_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -

          # ── Secrets (sensitive config, per service) ────────────────────────
          # --dry-run=client | kubectl apply is idempotent — safe to rerun.

          kubectl create secret generic auth-service-secrets \
            --from-literal=DATABASE_URL="$AUTH_DATABASE_URL" \
            --from-literal=JWT_SECRET="$JWT_SECRET" \
            --from-literal=JWT_REFRESH_SECRET="$JWT_REFRESH_SECRET" \
            --from-literal=SMTP_USER="$SMTP_USER" \
            --from-literal=SMTP_PASS="$SMTP_PASS" \
            -n "$K8S_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -

          kubectl create secret generic ai-service-secrets \
            --from-literal=DATABASE_URL="$AI_DATABASE_URL" \
            --from-literal=GROQ_API_KEY="$GROQ_API_KEY" \
            -n "$K8S_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -

          kubectl create secret generic core-service-secrets \
            --from-literal=DATABASE_URL="$CORE_DATABASE_URL" \
            --from-literal=STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
            --from-literal=PAYMENT_SUCCESS_URL="http://$APP_DOMAIN/complete-order" \
            --from-literal=PAYMENT_CANCEL_URL="http://$APP_DOMAIN/checkout" \
            -n "$K8S_NAMESPACE" \
            --dry-run=client -o yaml | kubectl apply -f -

          # ── Deployments ───────────────────────────────────────────────────
          # Pipe through sed so IMAGE_TAG is substituted without mutating files on disk.
          # The k8s yaml files keep ":latest" as a placeholder; sed replaces it for this run only.
          sed "s|:latest|:$IMAGE_TAG|g" k8s/auth-service.yaml | kubectl apply -f - -n "$K8S_NAMESPACE"
          sed "s|:latest|:$IMAGE_TAG|g" k8s/core-service.yaml | kubectl apply -f - -n "$K8S_NAMESPACE"
          sed "s|:latest|:$IMAGE_TAG|g" k8s/ai-service.yaml   | kubectl apply -f - -n "$K8S_NAMESPACE"
          sed "s|:latest|:$IMAGE_TAG|g" k8s/frontend.yaml     | kubectl apply -f - -n "$K8S_NAMESPACE"

          kubectl apply -f k8s/ingress.yaml -n "$K8S_NAMESPACE"

          # ── Wait for rollouts ─────────────────────────────────────────────
          kubectl rollout status deployment/auth-service -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/core-service -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/ai-service   -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/frontend     -n "$K8S_NAMESPACE" --timeout=120s
        '''
      }
    }

    // ── 6. Smoke Test ────────────────────────────────────────────────────────
    stage('Smoke Test') {
      when { branch 'main' }
      steps {
        sh '''
          echo "Checking frontend is reachable..."
          curl -sf --retry 5 --retry-delay 5 \
            "http://$APP_DOMAIN/" -o /dev/null \
            && echo "Smoke test PASSED" \
            || { echo "Smoke test FAILED — check ingress and pod logs"; exit 1; }
        '''
      }
    }

  }

  // ── Post ───────────────────────────────────────────────────────────────────
  post {
    success {
      echo "Build #${BUILD_NUMBER} (${GIT_COMMIT.take(7)}) deployed successfully."
    }
    failure {
      echo "Build #${BUILD_NUMBER} failed — check the stage logs above."
    }
    always {
      sh 'az logout || true'
      cleanWs()
    }
  }
}
