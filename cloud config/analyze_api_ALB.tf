# Target group for analyze_api service
resource "aws_lb_target_group" "tg_analyze_api" {
  name        = "tg-analyze-api"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.logmonitor_vpc.id                                                                               

  health_check {
    path                = "/analyze/health"
    protocol            = "HTTP"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener rule for /analyze_api/*
resource "aws_lb_listener_rule" "analyze_api_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 12

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_analyze_api.arn
  }

  condition {
    path_pattern {
      values = ["/analyze/*"]
    }
  }
}
