#!/bin/bash

# Fundraising Flywheel - Update Script
# This script updates the application on the Vultr server using GitHub and PM2
# Usage: Run from the application directory or let it auto-detect

set -e  # Exit on any error

# ANSI color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting Fundraising Flywheel update process...${NC}"

# Configuration (matching install.sh)
APP_NAME="jda-landingpage-mkt-2"
NEW_USER="jda"
SOURCE_DIR="/root/jda-landingpage-mkt-2"
TARGET_DIR="/home/$NEW_USER/$APP_NAME"

# Check if jda user exists
if ! id "$NEW_USER" &>/dev/null; then
    echo -e "${RED}❌ Error: User '$NEW_USER' does not exist${NC}"
    echo -e "${YELLOW}Please run install.sh first to create the user and set up the application.${NC}"
    exit 1
fi

# Check if source directory exists (where app is pulled)
if [ ! -d "$SOURCE_DIR" ]; then
    echo -e "${RED}❌ Error: Source directory $SOURCE_DIR not found${NC}"
    echo -e "${YELLOW}Please ensure the application is cloned/pulled to $SOURCE_DIR first.${NC}"
    exit 1
fi

# Check if source has git repository
if [ ! -d "$SOURCE_DIR/.git" ]; then
    echo -e "${RED}❌ Error: $SOURCE_DIR is not a git repository${NC}"
    echo -e "${YELLOW}Please ensure the application is properly cloned from git.${NC}"
    exit 1
fi

# Create target directory if it doesn't exist
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${BLUE}📂 Creating target directory: $TARGET_DIR${NC}"
    mkdir -p "$TARGET_DIR"
    chown -R $NEW_USER:$NEW_USER "$TARGET_DIR"
fi

# Copy files from source to target (excluding node_modules, .git, .env)
echo -e "${BLUE}📋 Copying files from $SOURCE_DIR to $TARGET_DIR...${NC}"
rsync -av --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude 'logs' "$SOURCE_DIR/" "$TARGET_DIR/"

# Set ownership to jda user
echo -e "${BLUE}🔒 Setting file permissions...${NC}"
chown -R $NEW_USER:$NEW_USER "$TARGET_DIR"
chmod -R 750 "$TARGET_DIR"

# Set APP_PATH to target directory (where app will run)
APP_PATH="$TARGET_DIR"
echo -e "${GREEN}✅ Application will run from: $APP_PATH${NC}"

# Change to target directory
cd "$TARGET_DIR"

# First, update the source directory (pull latest from git)
echo -e "${BLUE}📥 Pulling latest changes from GitHub (in source directory)...${NC}"
cd "$SOURCE_DIR"
git pull

# Now copy updated files to target
echo -e "${BLUE}📋 Copying updated files to $TARGET_DIR...${NC}"
rsync -av --exclude 'node_modules' --exclude '.git' --exclude '.env' --exclude 'logs' "$SOURCE_DIR/" "$TARGET_DIR/"

# Set ownership again after copy
chown -R $NEW_USER:$NEW_USER "$TARGET_DIR"

# Change back to target directory
cd "$TARGET_DIR"

# Run all update operations as jda user
echo -e "${BLUE}👤 Running update operations as user: $NEW_USER${NC}"
sudo -u $NEW_USER bash << EOF
set -e
APP_NAME="$APP_NAME"
TARGET_DIR="$TARGET_DIR"
cd "$TARGET_DIR"

# Update .env file with latest configuration (matching install.sh)
echo "⚙️  Updating .env file..."
cat > .env << 'ENVEOF'
AIRTABLE_API_KEY='patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231'
AIRTABLE_BASE_ID='app0YMWSt1LtrGu7S'
AIRTABLE_TABLE_ID='tblP52B81ccH8jICa'
CALENDLY_PERSONAL_ACCESS_TOKEN='eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ'
CALENDLY_USER_URI='https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96'
NEXT_PUBLIC_BASE_URL='https://fundraisingflywheel.io'
NODE_ENV='production'
PORT=3015
HOST='45.32.192.106'
ENVEOF
echo "✅ .env file updated"

