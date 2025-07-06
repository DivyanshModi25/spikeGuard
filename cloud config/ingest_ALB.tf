# Target group for ingest service
resource "aws_lb_target_group" "tg_ingest" {
  name        = "tg-ingest"
  port        = 5000
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = aws_vpc.logmonitor_vpc.id                                                                               

  health_check {
    path                = "/ingest/health"
    protocol            = "HTTP"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# Listener rule for /ingest/*
resource "aws_lb_listener_rule" "ingest_rule" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tg_ingest.arn
  }

  condition {
    path_pattern {
      values = ["/ingest/*"]
    }
  }
}
