# Deployment Guide - Kane's Bookstore Payment System

## 🎯 Overview

This guide provides step-by-step instructions for deploying Kane's Bookstore hybrid payment system across development, staging, and production environments.

## 🏗 Pre-Deployment Checklist

### Required Accounts & Services

- [ ] GoHighLevel Agency/Sub-Account
- [ ] Stripe Account (Live + Test)
- [ ] NowPayments Account
- [ ] Domain with SSL Certificate
- [ ] Cloud Provider Account (AWS/GCP/Azure)
- [ ] Email Service Provider
- [ ] Monitoring Service (New Relic/Datadog)

### Required Credentials

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# NowPayments Configuration
NOWPAYMENTS_API_KEY_SANDBOX=...
NOWPAYMENTS_API_KEY_LIVE=...
NOWPAYMENTS_IPN_SECRET=...

# GoHighLevel Configuration
GHL_API_KEY=...
GHL_LOCATION_ID=...

# Database Configuration
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Application Configuration
NODE_ENV=production
DOMAIN=https://kanesbookstore.com
JWT_SECRET=...
ENCRYPTION_KEY=...
```

## 🔧 Development Environment Setup

### 1. Local Development

```bash
# Clone repository
git clone https://github.com/your-org/kane-bookstore-payment-system.git
cd kane-bookstore-payment-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development
# Edit .env.development with development credentials

# Set up database
npm run db:setup
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

### 2. Docker Development Environment

```yaml
# docker-compose.dev.yml
version: "3.8"
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: kanes_bookstore_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Run database migrations
docker-compose exec app npm run db:migrate

# View logs
docker-compose logs -f app
```

## 🚀 Production Deployment

### 1. Infrastructure Setup (AWS)

#### VPC and Networking

```bash
# Create VPC
aws ec2 create-vpc --cidr-block 10.0.0.0/16 --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=kanes-bookstore-vpc}]'

# Create subnets
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.1.0/24 --availability-zone us-east-1a
aws ec2 create-subnet --vpc-id vpc-xxx --cidr-block 10.0.2.0/24 --availability-zone us-east-1b

# Create internet gateway
aws ec2 create-internet-gateway --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=kanes-bookstore-igw}]'

# Attach internet gateway to VPC
aws ec2 attach-internet-gateway --vpc-id vpc-xxx --internet-gateway-id igw-xxx
```

#### Application Load Balancer

```bash
# Create security group for ALB
aws ec2 create-security-group --group-name kanes-bookstore-alb-sg --description "Security group for Kanes Bookstore ALB" --vpc-id vpc-xxx

# Add rules for HTTP/HTTPS
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id sg-xxx --protocol tcp --port 443 --cidr 0.0.0.0/0

# Create target group
aws elbv2 create-target-group --name kanes-bookstore-tg --protocol HTTP --port 3000 --vpc-id vpc-xxx --health-check-path /health

# Create load balancer
aws elbv2 create-load-balancer --name kanes-bookstore-alb --subnets subnet-xxx subnet-yyy --security-groups sg-xxx
```

#### RDS Database Setup

```bash
# Create DB subnet group
aws rds create-db-subnet-group --db-subnet-group-name kanes-bookstore-db-subnet --db-subnet-group-description "Subnet group for Kanes Bookstore" --subnet-ids subnet-xxx subnet-yyy

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier kanes-bookstore-prod \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --master-username admin \
  --master-user-password SecurePassword123! \
  --allocated-storage 100 \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name kanes-bookstore-db-subnet \
  --backup-retention-period 7 \
  --storage-encrypted \
  --multi-az
```

### 2. Container Deployment (ECS)

#### Dockerfile.prod

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

#### ECS Task Definition

```json
{
  "family": "kanes-bookstore-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "kanes-bookstore-app",
      "image": "your-account.dkr.ecr.region.amazonaws.com/kanes-bookstore:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:kanes-bookstore/database"
        },
        {
          "name": "STRIPE_SECRET_KEY",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:kanes-bookstore/stripe"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/kanes-bookstore",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3000/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

### 3. CI/CD Pipeline (GitHub Actions)

#### .github/workflows/deploy.yml

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: kanes-bookstore
  ECS_SERVICE: kanes-bookstore-service
  ECS_CLUSTER: kanes-bookstore-cluster

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run security audit
        run: npm audit --audit-level high

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build, tag, and push image to Amazon ECR
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -f Dockerfile.prod -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

      - name: Deploy to Amazon ECS
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          aws ecs update-service --cluster $ECS_CLUSTER --service $ECS_SERVICE --force-new-deployment

      - name: Wait for deployment
        run: |
          aws ecs wait services-stable --cluster $ECS_CLUSTER --services $ECS_SERVICE
```

