variable "analyze_consumer_service_image" {
    default = "techsavvydivyansh/analyze_consumer_service_logmonitor"
}


resource "aws_ecs_task_definition" "logmonitor_analyze_consumer_task" {
  family                   = "logmonitor-analyze-consumer-task"
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
      name      = "analyze_consumer_service"
      image     = var.analyze_consumer_service_image 
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

resource "aws_ecs_service" "logmonitor_analyze_consumer_service" {
  name            = "logmonitor-analyze_consumer-service"
  cluster         = aws_ecs_cluster.logmonitor_cluster.id
  task_definition = aws_ecs_task_definition.logmonitor_analyze_consumer_task.arn
  launch_type     = "FARGATE"
  desired_count   = 1

  network_configuration {
    subnets          = [aws_subnet.private_subnet1.id,aws_subnet.private_subnet2.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = false
  }

  depends_on = [aws_iam_role_policy_attachment.ecs_task_execution_attach]
}
