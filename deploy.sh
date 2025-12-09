#!/bin/bash

# JD Alchemy Landing Page Deployment Script for Vultr
# This script will deploy the application to /root/jda-landingpage-mkt1

set -e  # Exit on any error

echo "🚀 Starting JD Alchemy Landing Page Deployment..."

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential

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

# Create .env file
echo "📝 Creating .env file..."
cat > .env << 'EOF'
AIRTABLE_API_KEY='patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231'
AIRTABLE_BASE_ID='app0YMWSt1LtrGu7S'
AIRTABLE_TABLE_ID='tblP52B81ccH8jICa'
CALENDLY_PERSONAL_ACCESS_TOKEN='eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ'
CALENDLY_USER_URI='https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96'
NEXT_PUBLIC_BASE_URL='http://45.77.249.188:3015'
NODE_ENV='production'
PORT=3015
HOST='45.77.249.188'
EOF

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
    name: 'jda-landingpage-mkt-2',
    script: 'npm',
    args: 'start',
    cwd: '/root/jda-landingpage-mkt-2',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3015,
      HOST: '45.77.249.188',
      NEXT_PUBLIC_BASE_URL: 'http://45.77.249.188:3015',
      AIRTABLE_API_KEY: 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231',
      AIRTABLE_BASE_ID: 'app0YMWSt1LtrGu7S',
      AIRTABLE_TABLE_ID: 'tblP52B81ccH8jICa',
      CALENDLY_PERSONAL_ACCESS_TOKEN: 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ',
      CALENDLY_USER_URI: 'https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96'
    },
    error_file: '/root/jda-landingpage-mkt-2/logs/err.log',
    out_file: '/root/jda-landingpage-mkt-2/logs/out.log',
    log_file: '/root/jda-landingpage-mkt-2/logs/combined.log',
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