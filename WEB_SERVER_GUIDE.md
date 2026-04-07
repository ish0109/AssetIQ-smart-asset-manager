# Web Server Configuration Guide - Quick Reference

## Current Status

✅ **Already Using Apache** - Via `.htaccess` in PHP backend (`php-backend/public/.htaccess`)

## Can You Use Nginx or Apache? YES!

Both work perfectly with this project. Here's what you need to know:

## Quick Comparison

| Aspect | Apache | Nginx |
|--------|--------|-------|
| **Memory Usage** | 15-80 MB per process | 1-5 MB per process |
| **Performance** | Good | Excellent (high concurrency) |
| **Configuration** | `.htaccess` + vhosts | Simpler syntax |
| **Default PHP** | Directly supported | Via PHP-FPM |
| **WebSocket** | Via mod_proxy | Native support |
| **Shared Hosting** | ✅ Universal support | ❌ Limited |
| **Learning Curve** | Moderate | Easy |
| **Best For** | Shared hosting, ease | Cloud, VPS, performance |

## Current Setup

### What We're Already Using:

```
Project Structure:
├── Next.js Frontend (Node.js on port 3000)
├── PHP Backend (port 8000)
│   └── Uses Apache .htaccess for routing
└── .htaccess already configured for:
    ✅ URL rewriting
    ✅ CORS headers
    ✅ Security headers
```

## 1. Keep Existing Apache Setup

**Best if:**
- Using shared hosting
- Don't want to change
- Prefer .htaccess simplicity

**Run:**
```bash
# Frontend
cd app && npm run dev

# Backend (uses built-in PHP server)
cd php-backend/public && php -S localhost:8000

# Or use Apache directly with vhost configuration
```

**No changes needed!** Already working.

## 2. Switch to Nginx

**Best if:**
- Using VPS or cloud server
- Want better performance
- Handling high traffic

**Installation:**
```bash
# Linux
sudo apt-get install nginx

# macOS
brew install nginx

# Windows
# Download from nginx.org
```

**Setup:**
1. Copy configuration from [NGINX_SETUP.md](NGINX_SETUP.md)
2. Update paths in config
3. Restart: `sudo systemctl restart nginx`

**Commands:**
```bash
# Test config
sudo nginx -t

# Start
sudo systemctl start nginx

# Stop
sudo systemctl stop nginx

# Reload config
sudo systemctl reload nginx
```

## 3. Enhanced Apache Setup

**Best if:**
- Want better Apache configuration
- Using VPS with Apache
- Need optimization

**Setup:**
1. Copy configuration from [APACHE_SETUP.md](APACHE_SETUP.md)
2. Enable required modules:
   ```bash
   sudo a2enmod rewrite proxy proxy_http headers ssl
   sudo systemctl restart apache2
   ```
3. Add virtual host configuration

**Verification:**
```bash
sudo apache2ctl configtest
sudo systemctl restart apache2
```

## Configuration Files

| File | Purpose | Current |
|------|---------|---------|
| [APACHE_SETUP.md](APACHE_SETUP.md) | Complete Apache configuration | ✅ New |
| [NGINX_SETUP.md](NGINX_SETUP.md) | Complete Nginx configuration | ✅ New |
| `php-backend/public/.htaccess` | Apache rewrite rules | ✅ Existing |

## Quick Start Guide

### Option 1: Keep Current Setup (Recommended for Development)

```bash
# Terminal 1: Start Next.js
cd app
npm run dev

# Terminal 2: Start PHP backend
cd php-backend/public
php -S localhost:8000
```

**URLs:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Option 2: Use Apache

```bash
# Edit hosts file
# Windows: C:\Windows\System32\drivers\etc\hosts
# Linux: /etc/hosts
127.0.0.1    localhost

# Copy configuration from APACHE_SETUP.md
# Enable modules
sudo a2enmod rewrite proxy proxy_http

# Create vhost
sudo nano /etc/apache2/sites-available/dashboard.conf
# Paste Apache config

# Enable and restart
sudo a2ensite dashboard
sudo systemctl restart apache2

# Access
# http://localhost/        → Next.js
# http://localhost:8000/   → PHP Backend
```

### Option 3: Use Nginx

```bash
# Install
sudo apt-get install nginx

# Copy configuration from NGINX_SETUP.md
sudo nano /etc/nginx/sites-available/dashboard.conf
# Paste Nginx config

# Enable and test
sudo ln -s /etc/nginx/sites-available/dashboard.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Access
# http://localhost/        → Next.js
# http://localhost:8000/   → PHP Backend
```

## Troubleshooting

### Next.js not accessible
```bash
# Check if running
curl http://localhost:3000

# Restart
cd app && npm run dev
```

### PHP backend not accessible
```bash
# Check if running
curl http://localhost:8000/api/transactions

# Restart
cd php-backend/public && php -S localhost:8000
```

### Routes not working
- **Apache**: Check `.htaccess` permissions and mod_rewrite enabled
- **Nginx**: Check `try_files` directive and server block configuration

### CORS errors
- Both have CORS headers configured
- Check browser console for specific errors
- May need to adjust `Access-Control-Allow-Origin`

## Performance Recommendations

### For Development
```bash
php -S localhost:8000  # Built-in PHP server is fine
```

### For Production

**Apache:**
- Enable compression (mod_deflate)
- Enable caching (mod_expires)
- Use HTTP/2 (mod_http2)
- Memory: ~50-200MB

**Nginx:**
- Enable gzip compression
- Enable caching
- HTTP/2 enabled by default
- Memory: ~10-30MB

## Decision Matrix

| Scenario | Recommendation |
|----------|---|
| Development | Keep current (PHP dev server + npm dev) |
| Shared Hosting | Apache (already configured) |
| VPS with low traffic | Apache |
| VPS with high traffic | Nginx |
| Cloud deployment | Nginx |
| Docker container | Nginx |

## Environment Variables

Both Apache and Nginx use same PHP environment:
```env
MONGODB_URI=mongodb+srv://...
MONGODB_DB=transaction_dashboard
DEBUG_MODE=true
```

## Summary

✅ **Already configured**: Apache (via .htaccess)
✅ **Can easily switch to**: Nginx (templates provided)
✅ **No code changes needed**: API endpoints remain same
✅ **Both work perfectly**: Choose based on your infrastructure

### Next Steps

1. **Development**: Keep using `php -S localhost:8000`
2. **Production**: Choose Apache or Nginx based on your hosting
3. **Copy configuration**: From APACHE_SETUP.md or NGINX_SETUP.md
4. **Test**: Run `php test.php` to verify backend works

See detailed setup in:
- [APACHE_SETUP.md](APACHE_SETUP.md) - Full Apache guide
- [NGINX_SETUP.md](NGINX_SETUP.md) - Full Nginx guide
- [php-backend/README.md](php-backend/README.md) - PHP backend docs
