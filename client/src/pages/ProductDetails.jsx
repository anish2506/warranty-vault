import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/ProductDetails.css";
import {
  getWarrantyStatus,
  getWarrantyProgress,
  formatRemainingDays,
} from "../utils/warranty";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [documentError, setDocumentError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`);
        setProduct(response.data.product || response.data);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`/documents/product/${id}`);
        setDocuments(response.data.documents || []);
      } catch (error) {
        setDocumentError(error.response?.data?.message || "Failed to load documents");
      }
    };
    fetchDocuments();
  }, [id]);

  if (loading) {
    return (
      <div className="pd-loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pd-loading">
        <p className="pd-error">{error || "Product not found."}</p>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
      </div>
    );
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      navigate("/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete product");
    }
  };

  const handleFileChange = (e) => {
    setDocumentError("");
    setSelectedFile(e.target.files[0] || null);
  };

  const handleUploadDocument = async () => {
    if (!selectedFile) { setDocumentError("Please select a file first."); return; }
    try {
      setUploading(true);
      setDocumentError("");
      const formData = new FormData();
      formData.append("productId", id);
      formData.append("document", selectedFile);
      const response = await api.post("/documents", formData);
      setDocuments(prev => [response.data.document, ...prev]);
      setSelectedFile(null);
      const input = document.getElementById("document-file-input");
      if (input) input.value = "";
    } catch (error) {
      setDocumentError(error.response?.data?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await api.delete(`/documents/${documentId}`);
      setDocuments(prev => prev.filter(d => d._id !== documentId));
    } catch (error) {
      setDocumentError(error.response?.data?.message || "Failed to delete document");
    }
  };

  const { status, daysRemaining } = getWarrantyStatus(product);
  const progress = getWarrantyProgress(product);

  const getStatusBadgeClass = () => {
    switch (status) {
      case "Active": return "badge-active";
      case "Expiring Soon": return "badge-expiring";
      case "Expired": return "badge-expired";
      case "Not Started": return "badge-not-started";
      default: return "badge-unknown";
    }
  };

  const fmt = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      : "Not provided";

  const getFileTypeLabel = (fileType = "") => {
    if (fileType.includes("pdf")) return { label: "PDF", cls: "ft-pdf" };
    if (fileType.includes("image") || fileType.includes("png") || fileType.includes("jpg") || fileType.includes("jpeg")) return { label: "IMG", cls: "ft-img" };
    return { label: "FILE", cls: "ft-file" };
  };

  return (
    <div className="pd-page">
      <div className="pd-container">
        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>

        {/* Hero header */}
        <div className="pd-hero">
          <div className="pd-hero-left">
            <div className="pd-hero-icon">📦</div>
            <div className="pd-hero-text">
              <h1>{product.name}</h1>
              <p className="pd-hero-sub">
                {product.brand && <span>{product.brand}</span>}
                {product.category && <span className="pd-category-tag">{product.category}</span>}
                {product.model && <span className="pd-model">· {product.model}</span>}
              </p>
            </div>
          </div>
          <div className="pd-hero-right">
            <span className={`status-badge ${getStatusBadgeClass()}`}>{status}</span>
            <button className="pd-edit-btn" onClick={() => navigate(`/product/${id}/edit`)}>
              ✏️ Edit
            </button>
            <button className="pd-delete-btn" onClick={handleDelete}>
              🗑️ Delete
            </button>
          </div>
        </div>

        <div className="pd-grid">
          {/* Left column */}
          <div className="pd-left">
            {/* Warranty Intelligence */}
            <div className="pd-card warranty-card">
              <div className="warranty-card-header">
                <h2>🛡️ Warranty Intelligence</h2>
              </div>

              <div className="warranty-countdown">
                <span className={`warranty-countdown-value ${getStatusBadgeClass()}`}>
                  {formatRemainingDays(daysRemaining, status)}
                </span>
                <span className="warranty-countdown-label">until warranty expires</span>
              </div>

              {status !== "Unknown" && (
                <div className="warranty-progress-block">
                  <div className="warranty-progress-header">
                    <span>Warranty Period Used</span>
                    <span className="warranty-progress-pct">{progress}%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${getStatusBadgeClass()}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="warranty-dates-grid">
                <div className="warranty-date-item">
                  <span className="wdi-label">Start Date</span>
                  <span className="wdi-value">{fmt(product.warrantyStart)}</span>
                </div>
                <div className="warranty-date-item">
                  <span className="wdi-label">End Date</span>
                  <span className={`wdi-value ${status === "Expired" ? "expired-date" : ""}`}>{fmt(product.warrantyEnd)}</span>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="pd-card">
              <h2>Product Information</h2>
              <div className="pd-info-grid">
                <div className="pd-info-item">
                  <span className="pd-info-label">Brand</span>
                  <span className="pd-info-value">{product.brand || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Model</span>
                  <span className="pd-info-value">{product.model || "Not provided"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Category</span>
                  <span className="pd-info-value">{product.category || "—"}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Purchase Price</span>
                  <span className="pd-info-value price-value">₹{Number(product.purchasePrice || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="pd-info-item">
                  <span className="pd-info-label">Purchase Date</span>
                  <span className="pd-info-value">{fmt(product.purchaseDate)}</span>
                </div>
              </div>
              {product.notes && (
                <div className="pd-notes">
                  <span className="pd-info-label">Notes</span>
                  <p>{product.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column — Documents Vault */}
          <div className="pd-right">
            <div className="pd-card vault-card">
              <div className="vault-header">
                <div>
                  <h2>📁 Document Vault</h2>
                  <p>Invoices, receipts & warranty cards</p>
                </div>
                <span className="vault-count">{documents.length}</span>
              </div>

              {/* Upload zone */}
              <div className="upload-zone">
                <input
                  id="document-file-input"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="document-file-input" className="upload-zone-label">
                  {selectedFile ? (
                    <span className="upload-selected">📄 {selectedFile.name}</span>
                  ) : (
                    <span className="upload-placeholder">
                      <span>☁️</span>
                      <strong>Click to select</strong> a file to upload
                    </span>
                  )}
                </label>
                <button
                  className="upload-btn"
                  onClick={handleUploadDocument}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? (
                    <span className="extract-btn-inner"><span className="btn-spinner-dark"></span> Uploading...</span>
                  ) : "Upload"}
                </button>
              </div>

              {documentError && (
                <div className="doc-error">{documentError}</div>
              )}

              {/* Document list */}
              <div className="vault-list">
                {documents.length === 0 ? (
                  <div className="vault-empty">
                    <span>🗂️</span>
                    <p>No documents yet. Upload your invoice or warranty card.</p>
                  </div>
                ) : (
                  documents.map(doc => {
                    const ft = getFileTypeLabel(doc.fileType);
                    return (
                      <div className="vault-item" key={doc._id}>
                        <div className="vault-item-left">
                          <span className={`file-type-badge ${ft.cls}`}>{ft.label}</span>
                          <div className="vault-item-info">
                            <p className="vault-item-name">{doc.fileName}</p>
                            <p className="vault-item-type">{doc.fileType}</p>
                          </div>
                        </div>
                        <div className="vault-item-actions">
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="vault-view-btn"
                          >
                            View ↗
                          </a>
                          <button
                            className="vault-delete-btn"
                            onClick={() => handleDeleteDocument(doc._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;