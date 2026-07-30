# U2ber Club Studio — Deploy to `studio.u2berclub.com`

This is a small, self-contained Node.js app. It serves your website, a
password-protected admin panel, live traffic + click analytics, and injects
Meta Pixel / Google Tag Manager / GA4 tags — all editable from the admin.

Files:
```
studio-u2berclub/
├── server.js               # the web server
├── package.json
├── public/                 # site-config.js, admin.html, and the 7 studio photos
├── templates/index.html    # the homepage (server fills in content + tags)
└── data/                   # created automatically: content.json + events.jsonl
```

---

## What you need
- Your existing Ubuntu VPS (the one running u2berclub.com)
- SSH access, and `sudo`
- 10–15 minutes

Throughout, replace `studio.u2berclub.com` if you use a different subdomain.

---

## Step 1 — Point the subdomain at your VPS (DNS)
In your domain's DNS settings, add an **A record**:

| Type | Name    | Value            |
|------|---------|------------------|
| A    | studio  | YOUR_VPS_IP      |

(Use the same IP your u2berclub.com already points to.) Save. DNS can take a
few minutes to propagate.

---

## Step 2 — Upload the app to the VPS
From your computer, in the folder that contains `studio-u2berclub`:
```bash
scp -r studio-u2berclub youruser@YOUR_VPS_IP:/var/www/
```
Or use any SFTP tool (FileZilla) to copy the `studio-u2berclub` folder into
`/var/www/` on the server.

---

## Step 3 — Install Node.js (skip if already installed)
SSH in, then:
```bash
node -v   # if this prints v18+ you can skip the next two lines
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## Step 4 — Install dependencies
```bash
cd /var/www/studio-u2berclub
npm install --omit=dev
```

---

## Step 5 — Run it as a service (survives reboots)
Create the service file:
```bash
sudo nano /etc/systemd/system/u2berstudio.service
```
Paste this (change **ADMIN_PASSWORD** to your own strong password, and put any
long random string as **SESSION_SECRET**):
```ini
[Unit]
Description=U2ber Club Studio
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/studio-u2berclub
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ADMIN_PASSWORD=change-this-to-a-strong-password
Environment=SESSION_SECRET=paste-a-long-random-string-here
User=www-data
Group=www-data

[Install]
WantedBy=multi-user.target
```
Save (Ctrl+O, Enter, Ctrl+X), then:
```bash
sudo chown -R www-data:www-data /var/www/studio-u2berclub
sudo systemctl daemon-reload
sudo systemctl enable --now u2berstudio
sudo systemctl status u2berstudio      # should say "active (running)"
```
The app is now running on `http://127.0.0.1:3001`.

---

## Step 6 — Put nginx in front (subdomain + reverse proxy)
```bash
sudo nano /etc/nginx/sites-available/studio.u2berclub.com
```
Paste:
```nginx
server {
    listen 80;
    server_name studio.u2berclub.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Enable it and reload:
```bash
sudo ln -s /etc/nginx/sites-available/studio.u2berclub.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 7 — Free SSL (https)
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d studio.u2berclub.com
```
Choose the redirect-to-HTTPS option. Done — your site is live at
**https://studio.u2berclub.com**.

---

## Using it
- **Website:** https://studio.u2berclub.com
- **Admin:** https://studio.u2berclub.com/admin  (log in with your ADMIN_PASSWORD)
  - **Analytics tab** — live visitors, 24h/7d/all-time views, a 7-day chart,
    button-click counts, traffic sources, and a live activity feed.
  - **Content tab** — edit every headline, paragraph, button, caption, the
    WhatsApp number, and the Made-in-Ludhiana form URL. Save = live for everyone.
  - **Tracking & Ads tab** — paste your **GTM**, **Meta Pixel**, and **GA4** IDs
    to switch tracking on for ad targeting. No code required.

## Everyday admin tasks
- **Change the password:** edit `ADMIN_PASSWORD` in the service file, then
  `sudo systemctl daemon-reload && sudo systemctl restart u2berstudio`.
- **Update the site after a code change:** re-upload files, then
  `sudo systemctl restart u2berstudio`.
- **Swap studio photos:** replace the `.jpg` files in `public/` (keep the same
  names: `backdrop-1..3.jpg`, `gallery-1..4.jpg`), then hard-refresh the page.
- **Backups:** your content lives in `data/content.json`; analytics in
  `data/events.jsonl`. The admin's **Backup/Restore** buttons export/import the
  content as a JSON file too.

## Notes
- Analytics are **first-party and cookie-free** (a random visitor id in the
  browser's localStorage), so they keep working even with ad blockers and don't
  need a cookie banner on their own. If you enable GTM/Pixel/GA, those are
  third-party and you should add a cookie/consent notice per local law.
- For very high traffic the `events.jsonl` file will grow; it's fine for a
  studio site. Archive/rename it occasionally if you like (the app recreates it).
