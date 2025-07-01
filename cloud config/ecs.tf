variable "auth_service_image" {
    default = "techsavvydivyansh/auth_service_logmonitor"
}

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

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecsTaskExecutionRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{
      Action    = "sts:AssumeRole",
      Effect    = "Allow",
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_attach" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_cloudwatch_log_group" "ecs_log_group" {
  name              = "/ecs/logmonitor"
  retention_in_days = 7
}


resource "aws_ecs_task_definition" "logmonitor_task" {
  family                   = "logmonitor-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_execution_role.arn 
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "auth_service"
      image     = var.auth_service_image 
      essential = true
      portMappings = [{
        containerPort = 5000
        protocol      = "tcp"
        hostPort      = 5000
        name          = "logmonitor-http"
        appProtocol   = "http"
      }]
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs_log_group.name,
          awslogs-region        = var.aws_region,
          awslogs-stream-prefix = "ecs"
        }
      },
      environment = [
        {
          name  = "DATABASE_URL"
          value = "mysql+pymysql://${var.db_username}:${var.db_password}@${aws_db_instance.logmonitor.endpoint}/${var.db_name}"
        },
        {
          name  = "PRIVATE_KEY"
          value = file("${path.module}/secrets/private.pem")
        },
        {
          name  = "PUBLIC_KEY"
          value = file("${path.module}/secrets/public.pem")
        }
      ]

      #  healthCheck = {
      #   command     = ["CMD-SHELL", "curl -f http://localhost:5000/health || exit 1"]
      #   interval    = 30
      #   timeout     = 5
      #   retries     = 3
      #   startPeriod = 10
      # }

      
    }
  ])
}

resource "aws_ecs_service" "logmonitor_service" {
  name            = "logmonitor-auth-service"
  cluster         = aws_ecs_cluster.logmonitor_cluster.id
  task_definition = aws_ecs_task_definition.logmonitor_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_subnet.private_subnet1.id,aws_subnet.private_subnet2.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_attach]
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