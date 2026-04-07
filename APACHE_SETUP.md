# Apache Configuration Guide

This guide shows how to configure Apache for both your Next.js frontend and PHP backend.

## Current Setup

- **Frontend**: Next.js (Node.js)
- **Backend**: PHP 8.0+ (already using Apache via .htaccess)

## Apache Installation

### Windows
Download from: https://httpd.apache.org/download.cgi or use Apache Lounge

### Linux/Ubuntu
```bash
sudo apt-get update
sudo apt-get install apache2
```

### macOS
```bash
brew install httpd
```

## 1. Enable Required Modules

### Linux/macOS
```bash
# Enable mod_rewrite (for URL routing)
sudo a2enmod rewrite

# Enable mod_proxy (for Node.js proxying)
sudo a2enmod proxy
sudo a2enmod proxy_http

# Enable mod_headers (for security headers)
sudo a2enmod headers

# Enable mod_ssl (for HTTPS)
sudo a2enmod ssl

# Restart Apache
sudo systemctl restart apache2
```

### Windows
Edit `httpd.conf` and uncomment:
```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule headers_module modules/mod_headers.so
```

## 2. Virtual Host for Next.js Frontend

### File: `/etc/apache2/sites-available/nextjs.conf` (Linux) or `httpd-vhosts.conf` (Windows)

```apache
<VirtualHost *:80>
    ServerName localhost
    ServerAlias 127.0.0.1
    
    DocumentRoot /var/www/nextjs

    # Proxy to Next.js server
    <Location />
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:3000/
        ProxyPassReverse http://127.0.0.1:3000/
        
        # WebSocket support
        RewriteEngine On
        RewriteCond %{HTTP:Upgrade} websocket [NC]
        RewriteCond %{HTTP:Connection} upgrade [NC]
        RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
    </Location>

    # Don't proxy static files
    <Location /public>
        ProxyPass !
    </Location>

    # Security headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/nextjs-error.log
    CustomLog ${APACHE_LOG_DIR}/nextjs-access.log combined
</VirtualHost>
```

## 3. Virtual Host for PHP Backend

### File: `/etc/apache2/sites-available/php-backend.conf`

```apache
<VirtualHost *:8000>
    ServerName localhost
    ServerAlias 127.0.0.1
    
    DocumentRoot /var/www/php-backend/public

    # Enable mod_rewrite
    <Directory /var/www/php-backend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # URL rewriting
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ /index.php?/$1 [QSA,L]
        </IfModule>
    </Directory>

    # PHP Handler
    <FilesMatch \.php$>
        SetHandler "proxy:unix:/run/php/php8.0-fpm.sock|fcgi://localhost"
    </FilesMatch>

    # CORS Headers
    <IfModule mod_headers.c>
        Header set Access-Control-Allow-Origin "*"
        Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
        Header set Access-Control-Allow-Headers "Content-Type, Authorization"
    </IfModule>

    # Security Headers
    <IfModule mod_headers.c>
        Header set X-Content-Type-Options "nosniff"
        Header set X-Frame-Options "SAMEORIGIN"
        Header set X-XSS-Protection "1; mode=block"
    </IfModule>

    # Logging
    ErrorLog ${APACHE_LOG_DIR}/php-backend-error.log
    CustomLog ${APACHE_LOG_DIR}/php-backend-access.log combined
</VirtualHost>
```

## 4. Combined Virtual Host (Same Server)

### File: `/etc/apache2/sites-available/transaction-dashboard.conf`

```apache
<VirtualHost *:80>
    ServerName localhost
    ServerAlias 127.0.0.1
    DocumentRoot /var/www

    # Next.js Frontend - Root path
    <Location />
        ProxyPreserveHost On
        ProxyPass http://127.0.0.1:3000/
        ProxyPassReverse http://127.0.0.1:3000/
    </Location>

    # PHP Backend - /api path
    <Location /api>
        ProxyPass !
    </Location>

    <Directory /var/www/php-backend/public>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    # Alias for PHP backend
    Alias /api /var/www/php-backend/public

    # PHP-FPM for /api routes
    <Directory /var/www/php-backend/public>
        <IfModule mod_rewrite.c>
            RewriteEngine On
            RewriteCond %{REQUEST_FILENAME} !-f
            RewriteCond %{REQUEST_FILENAME} !-d
            RewriteRule ^(.*)$ /index.php?/$1 [QSA,L]
        </IfModule>

        <FilesMatch \.php$>
            SetHandler "proxy:unix:/run/php/php8.0-fpm.sock|fcgi://localhost"
        </FilesMatch>
    </Directory>

    # Security headers
    <IfModule mod_headers.c>
        Header set X-Content-Type-Options "nosniff"
        Header set X-Frame-Options "SAMEORIGIN"
        Header set X-XSS-Protection "1; mode=block"
    </IfModule>

    ErrorLog ${APACHE_LOG_DIR}/dashboard-error.log
    CustomLog ${APACHE_LOG_DIR}/dashboard-access.log combined
</VirtualHost>
```

