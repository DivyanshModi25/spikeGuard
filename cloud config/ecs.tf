variable "db_username" {
  default = "logUser"
}

variable "db_password" {
  default = "11111111"
}

variable "db_name" {
  default = "logmonitor"
}



resource "aws_ecs_cluster" "logmonitor_cluster" {
  name = "logmonitor-cluster"
}

data "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_attach" {
  role       = data.aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/logmonitor"
  retention_in_days = 7
}

resource "aws_security_group" "ecs_sg" {
  name        = "logmonitor-ecs-sg"
  description = "Allow EC2 to access ECS containers"
  vpc_id      = aws_vpc.logmonitor_vpc.id 

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] # Internal access from EC2 or Nginx
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "logmonitor-ecs-sg"
  }
}