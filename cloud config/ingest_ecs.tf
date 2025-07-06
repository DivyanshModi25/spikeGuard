variable "ingest_service_image" {
    default = "techsavvydivyansh/ingest_service_logmonitor"
}


resource "aws_ecs_task_definition" "logmonitor_ingest_task" {
  family                   = "logmonitor-ingest-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn = data.aws_iam_role.ecs_task_execution_role.arn
  task_role_arn      = data.aws_iam_role.ecs_task_execution_role.arn
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "ingest_service"
      image     = var.ingest_service_image 
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
          name  = "KAFKA_BROKER"
          value = "${aws_instance.kafka_ec2.private_ip}:9092"
        },
      ]
      
    }
  ])
}

resource "aws_ecs_service" "logmonitor_ingest_service" {
  name            = "logmonitor-ingest-service"
  cluster         = aws_ecs_cluster.logmonitor_cluster.id
  task_definition = aws_ecs_task_definition.logmonitor_ingest_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_subnet.private_subnet1.id,aws_subnet.private_subnet2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tg_ingest.arn 
    container_name   = "ingest_service"
    container_port   = 5000
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_attach]
}
