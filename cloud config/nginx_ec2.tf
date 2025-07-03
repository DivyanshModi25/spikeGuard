
resource "aws_security_group" "nginx_sg" {
  name        = "nginx-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.logmonitor_vpc.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SSH (lock down for prod)
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # HTTP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "nginx-sg"
  }
}


resource "aws_instance" "nginx_ec2" {
  ami                    = "ami-0f918f7e67a3323f0" # Ubuntu 24.04 LTS in ap-south-1 (Mumbai)
  instance_type          = "t2.micro"
  subnet_id              = aws_subnet.public_subnet1.id
  vpc_security_group_ids = [aws_security_group.nginx_sg.id]
  key_name               = var.key_name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash -xe
              sudo apt update -y

              touch test.txt

              sudo apt install nginx -y
                
             
              EOF

  tags = {
    Name = "nginx-proxy-ec2"
  }
}
