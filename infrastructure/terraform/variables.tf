variable "location" {
  description = "Azure region"
  type        = string
  default     = "southeastasia"   # Singapore — closest to Vietnam
}

variable "resource_group_name" {
  description = "Resource group for all project resources"
  type        = string
  default     = "rg-ecommerce-prod"
}

# ── ACR ───────────────────────────────────────────────────────────────────────
variable "acr_name" {
  description = "Azure Container Registry name (globally unique, alphanumeric only)"
  type        = string
  default     = "ecommerceacr2026"
}

variable "acr_sku" {
  description = "ACR SKU: Basic | Standard | Premium"
  type        = string
  default     = "Standard"
}

# ── AKS ───────────────────────────────────────────────────────────────────────
variable "aks_cluster_name" {
  description = "AKS cluster name"
  type        = string
  default     = "aks-ecommerce"
}

variable "aks_dns_prefix" {
  description = "DNS prefix for the AKS API server"
  type        = string
  default     = "ecommerce"
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
  default     = "Standard_B2s"   # 2 vCPU, 4 GB RAM — cheapest viable option
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
