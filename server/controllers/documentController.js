const Document = require("../models/Document");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const uploadDocument = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Product.findOne({
      _id: productId,
      user: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "warrantyvault/documents",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(req.file.buffer);
    });

    const document = await Document.create({
      user: req.user.id,
      product: productId,
      fileName: req.file.originalname,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType: req.file.mimetype,
      resourceType: uploadResult.resource_type,
      fileSize: req.file.size,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Upload document error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductDocuments = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({
      _id: productId,
      user: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const documents = await Document.find({
      product: productId,
      user: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Find document belonging to logged-in user
    const document = await Document.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    // Delete file from Cloudinary
    await cloudinary.uploader.destroy(document.publicId, {
      resource_type: document.resourceType || "image",
    });

    // Delete document record from MongoDB
    await Document.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadDocument,
  getProductDocuments,
  deleteDocument,
};