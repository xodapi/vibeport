# Deploying VibePort

VibePort is a dashboard for a **local or private** `proxyrs` service. Its model and metrics features require network access from the VibePort server to the proxy.

## Recommended topology

```text
Browser ── HTTPS ──> VibePort (Next.js)
                         │
                         └── private network ──> proxyrs :3001
```

Keep `proxyrs` on loopback or a private network. Do not expose its management endpoints directly to the public internet.

## Local production run

```powershell
cd C:\project\vibeport
Copy-Item .env.example .env.local
# Set NEXT_PUBLIC_PROXY_URL=http://127.0.0.1:3001
npm ci --ignore-scripts
npm run build
npm run start
```

Open `http://127.0.0.1:3000`.

## Environment variables

| Variable | Required | Default | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_PROXY_URL` | Yes | `http://127.0.0.1:3001` | URL VibePort server uses to reach proxyrs. Use only a private or loopback address. |
| `NEXT_PUBLIC_VIMIT_URL` | No | `http://127.0.0.1:3002` | Reserved for the future Vimit server integration. |
| `NODE_ENV` | Production | `development` | Set by `next start`. |

The Settings page accepts only localhost URLs and stores the selected proxy URL in an HTTP-only, same-site cookie. It never stores an API key.

## Reverse proxy

Terminate HTTPS at a reverse proxy such as nginx or Caddy. Forward traffic to VibePort on a private loopback port.

Example nginx server block:

```nginx
server {
    listen 443 ssl http2;
    server_name vibeport.example.internal;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Use access control at the reverse proxy or private-network level. VibePort v0.1 does not include multi-user authentication.

## Docker

The VibePort runtime needs to resolve the proxyrs address from inside its container. On Docker Desktop for Windows/macOS, use `host.docker.internal`.

```bash
docker build -t vibeport .
docker run --rm -p 3000:3000 \
  -e NEXT_PUBLIC_PROXY_URL=http://host.docker.internal:3001 \
  vibeport
```

For Linux, place VibePort and proxyrs on the same private Docker network, then use the proxyrs service name and port.

## Vercel and other public serverless hosts

Do **not** deploy VibePort to a public Vercel project if `proxyrs` only exists on your workstation at `127.0.0.1:3001`. Serverless functions cannot reach your machine's loopback interface.

Vercel is appropriate only when:

1. `proxyrs` runs in a private reachable network, and
2. VibePort is access-controlled, and
3. proxy management endpoints are not publicly exposed.

## Production checklist

- [ ] `npm ci --ignore-scripts`
- [ ] `npm run lint`
- [ ] `npm run type-check`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `NEXT_PUBLIC_PROXY_URL` points to a private proxyrs address
- [ ] proxyrs management token is configured if it is network-accessible
- [ ] HTTPS terminates at a reverse proxy
- [ ] VibePort access is restricted to authorized users
- [ ] `.env.local` and API keys are not committed
