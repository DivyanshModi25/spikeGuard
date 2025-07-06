resource "aws_security_group" "lb_sg" {
  name        = "alb-security-group"
  description = "Allow HTTP traffic to ALB"
  vpc_id      = aws_vpc.logmonitor_vpc.id

  ingress {
    description = "Allow HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  

  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "alb-sg"
  }
}


# Load Balancer
resource "aws_lb" "logMonitor_alb" {
  name               = "logmonitor-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.lb_sg.id]
  subnets            = [aws_subnet.public_subnet1.id,aws_subnet.public_subnet2.id]
}


# Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.logMonitor_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "404 Not Found"
      status_code  = "404"
    }
  }
}