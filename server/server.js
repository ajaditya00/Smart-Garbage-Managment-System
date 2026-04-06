import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './config/database.js';

// Create __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Route imports
import authRoutes from './routes/auth.js';
import complaintRoutes from './routes/complaints.js';
import adminRoutes from './routes/admin.js';
import assignmentRoutes from './routes/assignments.js';
import ngoRoutes from './routes/ngo.js';
import feedbackRoutes from './routes/feedback.js';
import donationRoutes from './routes/donations.js';
import uploadRoutes from './routes/uploads.js';

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : 'http://localhost:5173',
  credentials: true
}));

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/donate', donationRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log every error in detail
  console.error('[GlobalErrorHandler]', {
    name   : err.name,
    message: err.message,
    code   : err.code,
    stack  : err.stack,
    raw    : JSON.stringify(err)  // Catches non-standard error objects (e.g. Cloudinary API errors)
  });

  // Multer file upload errors
  if (err.name === 'MulterError') {
    const msg = err.code === 'LIMIT_FILE_SIZE'
      ? 'File too large. Maximum size is 5 MB.'
      : `Upload error: ${err.message}`;
    return res.status(400).json({ message: msg });
  }

  // Custom file-filter error thrown by our fileFilter
  if (err.message && err.message.startsWith('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ message: 'Validation Error', errors });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  // Duplicate key (MongoDB unique index)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `${field} already exists` });
  }

  // Fallback — always include a message so we never return {}
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack  : process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});


// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});