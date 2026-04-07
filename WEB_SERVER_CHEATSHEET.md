# Web Server Cheat Sheet

## Quick Reference

### Already Using?
✅ **Apache** (via .htaccess in php-backend/public/)

### Can Switch To?
✅ **Nginx** (templates provided)
✅ **Docker** (full setup provided)

---

## Commands Quick Reference

### Apache

```bash
# Check configuration
sudo apache2ctl configtest

# Enable modules
sudo a2enmod rewrite
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod ssl

# Restart
sudo systemctl restart apache2

# Check status
sudo systemctl status apache2

# View logs
tail -f /var/log/apache2/error.log
tail -f /var/log/apache2/access.log
```

### Nginx

```bash
# Check configuration
sudo nginx -t

# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Restart
sudo systemctl restart nginx

# Reload config (no downtime)
sudo systemctl reload nginx

# View logs
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

### Docker

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart php

# Check status
docker-compose ps

# Run command
docker-compose exec php php test.php

# View config
docker-compose config
```

### PHP Development

```bash
# Start built-in server
cd php-backend/public
php -S localhost:8000

# Start with specific PHP version
php8.0 -S localhost:8000

# Run tests
php test.php

# Check PHP version
php --version
```

---

## Configuration Files Reference

### Apache (.htaccess)

**Location**: `php-backend/public/.htaccess`

**Key Directives**:
```apache
RewriteEngine On              # Enable URL rewriting
RewriteRule ^(.*)$ /index.php # Route to index.php
Header set Access-Control-Allow-Origin "*"  # CORS
```

### Nginx (server block)

**Location**: `/etc/nginx/sites-available/` or `/etc/nginx/conf.d/`

**Key Directives**:
```nginx
location /api {
    try_files $uri $uri/ /index.php?$query_string;  # Route to index.php
}
add_header 'Access-Control-Allow-Origin' '*';  # CORS
```

### Docker (compose)

**Location**: `docker-compose.yml`

**Key Services**:
- nextjs (port 3000)
- php (port 9000)
- nginx (port 80, 8000)

---

## Configuration Comparison

| Task | Apache | Nginx | Docker |
|------|--------|-------|--------|
| **Enable rewrite** | `a2enmod rewrite` | Built-in | Built-in |
| **Enable proxy** | `a2enmod proxy` | Built-in | Built-in |
| **Configure CORS** | .htaccess | nginx.conf | docker-compose |
| **SSL/HTTPS** | Apache module | Built-in | Volume mount |
| **PHP support** | mod_php or PHP-FPM | PHP-FPM only | PHP-FPM in container |

---

## File Locations

### Apache
```
Windows: C:\Apache24\conf\httpd.conf
Linux:   /etc/apache2/apache2.conf
macOS:   /usr/local/etc/httpd/httpd.conf
Logs:    /var/log/apache2/
```

### Nginx
```
Windows: C:\nginx\conf\nginx.conf
Linux:   /etc/nginx/nginx.conf
macOS:   /usr/local/etc/nginx/nginx.conf
Logs:    /var/log/nginx/
```

### Docker
```
Compose: docker-compose.yml
Config:  conf.d/nextjs.conf, conf.d/php-backend.conf
Logs:    docker-compose logs
```

---

## Memory & Performance

### Apache
```
Per process: 15-80 MB
Typical: 50-200 MB total
Best for: Shared hosting
```

### Nginx
```
Per process: 1-5 MB
Typical: 10-30 MB total
Best for: High traffic, VPS
```

### Docker
```
Per container: Varies
Typical: 100-500 MB total
Best for: Production, scaling
```

---

## Port Usage

### Development
```
3000: Next.js frontend
8000: PHP backend
```

### Production (Apache)
```
80:  Apache (all requests)
443: HTTPS (if configured)
```

### Production (Nginx)
```
80:   Nginx frontend proxy
8000: Nginx backend proxy
```

### Production (Docker)
```
80:   Nginx (maps to nextjs:3000 internally)
8000: Nginx (maps to php:9000 internally)
443:  HTTPS (if configured)
```

---

## SSL/HTTPS Setup

### Generate Self-Signed Certificate
```bash
openssl req -x509 -newkey rsa:4096 -nodes \
    -out cert.pem -keyout key.pem -days 365
```

### Apache
```apache
SSLEngine on
SSLCertificateFile /path/to/cert.pem
SSLCertificateKeyFile /path/to/key.pem
```

### Nginx
```nginx
ssl_certificate /path/to/cert.pem;
ssl_certificate_key /path/to/key.pem;
```

