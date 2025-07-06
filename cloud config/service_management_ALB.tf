# Target group for service_manage service
resource "aws_lb_target_group" "tg_service_manage" {
  name        = "tg-service-manage"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.logmonitor_vpc.id                                                                               

  health_check {
    path                = "/serviceManage/health"
    protocol            = "HTTP"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener rule for /service_manage/*
resource "aws_lb_listener_rule" "service_manage_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 13

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_service_manage.arn
  }

  condition {
    path_pattern {
      values = ["/serviceManage/*"]
    }
  }
}
