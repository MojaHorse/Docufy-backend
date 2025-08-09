require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role key — backend only!
const supabase = createClient(supabaseUrl, supabaseKey);

// Allowed origins for CORS
const allowedOrigins = [
  'http://localhost:5173', // local dev
  'https://your-frontend-domain.vercel.app' // deployed frontend domain
];

// Middleware
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

// -------------------- SIGNUP --------------------
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { idNumber, password, phone, name, surname } = req.body;

    if (!idNumber || !password || !phone || !name || !surname) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Create fake email for Supabase
    const email = `user${idNumber}@example.com`;

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      phone,
      user_metadata: { name, surname, idNumber },
      email_confirm: true
    });

    if (error) throw new Error(error.message);

    // Insert into 'users' table
    const { error: dbError } = await supabase
      .from('users')
      .insert([{ user_id: data.user.id, email, phone, name, surname, idNumber }]);

    if (dbError) throw new Error(dbError.message);

    res.json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// -------------------- LOGIN --------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { idNumber, password } = req.body;

    if (!idNumber || !password) {
      return res.status(400).json({ success: false, message: 'Missing ID Number or password' });
    }

    const email = `user${idNumber}@example.com`;

    // Sign in user
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

// -------------------- START SERVER --------------------
if (process.env.VERCEL) {
  // On Vercel, export the app (no app.listen)
  module.exports = app;
} else {
  // Local/Standalone backend
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
