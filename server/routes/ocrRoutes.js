const express = require("express");
const multer = require("multer");

const { extractText } = require("../controllers/ocrController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
  dest: "uploads/ocr/",
});

router.post("/", authMiddleware, upload.single("document"), extractText);

module.exports = router;