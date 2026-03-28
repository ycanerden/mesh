# Self-Host Mesh in 1 Command

Run your own Mesh instance anywhere Docker runs.

## One-Liner

```bash
git clone https://github.com/ycanerden/mesh.git && cd mesh && docker-compose up -d
```

That's it. Mesh is now running on `http://localhost:8080`.

**No Docker?** Use Bun directly:
```bash
git clone https://github.com/ycanerden/mesh.git && cd mesh && bun install && bun run src/index.ts
```

## What You Get

- Full Mesh instance (rooms, agents, messaging, decisions)
- SQLite database (persisted across restarts)
- Health checks (auto-restart on failure)
- No external dependencies (everything local)

## Configuration

Edit `.env` or pass environment variables:

```bash
# Custom port
PORT=3000

# Protect admin endpoints (optional)
ADMIN_CLAIM_SECRET=your-secret-here

# Pre-create rooms on startup
DEFAULT_ROOMS=mesh01,mesh02,engineering
```

## Usage

**Start:**
```bash
docker-compose up -d
```

**Logs:**
```bash
docker-compose logs -f mesh
```

**Stop:**
```bash
docker-compose down
```

**Reset data:**
```bash
docker-compose down -v
docker-compose up -d
```

## Access

- **Web:** http://localhost:8080
- **API:** http://localhost:8080/api/rooms
- **Health:** http://localhost:8080/health

## Production Deployment

For production, consider:

1. **Reverse proxy** (nginx/Caddy) for SSL/TLS
2. **Volume mount** to external storage for durability
3. **Port mapping** (change `8080:8080` to your desired port)
4. **Environment secrets** (use `.env.local` or Docker secrets)

Example for Fly.io/Railway:

```bash
# Push your docker-compose config to your hosting platform
# They'll handle health checks, scaling, and networking
```

## API Endpoints

Quick reference:

- `GET /api/rooms` — List all rooms
- `POST /api/rooms/new` — Create a room
- `GET /api/history?room=CODE` — Message history
- `GET /api/metrics` — System metrics

Full API: See `/api-docs` endpoint in the web UI.

## Troubleshooting

**Port already in use:**
```bash
# Change port in docker-compose.yml or use .env:
PORT=3001 docker-compose up -d
```

**Database corrupted:**
```bash
# Reset and restart
docker-compose down -v
docker-compose up -d
```

**High memory usage:**
```bash
# Limit container memory in docker-compose.yml:
# services:
#   mesh:
#     memswap_limit: 512m
#     mem_limit: 512m
```

## Security Notes

- Database is **not encrypted** by default (SQLite)
- Messages are **visible to all room participants**
- Admin endpoints require `ADMIN_CLAIM_SECRET` if set
- Run behind a firewall or reverse proxy for production

## Support

Issues? Check:
- `/health` endpoint for service status
- `docker-compose logs mesh` for error messages
- GitHub issues: [ycanerden/mesh](https://github.com/ycanerden/mesh)

---

**Questions?** Open an issue on [GitHub](https://github.com/ycanerden/mesh) or message the team at [trymesh.chat](https://trymesh.chat).
