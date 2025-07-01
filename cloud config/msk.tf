# # Security Group for MSK (allow internal VPC access)
# resource "aws_security_group" "msk_sg" {
#   name        = "logmonitor-msk-sg"
#   description = "Allow Kafka access within VPC"
#   vpc_id      = aws_vpc.logmonitor_vpc.id

#   ingress {
#     from_port   = 9098
#     to_port     = 9098
#     protocol    = "tcp"
#     cidr_blocks = ["10.0.0.0/16"]
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = {
#     Name = "logmonitor-msk-sg"
#   }
# }

# # MSK Provisioned Cluster
# resource "aws_msk_cluster" "logmonitor_msk" {
#   cluster_name           = "logmonitor-msk-provisioned"
#   kafka_version          = "3.6.0"
#   number_of_broker_nodes = 2
#   broker_node_group_info {
#     instance_type   = "kafka.t3.small"
#     # ebs_volume_size = 20
#     client_subnets  = [aws_subnet.private_subnet1.id,aws_subnet.private_subnet2.id]
#     security_groups = [aws_security_group.msk_sg.id]
#   }

#   encryption_info {
#     encryption_in_transit {
#       client_broker = "PLAINTEXT"
#       in_cluster    = true
#     }
#   }

#   tags = {
#     Name = "logmonitor-msk"
#   }
# }
