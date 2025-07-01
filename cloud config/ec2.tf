# variable "aws_region" {
#   default = "ap-south-1"
# }

# variable "key_name" {
#   description = "EC2 Key pair name"
#   default     = "logMonitor-nginx"
# }


# resource "aws_instance" "nginx_ec2" {
#   ami                    = "ami-0f918f7e67a3323f0" # Ubuntu 22.04 LTS in ap-south-1 (Mumbai)
#   instance_type          = "t2.micro"
#   subnet_id              = aws_subnet.public_subnet1.id
#   vpc_security_group_ids = [aws_security_group.nginx_sg.id]
#   key_name               = var.key_name
#   associate_public_ip_address = true

#   user_data = <<-EOF
#               #!/bin/bash
#               apt-get update -y
#               apt-get install nginx -y

#               cat > /etc/nginx/nginx.conf <<'EOL'
#               events {}

#               http {
#                 upstream auth_service {
#                   server ${awsecs}:5000;
#                 }

#                 server {
#                   listen 80;

#                   location /auth/ {
#                     if ($request_method = OPTIONS ) {
#                       add_header 'Access-Control-Allow-Origin' $http_origin;
#                       add_header 'Access-Control-Allow-Credentials' 'true';
#                       add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
#                       add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
#                       add_header 'Access-Control-Max-Age' 1728000;
#                       add_header 'Content-Length' 0;
#                       add_header 'Content-Type' 'text/plain charset=UTF-8';
#                       return 204;
#                     }

#                     proxy_pass http://auth_service/;
#                     proxy_set_header Host $host;
#                     proxy_set_header X-Real-IP $remote_addr;

#                     add_header 'Access-Control-Allow-Origin' $http_origin always;
#                     add_header 'Access-Control-Allow-Credentials' 'true' always;
#                     add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;
#                     add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;
#                   }
#                 }
#               }
#               EOL

#               systemctl enable nginx
#               systemctl restart nginx
#               EOF

#   tags = {
#     Name = "nginx-proxy-ec2"
#   }
# }

# resource "aws_security_group" "nginx_sg" {
#   name        = "nginx-sg"
#   description = "Allow HTTP and SSH"
#   vpc_id      = aws_vpc.logmonitor_vpc.id

#   ingress {
#     from_port   = 22
#     to_port     = 22
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # SSH (lock down for prod)
#   }

#   ingress {
#     from_port   = 80
#     to_port     = 80
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"] # HTTP
#   }

#   egress {
#     from_port   = 0
#     to_port     = 0
#     protocol    = "-1"
#     cidr_blocks = ["0.0.0.0/0"]
#   }

#   tags = {
#     Name = "nginx-sg"
#   }
# }