### Let's Encrypt (Free)
```bash
sudo certbot certonly --standalone -d yourdomain.com
# Apache: sudo certbot --apache -d yourdomain.com
# Nginx: sudo certbot --nginx -d yourdomain.com
```

---

## Debugging

### Check if port is available
```bash
# Linux/macOS
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

### Test connectivity
```bash
# Test frontend
curl http://localhost:3000

# Test backend
curl http://localhost:8000/api/transactions

# Test API with data
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"type":"expense","amount":50,...}'
```

### View detailed logs
```bash
# Apache
sudo apache2ctl -S              # Show virtual hosts
tail -f /var/log/apache2/*.log  # Real-time logs

# Nginx
sudo nginx -T                   # Show config
tail -f /var/log/nginx/*.log    # Real-time logs

# Docker
docker-compose logs -f php
docker-compose logs -f nginx
```

---

## Environment Variables

### Set on System
```bash
# Linux/macOS
export MONGODB_URI=mongodb+srv://...
export MONGODB_DB=transaction_dashboard

# Windows
set MONGODB_URI=mongodb+srv://...
set MONGODB_DB=transaction_dashboard
```

### Docker .env file
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=transaction_dashboard
NODE_ENV=production
DEBUG_MODE=false
```

### PHP
```php
$mongoUri = getenv('MONGODB_URI');
$mongoDb = getenv('MONGODB_DB') ?: 'transaction_dashboard';
```

---

## Performance Optimization

### Compression (All Servers)
```apache
# Apache
AddOutputFilterByType DEFLATE text/html text/plain text/xml

# Nginx
gzip on;
gzip_types text/plain text/css application/json;
```

### Caching (All Servers)
```apache
# Apache
<IfModule mod_expires.c>
    ExpiresByType text/css "access plus 1 year"
</IfModule>

# Nginx
add_header Cache-Control "public, immutable, max-age=31536000";
```

### Connection Pooling
```nginx
upstream php {
    server php:9000;
    keepalive 32;
}
```

---

## Common Errors & Solutions

### Error: Cannot connect to backend
```bash
# Check if services running
ps aux | grep php
ps aux | grep nginx

# Check logs
tail -f /var/log/apache2/error.log
```

### Error: 502 Bad Gateway
```bash
# Nginx specific
# Check upstream server running
curl http://127.0.0.1:9000

# Check PHP-FPM socket
php -v
```

### Error: 404 on API routes
```bash
# Check rewrite rules enabled
sudo a2enmod rewrite

# Restart
sudo systemctl restart apache2

# Check .htaccess readable
chmod 644 .htaccess
```

### Error: CORS blocked
```bash
# Check CORS headers set
curl -i http://localhost:8000/api/transactions | grep -i cors

# Update header in config
add_header 'Access-Control-Allow-Origin' '*';
```

---

## Decision Tree

```
Start
  │
  ├─ Development?
  │   └─ USE: Built-in PHP server
  │
  ├─ Shared Hosting?
  │   └─ USE: Apache (already configured)
  │
  ├─ VPS/Cloud?
  │   ├─ Low traffic? → USE: Apache
  │   └─ High traffic? → USE: Nginx
  │
  ├─ Enterprise/Docker?
  │   └─ USE: Docker
  │
  └─ Not sure?
      └─ START: Apache (most compatible)
```

---

## Files Created

| File | Purpose | Status |
|------|---------|--------|
| APACHE_SETUP.md | Full Apache guide | ✅ Created |
| NGINX_SETUP.md | Full Nginx guide | ✅ Created |
| DOCKER_SETUP.md | Full Docker guide | ✅ Created |
| WEB_SERVER_GUIDE.md | Quick reference | ✅ Created |
| WEB_SERVER_SUMMARY.md | Overview | ✅ Created |
| This file | Cheat sheet | ✅ Created |

---

## Quick Links

- **Apache Details**: See [APACHE_SETUP.md](APACHE_SETUP.md)
- **Nginx Details**: See [NGINX_SETUP.md](NGINX_SETUP.md)
- **Docker Details**: See [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **PHP Backend**: See [php-backend/README.md](php-backend/README.md)

---

## Summary

```
Currently Using:   Apache (.htaccess)
Can Switch To:     Nginx or Docker
Configuration:     All provided
Time to Deploy:    5-30 minutes
Code Changes:      None needed
Hosting Type:      Any
```

**Start here**: Choose your option from WEB_SERVER_SUMMARY.md
