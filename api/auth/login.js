const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    // CORS preflight support
    res.setHeader('Access-Control-Allow-Origin', 'https://e-docufy.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', 'https://e-docufy.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  try {
    const { idNumber, password } = req.body;
    if (!idNumber || !password) {
      return res.status(400).json({ success: false, message: 'Missing ID Number or password' });
    }

    const email = `user${idNumber}@example.com`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    return res.status(200).json({
      success: true,
      access_token: data.session.access_token,
      user: data.user,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
