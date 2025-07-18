# VPC and Subnet Setup Based on Your Map
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "ap-south-1"
}


variable "aws_region" {
  default = "ap-south-1"
}