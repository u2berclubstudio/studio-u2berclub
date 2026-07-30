# Connect the site to GitHub (edit → push → one-command deploy)

Once this is set up, updating the live site is:
1. I edit the files on your Mac.
2. You click **Commit** then **Push** in the GitHub Desktop app.
3. On the server you run one command: `bash update.sh`.

No more uploading files one by one.

> Reminder: most **text, number, and tracking changes don't need GitHub at all** —
> do those in the Dashboard (studio.u2berclub.com/dashboard), they save instantly.
> GitHub is only for design/code changes I make for you.

---

## PART A — Put the project on GitHub (one time, ~10 min)

### 1. Make a GitHub account
If you don't have one, sign up free at https://github.com

### 2. Install GitHub Desktop (the easy app — no command line)
Download from https://desktop.github.com , install, open it, and **sign in** with your GitHub account.

### 3. Add this project as a repository
- In GitHub Desktop: menu **File → Add Local Repository…**
- Choose this folder:
  `/Users/atul/u2ber club/claude agents/studio-u2berclub`
- It will say “this directory is not a Git repository” — click the blue
  **create a repository** link it offers.
- On the next screen just click **Create Repository** (leave the defaults).

### 4. Publish it to GitHub
- Click the big **Publish repository** button (top right).
- Name: `studio-u2berclub`
- **Untick “Keep this code private.”** (Public is simpler and there are **no secrets**
  in here — your admin password and session secret live only on the server, and the
  `data/` folder with content/analytics is excluded from Git.)
- Click **Publish Repository.**

Your code is now on GitHub. Note the address — it will be:
`https://github.com/YOUR_USERNAME/studio-u2berclub`

---

## PART B — Point the server at GitHub (one time, ~5 min)

SSH into the server (`ssh root@129.121.123.192`), then run these, **replacing
`YOUR_USERNAME`** with your GitHub username:

```
# stop the app
systemctl stop u2berstudio

# keep a backup of the current folder (with your data)
mv /var/www/studio-u2berclub /var/www/studio-u2berclub-old

# clone the project fresh from GitHub
git clone https://github.com/YOUR_USERNAME/studio-u2berclub.git /var/www/studio-u2berclub

# bring your saved content + analytics across
cp -r /var/www/studio-u2berclub-old/data /var/www/studio-u2berclub/ 2>/dev/null || mkdir -p /var/www/studio-u2berclub/data

# install and start
cd /var/www/studio-u2berclub
npm install --omit=dev
chown -R www-data:www-data /var/www/studio-u2berclub
systemctl start u2berstudio
systemctl status u2berstudio
```

Green **active (running)** = done. Check https://studio.u2berclub.com still works.
Once you're happy, you can delete the backup: `rm -rf /var/www/studio-u2berclub-old`

> If `git` isn't installed: `apt-get install -y git` then re-run the clone line.

---

## PART C — The everyday update flow

**When I make a change for you:**

1. Open **GitHub Desktop.** You'll see the changed files listed on the left.
2. Bottom-left: type a short summary (e.g. “update launchpad form”), click
   **Commit to main.**
3. Top: click **Push origin.**

**Then, on the server** (SSH in and run):

```
cd /var/www/studio-u2berclub
bash update.sh
```

That single command pulls the new code, installs anything new, and restarts the
site. Live in ~10 seconds.

---

## Optional later: fully automatic deploys
If you get tired of running `update.sh`, I can add a GitHub Action so the site
auto-updates the instant you push — zero server commands. Ask me when you want it.
