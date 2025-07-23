const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'API is running' });
});

module.exports = app;
