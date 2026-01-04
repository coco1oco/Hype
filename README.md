# Hype - Second-Hand Ticket Marketplace

A React-based event ticketing platform with second-hand ticket resale and auction features.

## Features

- 🎫 Second-hand ticket marketplace
- 🔨 Auction-style bidding system
- 👥 Fan-to-fan ticket resales
- 📱 Mobile-responsive design
- 🎨 Modern iOS-inspired UI

## Tech Stack

- React 18
- Vite
- React Router DOM
- React Icons
- Leaflet (for maps)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:

   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:

   ```bash
   vercel login
   ```

3. Deploy:

   ```bash
   cd hackathon/Hype
   vercel
   ```

4. Follow the prompts to link your project or create a new one.

### Option 2: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `hackathon/Hype` (if repo root is `codes/`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click "Deploy"

### Important Notes

- Static assets (images) are in the `public/` folder
- The `vercel.json` file handles SPA routing
- Make sure all image files (`.jpg`, `.png`) are in the `public/` directory

## Project Structure

```
hackathon/Hype/
├── public/          # Static assets (images)
├── src/
│   ├── components/ # React components
│   ├── pages/      # Page components
│   ├── data/       # Event data
│   ├── services/   # Business logic
│   └── utils/      # Utility functions
├── vercel.json     # Vercel configuration
└── package.json
```
