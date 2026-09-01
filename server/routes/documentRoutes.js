const express = require("express");

const router = express.Router();

const {
  uploadDocument,
  getProductDocuments,
  deleteDocument,
} = require("../controllers/documentController");

const authMiddleware = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");


// Upload document
router.post(
  "/",
  authMiddleware,
  upload.single("document"),
  uploadDocument
);


// Get documents for product
router.get(
  "/product/:productId",
  authMiddleware,
  getProductDocuments
);


// Delete document
router.delete(
  "/:id",
  authMiddleware,
  deleteDocument
);


module.exports = router;