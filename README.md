# Peedika - Eco-Friendly E-Commerce Platform

A sustainable shopping platform with AI-powered eco-scoring, greener alternatives, and rewards for eco-friendly choices.

## Features

- 🌿 **Eco Scores** - Every product rated for sustainability (0-100)
- 🤖 **AI Copilot** - Get personalized sustainable shopping advice
- 🔄 **Greener Alternatives** - Swap cart items for more eco-friendly options
- 🎯 **Eco Points** - Earn rewards for green purchases
- 💳 **Store Credit** - Convert eco-points to discounts

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript + MongoDB
- **AI**: Google Gemini API
- **Deployment**: Render

---

## Deployment on Render

### Option 1: Deploy with Blueprint (Recommended)

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint**
4. Connect your GitHub repo
5. Render will detect `render.yaml` and set up the service
6. Add environment variables in the Render dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `GEMINI_API_KEY` - Google Gemini API key
   - `JWT_SECRET` - Auto-generated or set your own

### Option 2: Manual Deploy

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm run render:build`
   - **Start Command**: `npm start`
   - **Environment**: Node
5. Add environment variables:
   ```
   NODE_ENV=production
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret-key
   GEMINI_API_KEY=your-gemini-key
   ```

---

## Local Development

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/peedika.git
   cd peedika
   ```

2. Install dependencies:

   ```bash
   npm run install:all
   ```

3. Create environment file:

   ```bash
   cp .env.example server/.env
   ```

   Edit `server/.env` with your values.

4. Seed the database (optional):

   ```bash
   npm run seed
   ```

5. Start development servers:

   ```bash
   # Terminal 1 - Backend
   npm run dev

   # Terminal 2 - Frontend
   npm run dev:client
   ```

6. Open http://localhost:8080

---

## Project Structure

```
peedika/
├── peedika-green/          # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── lib/            # API & utilities
│   │   └── types/          # TypeScript types
│   └── dist/               # Production build
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── ml/             # ML classifier
│   └── dist/               # Compiled JS
├── scripts/                # Build scripts
├── render.yaml             # Render deployment config
└── package.json            # Root package.json
```

---

## Environment Variables

| Variable              | Description                   | Required |
| --------------------- | ----------------------------- | -------- |
| `MONGO_URI`           | MongoDB connection string     | Yes      |
| `JWT_SECRET`          | Secret for JWT tokens         | Yes      |
| `GEMINI_API_KEY`      | Google Gemini API key         | Yes      |
| `NODE_ENV`            | `production` or `development` | Yes      |
| `PORT`                | Server port (default: 5000)   | No       |
| `UNSPLASH_ACCESS_KEY` | For product image scraping    | No       |

---

## API Endpoints

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/products` - Get products
- `GET /api/products/:id` - Get product details
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add to cart
- `POST /api/cart/swap` - Swap to greener alternative
- `POST /api/copilot` - AI assistant
- `POST /api/checkout` - Place order

---

## License

MIT
