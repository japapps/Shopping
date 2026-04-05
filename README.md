# Shopping List App

Collaborative shopping list webapp built with React + Vite.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open `http://localhost:5173` on your computer.  
To test on your phone, use the Network URL shown in terminal (e.g. `http://192.168.1.x:5173`) — both devices must be on the same WiFi.

## Build for Production

```bash
npm run build
```

Output goes to `dist/` folder. Deploy to Vercel, Netlify, or any static host.

## Deploy to Vercel (free)

```bash
npm install -g vercel
vercel
```

Follow the prompts. You'll get a public URL like `https://shopping-list-xxx.vercel.app` — open it on any phone.

## Add to Home Screen (PWA)

On your phone, open the deployed URL in Safari/Chrome:
- **iOS**: Tap Share → "Add to Home Screen"
- **Android**: Tap menu → "Add to Home Screen"

The app will look and feel like a native app.

## Supabase Integration

See `supabase-setup.md` for full database schema, RLS policies, and integration guide.

## Project Structure

```
shopping-list-app/
├── index.html          # Entry HTML with PWA meta tags
├── package.json        # Dependencies
├── vite.config.js      # Vite config (host: true for mobile testing)
├── public/
│   └── manifest.json   # PWA manifest
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Full app component
```
