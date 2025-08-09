require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// CORS setup for both local and deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'https://e-docufy.vercel.app'
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { idNumber, password, phone, name, surname } = req.body;
    if (!idNumber || !password || !phone || !name || !surname) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const email = `user${idNumber}@example.com`;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      phone,
      user_metadata: { name, surname, idNumber },
      email_confirm: true
    });

    if (error) throw new Error(error.message);

    const { error: dbError } = await supabase
      .from('users')
      .insert([{ user_id: data.user.id, email, phone, name, surname, idNumber }]);

    if (dbError) throw new Error(dbError.message);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { idNumber, password } = req.body;
    if (!idNumber || !password) {
      return res.status(400).json({ success: false, message: 'Missing ID Number or password' });
    }

    const email = `user${idNumber}@example.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new Error(error.message);

    res.json({
      success: true,
      access_token: data.session.access_token,
      user: data.user
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
});

// Export for Vercel
module.exports = app;
