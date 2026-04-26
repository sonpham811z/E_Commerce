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

# ─── Misc ─────────────────────────────────────────────────────────────────────
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "location" {
  value = azurerm_resource_group.main.location
}
