variable "project_id" {
  description = "GCP project id for GKE resources"
  type        = string
}

variable "region" {
  description = "GCP region for cluster and subnet"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "Primary zone used by the zonal cluster"
  type        = string
  default     = "us-central1-a"
}

variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
  default     = "maker-platform-gke"
}

variable "network_name" {
  description = "VPC network name"
  type        = string
  default     = "maker-platform-vpc"
}

variable "subnet_name" {
  description = "Subnet name for GKE nodes"
  type        = string
  default     = "maker-platform-subnet"
}

variable "subnet_cidr" {
  description = "Primary CIDR range for node subnet"
  type        = string
  default     = "10.10.0.0/16"
}

variable "pods_cidr" {
  description = "Secondary CIDR for pods"
  type        = string
  default     = "10.20.0.0/16"
}

variable "services_cidr" {
  description = "Secondary CIDR for services"
  type        = string
  default     = "10.30.0.0/20"
}

variable "node_count" {
  description = "Initial node count for the primary node pool"
  type        = number
  default     = 2
}

variable "machine_type" {
  description = "GCE machine type for GKE nodes"
  type        = string
  default     = "e2-standard-2"
}
