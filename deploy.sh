#!/bin/bash

# JD Alchemy Landing Page Deployment Script for Vultr
# This script will deploy the application to /root/jda-landingpage-mkt1

set -e  # Exit on any error

echo "🚀 Starting JD Alchemy Landing Page Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm if not already installed
if ! command -v node &> /dev/null; then
    echo "📥 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install PM2 globally if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📥 Installing PM2..."
    sudo npm install -g pm2
fi

# Install nginx if not already installed
if ! command -v nginx &> /dev/null; then
    echo "📥 Installing nginx..."
    sudo apt install -y nginx
fi

# Create directory if it doesn't exist
echo "📁 Setting up project directory..."
sudo mkdir -p /root/jda-landingpage-mkt-1
cd /root/jda-landingpage-mkt-1

# Clone or pull the repository
if [ -d ".git" ]; then
    echo "🔄 Pulling latest changes from GitHub..."
    git pull origin main
else
    echo "📥 Cloning repository from GitHub..."
    git clone https://github.com/brandbeam-ai/jda-landingpage-mkt-1.git .
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'jda-landingpage-mkt1',
    script: 'npm',
    args: 'start',
    cwd: '/root/jda-landingpage-mkt1',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3013
    },
    error_file: '/root/jda-landingpage-mkt-1/logs/err.log',
    out_file: '/root/jda-landingpage-mkt-1/logs/out.log',
    log_file: '/root/jda-landingpage-mkt-1/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start or restart the application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete jda-landingpage-mkt1 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup

echo "✅ Deployment completed successfully!"
echo "📊 PM2 Status:"
pm2 status 