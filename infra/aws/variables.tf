variable "aws_region" {
  type = string
  description = "Operator-chosen AWS region. Do not apply until region/privacy approval."
}
variable "environment" {
  type = string
  default = "staging"
  validation {
    condition = contains(["staging", "production"], var.environment)
    error_message = "Environment must be staging or production."
  }
}
variable "name" {
  type = string
  default = "devfolio"
  validation {
    condition = can(regex("^[a-z][a-z0-9-]{2,18}$", var.name))
    error_message = "Use 3-19 lowercase letters, digits or hyphens, starting with a letter."
  }
}
variable "site_domain" {
  type = string
  description = "Approved hostname, no scheme (e.g. stage.example.com)."
}
variable "acm_certificate_arn" {
  type = string
  description = "A validated ACM TLS certificate in this region for site_domain."
}
variable "route53_zone_id" {
  type = string
  default = ""
  description = "Optional Route53 public hosted zone. Empty = manually configure DNS."
}
variable "alert_email" {
  type = string
  description = "Email for budget/incident notifications; subscription requires confirmation."
}
variable "monthly_budget_usd" {
  type = number
  description = "Approved monthly USD limit for AWS Budgets (alert only, not a hard spending cap)."
  validation {
    condition = var.monthly_budget_usd >= 10
    error_message = "Budget must be at least USD 10."
  }
}
variable "instance_type" {
  type = string
  default = "t3.small"
  description = "EC2 size; review capacity and pricing before apply."
}
variable "db_instance_class" {
  type = string
  default = "db.t4g.micro"
}
variable "github_oidc_provider_arn" {
  type = string
  description = "Existing AWS GitHub OIDC provider ARN (create/approve once separately)."
}
variable "github_oidc_subject" {
  type = string
  description = "Exact GitHub-issued OIDC sub for protected deployment environment. Default GitHub format is repo:OWNER/REPO:environment:ENV; custom issuer claims require separate validation. Never use a wildcard."
  validation {
    condition = can(regex("^repo:[^:*]+:environment:(staging|production)$", var.github_oidc_subject))
    error_message = "Expected exact repo:OWNER/REPO:environment:ENV OIDC subject."
  }
}

variable "enable_alb_instance_replacement" {
  type = bool
  default = false
  description = "Do not enable until a signed approved release is bootstrapped on new instances and ALB health is verified in staging."
}
