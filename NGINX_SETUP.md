# Nginx Configuration Guide

This guide shows how to configure Nginx for both your Next.js frontend and PHP backend.

## Current Setup

- **Frontend**: Next.js (Node.js)
- **Backend**: PHP 8.0+

## Nginx Installation

### Windows
Download from: https://nginx.org/en/download.html

### Linux/Ubuntu
```bash
sudo apt-get update
sudo apt-get install nginx
```

### macOS
```bash
brew install nginx
```

## 1. Next.js Frontend Configuration

### File: `/etc/nginx/sites-available/nextjs` (Linux) or `nginx/conf/next.conf` (Windows)

```nginx
upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name localhost;

    # Frontend - Next.js
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 2. PHP Backend Configuration

### File: `/etc/nginx/sites-available/php-backend` (Linux) or `nginx/conf/php.conf` (Windows)

```nginx
upstream php_backend {
    server 127.0.0.1:9000;
}

server {
    listen 8000;
    server_name localhost;
    root /var/www/php-backend/public;

    # PHP Backend
    location ~ \.php$ {
        fastcgi_pass unix:/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
}
```

## 3. Combined Configuration (Both on Same Server)

### File: `/etc/nginx/sites-available/transaction-dashboard`

```nginx
# Next.js upstream
upstream nextjs {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name localhost;
    charset utf-8;

    # Frontend - All requests to / except /api
    location / {
        # Exclude API routes
        location /api {
            # API handled below
        }

        proxy_pass http://nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # PHP Backend - /api routes
    location /api {
        root /var/www/php-backend/public;
        try_files $uri $uri/ /index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass unix:/run/php/php8.0-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Security headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
}
```

## 4. Enable Configuration (Linux)

```bash
# Create symlink to sites-enabled
sudo ln -s /etc/nginx/sites-available/transaction-dashboard /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

## 5. Performance Configuration

Add to your server block for better performance:

```nginx
# Gzip compression
gzip on;
gzip_vary on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css text/xml text/javascript 
            application/json application/javascript application/xml+rss 
            application/rss+xml application/atom+xml image/svg+xml;

# Caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
location /api {
    limit_req zone=api_limit burst=20 nodelay;
}
```

## 6. Windows Setup with Nginx

### Step 1: Extract Nginx
```powershell
# Extract to C:\nginx
```

### Step 2: Edit Configuration
Edit `C:\nginx\conf\nginx.conf`:

```nginx
http {
    server {
        listen 80;
        server_name localhost;

        # Next.js
        location / {
            proxy_pass http://127.0.0.1:3000;
            proxy_set_header Host $host;
        }

        # PHP Backend
        location /api {
            root C:/path/to/php-backend/public;
            try_files $uri $uri/ /index.php?$query_string;
            
            location ~ \.php$ {
                fastcgi_pass 127.0.0.1:9000;
                fastcgi_index index.php;
                fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
                include fastcgi_params;
            }
        }
    }
}
```

### Step 3: Start Nginx
```powershell
cd C:\nginx
start nginx

# Or run as service
# Install as service: nginx -install
# Start service: net start nginx
```

## 7. PHP-FPM Configuration

### Linux
```bash
# Install PHP-FPM
sudo apt-get install php8.0-fpm

# Configure PHP socket (usually already configured)
# Edit /etc/php/8.0/fpm/pool.d/www.conf
# listen = /run/php/php8.0-fpm.sock

# Start PHP-FPM
sudo systemctl start php8.0-fpm
sudo systemctl enable php8.0-fpm
```

### Windows
```powershell
# Edit php.ini for FastCGI
# Set: listen = 127.0.0.1:9000

# Start PHP-FPM
php-cgi.exe -b 127.0.0.1:9000
# Or use wincache extension for better performance
```

## 8. SSL/HTTPS Configuration

Add to server block:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    return 301 https://$host$request_uri;
}
```

## 9. Troubleshooting

### 502 Bad Gateway
```bash
# Check if backend is running
curl http://localhost:3000      # Next.js
curl http://localhost:8000      # PHP Backend

# Check PHP-FPM socket
sudo ss -ln | grep 9000
```

### 404 on API routes
```bash
# Check PHP configuration
# Ensure index.php exists in root
# Verify try_files directive is correct
```

### CORS issues
```nginx
# Add CORS headers
add_header 'Access-Control-Allow-Origin' '*';
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Content-Type';

# Handle preflight
if ($request_method = 'OPTIONS') {
    return 204;
}
```

## Comparison: Apache vs Nginx

| Feature | Apache | Nginx |
|---------|--------|-------|
| Memory Usage | Higher | Lower |
| Concurrency | Good | Excellent |
| Configuration | More complex | Simpler |
| Modules | Many built-in | Fewer, more lightweight |
| Performance | Good | Better for high traffic |
| Windows Support | Yes | Yes |

## Summary

- ✅ **Nginx** is lighter weight and better for high-traffic scenarios
- ✅ **Already using Apache** (.htaccess for PHP backend)
- ✅ Both work great with this project
- 🔧 Choose based on your needs and infrastructure

## Next Steps

1. Install Nginx or keep Apache
2. Update configuration with your domain/paths
3. Test with: `nginx -t` (Nginx) or `apachectl configtest` (Apache)
4. Restart service
5. Monitor logs for errors
