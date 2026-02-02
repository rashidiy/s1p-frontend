# Docker Setup Guide for SIPCRM

This guide explains how to run the SIPCRM frontend with Docker and Nginx for multi-tenant subdomain support.

## Architecture

```
Internet/Browser
        ↓
   Nginx (Port 80/443)
        ↓
  Subdomain Detection
        ↓
   ┌────────────────┐
   │                │
owner.domain.com → Owner Portal
company1.domain.com → Company Portal (company_subdomain=company1)
company2.domain.com → Company Portal (company_subdomain=company2)
```

## Prerequisites

- Docker & Docker Compose installed
- Domain configured with wildcard DNS (*.domain.com)
- Backend API running and accessible

## Quick Start

### 1. Configure Environment

Create `.env` file in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://your-backend-api:8000

# Multi-tenant Configuration
NEXT_PUBLIC_OWNER_SUBDOMAIN=owner
NEXT_PUBLIC_BASE_DOMAIN=domain.com
```

### 2. Update Nginx Configuration

Edit `nginx/conf.d/sipcrm.conf` and replace `domain.com` with your actual domain:

```nginx
server_name *.yourdomain.com yourdomain.com;
```

### 3. Build and Run

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4. Access the Application

- Owner Portal: `http://owner.domain.com`
- Company Portals: `http://company1.domain.com`, `http://company2.domain.com`, etc.

## Local Development

For local development without Docker:

### Option 1: Using /etc/hosts

Add to `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1  owner.localhost
127.0.0.1  company1.localhost
127.0.0.1  company2.localhost
```

Then run:

```bash
npm run dev
```

Access:
- Owner: `http://owner.localhost:3000`
- Company1: `http://company1.localhost:3000`

### Option 2: Query Parameter Override

For testing without DNS setup:

```bash
npm run dev
```

Access:
- Owner: `http://localhost:3000?subdomain=owner`
- Company: `http://localhost:3000?subdomain=company1`

## DNS Configuration

### Wildcard DNS Setup

For production, configure your DNS with a wildcard A record:

```
Type    Name    Value
A       @       <your-server-ip>
A       *       <your-server-ip>
```

This allows:
- `domain.com` → Main site
- `owner.domain.com` → Owner portal
- `*.domain.com` → Company portals

### Testing DNS

```bash
# Test DNS resolution
nslookup owner.domain.com
nslookup company1.domain.com

# Test from browser
curl -H "Host: owner.domain.com" http://your-server-ip
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

1. Install Certbot:
```bash
docker-compose exec nginx sh
apk add certbot certbot-nginx
```

2. Generate wildcard certificate:
```bash
certbot certonly --manual \
  --preferred-challenges dns \
  -d domain.com \
  -d *.domain.com
```

3. Uncomment HTTPS server block in `nginx/conf.d/sipcrm.conf`

4. Update certificate paths:
```nginx
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

5. Reload Nginx:
```bash
docker-compose exec nginx nginx -s reload
```

### Using Custom SSL Certificates

1. Place your certificates in `nginx/ssl/`:
   - `nginx/ssl/domain.com.crt` (certificate)
   - `nginx/ssl/domain.com.key` (private key)

2. Uncomment HTTPS server block in `nginx/conf.d/sipcrm.conf`

3. Restart Nginx:
```bash
docker-compose restart nginx
```

## How Subdomain Routing Works

### 1. Nginx Layer

Nginx extracts the subdomain from the request host:

```nginx
map $host $subdomain {
    ~^(?<sub>[^.]+)\.domain\.com$ $sub;
    default "";
}
```

Then passes it to Next.js via header:

```nginx
proxy_set_header X-Subdomain $subdomain;
```

### 2. Next.js Middleware Layer

Middleware (`src/middleware.ts`) reads the subdomain and:

- If `subdomain === 'owner'`:
  - Allows access to `/owner/*` routes
  - Redirects non-owner routes to `/owner/dashboard`

