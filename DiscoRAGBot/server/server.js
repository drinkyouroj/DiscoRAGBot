// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const basicRoutes = require("./routes/index");
const authRoutes = require("./routes/authRoutes");
const botSettingsRoutes = require("./routes/botSettingsRoutes");
const globalBotConfigRoutes = require("./routes/globalBotConfigRoutes");
const fileRoutes = require("./routes/fileRoutes");
const urlRoutes = require("./routes/urlRoutes");
const manualEntryRoutes = require("./routes/manualEntryRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const { connectDB } = require("./config/database");
const cors = require("cors");

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL variables in .env missing.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
// Pretty-print JSON responses
app.enable('json spaces');
// We want to be consistent with URL paths, so we enable strict routing
app.enable('strict routing');

app.use(cors({}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Request received, proceeding to next middleware');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
connectDB();

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Basic Routes
app.use(basicRoutes);
// Authentication Routes
app.use('/api/auth', authRoutes);
// Bot Settings Routes (user-specific)
app.use('/api/users', botSettingsRoutes);
// Global Bot Configuration Routes
console.log('Registering global bot configuration routes at /api/bot-configuration');
app.use('/api/bot-configuration', globalBotConfigRoutes);
// File Routes
app.use('/api/files', fileRoutes);
// URL Routes
app.use('/api/urls', urlRoutes);
// Manual Entry Routes
app.use('/api/manual-entries', manualEntryRoutes);
// Analytics Routes
console.log('Registering analytics routes at /api/analytics');
app.use('/api/analytics', analyticsRoutes);

// Add response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log(`Response sent for ${req.method} ${req.url} with status ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log(`JSON response sent for ${req.method} ${req.url} with status ${res.statusCode}`);
    return originalJson.call(this, data);
  };
  
  next();
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  console.log(`404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});