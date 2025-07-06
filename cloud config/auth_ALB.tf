# Target group for auth service
resource "aws_lb_target_group" "tg_auth" {
  name        = "tg-auth"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.logmonitor_vpc.id                                                                               

  health_check {
    path                = "/auth/health"
    protocol            = "HTTP"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener rule for /auth/*
resource "aws_lb_listener_rule" "auth_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 11

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_auth.arn
  }

  condition {
    path_pattern {
      values = ["/auth/*"]
    }
  }
}
