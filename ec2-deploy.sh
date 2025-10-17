#!/bin/bash

# EC2 Production Deployment Script
# This script should be run on your EC2 instance

set -e

echo "🚀 Starting EC2 deployment..."

# Update system
echo "📦 Updating system packages..."
sudo yum update -y

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Docker (optional, for containerized deployment)
echo "📦 Installing Docker..."
sudo yum install -y docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /opt/todo-app
sudo chown $USER:$USER /opt/todo-app
cd /opt/todo-app

# Clone repository (replace with your actual repository URL)
echo "📥 Cloning repository..."
# git clone https://github.com/yourusername/boilerplate-nestjs.git .
# OR if you're uploading files directly:
# Copy your project files to /opt/todo-app/

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build application
echo "🔨 Building application..."
npm run build

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
NODE_ENV=production
PORT=3000

# MySQL Configuration (replace with your RDS endpoint)
MYSQL_HOST=your-rds-endpoint.amazonaws.com
MYSQL_PORT=3306
MYSQL_USERNAME=your-username
MYSQL_PASSWORD=your-secure-password
MYSQL_DATABASE=testLocalDB

# MongoDB Configuration (replace with your DocumentDB endpoint)
MONGODB_URI=mongodb://your-documentdb-endpoint:27017

# Redis Configuration (replace with your ElastiCache endpoint)
REDIS_HOST=your-elasticache-endpoint.cache.amazonaws.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=1d
EOF

# Set up PM2
echo "🚀 Setting up PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Configure firewall (if using iptables)
echo "🔥 Configuring firewall..."
sudo yum install -y iptables-services
sudo systemctl enable iptables
sudo systemctl start iptables

# Allow necessary ports
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # SSH
sudo iptables -A INPUT -p tcp --dport 3000 -j ACCEPT # Application
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT   # HTTP
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT  # HTTPS
sudo iptables -A INPUT -p tcp --dport 3306 -j ACCEPT # MySQL
sudo iptables -A INPUT -p tcp --dport 27017 -j ACCEPT # MongoDB
sudo iptables -A INPUT -p tcp --dport 6379 -j ACCEPT # Redis

# Save iptables rules
sudo service iptables save

# Install and configure Nginx (optional, for reverse proxy)
echo "🌐 Installing Nginx..."
sudo yum install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx

# Create Nginx configuration
echo "⚙️ Configuring Nginx..."
sudo tee /etc/nginx/conf.d/todo-app.conf > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/todo-app > /dev/null << EOF
/opt/todo-app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

# Create logs directory
mkdir -p /opt/todo-app/logs

# Set up monitoring script
echo "📊 Setting up monitoring..."
cat > /opt/todo-app/monitor.sh << 'EOF'
#!/bin/bash
# Simple monitoring script

echo "=== Todo App Status ==="
pm2 status

echo "=== System Resources ==="
free -h
df -h

echo "=== Application Logs (last 10 lines) ==="
pm2 logs todo-app --lines 10
EOF

chmod +x /opt/todo-app/monitor.sh

# Create backup script
echo "💾 Setting up backup script..."
cat > /opt/todo-app/backup.sh << 'EOF'
#!/bin/bash
# Backup script for database and application

BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/todo-app-$DATE.tar.gz /opt/todo-app --exclude=node_modules --exclude=logs

# Backup MySQL (if using local MySQL)
# mysqldump -u root -p$MYSQL_PASSWORD testLocalDB > $BACKUP_DIR/mysql-$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/todo-app/backup.sh

# Set up cron jobs
echo "⏰ Setting up cron jobs..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/todo-app/backup.sh") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/todo-app/monitor.sh > /opt/todo-app/logs/monitor.log 2>&1") | crontab -

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update the .env file with your actual database credentials"
echo "2. Configure your domain in Nginx configuration"
echo "3. Set up SSL certificate (Let's Encrypt recommended)"
echo "4. Test the application: curl http://localhost:3000/health"
echo ""
echo "🔧 Useful commands:"
echo "- Check app status: pm2 status"
echo "- View logs: pm2 logs todo-app"
echo "- Restart app: pm2 restart todo-app"
echo "- Monitor: /opt/todo-app/monitor.sh"
echo "- Backup: /opt/todo-app/backup.sh"
