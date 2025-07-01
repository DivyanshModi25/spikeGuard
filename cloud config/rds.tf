resource "aws_db_subnet_group" "logmonitor_subnet_group" {
  name       = "logmonitor-private-subnet-group"
  subnet_ids = [
    aws_subnet.private_subnet1.id,
    aws_subnet.private_subnet2.id
  ]

  tags = {
    Name = "logmonitor-subnet-group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "rds-sg"
  description = "Allow MySQL traffic within VPC"
  vpc_id      = aws_vpc.logmonitor_vpc.id

  ingress {
    from_port   = 3306
    to_port     = 3306
    protocol    = "tcp"
    cidr_blocks = [aws_subnet.private_subnet1.cidr_block,aws_subnet.private_subnet2.cidr_block,"103.216.213.54/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "logmonitor-db-sg"
  }
}

resource "aws_db_instance" "logmonitor" {
  identifier             = "logmonitor"
  engine                 = "mysql"
  engine_version         = "8.0"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  username               = "logUser"
  password               = "11111111"
  db_name                = "logmonitor"
  publicly_accessible    = false
  skip_final_snapshot    = true
  deletion_protection    = false

  db_subnet_group_name   = aws_db_subnet_group.logmonitor_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  tags = {
    Name = "logmonitor-db"
  }
}
