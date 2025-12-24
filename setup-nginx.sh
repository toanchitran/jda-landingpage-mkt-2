#!/bin/bash

# Nginx configuration script with SSL for fundraisingflywheel.io
# This script should be run ON THE VULTR SERVER
# Usage: bash setup-nginx.sh

set -e

# Configuration
DOMAIN="fundraisingflywheel.io"
APP_PORT="3015"
APP_DIR="/root/jda-landingpage-mkt-2"
EMAIL="digicon@digicon.pro"  # Change this to your email for SSL certificate notifications

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Setting up Nginx for ${DOMAIN}...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}❌ Please run as root (use sudo)${NC}"
  exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
  echo -e "${YELLOW}📥 Installing Nginx...${NC}"
  apt update
  apt install -y nginx
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}📥 Installing Certbot...${NC}"
  apt install -y certbot python3-certbot-nginx
fi

echo -e "${YELLOW}📝 Step 1: Creating initial Nginx configuration (HTTP only)...${NC}"

# Backup existing config if it exists
if [ -f /etc/nginx/sites-available/${DOMAIN} ]; then
  cp /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-available/${DOMAIN}.backup.$(date +%Y%m%d_%H%M%S)
  echo -e "${GREEN}✅ Backed up existing configuration${NC}"
fi

# Create initial HTTP-only configuration for Certbot verification
cat > /etc/nginx/sites-available/${DOMAIN} << EOF
# Rate Limiting Zones (Top level of http block)
limit_req_zone \$binary_remote_addr zone=general:10m rate=5r/s;
limit_req_zone \$binary_remote_addr zone=api:10m rate=30r/m;
limit_conn_zone \$binary_remote_addr zone=conn_limit:10m;

server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # Disable server tokens (version disclosure)
    server_tokens off;
    merge_slashes on;

    # Logging
    access_log /var/log/nginx/${DOMAIN}.access.log;
    error_log /var/log/nginx/${DOMAIN}.error.log;

    # Client body size (for file uploads)
    client_max_body_size 50M;

    # Security headers
    # HSTS (Strict-Transport-Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # CSP (Content-Security-Policy) - allowing 'unsafe-inline' for styles (Next.js req) and scripts (if needed, but restricted)
    # Note: Next.js often requires 'unsafe-inline' for styles. 'unsafe-eval' might be needed for dev, but try to avoid in prod.
    # Adjusted to allow images/fonts from self and data.
    # Added https://*.cloudfront.net for Hotjar and other CDN-hosted scripts
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://static.hotjar.com https://*.cloudfront.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.hotjar.com wss://*.hotjar.com https://api.calendly.com; frame-src 'self' https://calendly.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=(), usb=()" always;
    add_header X-Permitted-Cross-Domain-Policies "none" always;
    add_header Cross-Origin-Embedder-Policy "unsafe-none" always; # Changed from require-corp to avoid breaking external resources
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    # Gzip compression - BREACH mitigation (disable for dynamic content)
    gzip on;
    gzip_vary on;
    # Only compress static assets, not dynamic HTML
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
    gzip_proxied expired no-cache no-store private auth;

    # Block sensitive files
    location ~* \.(env|git|svn|htaccess|htpasswd|ini|log|sh|sql|bak|backup|swp|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Block hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Proxy settings for Next.js
    location / {
        # Rate Limiting
        limit_req zone=general burst=10 nodelay;
        limit_conn conn_limit 10;

        proxy_pass http://localhost:${APP_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Chunked encoding support
        proxy_buffering off;
        proxy_request_buffering off;
        chunked_transfer_encoding on;
        
        # Timeouts
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Cache static files (Reduced expiry to 30d)
    location /_next/static {
        proxy_pass http://localhost:${APP_PORT};
        proxy_cache_valid 200 60m;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Handle Next.js image optimization
    location /_next/image {
        proxy_pass http://localhost:${APP_PORT};
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # General Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4|webp)$ {
        proxy_pass http://localhost:${APP_PORT};
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        limit_req zone=api burst=5 nodelay;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo -e "${GREEN}✅ Nginx configuration created${NC}"

echo -e "${YELLOW}🔗 Step 2: Enabling site...${NC}"

# Create symbolic link to enable the site
ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled/${DOMAIN}

# Remove default site if exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✅ Removed default site${NC}"
fi

# Ensure no conflicting configurations are active
echo -e "${YELLOW}🧹 Cleaning up any conflicting configurations...${NC}"
# Don't remove o2o.digicon.pro config, just ensure our config takes precedence
# Remove any other default SSL configs that might interfere
rm -f /etc/nginx/sites-enabled/default-ssl 2>/dev/null || true

echo -e "${YELLOW}🧪 Step 3: Testing Nginx configuration...${NC}"

nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi

echo -e "${YELLOW}🔄 Step 4: Reloading Nginx...${NC}"

systemctl reload nginx

echo -e "${GREEN}✅ Nginx reloaded${NC}"

echo -e "${YELLOW}🔐 Step 5: Setting up SSL certificate with Certbot...${NC}"
echo "This may take a few moments..."

# Obtain SSL certificate for both main domain and www subdomain
certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email ${EMAIL} --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained and configured${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificate setup failed or skipped${NC}"
    echo "This might be because:"
    echo "  1. DNS records are not pointing to this server yet"
    echo "  2. Port 80 and 443 are not open in firewall"
    echo "  3. Domain is not accessible from internet"
    echo ""
    echo "You can set up SSL later by running:"
    echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
    echo ""
    echo -e "${GREEN}✅ HTTP configuration is ready. Test at: http://${DOMAIN}${NC}"
fi

echo -e "${YELLOW}🔄 Step 6: Final Nginx reload...${NC}"

systemctl reload nginx

echo -e "${YELLOW}⚙️  Step 7: Setting up auto-renewal for SSL certificate...${NC}"

# Test auto-renewal (only if certificate was obtained)
if certbot certificates | grep -q "${DOMAIN}"; then
    certbot renew --dry-run
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL auto-renewal is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  SSL auto-renewal test had issues (but certificate is installed)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  SSL certificate not found, skipping auto-renewal test${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📊 Configuration Summary:"
echo "  Domain: ${DOMAIN}"
echo "  Backend Port: ${APP_PORT}"
echo "  App Directory: ${APP_DIR}"
if certbot certificates | grep -q "${DOMAIN}"; then
    echo "  SSL: Enabled ✅"
else
    echo "  SSL: Not configured (HTTP only for now)"
fi
echo ""
echo "🌐 Your site is now available at:"
if certbot certificates | grep -q "${DOMAIN}"; then
    echo "  https://${DOMAIN}"
    echo "  https://www.${DOMAIN}"
else
    echo "  http://${DOMAIN}"
    echo "  http://www.${DOMAIN}"
fi
echo ""
echo "📋 Useful commands:"
echo "  systemctl status nginx    - Check Nginx status"
echo "  systemctl reload nginx    - Reload Nginx configuration"
echo "  certbot renew             - Manually renew SSL certificate"
echo "  certbot certificates      - List all certificates"
echo "  tail -f /var/log/nginx/${DOMAIN}.access.log - View access logs"
echo "  tail -f /var/log/nginx/${DOMAIN}.error.log  - View error logs"
echo ""
if certbot certificates | grep -q "${DOMAIN}"; then
    echo "🔐 SSL Certificate will auto-renew before expiration"
else
    echo "🔐 To set up SSL later, run:"
    echo "   certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
fi
echo ""
