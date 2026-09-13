require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Phase 1 Routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const departmentRoutes = require('./routes/department.routes');
const categoryRoutes = require('./routes/category.routes');
const requestRoutes = require('./routes/request.routes');

// Phase 2 Routes
const assetRoutes = require('./routes/asset.routes');
const repairRoutes = require('./routes/repair.routes');
const employeeRoutes = require('./routes/employee.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

// Phase 3 Routes
const stockRoutes = require('./routes/stock.routes');
const budgetRoutes = require('./routes/budget.routes');

const { errorHandler } = require('./middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);

// Request Parsing & Logging
app.use(express.json({ limit: '10mb' })); // Increased limit for base64 QR codes
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Phase 1 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/asset-requests', requestRoutes);

// Phase 2 API Routes
app.use('/api/assets', assetRoutes);
app.use('/api/repair-requests', repairRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Phase 3 API Routes
app.use('/api/stock', stockRoutes);
app.use('/api/budgets', budgetRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'AssetFlow API Server is running — Phase 3 active.' });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` CCL AssetFlow Server running on http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`====================================================`);
});
