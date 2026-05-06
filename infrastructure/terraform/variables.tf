variable "location" {
  description = "Azure region"
  type        = string
  default     = "East Asia"
}

variable "resource_group_name" {
  description = "Resource group for all project resources"
  type        = string
  default     = "HAADTechRG"
}

# ── ACR ───────────────────────────────────────────────────────────────────────
variable "acr_name" {
  description = "Azure Container Registry name (globally unique, alphanumeric only)"
  type        = string
  default     = "haadtechacr2026"
}

variable "acr_sku" {
  description = "ACR SKU: Basic | Standard | Premium"
  type        = string
  default     = "Basic"
}

# ── AKS ───────────────────────────────────────────────────────────────────────
variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "haadtech-aks"
}

variable "aks_dns_prefix" {
  description = "DNS prefix for the AKS API server"
  type        = string
  default     = "haadtech"
}

variable "aks_kubernetes_version" {
  description = "Kubernetes version"
  type        = string
  default     = "1.29"
}

variable "system_node_count" {
  description = "Number of nodes in the system node pool"
  type        = number
  default     = 2
}

variable "system_node_vm_size" {
  description = "VM size for system node pool"
  type        = string
  default     = "Standard_B2s"
}

# ── Key Vault ─────────────────────────────────────────────────────────────────
variable "key_vault_name" {
  description = "Azure Key Vault name (globally unique)"
  type        = string
  default     = "haadtechkv2026IS402"
}

# ── App Service ───────────────────────────────────────────────────────────────
variable "app_service_plan_name" {
  description = "App Service Plan name"
  type        = string
  default     = "haadtech-asp"
}

variable "webapp_name" {
  description = "App Service name for frontend (globally unique)"
  type        = string
  default     = "haadtech-web-2026"
}

# ── Monitoring ────────────────────────────────────────────────────────────────
variable "law_name" {
  description = "Log Analytics Workspace name"
  type        = string
  default     = "haadtech-law"
}

variable "appinsights_name" {
  description = "Application Insights name"
  type        = string
  default     = "haadtech-appinsights"
}

# ── Networking ────────────────────────────────────────────────────────────────
variable "vnet_name" {
  description = "Virtual Network name"
  type        = string
  default     = "haadtech-vnet"
}

# ── Tags ──────────────────────────────────────────────────────────────────────
variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default = {
    project     = "ecommerce"
    environment = "prod"
    managed_by  = "terraform"
  }
}
