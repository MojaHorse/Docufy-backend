require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true })); // Replace with your frontend URL in production
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock "database" for demo (replace with real DB logic)
const users = new Map(); // key: idNumber, value: user object with password, name, etc.

// Helper to generate a simple token (for demo only)
const generateToken = (idNumber) => `token-${idNumber}-${Date.now()}`;

// Signup route
app.post('/api/auth/signup', (req, res) => {
  const { name, surname, idNumber, phone, password } = req.body;
  
  if (!name || !surname || !idNumber || !phone || !password) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }
  
  if (users.has(idNumber)) {
    return res.status(409).json({ success: false, message: 'User already exists' });
  }

  // Store user - in production, hash password and save to real DB
  users.set(idNumber, { name, surname, phone, password });

  return res.json({ success: true, message: 'User registered successfully' });
});

// Login route
app.post('/api/auth/login', (req, res) => {
  const { idNumber, password } = req.body;

  if (!idNumber || !password) {
    return res.status(400).json({ success: false, message: 'Missing ID Number or password' });
  }

  const user = users.get(idNumber);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid ID Number or password' });
  }

  // In production, verify hashed password
  if (user.password !== password) {
    return res.status(401).json({ success: false, message: 'Invalid ID Number or password' });
  }

  // Generate token (JWT recommended in real apps)
  const token = generateToken(idNumber);

  return res.json({ success: true, token });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
