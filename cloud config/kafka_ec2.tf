
resource "aws_security_group" "kafka_sg" {
  name        = "kafka-internal-sg"
  description = "Allow HTTP and SSH"
  vpc_id      = aws_vpc.logmonitor_vpc.id

  ingress {
    description = "Kafka 9092 from private subnet 2"
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["10.0.4.0/24"]
  }

  ingress {
    description = "Kafka 9092 from private subnet 1"
    from_port   = 9092
    to_port     = 9092
    protocol    = "tcp"
    cidr_blocks = ["10.0.2.0/24"]
  }

  ingress {
    description = "SSH from public subnet (bastion host)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"] 
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "kafka-sg"
  }
}


resource "aws_instance" "kafka_ec2" {
  ami                    = "ami-0f918f7e67a3323f0" # Ubuntu 24.04 LTS in ap-south-1 (Mumbai)
  instance_type          = "t3.medium"
  subnet_id              = aws_subnet.private_subnet1.id 
  vpc_security_group_ids = [aws_security_group.kafka_sg.id]
  associate_public_ip_address = false 
  key_name = var.key_name

  depends_on = [ aws_nat_gateway.nat,aws_route_table_association.private_rt_assoc1,aws_route_table_association.private_rt_assoc2 ]

  user_data = <<-EOF
              #!/bin/bash -xe
              sudo apt update -y
              sudo apt install -y docker.io docker-compose
              sudo systemctl enable docker
              sudo systemctl start docker

              # Add ubuntu user to docker group to run without sudo
              sudo usermod -aG docker ubuntu

              newgrp docker
              cd /home/ubuntu

              PRIVATE_IP=$(hostname -I | awk '{print $1}')
              export PRIVATE_IP

              cat <<EOL > docker-compose.yml
              version: '3.8'
              services:
                zookeeper:
                  image: confluentinc/cp-zookeeper:7.5.0
                  container_name: zookeeper
                  restart: always
                  environment:
                    ZOOKEEPER_CLIENT_PORT: 2181
                    ZOOKEEPER_TICK_TIME: 2000
                  ports:
                    - "2181:2181"

                kafka:
                  image: confluentinc/cp-kafka:7.5.0
                  container_name: kafka
                  restart: always
                  depends_on:
                    - zookeeper
                  ports:
                    - "9092:9092"
                  environment:
                    KAFKA_BROKER_ID: 1
                    KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
                    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://$${PRIVATE_IP}:9092
                    KAFKA_LISTENERS: PLAINTEXT://0.0.0.0:9092
                    KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
                  depends_on:
                    - zookeeper
              EOL

              docker-compose up -d
              EOF
            

  tags = {
    Name = "logmonitor-kafka-ec2"
  }
}
