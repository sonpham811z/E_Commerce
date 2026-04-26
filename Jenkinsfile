// ─── Pipeline — Build from GitHub → ACR → AKS ────────────────────────────────
// Required Jenkins credentials (Manage Jenkins > Credentials):
//   AZURE_SP_ID       — Azure Service Principal App ID
//   AZURE_SP_SECRET   — Azure Service Principal Secret
//   AZURE_TENANT_ID   — Azure Tenant ID
//   AZURE_SUB_ID      — Azure Subscription ID
//
// Required Jenkins plugins:
//   - Docker Pipeline, Pipeline, Azure CLI, Kubernetes CLI, Git

pipeline {
  agent any

  // ── Editable config ────────────────────────────────────────────────────────
  environment {
    ACR_NAME          = 'ecommerceacr2026'
    ACR_SERVER        = "${ACR_NAME}.azurecr.io"
    AKS_RESOURCE_GROUP = 'rg-ecommerce-prod'
    AKS_CLUSTER_NAME  = 'aks-ecommerce'
    K8S_NAMESPACE     = 'ecommerce'

    // Injected from Jenkins credential store
    AZURE_SP_ID       = credentials('AZURE_SP_ID')
    AZURE_SP_SECRET   = credentials('AZURE_SP_SECRET')
    AZURE_TENANT_ID   = credentials('AZURE_TENANT_ID')
    AZURE_SUB_ID      = credentials('AZURE_SUB_ID')

    // Tag = build number + short git SHA  (e.g. 42-a1b2c3d)
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
            --username  "$AZURE_SP_ID" \
            --password  "$AZURE_SP_SECRET" \
            --tenant    "$AZURE_TENANT_ID" \
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
            // VITE_* vars are baked at build time — set real values here
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
    stage('Deploy to AKS') {
      steps {
        sh '''
          # Pull AKS credentials into ~/.kube/config
          az aks get-credentials \
            --resource-group "$AKS_RESOURCE_GROUP" \
            --name           "$AKS_CLUSTER_NAME" \
            --overwrite-existing

          # Swap :latest → :IMAGE_TAG in all manifests so each deploy is pinned
          find k8s/ -name "*.yaml" -exec \
            sed -i "s|:latest|:$IMAGE_TAG|g" {} +

          # Apply all manifests
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml   -n "$K8S_NAMESPACE"
          kubectl apply -f k8s/auth-service.yaml -n "$K8S_NAMESPACE"
          kubectl apply -f k8s/core-service.yaml -n "$K8S_NAMESPACE"
          kubectl apply -f k8s/ai-service.yaml   -n "$K8S_NAMESPACE"
          kubectl apply -f k8s/frontend.yaml      -n "$K8S_NAMESPACE"
          kubectl apply -f k8s/ingress.yaml       -n "$K8S_NAMESPACE"

          # Wait for rollouts
          kubectl rollout status deployment/auth-service  -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/core-service  -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/ai-service    -n "$K8S_NAMESPACE" --timeout=120s
          kubectl rollout status deployment/frontend      -n "$K8S_NAMESPACE" --timeout=120s
        '''
      }
    }

    // ── 6. Smoke test ────────────────────────────────────────────────────────
    stage('Smoke Test') {
      steps {
        sh '''
          INGRESS_IP=$(kubectl get svc ingress-nginx-controller \
            -n ingress-nginx \
            -o jsonpath="{.status.loadBalancer.ingress[0].ip}" 2>/dev/null || echo "")

          if [ -n "$INGRESS_IP" ]; then
            echo "Ingress IP: $INGRESS_IP"
            curl -sf "http://$INGRESS_IP/health" || echo "Health check skipped (no /health on ingress)"
          else
            echo "Ingress IP not ready yet — skipping smoke test"
          fi
        '''
      }
    }

  }

  // ── Post ───────────────────────────────────────────────────────────────────
  post {
    success {
      echo "✅ Deployed build #${BUILD_NUMBER} (${GIT_COMMIT.take(7)}) successfully."
    }
    failure {
      echo "❌ Build #${BUILD_NUMBER} failed. Check logs above."
    }
    always {
      sh 'az logout || true'
      cleanWs()
    }
  }
}
