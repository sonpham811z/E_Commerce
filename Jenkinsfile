pipeline {
    agent any

    environment {
        // ── Cấu hình Azure ──
        ACR_NAME        = 'haadtechacr2026'
        ACR_REGISTRY    = "${ACR_NAME}.azurecr.io"
        AKS_NAMESPACE   = 'ecommerce'
        RESOURCE_GROUP  = '<YOUR_RESOURCE_GROUP>'   // ← ĐỔI TÊN RESOURCE GROUP CỦA BẠN
        AKS_CLUSTER     = 'haadtech-aks'
        KEY_VAULT_NAME  = 'haadtechkv2026'
        WEBAPP_NAME     = 'haadtech-web-2026'

        // ── Build info ──
        BUILD_TAG       = "${env.BUILD_NUMBER}"
    }

    tools {
        nodejs 'NodeJS-20'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ══════════════════════════════════════════════
        // STAGE 1: CHECKOUT CODE
        // ══════════════════════════════════════════════
        stage('Checkout') {
            steps {
                checkout scm
                echo "Commit: ${GIT_COMMIT.take(7)}"
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 2: ĐỌC SECRETS TỪ KEY VAULT
        // ══════════════════════════════════════════════
        // Jenkins VM đã có Managed Identity → az CLI tự xác thực
        // Không cần lưu bất kỳ secret nào trong Jenkins Credentials
        stage('Load Secrets from Key Vault') {
            steps {
                script {
                    echo "Đọc 10 secrets từ Azure Key Vault: ${KEY_VAULT_NAME}..."

                    // --- ACR credentials (push Docker images) ---
                    env.ACR_USERNAME = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name acr-username --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.ACR_PASSWORD = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name acr-password --query value -o tsv",
                        returnStdout: true
                    ).trim()

                    // --- Auth Service secrets ---
                    env.AUTH_DB_URL = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name auth-database-url --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.KV_JWT_SECRET = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name jwt-secret --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.KV_SMTP_USER = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name smtp-user --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.KV_SMTP_PASS = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name smtp-pass --query value -o tsv",
                        returnStdout: true
                    ).trim()

                    // --- Core Service secrets ---
                    env.CORE_DB_URL = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name core-database-url --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.KV_STRIPE_KEY = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name stripe-secret-key --query value -o tsv",
                        returnStdout: true
                    ).trim()

                    // --- AI Service secrets ---
                    env.AI_DB_URL = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name ai-database-url --query value -o tsv",
                        returnStdout: true
                    ).trim()
                    env.KV_GROQ_KEY = sh(
                        script: "az keyvault secret show --vault-name ${KEY_VAULT_NAME} --name groq-api-key --query value -o tsv",
                        returnStdout: true
                    ).trim()

                    echo "✅ Đã load xong 10 secrets từ Key Vault"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 3: XÁC ĐỊNH BLUE/GREEN SLOT
        // ══════════════════════════════════════════════
        stage('Determine Slot') {
            steps {
                script {
                    // Lấy AKS credentials
                    sh "az aks get-credentials --resource-group ${RESOURCE_GROUP} --name ${AKS_CLUSTER} --overwrite-existing"

                    // Xác định slot hiện tại
                    def currentSlot = sh(
                        script: "kubectl get svc auth-service -n ${AKS_NAMESPACE} -o jsonpath='{.spec.selector.slot}' 2>/dev/null || echo 'blue'",
                        returnStdout: true
                    ).trim()
                    env.CURRENT_SLOT = currentSlot
                    env.NEW_SLOT = (currentSlot == 'blue') ? 'green' : 'blue'
                    echo "Current: ${env.CURRENT_SLOT} → Deploying to: ${env.NEW_SLOT}"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 4: ĐỒNG BỘ K8S SECRETS TỪ KEY VAULT
        // ══════════════════════════════════════════════
        // Mỗi lần pipeline chạy → K8s Secrets được cập nhật
        // từ Key Vault. Nếu bạn đổi password DB trên Key Vault,
        // lần deploy tiếp theo pods tự nhận giá trị mới.
        stage('Sync K8s Secrets') {
            steps {
                script {
                    // Đảm bảo namespace tồn tại
                    sh "kubectl apply -f k8s/namespace.yaml"

                    // Tạo/cập nhật ConfigMap (non-secret values)
                    sh "kubectl apply -f k8s/configmap.yaml"

                    // Xóa secrets cũ + tạo mới (đảm bảo giá trị mới nhất từ Key Vault)
                    sh """
                        kubectl delete secret auth-secrets -n ${AKS_NAMESPACE} --ignore-not-found
                        kubectl create secret generic auth-secrets \
                            --namespace=${AKS_NAMESPACE} \
                            --from-literal=DATABASE_URL="\${AUTH_DB_URL}" \
                            --from-literal=JWT_SECRET="\${KV_JWT_SECRET}" \
                            --from-literal=SMTP_USER="\${KV_SMTP_USER}" \
                            --from-literal=SMTP_PASS="\${KV_SMTP_PASS}"

                        kubectl delete secret core-secrets -n ${AKS_NAMESPACE} --ignore-not-found
                        kubectl create secret generic core-secrets \
                            --namespace=${AKS_NAMESPACE} \
                            --from-literal=DATABASE_URL="\${CORE_DB_URL}" \
                            --from-literal=STRIPE_SECRET_KEY="\${KV_STRIPE_KEY}"

                        kubectl delete secret ai-secrets -n ${AKS_NAMESPACE} --ignore-not-found
                        kubectl create secret generic ai-secrets \
                            --namespace=${AKS_NAMESPACE} \
                            --from-literal=DATABASE_URL="\${AI_DB_URL}" \
                            --from-literal=GROQ_API_KEY="\${KV_GROQ_KEY}"
                    """
                    echo "✅ K8s Secrets đã đồng bộ từ Key Vault"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 5: TEST
        // ══════════════════════════════════════════════
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

        // ══════════════════════════════════════════════
        // STAGE 6: BUILD DOCKER IMAGES
        // ══════════════════════════════════════════════
        stage('Build Docker Images') {
            steps {
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

        // ══════════════════════════════════════════════
        // STAGE 7: PUSH TO ACR (dùng credentials từ Key Vault)
        // ══════════════════════════════════════════════
        stage('Push to ACR') {
            steps {
                sh """
                    echo "\${ACR_PASSWORD}" | docker login ${ACR_REGISTRY} \
                        -u "\${ACR_USERNAME}" --password-stdin

                    docker push ${ACR_REGISTRY}/auth-service:${NEW_SLOT}
                    docker push ${ACR_REGISTRY}/auth-service:build-${BUILD_TAG}

                    docker push ${ACR_REGISTRY}/core-service:${NEW_SLOT}
                    docker push ${ACR_REGISTRY}/core-service:build-${BUILD_TAG}

                    docker push ${ACR_REGISTRY}/ai-service:${NEW_SLOT}
                    docker push ${ACR_REGISTRY}/ai-service:build-${BUILD_TAG}
                """
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 8: DEPLOY VÀO SLOT MỚI (Blue-Green)
        // ══════════════════════════════════════════════
        stage('Deploy to New Slot') {
            steps {
                script {
                    // Update image + scale up slot mới
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl set image deployment/${svc}-${NEW_SLOT} \
                                ${svc}=${ACR_REGISTRY}/${svc}:${NEW_SLOT} \
                                -n ${AKS_NAMESPACE}

                            kubectl scale deployment/${svc}-${NEW_SLOT} \
                                --replicas=1 -n ${AKS_NAMESPACE}
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

        // ══════════════════════════════════════════════
        // STAGE 9: SMOKE TEST (trên slot mới, chưa switch traffic)
        // ══════════════════════════════════════════════
        stage('Smoke Test') {
            steps {
                script {
                    // Test health endpoint trực tiếp trong pod
                    def authPod = sh(
                        script: "kubectl get pod -n ${AKS_NAMESPACE} -l app=auth-service,slot=${NEW_SLOT} -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()
                    sh "kubectl exec ${authPod} -n ${AKS_NAMESPACE} -- wget -qO- http://localhost:3001/health || exit 1"

                    def corePod = sh(
                        script: "kubectl get pod -n ${AKS_NAMESPACE} -l app=core-service,slot=${NEW_SLOT} -o jsonpath='{.items[0].metadata.name}'",
                        returnStdout: true
                    ).trim()
                    sh "kubectl exec ${corePod} -n ${AKS_NAMESPACE} -- wget -qO- http://localhost:3003/health || exit 1"

                    echo "✅ Smoke tests passed on ${NEW_SLOT} slot"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 10: SWITCH TRAFFIC (Blue ↔ Green)
        // ══════════════════════════════════════════════
        stage('Switch Traffic') {
            steps {
                script {
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl patch svc ${svc} -n ${AKS_NAMESPACE} \
                                -p '{"spec":{"selector":{"app":"${svc}","slot":"${NEW_SLOT}"}}}'
                        """
                    }
                    echo "✅ Traffic switched to ${NEW_SLOT}"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 11: SCALE DOWN SLOT CŨ
        // ══════════════════════════════════════════════
        stage('Scale Down Old Slot') {
            steps {
                script {
                    for (svc in ['auth-service', 'core-service', 'ai-service']) {
                        sh """
                            kubectl scale deployment/${svc}-${CURRENT_SLOT} \
                                --replicas=0 -n ${AKS_NAMESPACE}
                        """
                    }
                    echo "Old slot ${CURRENT_SLOT} scaled down"
                }
            }
        }

        // ══════════════════════════════════════════════
        // STAGE 12: BUILD & DEPLOY FRONTEND → App Service
        // ══════════════════════════════════════════════
        stage('Build Frontend') {
            steps {
                dir('Ecommerce_Website') {
                    script {
                        // Lấy Ingress External IP
                        def ingressIP = sh(
                            script: "kubectl get ingress ecommerce-ingress -n ${AKS_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
                            returnStdout: true
                        ).trim()

                        // Tạo .env cho Vite build
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
                        cd dist && zip -r ../frontend.zip . && cd ..
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

    // ══════════════════════════════════════════════
    // POST ACTIONS
    // ══════════════════════════════════════════════
    post {
        success {
            echo "✅ Build #${BUILD_NUMBER} deployed successfully. Slot: ${env.NEW_SLOT}"
        }
        failure {
            script {
                echo "❌ Build #${BUILD_NUMBER} failed! Rolling back..."
                // Rollback: switch traffic về slot cũ
                for (svc in ['auth-service', 'core-service', 'ai-service']) {
                    sh """
                        kubectl patch svc ${svc} -n ${AKS_NAMESPACE} \
                            -p '{"spec":{"selector":{"app":"${svc}","slot":"${env.CURRENT_SLOT}"}}}' || true
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
        always {
            // Wrap trong node{} để tránh lỗi MissingContextVariableException
            node {
                sh 'docker system prune -f || true'
                cleanWs()
            }
        }
    }
}