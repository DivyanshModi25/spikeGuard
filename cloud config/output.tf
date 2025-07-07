output "rds_endpoint" {
  value = aws_db_instance.logmonitor.endpoint
}

output "private_subnet_ids" {
  value = [
    aws_subnet.private_subnet1.id,
    aws_subnet.private_subnet2.id
  ]
}


output "ALBDomain" {
  value=aws_lb.logMonitor_alb.dns_name
}