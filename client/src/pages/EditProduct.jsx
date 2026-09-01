import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import "../styles/EditProduct.css";

const EditProduct = () => {
  const { id } = useParams();
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" | "error"

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        const product = response.data.product || response.data;
        setFormData({
          name: product.name || "",
          brand: product.brand || "",
          model: product.model || "",
          category: product.category || "",
          purchaseDate: product.purchaseDate ? product.purchaseDate.substring(0, 10) : "",
          purchasePrice: product.purchasePrice || "",
          warrantyStart: product.warrantyStart ? product.warrantyStart.substring(0, 10) : "",
          warrantyEnd: product.warrantyEnd ? product.warrantyEnd.substring(0, 10) : "",
          notes: product.notes || "",
        });
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load product");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      await api.put(`/products/${id}`, formData);
      setMessage("✓ Product updated successfully! Redirecting...");
      setMessageType("success");
      setTimeout(() => navigate(`/product/${id}`), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update product");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="edit-product-page">
      <div className="edit-product-container">
        {/* Header */}
        <div className="edit-product-header">
          <button className="back-btn" onClick={() => navigate(`/product/${id}`)}>
            ← Back
          </button>
          <div>
            <h1>Edit Product</h1>
            <p>Update product details and warranty information.</p>
          </div>
        </div>

        {/* Form card */}
        <div className="edit-product-card">
          <form onSubmit={handleSubmit} className="edit-product-form">

            <div className="form-section-title">Product Details</div>

            <div className="edit-product-group">
              <label>Product Name <span className="required">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="edit-product-group">
              <label>Brand <span className="required">*</span></label>
              <input type="text" name="brand" value={formData.brand} onChange={handleChange} required />
            </div>

            <div className="edit-product-group">
              <label>Model</label>
              <input type="text" name="model" value={formData.model} onChange={handleChange} />
            </div>

            <div className="edit-product-group">
              <label>Category <span className="required">*</span></label>
              <input type="text" name="category" value={formData.category} onChange={handleChange} required />
            </div>

            <div className="form-section-title">Purchase &amp; Warranty</div>

            <div className="edit-product-group">
              <label>Purchase Date <span className="required">*</span></label>
              <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
            </div>

            <div className="edit-product-group">
              <label>Purchase Price (₹) <span className="required">*</span></label>
              <input type="number" name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} min="0" required />
            </div>

            <div className="edit-product-group">
              <label>Warranty Start <span className="required">*</span></label>
              <input type="date" name="warrantyStart" value={formData.warrantyStart} onChange={handleChange} required />
            </div>

            <div className="edit-product-group">
              <label>Warranty End <span className="required">*</span></label>
              <input type="date" name="warrantyEnd" value={formData.warrantyEnd} onChange={handleChange} required />
            </div>

            <div className="edit-product-group full-width">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} />
            </div>

            {message && (
              <div className={`edit-form-message ${messageType === "success" ? "msg-success" : "msg-error"}`}>
                {message}
              </div>
            )}

            <div className="edit-product-actions">
              <button type="button" className="edit-cancel-button" onClick={() => navigate(`/product/${id}`)}>
                Cancel
              </button>
              <button type="submit" className="edit-save-button" disabled={submitting}>
                {submitting ? (
                  <span className="save-spinner-content">
                    <span className="btn-spinner"></span>
                    Saving...
                  </span>
                ) : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;