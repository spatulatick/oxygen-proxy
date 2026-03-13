# void — Scramjet Proxy Site

A clean, custom-designed proxy site powered by [Scramjet](https://github.com/MercuryWorkshop/scramjet).

## Project Structure

```
my-proxy-site/
├── public/
│   ├── index.html        ← Custom homepage UI
│   ├── sw.js             ← Scramjet service worker
│   └── static/
│       └── app.js        ← Scramjet controller + BareMux init
├── src/
│   └── server.js         ← Express + Wisp backend
├── package.json
└── .gitignore
```

## Setup

### 1. Install Node.js

Download and install Node.js (v18+) from https://nodejs.org

### 2. Install dependencies

Open a terminal in this folder and run:

```bash
npm install
```

### 3. Start the server

```bash
npm start
```

Then open http://localhost:8080 in your browser.

## How it works

- **Scramjet** rewrites web pages inside a Service Worker so your browser
  can load blocked sites without any extensions.
- **BareMux** manages transport layers (how requests actually travel to the internet).
- **Wisp** is a WebSocket protocol used by BareMux under the hood.
- **Express** serves all the static files and hosts the Wisp server.

## Hosting

### Railway (recommended for beginners)
1. Push this project to a GitHub repo
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select your repo — Railway auto-detects Node.js and runs `npm start`

### Render
1. Push to GitHub
2. Go to https://render.com → New Web Service → Connect your repo
3. Build command: `npm install`  Start command: `npm start`

### VPS (Ubuntu)
```bash
sudo apt update && sudo apt install -y nodejs npm git
git clone <your-repo-url>
cd my-proxy-site
npm install
node src/server.js
```

Use PM2 to keep it running:
```bash
npm install -g pm2
pm2 start src/server.js --name proxy
pm2 save
pm2 startup
```

## Customization

- **Site name/colors**: Edit `public/index.html` CSS variables at the top (`--accent`, `--bg`, etc.)
- **Port**: Set `PORT` environment variable (default: 8080)
- **Add more shortcuts**: Add `<span class="pill" data-url="https://...">Name</span>` in index.html