## 🔧 GoHighLevel Configuration

### 1. Custom Fields Setup

```javascript
// GoHighLevel Custom Fields Configuration
const customFields = [
  {
    name: "Payment Method",
    type: "dropdown",
    options: ["stripe", "crypto"],
    isRequired: true,
  },
  {
    name: "Transaction ID",
    type: "text",
    isRequired: false,
  },
  {
    name: "Crypto Currency",
    type: "dropdown",
    options: ["BTC", "ETH", "USDC", "SOL"],
    isRequired: false,
  },
  {
    name: "Order Amount",
    type: "number",
    isRequired: true,
  },
  {
    name: "NFT Certificate ID",
    type: "text",
    isRequired: false,
  },
  {
    name: "Download Token",
    type: "text",
    isRequired: false,
  },
];

// Create custom fields via GHL API
const createCustomFields = async () => {
  for (const field of customFields) {
    await fetch(
      `https://services.leadconnectorhq.com/locations/${LOCATION_ID}/customFields`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GHL_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(field),
      }
    );
  }
};
```

### 2. Automation Workflows

```javascript
// Payment Confirmation Workflow
const paymentWorkflow = {
  name: "Payment Confirmation Flow",
  trigger: {
    type: "webhook",
    url: "/webhook/payment-completed",
  },
  actions: [
    {
      type: "email",
      template: "order-confirmation",
      delay: 0,
    },
    {
      type: "sms",
      template: "download-ready",
      delay: 300, // 5 minutes
    },
    {
      type: "tag",
      action: "add",
      tags: ["customer", "paid"],
    },
  ],
};

// Abandoned Cart Recovery
const abandonedCartWorkflow = {
  name: "Abandoned Cart Recovery",
  trigger: {
    type: "inactivity",
    duration: 1800, // 30 minutes
  },
  conditions: [
    {
      field: "payment_status",
      operator: "equals",
      value: "abandoned",
    },
  ],
  actions: [
    {
      type: "email",
      template: "cart-recovery-1",
      delay: 0,
    },
    {
      type: "email",
      template: "cart-recovery-2",
      delay: 86400, // 24 hours
    },
  ],
};
```

## 📊 Monitoring & Logging Setup

### 1. CloudWatch Configuration

```yaml
# cloudwatch-config.yml
version: "2"
agent:
  metrics_collection_interval: 60
  run_as_user: root

metrics:
  namespace: KanesBookstore/Application
  metrics_collected:
    cpu:
      measurement:
        - cpu_usage_idle
        - cpu_usage_iowait
        - cpu_usage_user
        - cpu_usage_system
      metrics_collection_interval: 60
    disk:
      measurement:
        - used_percent
      metrics_collection_interval: 60
      resources:
        - "*"
    mem:
      measurement:
        - mem_used_percent
      metrics_collection_interval: 60
    netstat:
      measurement:
        - tcp_established
        - tcp_time_wait
      metrics_collection_interval: 60

logs:
  logs_collected:
    files:
      collect_list:
        - file_path: /var/log/app/application.log
          log_group_name: /aws/ec2/kanes-bookstore
          log_stream_name: application
        - file_path: /var/log/app/payment.log
          log_group_name: /aws/ec2/kanes-bookstore
          log_stream_name: payments
