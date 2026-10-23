terraform {
  backend "s3" {}
  required_version = ">= 1.11.0, < 1.12.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "= 6.70.0"
    }
  }
}
provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "devfolio-os"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
