# JD Alchemy Landing Page - Vultr Deployment Guide

This guide will help you deploy the JD Alchemy Landing Page to a Vultr server using PM2 and nginx.

## Prerequisites

- A Vultr server (Ubuntu 20.04 or later recommended)
- Root access to the server
- A domain name (optional but recommended)

## Quick Deployment

### 1. Connect to your Vultr server

```bash
ssh root@your-server-ip
```

### 2. Download and run the deployment script

```bash
# Download the deployment script
wget https://raw.githubusercontent.com/brandbeam-ai/jda-landingpage-mkt-1/main/deploy.sh

# Make it executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

## Manual Deployment Steps

If you prefer to run the steps manually:

### 1. Update system packages

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js and npm

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 3. Install PM2 globally

```bash
sudo npm install -g pm2
```

### 4. Install nginx

```bash
sudo apt install -y nginx
```

### 5. Clone the repository

```bash
sudo mkdir -p /root/jda-landingpage-mkt-1
cd /root/jda-landingpage-mkt-1
git clone https://github.com/brandbeam-ai/jda-landingpage-mkt-1.git .
```

### 6. Install dependencies and build

```bash
npm install
npm run build
```

### 7. Setup PM2

```bash
# Copy the ecosystem config
cp ecosystem.config.js /root/jda-landingpage-mkt-1/

# Create logs directory
mkdir -p logs

# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### 8. Setup nginx

```bash
# Run the nginx setup script
chmod +x setup-nginx.sh
./setup-nginx.sh
```

## Configuration Files

### PM2 Ecosystem Config (`ecosystem.config.js`)

The PM2 configuration includes:
- Application name: `jda-landingpage-mkt1`
- Working directory: `/root/jda-landingpage-mkt-1`
- Port: 3013
- Auto-restart on failure
- Memory limit: 1GB
- Log files in `/root/jda-landingpage-mkt1/logs/`

### Nginx Configuration

The nginx configuration:
- Proxies requests to `localhost:3013`
- Includes security headers
- Enables gzip compression
- Caches static files
- Provides a health check endpoint at `/health`

## Management Commands

### PM2 Commands

```bash
# View application status
pm2 status

# View logs
pm2 logs jda-landingpage-mkt1

# Restart application
pm2 restart jda-landingpage-mkt1

# Stop application
pm2 stop jda-landingpage-mkt1

# Delete application
pm2 delete jda-landingpage-mkt1

# Monitor resources
pm2 monit
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart nginx
sudo systemctl restart nginx

# View nginx status
sudo systemctl status nginx
```

### Application Logs

```bash
# View PM2 logs
pm2 logs jda-landingpage-mkt1

# View nginx access logs
sudo tail -f /var/log/nginx/access.log

# View nginx error logs
sudo tail -f /var/log/nginx/error.log
```

## Updating the Application

To update the application with new code:

```bash
cd /root/jda-landingpage-mkt-1

# Pull latest changes
git pull origin main

# Install new dependencies (if any)
npm install

# Build the application
npm run build

# Restart the application
pm2 restart jda-landingpage-mkt1
```

## SSL/HTTPS Setup (Optional)

To enable HTTPS, you can use Let's Encrypt:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add this line: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Troubleshooting

### Application not starting

1. Check PM2 logs:
   ```bash
   pm2 logs jda-landingpage-mkt1
   ```

2. Check if port 3013 is available:
   ```bash
   netstat -tlnp | grep :3013
   ```

3. Check Node.js version:
   ```bash
   node --version
   ```

### Nginx issues

1. Test nginx configuration:
   ```bash
   sudo nginx -t
   ```

2. Check nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. Check if nginx is running:
   ```bash
   sudo systemctl status nginx
   ```

### Memory issues

If the application is using too much memory:

1. Check memory usage:
   ```bash
   pm2 monit
   ```

2. Adjust memory limit in `ecosystem.config.js`:
   ```javascript
   max_memory_restart: '512M'  // Reduce from 1G to 512M
   ```

## Security Considerations

1. **Firewall**: Configure UFW to only allow necessary ports:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Regular updates**: Keep the system updated:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Monitor logs**: Regularly check application and nginx logs for issues.

## Support

If you encounter any issues during deployment, please check:
1. The logs in `/root/jda-landingpage-mkt-1/logs/`
2. PM2 status with `pm2 status`
3. Nginx status with `sudo systemctl status nginx`

For additional support, refer to the project documentation or create an issue in the GitHub repository. 