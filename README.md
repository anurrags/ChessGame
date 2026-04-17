
# Chess Game ♟️

Enjoy playing chess, try this chess game created using react.js, node.js and typescript.

We have used chess.js node library(Copyright (c) 2023, Jeff Hlywa (jhlywa@gmail.com))

## Installation

1. Clone the repository
2. Checkout the main branch

3. Start server. To do so run the following commands:
```bash
  cd server
  npm install 
  npm run dev
```

4. Start client:
```bash
    cd ../client
    npm install
    npm run dev
```
And you are good to go.

---

## Deployment

### Client → Vercel

1. Go to [vercel.com](https://vercel.com) and import your repo
2. Set **Root Directory** to `client`
3. Set **Build Command** to `npm run build`
4. Set **Output Directory** to `build`
5. Add environment variable:
   - `VITE_SERVER_URL` = your Render server URL (e.g. `https://chess-server.onrender.com`)

### Server → Render

1. Go to [render.com](https://render.com) and create a new **Web Service**
2. Connect your repo
3. Configure:
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `PORT` = `10000` (Render default)
   - `CLIENT_URL` = your Vercel client URL (e.g. `https://chess-game.vercel.app`)
5. Set **Health Check Path** to `/health`
