# Docker Setup with Nginx and PHP

Complete Docker setup for running both Next.js frontend and PHP backend with Nginx.

## Prerequisites

- Docker installed
- Docker Compose installed

## Option 1: Docker Compose (Recommended)

### File: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # Next.js Frontend
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.nextjs
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./app:/app
      - /app/node_modules
    networks:
      - app-network
    depends_on:
      - nginx

  # PHP Backend
  php:
    image: php:8.0-fpm-alpine
    volumes:
      - ./php-backend:/var/www/php-backend
    ports:
      - "9000:9000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB:-transaction_dashboard}
    networks:
      - app-network

  # Nginx Web Server
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "8000:8000"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./php-backend:/var/www/php-backend:ro
    depends_on:
      - php
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

### File: `Dockerfile.nextjs`

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY app/package*.json ./
RUN npm install

COPY app .

ENV NEXT_PUBLIC_API_URL=http://nginx:8000

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

### File: `nginx.conf`

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    include /etc/nginx/conf.d/*.conf;
}
```

### File: `conf.d/nextjs.conf`

```nginx
upstream nextjs {
    server nextjs:3000;
}

server {
    listen 80;
    server_name localhost;

    location / {
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
}
```

### File: `conf.d/php-backend.conf`

```nginx
upstream php {
    server php:9000;
}

server {
    listen 8000;
    server_name localhost;
    root /var/www/php-backend/public;

    location ~ \.php$ {
        fastcgi_pass php;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ /\. {
        deny all;
    }

    # Security and CORS headers
    add_header X-Content-Type-Options "nosniff";
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type';
}
```

## Option 2: Production Docker Setup

### File: `Dockerfile.production`

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY app/package*.json ./
RUN npm ci

COPY app .
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY app/package*.json ./

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:8000

EXPOSE 3000

CMD ["npm", "start"]
```

### File: `docker-compose.prod.yml`

```yaml
version: '3.8'

services:
  nextjs:
    build:
      context: .
      dockerfile: Dockerfile.production
    restart: always
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://yourdomain.com

  php:
    image: php:8.0-fpm-alpine
    volumes:
      - ./php-backend:/var/www/php-backend:ro
    restart: always
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./conf.d:/etc/nginx/conf.d:ro
      - ./php-backend:/var/www/php-backend:ro
      - ./ssl:/etc/nginx/ssl:ro
    restart: always
    depends_on:
      - php
```

## Usage

### Start Development Environment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

### Start Production Environment

```bash
# Set environment variables
export MONGODB_URI=mongodb+srv://...
export MONGODB_DB=transaction_dashboard

# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Useful Commands

```bash
# Build specific service
docker-compose build nextjs

# Run command in service
docker-compose exec php php test.php

# View logs
docker-compose logs php

# Stop specific service
docker-compose stop nginx

# Restart service
docker-compose restart php

# Remove everything
docker-compose down -v
```

## Environment Variables

### File: `.env`

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net
MONGODB_DB=transaction_dashboard

# Node/Next.js
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000

# PHP
DEBUG_MODE=true
```

## Troubleshooting

### Container won't start
```bash
# View logs
docker-compose logs php

# Rebuild
docker-compose build --no-cache php
```

### Port already in use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>

# Or use different port
docker-compose down
# Edit docker-compose.yml ports
docker-compose up -d
```

### Cannot access API
```bash
# Check connectivity
docker-compose exec nextjs curl http://nginx:8000/api/transactions

# Check PHP-FPM
docker-compose exec php php --version
```

### Database connection failed
```bash
# Check environment variables
docker-compose config | grep MONGO

# Restart with fresh env
docker-compose down
export MONGODB_URI=...
docker-compose up -d
```

## Performance Tips

### Development
- Use volumes for hot reload
- Keep images small (alpine)
- Limit logging

### Production
- Use multi-stage builds
- Implement health checks
- Set resource limits
- Use dedicated networks
- Enable logging drivers

Example with health check:

```yaml
php:
  image: php:8.0-fpm-alpine
  healthcheck:
    test: ["CMD", "php-fpm-healthcheck"]
    interval: 10s
    timeout: 5s
    retries: 3
```

## Monitoring

### View Resource Usage
```bash
docker stats
```

### View Container Logs
```bash
docker-compose logs -f php
docker-compose logs -f nginx
```

### Access Container Shell
```bash
docker-compose exec php sh
docker-compose exec nginx sh
```

## SSL/HTTPS in Docker

### Generate Self-Signed Certificate
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -nodes -out ssl/cert.pem -keyout ssl/key.pem -days 365
```

### Update nginx.conf
```nginx
server {
    listen 443 ssl;
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of config
}
```

## Scaling with Docker

### Load Balancing Multiple PHP Instances

```yaml
php:
  image: php:8.0-fpm-alpine
  deploy:
    replicas: 3
```

### Using Docker Swarm

```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml transaction-dashboard

# Check status
docker stack services transaction-dashboard
```

## Summary

✅ **Option 1**: Docker Compose (development)
- Quick setup
- Hot reload
- Easy debugging

✅ **Option 2**: Production Docker
- Optimized images
- Health checks
- Environment variables

✅ **Benefits**:
- Consistent environment
- Easy deployment
- No conflicts with system packages
- Scalable

## Next Steps

1. Create `docker-compose.yml` file
2. Update paths to match your structure
3. Run `docker-compose up -d`
4. Access services on configured ports
5. Use `docker-compose logs` to debug
