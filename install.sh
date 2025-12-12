#!/bin/bash

# FRESH INSTALLATION SCRIPT for Fundraising Flywheel
# This script sets up a new server from scratch with security best practices.
# Usage: 
# 1. git clone <repo_url>
# 2. cd jda_tle_landing-page_2
# 3. bash install.sh

set -e

APP_NAME="jda-landingpage-mkt-2"
NEW_USER="jda"
REPO_DIR=$(pwd)
TARGET_DIR="/home/$NEW_USER/$APP_NAME"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🚀 Fundraising Flywheel - Fresh Install Script${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

# 1. Update System and Install Dependencies
echo -e "${YELLOW}📦 Updating system and installing dependencies...${NC}"

# Detect package manager
if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y git curl build-essential nginx certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    yum install -y git curl make gcc-c++ nginx certbot python3-certbot-nginx
fi

# Install Node.js (v18 or v20)
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs || yum install -y nodejs
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# 2. Create dedicated user
echo -e "${YELLOW}👤 Creating user $NEW_USER...${NC}"
if id "$NEW_USER" &>/dev/null; then
    echo -e "${GREEN}✅ User $NEW_USER already exists${NC}"
else
    useradd -m -s /bin/bash $NEW_USER
    # Generate random password
    PASSWORD=$(openssl rand -base64 12)
    echo "$NEW_USER:$PASSWORD" | chpasswd
    echo -e "${GREEN}✅ User $NEW_USER created${NC}"
    echo -e "${YELLOW}   (Password: $PASSWORD)${NC}"
fi

# 3. Setup Application Directory
echo -e "${YELLOW}📂 Setting up application directory...${NC}"
mkdir -p "$TARGET_DIR"

# Copy files from current location to target directory
# Exclude .git and node_modules to ensure clean state
echo -e "${YELLOW}   Copying files to $TARGET_DIR...${NC}"
rsync -av --exclude 'node_modules' --exclude '.git' --exclude '.env' "$REPO_DIR/" "$TARGET_DIR/"

# 4. Create Configuration Files (.env)
echo -e "${YELLOW}⚙️  Creating configuration files...${NC}"

# Generate .env file with secure defaults
cat > "$TARGET_DIR/.env" << EOF
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
echo -e "${GREEN}✅ .env file created${NC}"

# Create ecosystem.config.js with correct path and user
cat > "$TARGET_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: '$APP_NAME',
    script: 'npm',
    args: 'start',
    cwd: '$TARGET_DIR',
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
    error_file: '$TARGET_DIR/logs/err.log',
    out_file: '$TARGET_DIR/logs/out.log',
    log_file: '$TARGET_DIR/logs/combined.log',
    time: true
  }]
};
EOF

# 5. Set Permissions
echo -e "${YELLOW}🔒 Setting file permissions...${NC}"
chown -R $NEW_USER:$NEW_USER "/home/$NEW_USER"
chmod -R 750 "/home/$NEW_USER"

# 6. Install App Dependencies and Build
echo -e "${YELLOW}📦 Installing app dependencies and building (as $NEW_USER)...${NC}"

# We run these commands as the new user to ensure file ownership is correct
sudo -u $NEW_USER bash << EOF
cd $TARGET_DIR

# Install dependencies
npm install

# Build the project
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Create logs directory
mkdir -p logs

# Start with PM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
EOF

# 7. Setup PM2 Startup
echo -e "${YELLOW}🚀 Configuring PM2 startup...${NC}"
# This command needs to be run as root, but generating the startup script for the specific user
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $NEW_USER --hp /home/$NEW_USER
# Enable the systemd service
systemctl enable pm2-$NEW_USER

# 8. Setup Nginx
echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"
# Run the Nginx setup script (it's now in the target dir)
cd "$TARGET_DIR"

# Update APP_DIR in setup-nginx.sh to reflect the correct location
sed -i "s|APP_DIR=\"/root/jda-landingpage-mkt-2\"|APP_DIR=\"$TARGET_DIR\"|g" setup-nginx.sh

# Make sure it's executable
chmod +x setup-nginx.sh
bash setup-nginx.sh

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Installation Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "✅ App is running as user '$NEW_USER'"
echo "✅ PM2 is configured for auto-start"
echo "✅ Nginx is configured"
echo ""
echo "👉 Use 'su - $NEW_USER' to switch to the app user."
echo "👉 Check logs with 'pm2 logs'"
