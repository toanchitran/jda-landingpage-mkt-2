#!/bin/bash

echo "🔧 Fixing deployment issues..."

# Kill any process running on port 3000
echo "🛑 Stopping processes on port 3000..."
sudo lsof -ti:3000 | xargs sudo kill -9 2>/dev/null || true

# Kill any process running on port 3013
echo "🛑 Stopping processes on port 3013..."
sudo lsof -ti:3013 | xargs sudo kill -9 2>/dev/null || true

# Stop PM2 processes
echo "🛑 Stopping PM2 processes..."
pm2 delete all 2>/dev/null || true

# Navigate to the correct directory
cd /root/jda-landingpage-mkt-1

# Check if the directory exists and has the right content
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please make sure you're in the correct directory."
    exit 1
fi

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Create logs directory
mkdir -p logs

# Start the application with PM2
echo "🚀 Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

echo "✅ Fix completed!"
echo "📊 PM2 Status:"
pm2 status

echo "🌐 Testing the application..."
sleep 3
curl -s http://localhost:3013/health || echo "❌ Application not responding on port 3013" 