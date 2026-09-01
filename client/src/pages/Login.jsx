import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccessMessage("Welcome back! Redirecting...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-mesh"></div>
      
      <div className="auth-card animate-fade-in">
        <div className="auth-brand">
          <div className="brand-icon-wrapper">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="brand-svg">
              <path d="M12 2L4 6V12C4 17.52 7.42 22.61 12 24C16.58 22.61 20 17.52 20 12V6L12 2Z" fill="url(#brand-grad)" />
              <path d="M12 6L6 9V13.5C6 17.09 8.56 20.4 12 21.36C15.44 20.4 18 17.09 18 13.5V9L12 6Z" fill="#ffffff" fillOpacity="0.2" />
              <path d="M10 12L12 14L15 10" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="brand-grad" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="1" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>WarrantyVault</h1>
          <p className="auth-subtitle">Sign in to your smart warranty dashboard</p>
        </div>

        {errorMessage && (
          <div className="auth-alert error-alert">
            <span className="alert-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert success-alert">
            <span className="alert-icon">✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <div className="field-label-row">
              <label htmlFor="password">Password</label>
            </div>
            <div className="input-wrapper">
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="btn-spinner-content">
                <span className="btn-spinner"></span>
                Signing in...
              </span>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;