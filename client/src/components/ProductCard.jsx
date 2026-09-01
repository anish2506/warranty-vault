import { useNavigate } from "react-router-dom";
import { getWarrantyStatus, getWarrantyProgress, formatRemainingDays } from "../utils/warranty";
import "./ProductCard.css";

const CATEGORY_ICONS = {
  Electronics: "💻",
  Appliance: "🏠",
  Phone: "📱",
  Laptop: "💻",
  TV: "📺",
  Camera: "📷",
  Kitchen: "🍳",
  Furniture: "🛋️",
  Tools: "🔧",
  Automotive: "🚗",
};

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
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

  const categoryIcon = CATEGORY_ICONS[product.category] || "📦";

  const formattedEnd = product.warrantyEnd
    ? new Date(product.warrantyEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "Not provided";

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="product-card-top">
        <div className="product-card-icon">{categoryIcon}</div>
        <span className={`status-badge ${getStatusBadgeClass()}`}>{status}</span>
      </div>

      <div className="product-card-main">
        <h2 className="product-card-name">{product.name}</h2>
        <p className="product-card-meta">
          {product.brand && <span className="product-brand">{product.brand}</span>}
          {product.category && <span className="product-category-tag">{product.category}</span>}
        </p>
      </div>

      <div className="product-card-details">
        {product.purchasePrice && (
          <div className="detail-row">
            <span className="detail-label">Price</span>
            <span className="detail-value">₹{Number(product.purchasePrice).toLocaleString("en-IN")}</span>
          </div>
        )}
        <div className="detail-row">
          <span className="detail-label">Warranty End</span>
          <span className="detail-value">{formattedEnd}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Remaining</span>
          <span className={`detail-value detail-days ${getStatusBadgeClass()}`}>
            {formatRemainingDays(daysRemaining, status)}
          </span>
        </div>
      </div>

      {status !== "Unknown" && (
        <div className="product-card-progress">
          <div className="progress-bar-bg">
            <div
              className={`progress-bar-fill ${getStatusBadgeClass()}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        className="product-card-button"
        onClick={e => { e.stopPropagation(); navigate(`/product/${product._id}`); }}
      >
        View Details →
      </button>
    </div>
  );
};

export default ProductCard;