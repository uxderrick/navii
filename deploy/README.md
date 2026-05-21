# Navii API — Hetzner deploy

Single-box deploy. Assumes host already runs Caddy as reverse proxy (detected
on `204.168.183.130`). API container binds to `127.0.0.1:8787`; Caddy on the
host forwards traffic + handles TLS via Let's Encrypt.

## Prereqs on the box
- Docker + Docker Compose v2
- Caddy installed and managing the active `Caddyfile` (already in place)
- DNS A record: `navii-api.uxderrick.com` → `204.168.183.130` ✅ done

## 1. Build + push image

On your laptop:

```sh
# from repo root — push to GHCR (release.yml does this automatically on git tag v*)
docker build -t ghcr.io/uxderrick/navii-api:latest -f packages/api/Dockerfile .
docker push ghcr.io/uxderrick/navii-api:latest
```

Or trigger the GitHub Action: `git tag v0.1.0 && git push --tags`.

## 2. Bootstrap on the box

```sh
ssh root@204.168.183.130
mkdir -p /opt/navii && cd /opt/navii

# copy these three files from the repo
#   deploy/docker-compose.yml
#   deploy/.env.example  →  /opt/navii/.env
#   deploy/Caddyfile.snippet

# pull image (login first if GHCR package is private)
docker login ghcr.io -u <github-user>
docker compose pull
docker compose up -d
docker compose ps
curl -s http://127.0.0.1:8787/healthz   # → {"ok":true,...}
```

## 3. Wire host Caddy

Find the host's active Caddyfile (commonly `/etc/caddy/Caddyfile`).

```sh
# append the navii block
cat /opt/navii/Caddyfile.snippet >> /etc/caddy/Caddyfile

caddy validate --config /etc/caddy/Caddyfile
systemctl reload caddy
```

Caddy auto-issues a TLS cert for `navii-api.uxderrick.com` on first request.

## 4. Verify

```sh
curl -sI https://navii-api.uxderrick.com/healthz
curl -sI 'https://navii-api.uxderrick.com/avatar/alice?size=128'
curl -o /tmp/a.png 'https://navii-api.uxderrick.com/avatar/alice.png?size=256' && file /tmp/a.png
open 'https://navii-api.uxderrick.com/gallery?count=96&size=128'
```

## Update

```sh
cd /opt/navii && docker compose pull && docker compose up -d
```

## Env reference

| Var                  | Default     | Notes                                |
| -------------------- | ----------- | ------------------------------------ |
| `PORT`               | `8787`      | Container-internal port              |
| `HOST`               | `0.0.0.0`   | Bind inside container                |
| `TRUST_PROXY`        | `1`         | Read `X-Forwarded-For` from host Caddy |
| `RATE_LIMIT_PER_MIN` | `120`       | Per-IP limit on `/avatar/*`          |
| `PNG_CACHE_SIZE`     | `1000`      | LRU entries for PNG raster cache     |
| `LOG_LEVEL`          | `info`      | `debug` \| `info` \| `warn` \| `error` |

## Notes

- LRU cache and rate-limit buckets are per-process. Scale beyond one replica → swap to Redis.
- API never binds publicly — only the host Caddy reaches it via `127.0.0.1:8787`.
- Logs: `docker compose logs -f api`.
