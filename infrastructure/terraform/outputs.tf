# ─── ACR ──────────────────────────────────────────────────────────────────────
output "acr_login_server" {
  description = "ACR login server — use as image prefix in Jenkinsfile"
  value       = azurerm_container_registry.acr.login_server
}

output "acr_name" {
  description = "ACR resource name"
  value       = azurerm_container_registry.acr.name
}

# ─── AKS ──────────────────────────────────────────────────────────────────────
output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.aks.name
}

output "aks_resource_group" {
  value = azurerm_resource_group.main.name
}

output "aks_get_credentials_cmd" {
  description = "Run this to configure kubectl locally"
  value       = "az aks get-credentials --resource-group ${azurerm_resource_group.main.name} --name ${azurerm_kubernetes_cluster.aks.name}"
}

output "kube_config" {
  description = "Raw kubeconfig — store as Jenkins secret if needed"
  value       = azurerm_kubernetes_cluster.aks.kube_config_raw
  sensitive   = true
}

# ─── Key Vault ────────────────────────────────────────────────────────────────
output "key_vault_uri" {
  description = "Key Vault URI — use in Jenkins Azure Key Vault plugin config"
  value       = azurerm_key_vault.kv.vault_uri
}

# ─── App Service ──────────────────────────────────────────────────────────────
output "frontend_url" {
  description = "Frontend App Service URL"
  value       = "https://${azurerm_linux_web_app.frontend.default_hostname}"
}

# ─── Application Insights ─────────────────────────────────────────────────────
output "app_insights_connection_string" {
  description = "App Insights connection string — add to K8s ConfigMap"
  value       = azurerm_application_insights.appinsights.connection_string
  sensitive   = true
}

# ─── Misc ─────────────────────────────────────────────────────────────────────
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "location" {
  value = azurerm_resource_group.main.location
}
