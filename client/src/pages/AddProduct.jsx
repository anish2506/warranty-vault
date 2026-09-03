import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/AddProduct.css";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    category: "",
    purchaseDate: "",
    purchasePrice: "",
    warrantyStart: "",
    warrantyEnd: "",
    notes: "",
  });

  const [invoiceFile, setInvoiceFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState("");
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const normalizeDate = (dateValue) => {
    if (!dateValue) return "";
    const value = String(dateValue).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    let match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (match) return `${match[3]}-${match[2]}-${match[1]}`;
    return "";
  };

  const handleOCR = async () => {
    if (!invoiceFile) {
      setOcrMessage("Please select an invoice first.");
      setOcrSuccess(false);
      return;
    }
    try {
      setOcrLoading(true);
      setOcrMessage("");
      setMissingFields([]);
      setOcrSuccess(false);

      const data = new FormData();
      data.append("document", invoiceFile);
      const response = await api.post("/ocr", data);

      const result = response.data;
      if (!result.success) throw new Error(result.message || "OCR failed");

      const fields = result.fields;
      const missing = [];
      if (!fields.name) missing.push("Product Name");
      if (!fields.brand) missing.push("Brand");
      if (!fields.model) missing.push("Model");
      if (!fields.category) missing.push("Category");
      if (!fields.purchaseDate) missing.push("Purchase Date");
      if (fields.purchasePrice === null || fields.purchasePrice === undefined || fields.purchasePrice === "") missing.push("Purchase Price");
      if (!fields.warrantyStart) missing.push("Warranty Start");
      if (!fields.warrantyEnd) missing.push("Warranty End");
      setMissingFields(missing);

      setFormData(prev => ({
        ...prev,
        name: fields.name || prev.name,
        brand: fields.brand || prev.brand,
        model: fields.model || prev.model,
        category: fields.category || prev.category,
        purchaseDate: normalizeDate(fields.purchaseDate) || prev.purchaseDate,
        purchasePrice: fields.purchasePrice ?? prev.purchasePrice,
        warrantyStart: normalizeDate(fields.warrantyStart) || prev.warrantyStart,
        warrantyEnd: normalizeDate(fields.warrantyEnd) || prev.warrantyEnd,
      }));

      setOcrSuccess(true);
      setOcrMessage(`✓ Information extracted via ${result.method || "AI"}`);
    } catch (error) {
      setOcrMessage(error.message || "Failed to extract information");
      setOcrSuccess(false);
    } finally {
      setOcrLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post("/products", formData);
      const createdProduct = response.data.product;

      if (invoiceFile && createdProduct?._id) {
        const documentData = new FormData();
        documentData.append("productId", createdProduct._id);
        documentData.append("document", invoiceFile);
        await api.post("/documents", documentData);
      }

      setMessage("✓ Product added successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setInvoiceFile(file);
      setOcrMessage("");
      setMissingFields([]);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        {/* Page Header */}
        <div className="add-product-header">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back
          </button>
          <div>
            <h1>Add Product</h1>
            <p>Track a new product's warranty and store related documents.</p>
          </div>
        </div>

        {/* AI Smart Scanner */}
        <div className="ocr-scanner-card">
          <div className="ocr-scanner-title">
            <span className="ocr-sparkle">✦</span>
            <span>AI Smart Scanner</span>
            <span className="ocr-scanner-badge">Beta</span>
          </div>
          <p className="ocr-scanner-desc">
            Upload your invoice or receipt to auto-fill fields using AI + OCR.
          </p>

          <div
            className={`ocr-dropzone ${dragOver ? "drag-over" : ""} ${invoiceFile ? "file-selected" : ""}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => document.getElementById("ocr-file-input").click()}
          >
            {invoiceFile ? (
              <div className="dropzone-file-info">
                <span className="dropzone-file-icon">📄</span>
                <span className="dropzone-filename">{invoiceFile.name}</span>
                <button
                  className="dropzone-clear"
                  onClick={e => { e.stopPropagation(); setInvoiceFile(null); setOcrMessage(""); setMissingFields([]); }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="dropzone-placeholder">
                <span className="dropzone-icon">🖼️</span>
                <span>Drop invoice image here or <strong>click to browse</strong></span>
                <span className="dropzone-hint">Supports JPG, PNG, WebP</span>
              </div>
            )}
          </div>

          <input
            id="ocr-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            style={{ display: "none" }}
            onChange={e => {
              setInvoiceFile(e.target.files[0] || null);
              setOcrMessage("");
              setMissingFields([]);
            }}
          />

          <button
            type="button"
            className={`extract-btn ${ocrLoading ? "loading" : ""}`}
            onClick={handleOCR}
            disabled={!invoiceFile || ocrLoading}
          >
            {ocrLoading ? (
              <span className="extract-btn-inner">
                <span className="btn-spinner"></span>
                Scanning invoice...
              </span>
            ) : "⚡ Extract Information"}
          </button>

          {ocrMessage && (
            <div className={`ocr-feedback ${ocrSuccess ? "ocr-success" : "ocr-error"}`}>
              {ocrMessage}
            </div>
          )}

          {missingFields.length > 0 && (
            <div className="ocr-missing">
              <p>Please fill in the missing fields manually:</p>
              <div className="missing-pills">
                {missingFields.map(f => <span key={f} className="missing-pill">{f}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="add-product-card">
          <form onSubmit={handleSubmit} className="add-product-form">
            {/* Section: Product Details */}
            <div className="form-section-title">Product Details</div>

            <div className="add-product-group">
              <label>Product Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Samsung Galaxy S24" required />
            </div>

            <div className="add-product-group">
              <label>Brand <span className="required">*</span></label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="e.g. Samsung" required />
            </div>

            <div className="add-product-group">
              <label>Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="e.g. SM-S928B" />
            </div>

            <div className="add-product-group">
              <label>Category <span className="required">*</span></label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Electronics" required />
            </div>

            {/* Section: Dates & Price */}
            <div className="form-section-title">Purchase &amp; Warranty</div>

            <div className="add-product-group">
              <label>Purchase Date <span className="required">*</span></label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
            </div>

            <div className="add-product-group">
              <label>Purchase Price (₹) <span className="required">*</span></label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} min="0" placeholder="0" required />
            </div>

            <div className="add-product-group">
              <label>Warranty Start <span className="required">*</span></label>
              <input type="date" name="warrantyStart" value={formData.warrantyStart} onChange={handleChange} required />
            </div>

            <div className="add-product-group">
              <label>Warranty End <span className="required">*</span></label>
              <input type="date" name="warrantyEnd" value={formData.warrantyEnd} onChange={handleChange} required />
            </div>

            <div className="add-product-group full-width">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any additional notes about this product..." />
            </div>

            {message && (
              <div className={`form-message ${message.startsWith("✓") ? "form-success" : "form-error"}`}>
                {message}
              </div>
            )}

            <div className="add-product-actions">
              <button type="button" className="cancel-button" onClick={() => navigate("/dashboard")}>
                Cancel
              </button>
              <button type="submit" className="submit-product-button" disabled={submitting}>
                {submitting ? (
                  <span className="extract-btn-inner"><span className="btn-spinner"></span> Adding...</span>
                ) : "Add Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;