resource "google_compute_network" "maker_vpc" {
  name                    = var.network_name
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "maker_subnet" {
  name          = var.subnet_name
  ip_cidr_range = var.subnet_cidr
  region        = var.region
  network       = google_compute_network.maker_vpc.id

  secondary_ip_range {
    range_name    = "pods"
    ip_cidr_range = var.pods_cidr
  }

  secondary_ip_range {
    range_name    = "services"
    ip_cidr_range = var.services_cidr
  }
}

resource "google_container_cluster" "maker_gke" {
  name     = var.cluster_name
  location = var.zone

  remove_default_node_pool = true
  initial_node_count       = 1

  network    = google_compute_network.maker_vpc.name
  subnetwork = google_compute_subnetwork.maker_subnet.name

  network_policy {
    enabled = true
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = "pods"
    services_secondary_range_name = "services"
  }
}

resource "google_container_node_pool" "primary_nodes" {
  name       = "${var.cluster_name}-primary"
  location   = var.zone
  cluster    = google_container_cluster.maker_gke.name
  node_count = var.node_count

  node_config {
    machine_type = var.machine_type
    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}
