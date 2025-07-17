const express = require("express");
const router = express.Router();
const { upload, handleUpload } = require("../Controllers/uploadController");

router.post("/", upload.single("file"), handleUpload);

module.exports = router;
