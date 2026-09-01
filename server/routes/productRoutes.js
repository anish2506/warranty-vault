const express = require("express");

const {
  createProduct,getProducts,getProductById,updateById,deleteById,
} = require("../controllers/productController.js");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/",protect, createProduct);
router.get("/",protect, getProducts);
router.get("/:id",protect, getProductById);
router.put("/:id",protect, updateById);
router.delete("/:id",protect, deleteById);

module.exports = router;