resource "aws_vpc" "logmonitor_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "logmonitor-vpc"
  }
}

resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.logmonitor_vpc.id

  tags = {
    Name = "logmonitor-igw"
  }
}

resource "aws_eip" "nat_eip" {
  tags = {
    Name = "logmonitor-nat-eip"
  }
}


resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat_eip.id
  subnet_id     = aws_subnet.public_subnet1.id

  tags = {
    Name = "logmonitor-nat-public1-ap-south-1a"
  }
}

# Subnets
resource "aws_subnet" "public_subnet1" {
  vpc_id                  = aws_vpc.logmonitor_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "ap-south-1a"
  map_public_ip_on_launch = true

  tags = {
    Name = "logmonitor-subnet-public1-ap-south-1a"
  }
}

resource "aws_subnet" "private_subnet1" {
  vpc_id            = aws_vpc.logmonitor_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "ap-south-1a"

  tags = {
    Name = "logmonitor-subnet-private1-ap-south-1a"
  }
}

resource "aws_subnet" "public_subnet2" {
  vpc_id                  = aws_vpc.logmonitor_vpc.id
  cidr_block              = "10.0.3.0/24"
  availability_zone       = "ap-south-1b"
  map_public_ip_on_launch = true

  tags = {
    Name = "logmonitor-subnet-public2-ap-south-1b"
  }
}

resource "aws_subnet" "private_subnet2" {
  vpc_id            = aws_vpc.logmonitor_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "ap-south-1b"

  tags = {
    Name = "logmonitor-subnet-private2-ap-south-1b"
  }
}

# Route Tables
resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.logmonitor_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "logmonitor-rtb-public"
  }
}

resource "aws_route_table_association" "public_rt_assoc1" {
  subnet_id      = aws_subnet.public_subnet1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_rt_assoc2" {
  subnet_id      = aws_subnet.public_subnet2.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table" "private_rt1" {
  vpc_id = aws_vpc.logmonitor_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "logmonitor-rtb-private1-ap-south-1a"
  }
}

resource "aws_route_table_association" "private_rt_assoc1" {
  subnet_id      = aws_subnet.private_subnet1.id
  route_table_id = aws_route_table.private_rt1.id
}

resource "aws_route_table" "private_rt2" {
  vpc_id = aws_vpc.logmonitor_vpc.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = {
    Name = "logmonitor-rtb-private2-ap-south-1b"
  }
}

resource "aws_route_table_association" "private_rt_assoc2" {
  subnet_id      = aws_subnet.private_subnet2.id
  route_table_id = aws_route_table.private_rt2.id
}
