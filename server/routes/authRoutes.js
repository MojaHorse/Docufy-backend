// server/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");
const { authenticateToken } = require("../middleware/auth");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// REGISTER USER (fake email from ID)
router.post("/register", async (req, res) => {
  const { citizen_id, password, full_name } = req.body;

  // Create fake email from citizen_id
  const email = `${citizen_id}@edocufy.co.za`;

  try {
    // 1. Create Supabase user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // skip confirmation
      user_metadata: { full_name, citizen_id }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // 2. Insert profile into public.users
    const { data, error } = await supabase
      .from("users")
      .insert([{ id: userId, email, full_name, citizen_id }])
      .select();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      profile: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER PROFILE (Protected)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.id) // using Supabase user.id now
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ success: true, user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
