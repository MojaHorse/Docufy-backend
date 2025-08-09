const multer = require("multer");
const path = require("path");
const { spawn } = require("child_process");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
  const userId = req.user ? req.user.id : "anonymous"; // changed from userId to id
  cb(null, `${userId}-${Date.now()}-${file.originalname}`);
}
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: "No file uploaded" 
    });
  }

  const filePath = path.resolve(req.file.path);
  const python = spawn("python3", ["scripts/preprocess.py", filePath]);

  let result = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    console.error("stderr:", data.toString());
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ 
        success: false,
        message: "Error during image processing" 
      });
    }

    try {
      const output = JSON.parse(result);
      res.status(200).json({
        success: true,
        message: "File uploaded and processed successfully",
        data: {
          originalFile: req.file.filename,
          originalPath: req.file.path,
          processedImage: output.processed_image,
          extractedText: output.text,
          uploadedBy: req.user.username // Include user info
        }
      });
    } catch (err) {
      console.error("Failed to parse Python output:", err);
      res.status(500).json({ 
        success: false,
        message: "Error parsing OCR results" 
      });
    }
  });
};

module.exports = { upload, handleUpload };