# Plan: Migrate n8n from Cloud Trial → Self-Hosted DigitalOcean

## Context
User has n8n cloud trial ending soon with existing workflows to preserve. Wants to self-host on DigitalOcean (~$6/month) instead of paying $20/month for n8n cloud. Already has a DigitalOcean account and joinhabitat.eu domain set up from Campfire install.

---

## ⚠️ URGENT FIRST: Export Workflows Before Trial Ends

1. Log into your n8n cloud account
2. Open each workflow → click the **⋮ menu** (three dots) → **Download**
3. Save the `.json` files somewhere safe (Desktop folder)
4. Do this for EVERY workflow you want to keep

---

## Step 1: Create New Droplet

In DigitalOcean, go to **Marketplace** tab when creating a new Droplet and search for **n8n** — there's a 1-click install that sets up Docker + n8n automatically. Much simpler than manual Docker Compose.

- **Size**: $6/month (1GB RAM / 1CPU) — enough for personal use
- **Region**: Amsterdam (same as Campfire)
- **OS**: Ubuntu 22.04 via Marketplace n8n image

---

## Step 2: DNS Setup (send to Robbe)

Add another A record to joinhabitat.eu:
- **Type**: A
- **Name**: `n8n`
- **Value**: (new droplet IP)
- No proxy (grey cloud if Cloudflare)

Creates: `n8n.joinhabitat.eu`

---

## Step 3: SSH In & Configure

SSH into new server:
```
ssh root@NEW_DROPLET_IP
```

The Marketplace image uses Caddy (not Nginx) for SSL — it auto-configures HTTPS when you set the domain. Just need to set the domain in the config file.

---

## Step 4: Import Workflows

1. Go to `https://n8n.joinhabitat.eu`
2. Create owner account
3. Go to **Workflows** → **Import from file**
4. Upload each `.json` file saved in Step 0
5. Re-enter any credentials (API keys etc.) — these don't export for security reasons

---

## Cost
- New droplet: ~$6/month
- Domain: already owned
- **Total: $6/month vs $20/month cloud** → saves ~$168/year

---

# Plan: Set Up Campfire (Self-Hosted Slack Alternative) for Habitat ✅ DONE

## Context
The user purchased Campfire by 37signals — a self-hosted team chat app. They want to deploy it cheaply for ~40-50 people (with room to grow to 250). They are non-technical and need a complete, step-by-step guide.

---

## Step 1: Create a Hetzner Account & Server (cheapest option)

Hetzner is significantly cheaper than DigitalOcean and works perfectly for this.

1. Go to **hetzner.com** → sign up for an account (free)
2. Once logged in, go to **Cloud** → **New Project** → name it "Habitat Chat"
3. Click **Add Server**:
   - **Location**: pick one closest to you (Helsinki, Nuremberg, Ashburn, etc.)
   - **Image**: Ubuntu 22.04 LTS
   - **Type**: **CX22** (2 vCPU, 4GB RAM) — about **€4/month** — way more than enough for 250 users
   - **SSH Key**: skip for now, use password (simpler for first time)
   - **Name**: `habitat-chat`
4. Click **Create & Buy Now**
5. Hetzner will email you the **root password** and show you the **server IP address** — write these down

---

## Step 2: Set Up a Domain/Subdomain

You need a web address for your chat (e.g., `chat.habitatapp.com`).

**If you already have a Habitat domain:**
1. Log in to wherever you manage your domain (Cloudflare, GoDaddy, Namecheap, etc.)
2. Go to **DNS settings**
3. Add a new **A record**:
   - Name: `chat` (this creates `chat.yourdomain.com`)
   - Value: your Hetzner server IP address
   - TTL: Auto
   - **Important**: If using Cloudflare, make sure the cloud icon is **GREY (DNS only)** — NOT orange. Campfire needs a direct connection, no proxy.
4. Wait 5-15 minutes for DNS to spread

**If you don't have a domain yet:**
- Buy one on Namecheap (~$10/year) then follow the steps above

---

## Step 3: Connect to Your Server via SSH

On your Mac:
1. Open **Terminal** (search "Terminal" in Spotlight)
2. Type this, replacing with your actual IP:
   ```
   ssh root@YOUR_HETZNER_IP
   ```
3. Type `yes` when asked about fingerprint
4. Enter the root password Hetzner emailed you
5. You're now inside your server ✓

---

## Step 4: Run the Campfire Install Command

Paste the personalized command from 37signals into the terminal:
```
/bin/bash -c "$(curl -fsSL https://auth.once.com/install/hv2e-y3wr-r8ks-b7hc)"
```

- It will install Docker automatically
- It will ask: **"What domain are you using?"** → type your subdomain (e.g., `chat.habitatapp.com`)
- Wait up to 5 minutes
- It will automatically set up SSL (HTTPS) for you — no extra work needed

---

## Step 5: Create Your Admin Account

1. Open a browser and go to `https://chat.yourdomain.com`
2. Follow the setup wizard to create the first admin account (this is YOU)
3. From the admin panel, invite your Habitat team members by email

---

## Ongoing Notes
- Server auto-updates Campfire every night at 2am (server time)
- **Estimated monthly cost**: ~€4-5/month (~$5 USD)
- **To upgrade later** (if you grow past 250 users): resize the Hetzner server to CX32 (8GB/4CPU) with one click, no data loss
- **Backups**: connect to server via SSH and run `once` to see backup options

---

## Key Details to Keep Safe
- Hetzner server IP
- Root password (or set up an SSH key later)
- Your domain DNS login
- Campfire install token: `hv2e-y3wr-r8ks-b7hc` (do not share publicly)
