
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react";

import "./LoginPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ onClose }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const closeModal = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  }, [onClose, navigate]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal]);

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Login failed. Please try again."
        );
        return;
      }

      if (!data.token || !data.user) {
        setMessage(
          "The server response is missing login information."
        );
        return;
      }

      if (!["CLIENT", "FREELANCER"].includes(data.user.role)) {
        setMessage("Your account role is not recognized.");
        return;
      }

      try {
        const storage = rememberMe
          ? window.localStorage
          : window.sessionStorage;

        const otherStorage = rememberMe
          ? window.sessionStorage
          : window.localStorage;

        otherStorage.removeItem("ethioLanceToken");
        otherStorage.removeItem("ethioLanceUser");

        storage.setItem("ethioLanceToken", data.token);
        storage.setItem(
          "ethioLanceUser",
          JSON.stringify(data.user)
        );
      } catch (storageError) {
        console.error(storageError);
        setMessage("Could not save your login session.");
        return;
      }

      const dashboardPath =
        data.user.role === "CLIENT"
          ? "/client-dashboard"
          : "/freelancer-dashboard";

      closeModal();
      navigate(dashboardPath, { replace: true });
    } catch (error) {
      console.error("Login request failed:", error);

      setMessage(
        "Unable to connect to the server. Check that your backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSocialLogin(provider) {
    setMessage(`${provider} sign-in is not configured yet.`);
  }

  return (
    <div
      className="login-modal-overlay"
      onClick={closeModal}
    >
      <section
        className="login-modal-window"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Background decorations */}
        <div className="login-background">
          <div className="gold-shape gold-shape-one" />
          <div className="gold-shape gold-shape-two" />
          <div className="gold-wave gold-wave-one" />
          <div className="gold-wave gold-wave-two" />
          <div className="dot-pattern dot-pattern-one" />
          <div className="dot-pattern dot-pattern-two" />
        </div>

        {/* Top controls */}
        <div className="login-top-controls">
          <button
            type="button"
            className="login-modal-close"
            onClick={closeModal}
            aria-label="Close login"
          >
            <X size={23} />
          </button>
        </div>

        {/* Main layout */}
        <div className="login-layout">

          {/* LEFT BRANDING */}
          <section className="login-brand-section">
            <Link to="/" onClick={closeModal}>
              <img
                src="/ethiolance-emblem.png"
                alt="EthioLance emblem"
                className="login-logo"
              />
            </Link>

            <h1 className="login-brand-name">
              Ethio<span>Lance</span>
            </h1>

            <div className="brand-slogan">
              <span className="slogan-line" />

              <p>
                Work <span>•</span> Hire <span>•</span> Grow
              </p>

              <span className="slogan-line" />
            </div>

            <p className="brand-description">
              Empowering Ethiopia’s Talent
            </p>
          </section>

          {/* RIGHT LOGIN CARD */}
          <section className="login-form-section">
            <div className="login-card">

              <div className="login-card-heading">
                <h2 id="login-title">
                  Welcome Back <span></span>
                </h2>

                <p>Sign in to continue your journey</p>
              </div>

              <form
                className="login-form"
                onSubmit={handleSubmit}
              >
                {/* Email */}
                <div className="login-input-group">
                  <Mail size={24} />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Password */}
                <div className="login-input-group">
                  <LockKeyhole size={24} />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff size={23} />
                    ) : (
                      <Eye size={23} />
                    )}
                  </button>
                </div>

                {/* Remember me */}
                <div className="login-options">
                  <label className="remember-me">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) =>
                        setRememberMe(event.target.checked)
                      }
                      disabled={isLoading}
                    />

                    <span className="custom-checkbox">
                      {rememberMe && <Check size={17} />}
                    </span>

                    <span>Remember me</span>
                  </label>

                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() =>
                      setMessage(
                        "Password recovery will be implemented next."
                      )
                    }
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="login-submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In"}

                  {!isLoading && <ArrowRight size={24} />}
                </button>

                {/* Message */}
                {message && (
                  <p
                    className="login-message"
                    role="status"
                    aria-live="polite"
                  >
                    {message}
                  </p>
                )}

                {/* Divider */}
                <div className="login-divider">
                  <span />
                  <p>or continue with</p>
                  <span />
                </div>

                {/* Social login */}
                <div className="social-login">
                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Google")}
                    aria-label="Continue with Google"
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 48 48" aria-hidden="true">
                      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15z" />
                      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44z" />
                      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.5v-5.3H5.8a20 20 0 0 0 0 18.1z" />
                      <path fill="#EA4335" d="M24 12.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.8 29.5 5 24 5A20 20 0 0 0 5.8 14.9l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("GitHub")}
                    aria-label="Continue with GitHub"
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 .9a11.1 11.1 0 0 0-3.5 21.6c.6.1.8-.3.8-.6v-2.1c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.6-1.3-1.6-1.1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.3.8 1 .8 2v3c0 .3.2.7.8.6A11.1 11.1 0 0 0 12 .9z" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialLogin("Microsoft")}
                    aria-label="Continue with Microsoft"
                    disabled={isLoading}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#F25022" d="M1 1h10v10H1z" />
                      <path fill="#7FBA00" d="M13 1h10v10H13z" />
                      <path fill="#00A4EF" d="M1 13h10v10H1z" />
                      <path fill="#FFB900" d="M13 13h10v10H13z" />
                    </svg>
                  </button>
                </div>
              </form>

              <p className="login-register">
                Don’t have an account?{" "}
                <Link to="/register" onClick={closeModal}>
                  Create one
                </Link>
              </p>

            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default Login;
