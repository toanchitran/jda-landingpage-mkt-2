#!/bin/bash

# Fundraising Flywheel - Update Script
# This script updates the application on the Vultr server using GitHub and PM2

set -e  # Exit on any error

# ANSI color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting Fundraising Flywheel update process...${NC}"

# Path to the application on the server
APP_PATH="/root/jda-landingpage-mkt-2"
APP_NAME="jda-landingpage-mkt2"

# Check if we're running on the server
if [ ! -d "$APP_PATH" ]; then
    echo -e "${RED}❌ Error: Application directory $APP_PATH not found${NC}"
    echo -e "${YELLOW}This script should be run on the Vultr server where the application is deployed.${NC}"
    exit 1
fi


# Check for uncommitted changes
echo -e "${BLUE}🔍 Checking for uncommitted changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes that won't be updated.${NC}"
    echo -e "${YELLOW}   Consider committing or stashing these changes.${NC}"
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Update cancelled.${NC}"
        exit 1
    fi
fi

# Pull the latest changes from GitHub
echo -e "${BLUE}📥 Pulling latest changes from GitHub...${NC}"
git pull

# Install dependencies (in case there are new ones)
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Build the application
echo -e "${BLUE}🔨 Building the application...${NC}"
npm run build

# Restart the application with PM2
echo -e "${BLUE}🚀 Restarting the application with PM2...${NC}"
pm2 restart $APP_NAME

# Check if the restart was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Application successfully updated and restarted!${NC}"
else
    echo -e "${RED}❌ Error restarting the application. Checking PM2 logs...${NC}"
    pm2 logs $APP_NAME --lines 20
    exit 1
fi

# Display PM2 status
echo -e "${BLUE}📊 Current PM2 status:${NC}"
pm2 status $APP_NAME

# Quick health check
echo -e "${BLUE}🩺 Performing health check...${NC}"
PORT=$(grep -o "PORT: [0-9]*" ecosystem.config.js | awk '{print $2}' | tr -d ',')
sleep 3
curl -s "http://localhost:$PORT/api/health" > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check passed! Application is running properly.${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. The application might still be starting up or there could be an issue.${NC}"
    echo -e "${YELLOW}   Check the logs for more information: pm2 logs $APP_NAME${NC}"
fi

echo -e "${GREEN}✅ Update process completed!${NC}"