## 5. Enable Configuration (Linux)

```bash
# Enable site
sudo a2ensite transaction-dashboard.conf

# Disable default site
sudo a2dissite 000-default.conf

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2

# Check status
sudo systemctl status apache2
```

## 6. Port Configuration

### Add Listen Directive
```apache
# In httpd.conf or ports.conf
Listen 80
Listen 8000
```

### Windows Edit `httpd.conf`:
```apache
Listen 80
Listen 8000
```

## 7. Updated .htaccess for PHP Backend

Already in place at `php-backend/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /api/
    
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    RewriteRule ^(.*)$ index.php?/$1 [QSA,L]
</IfModule>

# CORS Headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable directory listing
<IfModule mod_autoindex.c>
    Options -Indexes
</IfModule>
```

## 8. Windows XAMPP Setup

### With XAMPP/Apache:

1. **Edit `xampp/apache/conf/httpd.conf`:**
```apache
Listen 80
Listen 8000
```

2. **Create `xampp/apache/conf/extra/httpd-vhosts.conf`:**
```apache
# Next.js
<VirtualHost *:80>
    ServerName localhost
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/
</VirtualHost>

# PHP Backend
<VirtualHost *:8000>
    ServerName localhost
    DocumentRoot "C:/xampp/php-backend/public"
    <Directory "C:/xampp/php-backend/public">
        Options +Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

3. **Enable in `httpd.conf`:**
```apache
Include conf/extra/httpd-vhosts.conf
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

4. **Start XAMPP Apache**

## 9. Performance Optimization

Add to virtual host:

```apache
# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain text/html text/xml text/css
    AddOutputFilterByType DEFLATE application/xml application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml application/javascript
    AddOutputFilterByType DEFLATE application/json
</IfModule>

# Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType font/woff "access plus 1 year"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>

# Keep-Alive
<IfModule mod_http2.c>
    Protocols h2 http/1.1
</IfModule>
```

## 10. SSL/HTTPS Configuration

```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/yourdomain.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/yourdomain.com/privkey.pem
    
    # ... rest of configuration
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName yourdomain.com
    Redirect / https://yourdomain.com/
</VirtualHost>
```

## 11. Troubleshooting

### Modules not loading
```bash
sudo apache2ctl -M | grep proxy
sudo apache2ctl -M | grep rewrite
```

### 502 Bad Gateway
```bash
# Check if services running
curl http://localhost:3000      # Next.js
curl http://localhost:8000      # PHP

# Check PHP-FPM
sudo systemctl status php8.0-fpm
```

### 404 on API routes
```bash
# Check rewrite rules
sudo a2enmod rewrite
sudo systemctl restart apache2

# Check .htaccess
sudo apache2ctl -S
```

### Cannot proxy WebSocket
```apache
# Add WebSocket support
RewriteCond %{HTTP:Upgrade} websocket [NC]
RewriteCond %{HTTP:Connection} upgrade [NC]
RewriteRule ^/?(.*) "ws://127.0.0.1:3000/$1" [P,L]
```

## 12. Production Deployment Checklist

- [ ] Enable mod_rewrite, mod_proxy, mod_headers
- [ ] Configure virtual hosts correctly
- [ ] Set correct permissions on directories
- [ ] Enable HTTPS with SSL certificate
- [ ] Configure logging appropriately
- [ ] Enable compression and caching
- [ ] Set security headers
- [ ] Test routing for both frontend and API
- [ ] Configure firewall rules
- [ ] Monitor Apache error logs

## Comparison Summary

| Aspect | Apache | Nginx |
|--------|--------|-------|
| Memory | Higher | Lower |
| Configuration | .htaccess/vhosts | Server blocks |
| Modules | Built-in | Limited |
| PHP Support | Direct | PHP-FPM |
| Performance | Good | Excellent |
| Learning Curve | Moderate | Easier |

## Current Status

✅ **Already Configured for Apache**:
- PHP backend has `.htaccess` for routing
- CORS headers configured
- Security headers set
- Works with shared hosting

✅ **Can Switch to Nginx**:
- Use configuration above
- Better for high traffic
- Lower resource usage
- More suitable for cloud deployments

Choose Apache for **ease of configuration** or Nginx for **performance** and **scalability**.
