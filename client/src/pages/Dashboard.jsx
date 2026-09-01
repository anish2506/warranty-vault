import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Dashboard.css";
import ProductCard from "../components/ProductCard";
import { getWarrantyStatus, parseLocalDate, formatRemainingDays } from "../utils/warranty";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        setProducts(response.data.products || []);
      } catch (error) {
        console.error(error);
        setError(error.response?.data?.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your vault...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <p className="dashboard-error">{error}</p>
      </div>
    );
  }

  const totalProducts = products.length;
  const activeProducts = products.filter(p => getWarrantyStatus(p).status === "Active").length;
  const expiringSoonProducts = products.filter(p => getWarrantyStatus(p).status === "Expiring Soon").length;
  const expiredProducts = products.filter(p => getWarrantyStatus(p).status === "Expired").length;

  const validActiveList = products.filter(p => {
    const s = getWarrantyStatus(p).status;
    return s === "Active" || s === "Expiring Soon";
  });

  const nextExpiringProduct = validActiveList.length > 0
    ? [...validActiveList].sort((a, b) => {
        return (parseLocalDate(a.warrantyEnd)?.getTime() || 0) - (parseLocalDate(b.warrantyEnd)?.getTime() || 0);
      })[0]
    : null;

  const longestCoverageProduct = validActiveList.length > 0
    ? [...validActiveList].sort((a, b) => {
        return (parseLocalDate(b.warrantyEnd)?.getTime() || 0) - (parseLocalDate(a.warrantyEnd)?.getTime() || 0);
      })[0]
    : null;

  const statusFilters = ["All", "Active", "Expiring Soon", "Expired", "Not Started"];

  const filteredProducts = products.filter(p => {
    const { status } = getWarrantyStatus(p);
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "All" || status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <div className="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
              <path d="M12 2L4 6V12C4 17.52 7.42 22.61 12 24C16.58 22.61 20 17.52 20 12V6L12 2Z" fill="url(#dash-grad)"/>
              <path d="M10 12L12 14L15 10" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="dash-grad" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#818cf8"/>
                  <stop offset="1" stopColor="#4f46e5"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">WarrantyVault</span>
        </div>

        <div className="dashboard-header-right">
          <div className="user-badge">
            <div className="user-avatar">{userInitial}</div>
            <span className="user-name">{user.name || "My Account"}</span>
          </div>
          <button className="logout-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="dashboard-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <Link to="/dashboard" className="sidebar-link active">
              <span className="sidebar-link-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                </svg>
              </span>
              Dashboard
            </Link>
            <Link to="/add-product" className="sidebar-link">
              <span className="sidebar-link-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
              </span>
              Add Product
            </Link>
            <span className="sidebar-link disabled">
              <span className="sidebar-link-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
                </svg>
              </span>
              Documents
              <span className="sidebar-badge">Soon</span>
            </span>
          </nav>

          {/* Sidebar stats mini card */}
          <div className="sidebar-summary">
            <div className="sidebar-summary-row">
              <span className="dot dot-active"></span>
              <span>{activeProducts} Active</span>
            </div>
            <div className="sidebar-summary-row">
              <span className="dot dot-expiring"></span>
              <span>{expiringSoonProducts} Expiring</span>
            </div>
            <div className="sidebar-summary-row">
              <span className="dot dot-expired"></span>
              <span>{expiredProducts} Expired</span>
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="dashboard-content">
          {/* Title + Add button */}
          <div className="dashboard-title">
            <div>
              <h1>My Vault</h1>
              <p className="dashboard-subtitle">Overview of your warranties &amp; coverage health</p>
            </div>
            <button className="add-product-button" onClick={() => navigate("/add-product")}>
              <span>+</span> Add Product
            </button>
          </div>

          {/* Stat Cards */}
          <div className="stats-container">
            <div className="stat-card stat-total">
              <div className="stat-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
                </svg>
              </div>
              <div className="stat-card-body">
                <div className="stat-card-value">{totalProducts}</div>
                <div className="stat-card-title">Total Products</div>
              </div>
            </div>

            <div className="stat-card stat-active-card">
              <div className="stat-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="stat-card-body">
                <div className="stat-card-value stat-active">{activeProducts}</div>
                <div className="stat-card-title">Active</div>
              </div>
            </div>

            <div className="stat-card stat-expiring-card">
              <div className="stat-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="stat-card-body">
                <div className="stat-card-value stat-expiring">{expiringSoonProducts}</div>
                <div className="stat-card-title">Expiring Soon</div>
              </div>
            </div>

            <div className="stat-card stat-expired-card">
              <div className="stat-card-icon">
                <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="stat-card-body">
                <div className="stat-card-value stat-expired">{expiredProducts}</div>
                <div className="stat-card-title">Expired</div>
              </div>
            </div>
          </div>

          {/* Insights */}
          {validActiveList.length > 0 && (
            <div className="insights-container">
              {nextExpiringProduct && (
                <div className="insight-card insight-warning">
                  <div className="insight-icon-wrap">⏳</div>
                  <div className="insight-body">
                    <span className="insight-label">Nearest Expiration</span>
                    <p className="insight-value">
                      <strong>{nextExpiringProduct.name}</strong>
                      <span className="insight-days">
                        {formatRemainingDays(
                          getWarrantyStatus(nextExpiringProduct).daysRemaining,
                          getWarrantyStatus(nextExpiringProduct).status
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {longestCoverageProduct && longestCoverageProduct._id !== nextExpiringProduct?._id && (
                <div className="insight-card insight-success">
                  <div className="insight-icon-wrap">🛡️</div>
                  <div className="insight-body">
                    <span className="insight-label">Longest Remaining Coverage</span>
                    <p className="insight-value">
                      <strong>{longestCoverageProduct.name}</strong>
                      <span className="insight-days">
                        {formatRemainingDays(
                          getWarrantyStatus(longestCoverageProduct).daysRemaining,
                          getWarrantyStatus(longestCoverageProduct).status
                        )}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Search & Filter */}
          <div className="products-controls">
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search by name, brand, or category..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="filter-tabs">
              {statusFilters.map(f => (
                <button
                  key={f}
                  className={`filter-tab ${filterStatus === f ? "active" : ""}`}
                  onClick={() => setFilterStatus(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          <div className="products-header">
            <h2>My Products</h2>
            <span className="products-count">
              {filteredProducts.length} of {totalProducts}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="empty-products">
              <div className="empty-icon">📦</div>
              <h3>{products.length === 0 ? "No products yet" : "No products match your filter"}</h3>
              <p>
                {products.length === 0
                  ? "Add your first product to start tracking its warranty."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {products.length === 0 && (
                <button className="add-product-button" onClick={() => navigate("/add-product")}>
                  + Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;