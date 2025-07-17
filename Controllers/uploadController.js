const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    }
  });

  const upload = multer({ storage });

  const handleUpload = (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
  
    res.status(200).json({
      message: "File uploaded successfully",
      filename: req.file.filename,
      path: req.file.path
    });
  };

  module.exports = { upload, handleUpload };
