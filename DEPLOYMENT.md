# AWS Elastic Beanstalk Deployment Guide

This guide provides step-by-step instructions to deploy the URL Shortener API to AWS Elastic Beanstalk.

## Prerequisites

### 1. AWS CLI Setup
```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS CLI
aws configure
# Enter your AWS Access Key ID, Secret Access Key, region, and output format
```

### 2. EB CLI Setup
```bash
# Install EB CLI
pip install awsebcli

# Verify installation
eb --version
```

### 3. Required AWS Services
- **RDS MySQL**: For database storage
- **ElastiCache Redis**: For caching (optional but recommended)
- **IAM Role**: For EB to access RDS and ElastiCache

## Step 1: Create RDS MySQL Database

```bash
# Create RDS MySQL instance
aws rds create-db-instance \
    --db-instance-identifier urlshortener-mysql \
    --db-instance-class db.t3.micro \
    --engine mysql \
    --engine-version 8.0.35 \
    --master-username admin \
    --master-user-password YourSecurePassword123! \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxxx \
    --db-subnet-group-name default \
    --backup-retention-period 7 \
    --multi-az \
    --storage-encrypted \
    --storage-type gp2

# Wait for instance to be available (check AWS Console)
aws rds describe-db-instances --db-instance-identifier urlshortener-mysql
```

## Step 2: Create ElastiCache Redis Cluster (Optional)

```bash
# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
    --cache-subnet-group-name urlshortener-redis-subnet \
    --cache-subnet-group-description "Subnet group for URL Shortener Redis" \
    --subnet-ids subnet-xxxxxxxxx subnet-yyyyyyyyy

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
    --cache-cluster-id urlshortener-redis \
    --cache-node-type cache.t3.micro \
    --engine redis \
    --num-cache-nodes 1 \
    --cache-subnet-group-name urlshortener-redis-subnet \
    --security-group-ids sg-xxxxxxxxx
```

## Step 3: Initialize Elastic Beanstalk Application

```bash
# Navigate to project directory
cd /path/to/url-shortner-mark-1

# Initialize EB application
eb init

# Select region (e.g., us-east-1)
# Select application name (e.g., url-shortener-api)
# Select platform: Node.js
# Select platform version: Node.js 22
# Setup SSH: Yes (recommended)
```

## Step 4: Create Environment

```bash
# Create production environment
eb create production

# Or create with specific configuration
eb create production \
    --instance-type t3.micro \
    --min-size 1 \
    --max-size 3 \
    --keyname your-key-pair
```

## Step 5: Configure Environment Variables

```bash
# Set environment variables
eb setenv \
    MYSQL_HOST=your-rds-endpoint.amazonaws.com \
    MYSQL_PORT=3306 \
    MYSQL_USERNAME=admin \
    MYSQL_PASSWORD=YourSecurePassword123! \
    MYSQL_DATABASE=urlshortener \
    REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com \
    REDIS_PORT=6379 \
    REDIS_PASSWORD=your-redis-password \
    REDIS_DB=0 \
    BASE_URL=https://your-app-name.region.elasticbeanstalk.com \
    JWT_SECRET=your-super-secure-jwt-secret-key \
    JWT_EXPIRES_IN=1d

# Verify environment variables
eb printenv
```

## Step 6: Update Security Groups

```bash
# Get your EB environment security group
eb status

# Update RDS security group to allow EB access
aws ec2 authorize-security-group-ingress \
    --group-id sg-rds-security-group-id \
    --protocol tcp \
    --port 3306 \
    --source-group sg-eb-security-group-id

# Update ElastiCache security group (if using)
aws ec2 authorize-security-group-ingress \
    --group-id sg-redis-security-group-id \
    --protocol tcp \
    --port 6379 \
    --source-group sg-eb-security-group-id
```

## Step 7: Deploy Application

```bash
# Deploy the application
eb deploy

# Monitor deployment
eb logs --all

# Check application health
eb health
```

## Step 8: Verify Deployment

```bash
# Get application URL
eb status

# Test the API
curl https://your-app-name.region.elasticbeanstalk.com/health

# Test URL shortening
curl -X POST https://your-app-name.region.elasticbeanstalk.com/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com"}'

# Test URL redirection (replace with actual short code)
curl -I https://your-app-name.region.elasticbeanstalk.com/a1B2c3D
```

## Step 9: Set Up Custom Domain (Optional)

```bash
# Configure custom domain
eb config

# In the config file, add:
# aws:elasticbeanstalk:customoption:DomainName: your-domain.com
# aws:elasticbeanstalk:customoption:SSL: arn:aws:acm:region:account:certificate/certificate-id

# Apply configuration
eb deploy
```

## Step 10: Database Migration

```bash
# Connect to your EB instance
eb ssh

# Run database migration (if needed)
# The application will auto-create tables on first run due to synchronize: true in development
# For production, consider using proper migrations

# Exit SSH
exit
```

## Monitoring and Maintenance

### View Logs
```bash
# View recent logs
eb logs

# View logs in real-time
eb logs --all --stream

# Download logs
eb logs --all --zip
```

### Scale Application
```bash
# Scale up instances
eb scale 3

# Scale down instances
eb scale 1
```

### Update Application
```bash
# Deploy new version
eb deploy

# Rollback if needed
eb deploy --version previous
```

### Environment Management
```bash
# List environments
eb list

# Switch environments
eb use production

# Terminate environment
eb terminate production
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check security group rules
   - Verify RDS endpoint and credentials
   - Check VPC configuration

2. **Redis Connection Issues**
   - Verify ElastiCache endpoint
   - Check security group rules
   - Ensure Redis cluster is available

3. **Application Health Check Failures**
   - Check application logs: `eb logs`
   - Verify health endpoint: `/health`
   - Check environment variables

4. **Deployment Failures**
   - Check build logs in EB console
   - Verify all dependencies are in package.json
   - Check .ebignore file

### Useful Commands

```bash
# Check environment status
eb status

# View environment health
eb health

# Open application in browser
eb open

# SSH into instance
eb ssh

# View configuration
eb config

# View environment variables
eb printenv

# View recent events
eb events
```

## Security Best Practices

1. **Use IAM Roles**: Don't hardcode AWS credentials
2. **Enable Encryption**: Use encrypted RDS and ElastiCache
3. **Security Groups**: Restrict access to necessary ports only
4. **Environment Variables**: Use EB environment variables for sensitive data
5. **HTTPS**: Configure SSL certificate for custom domains
6. **Regular Updates**: Keep dependencies and EB platform updated

## Cost Optimization

1. **Use Spot Instances**: For non-critical environments
2. **Auto Scaling**: Configure based on actual usage
3. **Reserved Instances**: For predictable workloads
4. **Monitor Usage**: Use AWS Cost Explorer
5. **Clean Up**: Terminate unused environments

## Production Checklist

- [ ] RDS MySQL instance created and accessible
- [ ] ElastiCache Redis cluster created (optional)
- [ ] Security groups properly configured
- [ ] Environment variables set correctly
- [ ] Application deployed successfully
- [ ] Health checks passing
- [ ] Custom domain configured (if needed)
- [ ] SSL certificate installed (if using custom domain)
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Documentation updated

## Support

For issues related to:
- **AWS Elastic Beanstalk**: Check AWS documentation and support
- **Application Code**: Review logs and application-specific issues
- **Database**: Check RDS documentation and monitoring
- **Caching**: Check ElastiCache documentation and monitoring
