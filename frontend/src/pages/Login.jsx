import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

import "./LoginPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ onClose }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close the login popup or return to the homepage.
  const closeModal = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  }, [onClose, navigate]);

  // Close the popup when Escape is pressed.
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

  // Connect to the existing EthioLance login API.
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

      // Handle incorrect credentials and API errors.
      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Login failed. Please try again."
        );
        return;
      }

      // Confirm that authentication information exists.
      if (!data.token || !data.user) {
        setMessage(
          "The server response is missing the login information."
        );
        return;
      }

      // Check the account role before redirecting.
      if (
        !["CLIENT", "FREELANCER"].includes(data.user.role)
      ) {
        setMessage(
          "Your account role is not recognized. Please contact support."
        );
        return;
      }

      // Save the user's authentication session.
      try {
        const storage = rememberMe
          ? window.localStorage
          : window.sessionStorage;

        const otherStorage = rememberMe
          ? window.sessionStorage
          : window.localStorage;

        // Remove any old session from the other storage.
        otherStorage.removeItem("ethioLanceToken");
        otherStorage.removeItem("ethioLanceUser");

        // Save the new token and user information.
        storage.setItem("ethioLanceToken", data.token);

        storage.setItem(
          "ethioLanceUser",
          JSON.stringify(data.user)
        );
      } catch (storageError) {
        console.error(
          "Could not save the login session:",
          storageError
        );

        setMessage(
          "Login succeeded, but the browser could not save your session. Check your browser storage settings."
        );
        return;
      }

      // Redirect users to their role-specific dashboards.
      const dashboardPath =
        data.user.role === "CLIENT"
          ? "/client-dashboard"
          : "/freelancer-dashboard";

      navigate(dashboardPath, { replace: true });
    } catch (error) {
      console.error("Login request failed:", error);

      setMessage(
        "Unable to connect to the server. Check that your backend is running and the API URL is correct."
      );
    } finally {
      setIsLoading(false);
    }
  }

  // Google authentication is not configured yet.
  function handleGoogleLogin() {
    setMessage(
      "Google sign-in is not configured yet. We'll connect it next."
    );
  }

  // Password recovery is not configured yet.
  function handleForgotPassword() {
    setMessage(
      "Password recovery using email verification will be implemented next."
    );
  }

  return (
    <div
      className="login-modal-overlay"
      onClick={closeModal}
    >
      <section
        className="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          className="login-modal-close"
          onClick={closeModal}
          aria-label="Close login"
        >
          <X size={22} />
        </button>

        {/* Login form panel */}
        <div className="login-modal-form-panel">
          <Link
            to="/"
            className="login-brand"
            onClick={closeModal}
          >
            <span className="brand-mark">e</span>

            <span>
              ethio<span className="brand-accent">lance</span>
            </span>
          </Link>

          <div className="login-heading">
            <h2 id="login-title">Welcome back!</h2>
            <p>Please log in to your account.</p>
          </div>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            {/* Email address */}
            <label htmlFor="login-identity">
              Email address
            </label>

            <div className="login-input-wrapper">
              <UserRound size={19} />

              <input
                id="login-identity"
                type="email"
                placeholder="Enter your email address"
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
            <label htmlFor="login-password">
              Password
            </label>

            <div className="login-input-wrapper">
              <LockKeyhole size={19} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
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
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={19} />
                ) : (
                  <Eye size={19} />
                )}
              </button>
            </div>

            {/* Remember me and forgotten password */}
            <div className="login-form-options">
              <label className="remember-option">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) =>
                    setRememberMe(event.target.checked)
                  }
                  disabled={isLoading}
                />

                <span>Remember me</span>
              </label>

              <button
                type="button"
                className="login-forgot-link"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Forgot Password?
              </button>
            </div>

            {/* Regular login */}
            <button
              type="submit"
              className="button button-primary login-submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}

              {!isLoading && <ArrowRight size={18} />}
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span>or</span>
            </div>

            {/* Continue with Google */}
            <button
              type="button"
              className="google-login-button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15z"
                />

                <path
                  fill="#34A853"
                  d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44z"
                />

                <path
                  fill="#FBBC05"
                  d="M12.6 27.7a12 12 0 0 1 0-7.5v-5.3H5.8a20 20 0 0 0 0 18.1z"
                />

                <path
                  fill="#EA4335"
                  d="M24 12.8c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6.8 29.5 5 24 5A20 20 0 0 0 5.8 14.9l6.8 5.3c1.6-4.8 6.1-8.4 11.4-8.4z"
                />
              </svg>

              <span>Continue with Google</span>
            </button>

            {/* Feedback messages */}
            {message && (
              <p
                className="login-message"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </form>

          {/* Registration link */}
          <p className="login-signup">
            Don't have an account?{" "}
            <Link
              to="/register"
              onClick={closeModal}
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* EthioLance branding panel */}
        <aside className="login-modal-brand-panel">
          <div className="login-brand-illustration">
            <span className="brand-mark">e</span>

            <span>
              ethio<span className="brand-accent">lance</span>
            </span>
          </div>

          <h3>
            Empowering Ethiopian professionals and businesses.
          </h3>

          <p>
            Connect your skills with opportunity and achieve
            more together.
          </p>

          <div className="login-decoration">
            <div className="login-decoration-circle circle-one" />
            <div className="login-decoration-circle circle-two" />
            <div className="login-decoration-circle circle-three" />

            <div className="login-decoration-icon">
              <UserRound size={38} />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

export default Login;