```

### 2. Health Check Endpoints

```javascript
// Health check implementation
app.get("/health", async (req, res) => {
  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {},
  };

  try {
    // Database health
    await db.query("SELECT 1");
    health.services.database = "healthy";
  } catch (error) {
    health.services.database = "unhealthy";
    health.status = "unhealthy";
  }

  try {
    // Redis health
    await redis.ping();
    health.services.redis = "healthy";
  } catch (error) {
    health.services.redis = "unhealthy";
    health.status = "unhealthy";
  }

  try {
    // Stripe API health
    await stripe.balance.retrieve();
    health.services.stripe = "healthy";
  } catch (error) {
    health.services.stripe = "unhealthy";
    health.status = "unhealthy";
  }

  const statusCode = health.status === "healthy" ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness check
app.get("/ready", (req, res) => {
  res.status(200).json({
    status: "ready",
    timestamp: new Date().toISOString(),
  });
});
```

## 🔒 Security Hardening

### 1. WAF Configuration

```json
{
  "Name": "KanesBookstoreWAF",
  "Scope": "CLOUDFRONT",
  "DefaultAction": {
    "Type": "ALLOW"
  },
  "Rules": [
    {
      "Name": "RateLimitRule",
      "Priority": 1,
      "Statement": {
        "RateBasedStatement": {
          "Limit": 10000,
          "AggregateKeyType": "IP"
        }
      },
      "Action": {
        "Block": {}
      }
    },
    {
      "Name": "SQLInjectionRule",
      "Priority": 2,
      "Statement": {
        "ManagedRuleGroupStatement": {
          "VendorName": "AWS",
          "Name": "AWSManagedRulesSQLiRuleSet"
        }
      },
      "Action": {
        "Block": {}
      }
    }
  ]
}
```

### 2. SSL/TLS Configuration

```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name kanesbookstore.com;

    ssl_certificate /etc/ssl/certs/kanesbookstore.com.crt;
    ssl_certificate_key /etc/ssl/private/kanesbookstore.com.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## ✅ Post-Deployment Verification

### 1. Smoke Tests

```bash
#!/bin/bash
# smoke-test.sh

BASE_URL="https://kanesbookstore.com"

echo "Running smoke tests..."

# Health check
curl -f "$BASE_URL/health" || exit 1
echo "✓ Health check passed"

# Homepage
curl -f "$BASE_URL/" || exit 1
echo "✓ Homepage accessible"

# API health
curl -f "$BASE_URL/api/health" || exit 1
echo "✓ API health check passed"

# Test payment creation (test mode)
curl -X POST "$BASE_URL/api/payments/stripe/create-session" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"test","customer_id":"test"}' || exit 1
echo "✓ Payment creation test passed"

echo "All smoke tests passed!"
```

### 2. Performance Testing

```javascript
// k6 performance test
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "2m", target: 100 }, // Ramp up
    { duration: "5m", target: 100 }, // Steady state
    { duration: "2m", target: 200 }, // Peak load
    { duration: "5m", target: 200 }, // Peak steady
    { duration: "2m", target: 0 }, // Ramp down
  ],
};

export default function () {
  let response = http.get("https://kanesbookstore.com/");
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 2s": (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
```

## 🚨 Rollback Procedures

### 1. Application Rollback

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_TASK_DEFINITION_ARN=$1

if [ -z "$PREVIOUS_TASK_DEFINITION_ARN" ]; then
  echo "Usage: $0 <previous-task-definition-arn>"
  exit 1
fi

echo "Rolling back to task definition: $PREVIOUS_TASK_DEFINITION_ARN"

aws ecs update-service \
  --cluster kanes-bookstore-cluster \
  --service kanes-bookstore-service \
  --task-definition $PREVIOUS_TASK_DEFINITION_ARN

echo "Waiting for rollback to complete..."
aws ecs wait services-stable \
  --cluster kanes-bookstore-cluster \
  --services kanes-bookstore-service

echo "Rollback completed successfully!"
```

### 2. Database Rollback

```bash
#!/bin/bash
# db-rollback.sh

BACKUP_TIMESTAMP=$1

if [ -z "$BACKUP_TIMESTAMP" ]; then
  echo "Usage: $0 <backup-timestamp>"
  exit 1
fi

echo "Creating new RDS instance from backup..."
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier kanes-bookstore-rollback \
  --db-snapshot-identifier kanes-bookstore-$BACKUP_TIMESTAMP

echo "Database rollback initiated. Update connection strings when ready."
```

---

**Deployment Version**: 1.0
**Last Updated**: December 2024
**Maintained By**: DevOps Team
**Emergency Contact**: ops@kanesbookstore.com
