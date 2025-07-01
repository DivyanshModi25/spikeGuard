
# # IAM Role for ECS Producers/Consumers
# resource "aws_iam_role" "msk_client_role" {
#   name = "spikeguard-msk-client-role"

#   assume_role_policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect = "Allow",
#         Principal = {
#           Service = "ecs-tasks.amazonaws.com"
#         },
#         Action = "sts:AssumeRole"
#       }
#     ]
#   })
# }

# resource "aws_iam_role_policy" "msk_policy" {
#   name = "msk-client-policy"
#   role = aws_iam_role.msk_client_role.id

#   policy = jsonencode({
#     Version = "2012-10-17",
#     Statement = [
#       {
#         Effect = "Allow",
#         Action = [
#           "kafka-cluster:Connect",
#           "kafka-cluster:DescribeCluster",
#           "kafka-cluster:DescribeTopic",
#           "kafka-cluster:WriteData",
#           "kafka-cluster:ReadData"
#         ],
#         Resource = "*"
#       }
#     ]
#   })
# }