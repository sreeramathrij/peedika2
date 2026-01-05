import "dotenv/config";
import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./config/db";
import { loadModel } from "./ml/classifier";

import productRoutes from "./routes/productRoutes";
import authRoutes from "./routes/authRoutes";
import cartRoutes from "./routes/cartRoutes";
import copilotRoutes from "./routes/copilotRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";

const app: Application = express();

const isProduction = process.env.NODE_ENV === "production";

// CORS configuration to allow credentials (cookies)
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:8080',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // In production, allow same-origin requests
    if (isProduction) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());


connectDB();
(async () => {
  await loadModel();
})();

// API routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/copilot", copilotRoutes);
app.use("/api/checkout", checkoutRoutes);

// Serve static files from the React app in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, "client");
  
  // Serve static assets
  app.use(express.static(clientBuildPath));
  
  // Handle React routing - return index.html for all non-API routes
  // Express 5 uses {*splat} syntax for catch-all routes
  app.get("/{*splat}", (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
