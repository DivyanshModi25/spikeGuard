output "rds_endpoint" {
  value = aws_db_instance.logmonitor.endpoint
}

output "private_subnet_ids" {
  value = [
    aws_subnet.private_subnet1.id,
    aws_subnet.private_subnet2.id
  ]
}



# data "aws_msk_cluster" "logmonitor_msk_data" {
#   cluster_name = aws_msk_cluster.logmonitor_msk.cluster_name
# }

# output "kafka_bootstrap_brokers" {
#   description = "PLAINTEXT bootstrap servers to use in services"
#   value       = data.aws_msk_cluster.logmonitor_msk_data.bootstrap_brokers
# }