const express = require("express");
const router = express.Router();
const { upload, handleUpload } = require("../Controllers/uploadController");
const { authenticateToken } = require("../middleware/auth");

// Protect the upload route with authentication
router.post("/", authenticateToken, upload.single("file"), handleUpload);

module.exports = router;
