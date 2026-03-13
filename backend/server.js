const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

// ──────────────────────────────────────────────
// CORS — Allow your Vercel frontend domain
// ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,       // set this in Vercel env vars
  'http://localhost:5173',         // local dev
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'fallback' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ──────────────────────────────────────────────
// Database — Connect once and cache the connection
// Vercel serverless functions re-use warm instances
// ──────────────────────────────────────────────
let isDbConnected = false;
let dbConnectionPromise = null;

const connectDB = () => {
  if (dbConnectionPromise) return dbConnectionPromise;

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI set. Using in-memory fallback.');
    global.isDbConnected = () => false;
    return Promise.resolve();
  }

  dbConnectionPromise = mongoose.connect(uri)
    .then(() => {
      console.log('MongoDB Connected');
      isDbConnected = true;
      global.isDbConnected = () => true;
    })
    .catch(err => {
      console.error('MongoDB connection failed:', err.message);
      isDbConnected = false;
      global.isDbConnected = () => false;
      dbConnectionPromise = null; // allow retry next cold start
    });

  return dbConnectionPromise;
};

// Connect to DB (non-blocking — routes have the fallback)
connectDB();

// ──────────────────────────────────────────────
// Export for Vercel serverless
// DO NOT call app.listen() — Vercel handles that
// ──────────────────────────────────────────────
module.exports = app;

// Local development only
if (process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running locally on http://localhost:${PORT}`);
  });
}
