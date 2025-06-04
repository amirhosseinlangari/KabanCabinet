// ====== IMPORT DEPENDENCIES ======
// Express framework for creating the server
const express = require('express');
// Parse environment variables
require('dotenv').config();
// Connect to MongoDB
const mongoose = require('mongoose');
// CORS middleware for handling cross-origin requests
const cors = require('cors');
// Parse incoming request bodies
const bodyParser = require('body-parser');
// File system operations
const fs = require('fs');
// Path manipulation
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// ====== IMPORT ROUTES ======
const orderRoutes = require('./routes/orderRoutes');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');

// ====== INITIALIZE EXPRESS APP ======
const app = express();

// ====== MIDDLEWARE SETUP ======
// Allow cross-origin requests
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
// Parse JSON in request bodies
app.use(bodyParser.json({ limit: '10mb' }));
// Parse URL-encoded data
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ====== SETUP DIRECTORY FOR EXCEL EXPORTS ======
const excelExportPath = process.env.EXCEL_EXPORT_PATH || './exports';
if (!fs.existsSync(excelExportPath)) {
  fs.mkdirSync(excelExportPath, { recursive: true });
  console.log(`Created directory for Excel exports: ${excelExportPath}`);
}

// ====== API ROUTES ======
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', require('./api/user'));
app.use('/api/cart', require('./api/cart'));
app.use('/api/payments', require('./api/payment'));

// ====== ERROR HANDLING MIDDLEWARE ======
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'مسیر مورد نظر یافت نشد'
  });
});

// ====== CONNECT TO MONGODB ======
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true
    });
    
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize DB connection
connectDB();

// ====== START SERVER ======
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`🌐 محیط: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 آدرس سرور: http://0.0.0.0:${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash in production, just log the error
  if (process.env.NODE_ENV === 'development') {
    process.exit(1);
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // مسیر پیش‌فرض برای محیط توسعه
  app.get('/', (req, res) => {
    res.send('API در حال اجرا است. برای دسترسی به API از /api استفاده کنید');
  });
}

// میدلور مدیریت خطاهای کلی
app.use((err, req, res, next) => {
  console.error('خطای سرور:', err);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'خطای سرور',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

module.exports = app; // Export for testing 