#!/bin/bash
# ==============================================================================
# JanSeva 24/7 Automated VPS Deployment Script (Ubuntu 22.04 / 24.04 LTS)
# Configures Node.js 20, PM2 24/7 Process Manager, Nginx Reverse Proxy, and Swap
# ==============================================================================

set -e

echo "=========================================================="
echo "  JanSeva Citizen Portal - 24/7 Production VPS Setup"
echo "=========================================================="

# 1. Update OS packages
echo "==> [1/7] Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw nginx

# 2. Add 2GB Swap Memory (essential for 1GB/2GB Free Tier VPS instances)
if [ ! -f /swapfile ]; then
    echo "==> [2/7] Configuring 2GB Swap memory to prevent build out-of-memory..."
    sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap successfully enabled."
else
    echo "==> [2/7] Swapfile already exists. Skipping."
fi

# 3. Install Node.js 20 LTS & PM2
echo "==> [3/7] Installing Node.js 20 LTS and PM2..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "PM2 version: $(pm2 -v)"

# 4. Determine Project Directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# 5. Install Backend Dependencies
echo "==> [4/7] Installing backend dependencies..."
cd "$PROJECT_ROOT/backend"
npm install --omit=dev

# Check for .env file
if [ ! -f .env ]; then
    echo "Creating backend .env file..."
    cat <<EOT > .env
PORT=5000
NODE_ENV=production
JWT_SECRET=janseva_secure_production_secret_$(openssl rand -hex 16)
FAST2SMS_API_KEY=
EOT
    echo "Notice: Add your FAST2SMS_API_KEY in backend/.env to activate live SMS."
fi

# 6. Install Frontend Dependencies and Build Production SPA
echo "==> [5/7] Building frontend static bundle..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run build

# Copy build to Nginx web root
sudo mkdir -p /var/www/janseva
sudo cp -r "$PROJECT_ROOT/frontend/dist/"* /var/www/janseva/
sudo chown -R www-data:www-data /var/www/janseva

# 7. Configure Nginx Reverse Proxy
echo "==> [6/7] Configuring Nginx Reverse Proxy..."
sudo tee /etc/nginx/sites-available/janseva << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 25M;

    # Static Frontend SPA
    location / {
        root /var/www/janseva;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # API Proxy to Express Backend (Port 5000)
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads & Media Proxy
    location /uploads/ {
        proxy_pass http://127.0.0.1:5000/uploads/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Enable Nginx site
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/janseva /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 8. Start Backend with PM2 and configure auto-start on boot
echo "==> [7/7] Launching 24/7 backend process via PM2..."
cd "$PROJECT_ROOT"
pm2 delete janseva-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 to restart on system reboots
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

# 9. Configure Firewall
echo "==> Configuring firewall..."
sudo ufw allow 'Nginx Full' 2>/dev/null || sudo ufw allow 80/tcp || true
sudo ufw allow 22/tcp 2>/dev/null || true

PUBLIC_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

echo ""
echo "=========================================================="
echo "  JanSeva System is now LIVE & Running 24/7 in the Cloud!"
echo "=========================================================="
echo ""
echo "  Public Web Portal:  http://${PUBLIC_IP}/"
echo "  Backend API:        http://${PUBLIC_IP}/api/health"
echo "  Process Manager:    pm2 status"
echo "  View Server Logs:   pm2 logs janseva-backend"
echo ""
echo "  Next steps for SMS & WhatsApp:"
echo "  1. Add your Fast2SMS key in: $PROJECT_ROOT/backend/.env"
echo "  2. Link WhatsApp once via the Admin Dashboard at: http://${PUBLIC_IP}/"
echo "     Or check PM2 logs to view the QR code."
echo "=========================================================="
