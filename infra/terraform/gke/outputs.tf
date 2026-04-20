output "project_id" {
  description = "GCP project id"
  value       = var.project_id
}

output "cluster_name" {
  description = "Created GKE cluster name"
  value       = google_container_cluster.maker_gke.name
}

output "cluster_zone" {
  description = "Zone where the cluster is created"
  value       = google_container_cluster.maker_gke.location
}

output "network_name" {
  description = "VPC network name"
  value       = google_compute_network.maker_vpc.name
}

output "subnetwork_name" {
  description = "Subnetwork name"
  value       = google_compute_subnetwork.maker_subnet.name
}

output "get_credentials_command" {
  description = "Command to configure kubectl for this cluster"
  value       = "gcloud container clusters get-credentials ${google_container_cluster.maker_gke.name} --zone ${google_container_cluster.maker_gke.location} --project ${var.project_id}"
}
