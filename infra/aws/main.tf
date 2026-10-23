data "aws_availability_zones" "available" { state = "available" }
data "aws_caller_identity" "current" {}
data "aws_ssm_parameter" "al2023" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64"
}
locals {
  prefix = format("%s-%s", var.name, var.environment)
  zones = slice(data.aws_availability_zones.available.names, 0, 2)
}
resource "aws_vpc" "app" {
  cidr_block = "10.62.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = { Name = local.prefix }
}
resource "aws_internet_gateway" "app" {
  vpc_id = aws_vpc.app.id
}
resource "aws_subnet" "public" {
  count = 2
  vpc_id = aws_vpc.app.id
  cidr_block = cidrsubnet(aws_vpc.app.cidr_block, 8, count.index)
  availability_zone = local.zones[count.index]
  map_public_ip_on_launch = false
  tags = { Name = format("%s-public-%d", local.prefix, count.index + 1) }
}
resource "aws_subnet" "database" {
  count = 2
  vpc_id = aws_vpc.app.id
  cidr_block = cidrsubnet(aws_vpc.app.cidr_block, 8, count.index + 20)
  availability_zone = local.zones[count.index]
  map_public_ip_on_launch = false
  tags = { Name = format("%s-db-%d", local.prefix, count.index + 1) }
}
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.app.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.app.id
  }
}
resource "aws_route_table_association" "public" {
  count = 2
  subnet_id = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
resource "aws_security_group" "alb" {
  name_prefix = format("%s-alb-", local.prefix)
  vpc_id = aws_vpc.app.id
  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    cidr_blocks = [aws_vpc.app.cidr_block]
  }
}
resource "aws_security_group" "app" {
  name_prefix = format("%s-app-", local.prefix)
  vpc_id = aws_vpc.app.id
  ingress {
    from_port = 3000
    to_port = 3000
    protocol = "tcp"
    security_groups = [aws_security_group.alb.id]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  # No SSH ingress. EC2 SSM for operator access.
}
resource "aws_security_group" "database" {
  name_prefix = format("%s-db-", local.prefix)
  vpc_id = aws_vpc.app.id
  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
resource "aws_db_subnet_group" "app" {
  name = format("%s-db", local.prefix)
  subnet_ids = aws_subnet.database[*].id
}
resource "aws_db_instance" "app" {
  identifier = format("%s-db", local.prefix)
  engine = "postgres"
  engine_version = "16"
  instance_class = var.db_instance_class
  db_name = "devfolio"
  username = "devfolio_admin"
  manage_master_user_password = true
  allocated_storage = 20
  max_allocated_storage = 100
  storage_type = "gp3"
  storage_encrypted = true
  db_subnet_group_name = aws_db_subnet_group.app.name
  vpc_security_group_ids = [aws_security_group.database.id]
  publicly_accessible = false
  multi_az = var.environment == "production"
  backup_retention_period = 30
  backup_window = "03:00-04:00"
  maintenance_window = "sun:04:00-sun:05:00"
  auto_minor_version_upgrade = true
  deletion_protection = var.environment == "production"
  skip_final_snapshot = false
  final_snapshot_identifier = format("%s-final-manual-rename-before-destroy", local.prefix)
  copy_tags_to_snapshot = true
}
resource "aws_s3_bucket" "artifacts" {
  bucket_prefix = format("%s-release-", local.prefix)
}
resource "aws_s3_bucket" "media" {
  bucket_prefix = format("%s-media-", local.prefix)
}
resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_public_access_block" "media" {
  bucket = aws_s3_bucket.media.id
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}
resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_versioning" "media" {
  bucket = aws_s3_bucket.media.id
  versioning_configuration { status = "Enabled" }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
resource "aws_s3_bucket_server_side_encryption_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  rule { apply_server_side_encryption_by_default { sse_algorithm = "AES256" } }
}
resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id
  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["POST"]
    allowed_origins = [format("https://%s", var.site_domain)]
    max_age_seconds = 300
  }
}
resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    id = "stale-noncurrent-artifacts"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration { noncurrent_days = 90 }
  }
}
resource "aws_secretsmanager_secret" "runtime" {
  name = format("%s-runtime-env", local.prefix)
  description = "Operator-provisioned dotenv secrets. Terraform deliberately never writes a value."
  recovery_window_in_days = 30
}
resource "aws_cloudwatch_log_group" "app" {
  name = format("/devfolio/%s/application", local.prefix)
  retention_in_days = var.environment == "production" ? 90 : 30
}
resource "aws_iam_role" "host" {
  name = format("%s-ec2-host", local.prefix)
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Service = "ec2.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}
resource "aws_iam_role_policy_attachment" "ssm" {
  role = aws_iam_role.host.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}
resource "aws_iam_role_policy" "host" {
  role = aws_iam_role.host.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:GetObject"], Resource = [format("%s/releases/%s/*", aws_s3_bucket.artifacts.arn, var.environment)] },
      { Effect = "Allow", Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"], Resource = [format("%s/private/staging/*", aws_s3_bucket.media.arn)] },
      { Effect = "Allow", Action = ["secretsmanager:GetSecretValue"], Resource = [aws_secretsmanager_secret.runtime.arn] },
      { Effect = "Allow", Action = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"], Resource = [format("%s:*", aws_cloudwatch_log_group.app.arn)] }
    ]
  })
}
resource "aws_iam_instance_profile" "host" {
  name = format("%s-host", local.prefix)
  role = aws_iam_role.host.name
}
resource "aws_instance" "host" {
  ami = data.aws_ssm_parameter.al2023.value
  instance_type = var.instance_type
  subnet_id = aws_subnet.public[0].id
  associate_public_ip_address = true
  vpc_security_group_ids = [aws_security_group.app.id]
  iam_instance_profile = aws_iam_instance_profile.host.name
  metadata_options {
    http_tokens = "required"
    http_endpoint = "enabled"
  }
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted = true
  }
  user_data = templatefile(format("%s/user-data.sh.tftpl", path.module), {
    env_secret_arn = aws_secretsmanager_secret.runtime.arn
    log_group = aws_cloudwatch_log_group.app.name
    aws_region = var.aws_region
  })
  tags = { Name = format("%s-host", local.prefix) }
}
resource "aws_lb" "app" {
  name = format("%s-alb", local.prefix)
  internal = false
  load_balancer_type = "application"
  subnets = aws_subnet.public[*].id
  security_groups = [aws_security_group.alb.id]
  drop_invalid_header_fields = true
  enable_deletion_protection = var.environment == "production"
}
resource "aws_lb_target_group" "app" {
  name = format("%s-app", local.prefix)
  port = 3000
  protocol = "HTTP"
  vpc_id = aws_vpc.app.id
  target_type = "instance"
  deregistration_delay = 30
  health_check {
    path = "/readyz"
    protocol = "HTTP"
    matcher = "200"
    interval = 30
    healthy_threshold = 2
    unhealthy_threshold = 2
  }
}
resource "aws_lb_target_group_attachment" "app" {
  target_group_arn = aws_lb_target_group.app.arn
  target_id = aws_instance.host.id
  port = 3000
}
resource "aws_lb_listener" "redirect" {
  load_balancer_arn = aws_lb.app.arn
  port = 80
  protocol = "HTTP"
  default_action {
    type = "redirect"
    redirect { port = "443", protocol = "HTTPS", status_code = "HTTP_301" }
  }
}
resource "aws_lb_listener" "tls" {
  load_balancer_arn = aws_lb.app.arn
  port = 443
  protocol = "HTTPS"
  ssl_policy = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn = var.acm_certificate_arn
  default_action {
    type = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}
resource "aws_route53_record" "site" {
  count = var.route53_zone_id == "" ? 0 : 1
  zone_id = var.route53_zone_id
  name = var.site_domain
  type = "A"
  alias {
    name = aws_lb.app.dns_name
    zone_id = aws_lb.app.zone_id
    evaluate_target_health = true
  }
}
resource "aws_iam_role" "deploy" {
  name = format("%s-gh-deploy", local.prefix)
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{ Effect = "Allow", Principal = { Federated = var.github_oidc_provider_arn },
      Action = "sts:AssumeRoleWithWebIdentity",
      Condition = { StringEquals = {
        "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
        "token.actions.githubusercontent.com:sub" = var.github_oidc_subject
      } }
    }]
  })
}
resource "aws_iam_role_policy" "deploy" {
  role = aws_iam_role.deploy.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      { Effect = "Allow", Action = ["s3:PutObject"], Resource = [format("%s/releases/%s/*", aws_s3_bucket.artifacts.arn, var.environment)] },
      { Effect = "Allow", Action = ["ssm:SendCommand"], Resource = [
        format("arn:aws:ssm:%s::document/AWS-RunShellScript", var.aws_region),
        aws_instance.host.arn
      ] },
      { Effect = "Allow", Action = ["ssm:GetCommandInvocation", "ssm:ListCommandInvocations"], Resource = ["*"] }
    ]
  })
}
resource "aws_sns_topic" "alerts" {
  name = format("%s-ops", local.prefix)
}
resource "aws_sns_topic_subscription" "email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol = "email"
  endpoint = var.alert_email
}
resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  alarm_name = format("%s-alb-5xx", local.prefix)
  namespace = "AWS/ApplicationELB"
  metric_name = "HTTPCode_Target_5XX_Count"
  statistic = "Sum"
  period = 300
  evaluation_periods = 2
  threshold = 5
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions = { LoadBalancer = aws_lb.app.arn_suffix }
  alarm_actions = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"
}
resource "aws_cloudwatch_metric_alarm" "unhealthy" {
  alarm_name = format("%s-unhealthy-target", local.prefix)
  namespace = "AWS/ApplicationELB"
  metric_name = "UnHealthyHostCount"
  statistic = "Maximum"
  period = 60
  evaluation_periods = 2
  threshold = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions = {
    LoadBalancer = aws_lb.app.arn_suffix
    TargetGroup = aws_lb_target_group.app.arn_suffix
  }
  alarm_actions = [aws_sns_topic.alerts.arn]
  treat_missing_data = "breaching"
}
resource "aws_cloudwatch_metric_alarm" "db_storage" {
  alarm_name = format("%s-db-low-storage", local.prefix)
  namespace = "AWS/RDS"
  metric_name = "FreeStorageSpace"
  statistic = "Average"
  period = 300
  evaluation_periods = 2
  threshold = 2147483648
  comparison_operator = "LessThanThreshold"
  dimensions = { DBInstanceIdentifier = aws_db_instance.app.id }
  alarm_actions = [aws_sns_topic.alerts.arn]
  treat_missing_data = "missing"
}
resource "aws_cloudwatch_metric_alarm" "host_status" {
  alarm_name = format("%s-ec2-status", local.prefix)
  namespace = "AWS/EC2"
  metric_name = "StatusCheckFailed"
  statistic = "Maximum"
  period = 60
  evaluation_periods = 2
  threshold = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  dimensions = { InstanceId = aws_instance.host.id }
  alarm_actions = [aws_sns_topic.alerts.arn]
  treat_missing_data = "missing"
}
resource "aws_budgets_budget" "cost" {
  name = format("%s-monthly-alert", local.prefix)
  budget_type = "COST"
  limit_amount = tostring(var.monthly_budget_usd)
  limit_unit = "USD"
  time_unit = "MONTHLY"
  notification {
    comparison_operator = "GREATER_THAN"
    threshold = 80
    threshold_type = "PERCENTAGE"
    notification_type = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}