# Update ecosystem.config.js with target path and latest env vars (matching install.sh)
echo "⚙️  Updating PM2 ecosystem configuration..."
cat > ecosystem.config.js << 'ECOSYSTEMEOF'
module.exports = {
  apps: [{
    name: 'ECOSYSTEM_APP_NAME_PLACEHOLDER',
    script: 'npm',
    args: 'start',
    cwd: 'ECOSYSTEM_TARGET_DIR_PLACEHOLDER',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3015,
      HOST: '45.32.192.106',
      NEXT_PUBLIC_BASE_URL: 'https://fundraisingflywheel.io',
      AIRTABLE_API_KEY: 'patuBi3WMEA1SssqX.0a634c1146471ac425c6e9ae49b7d4a36cca2656c1708c07dc77283e3cc6a231',
      AIRTABLE_BASE_ID: 'app0YMWSt1LtrGu7S',
      AIRTABLE_TABLE_ID: 'tblP52B81ccH8jICa',
      CALENDLY_PERSONAL_ACCESS_TOKEN: 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzU0NjQzMDkzLCJqdGkiOiI1MTY4YjBiNS05YmI1LTQ4YzctOTg5Yi0wNGNiMWJkMWEzZTgiLCJ1c2VyX3V1aWQiOiI0MmQzNTNjMC0zZjEwLTRiMjAtYjc0Zi0xYWM0NDJmMjlmOTYifQ.pWLAZgFEtv9R9HAxicRb-wNESpgnQDNyQPpBDKX5bBO_Lrxm98WQq_897ZCCjRoo_t6wyw-AKs5ss0FJHh7FyQ',
      CALENDLY_USER_URI: 'https://api.calendly.com/users/42d353c0-3f10-4b20-b74f-1ac442f29f96'
    },
    error_file: 'ECOSYSTEM_TARGET_DIR_PLACEHOLDER/logs/err.log',
    out_file: 'ECOSYSTEM_TARGET_DIR_PLACEHOLDER/logs/out.log',
    log_file: 'ECOSYSTEM_TARGET_DIR_PLACEHOLDER/logs/combined.log',
    time: true
  }]
};
ECOSYSTEMEOF
# Replace placeholders with actual values
sed -i "s|ECOSYSTEM_APP_NAME_PLACEHOLDER|${APP_NAME}|g" ecosystem.config.js
sed -i "s|ECOSYSTEM_TARGET_DIR_PLACEHOLDER|${TARGET_DIR}|g" ecosystem.config.js
echo "✅ ecosystem.config.js updated with path: ${TARGET_DIR}"

# Install dependencies (in case there are new ones)
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Create logs directory if it doesn't exist
mkdir -p logs

# Restart the application with PM2
echo "🚀 Restarting the application with PM2..."
pm2 delete \$APP_NAME 2>/dev/null || true
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check if the restart was successful
if [ \$? -eq 0 ]; then
    echo "✅ Application successfully updated and restarted!"
else
    echo "❌ Error restarting the application. Checking PM2 logs..."
    pm2 logs \$APP_NAME --lines 20
    exit 1
fi

# Display PM2 status
echo "📊 Current PM2 status:"
pm2 status \$APP_NAME
EOF

# Quick health check
echo -e "${BLUE}🩺 Performing health check...${NC}"
sleep 3
if curl -s "http://localhost:3015/health" > /dev/null; then
    echo -e "${GREEN}✅ Health check passed! Application is running properly.${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. The application might still be starting up or there could be an issue.${NC}"
    echo -e "${YELLOW}   Check the logs for more information: pm2 logs $APP_NAME${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Update process completed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📋 Application Information:"
echo "  Location: $APP_PATH"
echo "  PM2 App:  $APP_NAME"
echo ""
echo "📋 Useful commands:"
echo "  pm2 logs $APP_NAME              - View application logs"
echo "  pm2 status                      - Check PM2 status"
echo "  pm2 restart $APP_NAME           - Restart application"
echo "  pm2 monit                       - Monitor resources"
echo ""
