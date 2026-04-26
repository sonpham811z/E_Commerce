# ─── Resource Group ───────────────────────────────────────────────────────────
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

# ─── Azure Container Registry ─────────────────────────────────────────────────
resource "azurerm_container_registry" "acr" {
  name                = var.acr_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = var.acr_sku
  admin_enabled       = false   # Use managed identity pull, not admin credentials

  tags = var.tags
}

# ─── Log Analytics (for AKS monitoring) ──────────────────────────────────────
resource "azurerm_log_analytics_workspace" "aks" {
  name                = "law-${var.aks_cluster_name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

# ─── AKS Cluster ─────────────────────────────────────────────────────────────
resource "azurerm_kubernetes_cluster" "aks" {
  name                = var.aks_cluster_name
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  dns_prefix          = var.aks_dns_prefix
  kubernetes_version  = var.aks_kubernetes_version

  # System node pool
  default_node_pool {
    name                = "system"
    node_count          = var.system_node_count
    vm_size             = var.system_node_vm_size
    os_disk_size_gb     = 50
    type                = "VirtualMachineScaleSets"
    enable_auto_scaling = false

    node_labels = {
      "nodepool-type" = "system"
      "environment"   = "prod"
    }
  }

  # Use SystemAssigned managed identity (no service principal to rotate)
  identity {
    type = "SystemAssigned"
  }

  # Container networking
  network_profile {
    network_plugin = "kubenet"
    load_balancer_sku = "standard"
  }

  # Enable monitoring add-on
  oms_agent {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.aks.id
  }

  # Enable HTTP application routing (installs nginx ingress + external-dns)
  http_application_routing_enabled = false   # Use manual nginx-ingress instead

  tags = var.tags
}

# ─── Grant AKS kubelet identity AcrPull on ACR ───────────────────────────────
# This lets AKS nodes pull images from ACR without credentials in manifests
resource "azurerm_role_assignment" "aks_acr_pull" {
  scope                = azurerm_container_registry.acr.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_kubernetes_cluster.aks.kubelet_identity[0].object_id

  depends_on = [
    azurerm_kubernetes_cluster.aks,
    azurerm_container_registry.acr,
  ]
}