- If `subdomain === 'company1'` (or any other):
  - Blocks access to `/owner/*` routes
  - Allows access to company routes (`/dashboard`, `/contacts`, etc.)
  - Sets `company_subdomain` cookie for client-side access

### 3. Application Layer

Your app can access the subdomain via:

```typescript
// Server component
import { headers } from 'next/headers';
const subdomain = headers().get('x-subdomain');

// Client component
import { cookies } from 'next/headers';
const subdomain = cookies().get('company_subdomain');
```

## Production Deployment

### 1. Server Setup

```bash
# On your server
git clone <your-repo>
cd SIPCRM-Front

# Configure environment
cp .env.example .env
nano .env  # Edit with production values

# Build and run
docker-compose up -d --build
```

### 2. Firewall Configuration

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 3. Monitoring

```bash
# View logs
docker-compose logs -f nextjs
docker-compose logs -f nginx

# Check container status
docker-compose ps

# Restart services
docker-compose restart nextjs
docker-compose restart nginx
```

## Troubleshooting

### Subdomain Not Detected

1. Check Nginx logs:
```bash
docker-compose logs nginx | grep subdomain
```

2. Verify DNS resolution:
```bash
nslookup owner.domain.com
```

3. Test directly with curl:
```bash
curl -H "Host: owner.domain.com" http://your-server-ip
```

### 502 Bad Gateway

1. Check if Next.js is running:
```bash
docker-compose ps nextjs
```

2. Check Next.js logs:
```bash
docker-compose logs nextjs
```

3. Verify network connectivity:
```bash
docker-compose exec nginx ping nextjs
```

### Permission Denied

```bash
# Fix nginx log directory permissions
sudo chown -R 101:101 nginx/logs/

# Restart nginx
docker-compose restart nginx
```

### Cannot Access from Browser

1. Verify containers are running:
```bash
docker-compose ps
```

2. Check port binding:
```bash
sudo netstat -tlnp | grep :80
```

3. Test locally:
```bash
curl http://localhost
```

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | - | `http://api.domain.com` |
| `NEXT_PUBLIC_OWNER_SUBDOMAIN` | Owner portal subdomain | `owner` | `admin` |
| `NEXT_PUBLIC_BASE_DOMAIN` | Base domain | `domain.com` | `mycrm.com` |
| `NODE_ENV` | Environment | `production` | `development` |

## Scaling

### Horizontal Scaling

Add more Next.js instances:

```yaml
# docker-compose.yml
services:
  nextjs:
    # ... existing config
    deploy:
      replicas: 3
```

### Load Balancing

Nginx automatically load balances between multiple instances:

```nginx
upstream nextjs_backend {
    least_conn;
    server nextjs_1:3000;
    server nextjs_2:3000;
    server nextjs_3:3000;
}
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Keep certificates up to date**
3. **Limit CORS origins** in production
4. **Use strong SSL ciphers**
5. **Enable rate limiting** in Nginx
6. **Regular security updates**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

## Backup and Restore

### Backup

```bash
# Backup Nginx configuration
tar -czf nginx-backup.tar.gz nginx/

# Backup SSL certificates
tar -czf ssl-backup.tar.gz nginx/ssl/
```

### Restore

```bash
# Restore Nginx configuration
tar -xzf nginx-backup.tar.gz

# Restart services
docker-compose restart nginx
```

## Performance Optimization

### 1. Enable Nginx Caching

Add to `nginx/conf.d/sipcrm.conf`:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;

location / {
    proxy_cache my_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_bypass $http_upgrade;
}
```

### 2. Optimize Next.js Build

In `next.config.js`:

```javascript
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}
```

### 3. Enable HTTP/2

Uncomment in `nginx/conf.d/sipcrm.conf`:

```nginx
listen 443 ssl http2;
```

## Support

For issues or questions:
- Check logs: `docker-compose logs`
- Verify configuration: `docker-compose config`
- Test connectivity: `docker-compose exec nginx ping nextjs`
