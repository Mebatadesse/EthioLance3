
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowLeft,
  UserRound,
  LockKeyhole,
  Eye,
  EyeOff,
  X,
  Sun,
  Moon,
  ShieldCheck,
  Check,
} from "lucide-react";

import "./LoginPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login({ onClose, onRegisterClick }) {
  const navigate = useNavigate();

  // ================================
  // STATE
  // ================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [requiresOtp, setRequiresOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const otpRefs = useRef([]);

  // ================================
  // CLOSE MODAL
  // ================================

  const closeModal = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [closeModal]);

  // ================================
  // SAVE USER AND REDIRECT
  // ================================

  const saveUserAndRedirect = (data) => {
    const token = data.token;
    const user = data.user;

    if (!token || !user) {
      throw new Error("Invalid login response from server.");
    }

    if (rememberMe) {
      localStorage.setItem("ethioLanceToken", token);
      localStorage.setItem("ethioLanceUser", JSON.stringify(user));

      sessionStorage.removeItem("ethioLanceToken");
      sessionStorage.removeItem("ethioLanceUser");
    } else {
      sessionStorage.setItem("ethioLanceToken", token);
      sessionStorage.setItem("ethioLanceUser", JSON.stringify(user));

      localStorage.removeItem("ethioLanceToken");
      localStorage.removeItem("ethioLanceUser");
    }

    const role = user.role;

    closeModal();

    if (role === "CLIENT") {
      navigate("/client-dashboard", { replace: true });
    } else if (role === "FREELANCER") {
      navigate("/freelancer-dashboard", { replace: true });
    } else {
      throw new Error("Your account has an unsupported role.");
    }
  };

  // ================================
  // LOGIN SUBMIT
  // ================================

  const handleSubmit = async (event) => {
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
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Please try again."
        );
      }

      // Backend requires OTP verification
      if (data.requiresOtp) {
        setRequiresOtp(true);
        setOtp("");
        setMessage("");

        setTimeout(() => {
          otpRefs.current[0]?.focus();
        }, 100);

        return;
      }

      // Login without OTP
      saveUserAndRedirect(data);

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setMessage(
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // OTP INPUT HANDLING
  // ================================

  const handleOtpChange = (value, index) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const digits = otp.split("");

    digits[index] = digit;

    const updatedOtp = Array.from(
      { length: 6 },
      (_, i) => digits[i] || ""
    ).join("");

    setOtp(updatedOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (event, index) => {
    if (
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(pasted);

    const focusIndex = Math.min(pasted.length, 5);

    otpRefs.current[focusIndex]?.focus();
  };

  // ================================
  // OTP VERIFICATION
  // ================================

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setMessage("Please enter all 6 verification digits.");
      return;
    }

    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Invalid verification code."
        );
      }

      saveUserAndRedirect(data);

    } catch (error) {
      console.error("OTP VERIFICATION ERROR:", error);

      setMessage(
        error.message || "OTP verification failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ================================
  // BACK TO LOGIN
  // ================================

  const handleBackToLogin = () => {
    setRequiresOtp(false);
    setOtp("");
    setMessage("");
  };

  // ================================
  // OTHER ACTIONS
  // ================================

  const handleForgotPassword = () => {
    // Connect this to your forgot-password flow when available.
    alert("Forgot password functionality will be available soon.");
  };

  const handleGoogleLogin = () => {
    // Google authentication is not connected yet.
    alert("Google login will be available soon.");
  };

  // ================================
  // UI
  // ================================

  return (
    <div
      className="login-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          closeModal();
        }
      }}
    >
      <div
        className={`login-modal-window ${
          darkMode ? "dark-mode" : ""
        }`}
      >

        {/* BACKGROUND DECORATIONS */}

        <div className="login-background">
          <div className="gold-shape gold-shape-one" />
          <div className="gold-shape gold-shape-two" />

          <div className="gold-wave gold-wave-one" />
          <div className="gold-wave gold-wave-two" />

          <div className="dot-pattern dot-pattern-one" />
          <div className="dot-pattern dot-pattern-two" />
        </div>

        {/* TOP CONTROLS */}

        <div className="login-top-controls">

          <div className="theme-toggle">
            <button
              type="button"
              className={!darkMode ? "active" : ""}
              onClick={() => setDarkMode(false)}
              aria-label="Light mode"
            >
              <Sun />
            </button>

            <button
              type="button"
              className={darkMode ? "active" : ""}
              onClick={() => setDarkMode(true)}
              aria-label="Dark mode"
            >
              <Moon />
            </button>
          </div>

          <button
            type="button"
            className="login-modal-close"
            onClick={closeModal}
            aria-label="Close login"
          >
            <X size={19} />
          </button>

        </div>

        {/* MAIN LAYOUT */}

        <div className="login-layout">

          {/* BRANDING SECTION */}

          <div className="login-brand-section">

            <img
              src="/ethiolance-emblem.png"
              alt="EthioLance Logo"
              className="login-logo"
            />

            <h1 className="login-brand-name">
              Ethio<span>Lance</span>
            </h1>

            <div className="brand-slogan">
              <div className="slogan-line" />

              <p>
                CONNECT <span>•</span> CREATE <span>•</span> GROW
              </p>

              <div className="slogan-line" />
            </div>

            <p className="brand-description">
              Your talent. Your opportunity. Your future.
            </p>

          </div>

          {/* LOGIN FORM SECTION */}

          <div className="login-form-section">

            <div className="login-card">

              {/* ==========================
                  OTP VERIFICATION
              ========================== */}

              {requiresOtp ? (

                <>
                  <div className="login-card-heading">
                    <h2>Email Verification</h2>

                    <p>
                      Complete the verification to access your account.
                    </p>
                  </div>

                  <form
                    className="login-form"
                    onSubmit={handleOtpSubmit}
                  >

                    <div className="otp-section">

                      <div className="otp-icon">
                        <ShieldCheck size={32} />
                      </div>

                      <div className="otp-heading">
                        <h3>Verify your identity</h3>

                        <p>
                          We've sent a 6-digit verification code to
                        </p>

                        <strong>{email}</strong>
                      </div>

                      <div className="otp-inputs">

                        {Array.from({ length: 6 }).map((_, index) => (
                          <input
                            key={index}
                            ref={(element) => {
                              otpRefs.current[index] = element;
                            }}
                            type="text"
                            inputMode="numeric"
                            autoComplete={
                              index === 0
                                ? "one-time-code"
                                : "off"
                            }
                            maxLength={1}
                            value={otp[index] || ""}
                            onChange={(event) =>
                              handleOtpChange(
                                event.target.value,
                                index
                              )
                            }
                            onKeyDown={(event) =>
                              handleOtpKeyDown(event, index)
                            }
                            onPaste={
                              index === 0
                                ? handleOtpPaste
                                : undefined
                            }
                            disabled={isLoading}
                            aria-label={`Verification digit ${index + 1}`}
                            required
                          />
                        ))}

                      </div>

                      <p className="otp-security-note">
                        <LockKeyhole size={14} />
                        Your verification code is private and secure.
                      </p>

                    </div>

                    {message && (
                      <p className="login-message" role="alert">
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="login-submit"
                      disabled={isLoading || otp.length !== 6}
                    >
                      {isLoading ? (
                        "Verifying..."
                      ) : (
                        <>
                          Verify Code
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      className="otp-back-button"
                      onClick={handleBackToLogin}
                      disabled={isLoading}
                    >
                      <ArrowLeft size={16} />
                      Back to sign in
                    </button>

                  </form>
                </>

              ) : (

                /* ==========================
                   NORMAL LOGIN
                ========================== */

                <>
                  <div className="login-card-heading">
                    <h2>
                      Welcome <span>Back</span>
                    </h2>

                    <p>
                      Sign in to continue to your EthioLance account.
                    </p>
                  </div>

                  <form
                    className="login-form"
                    onSubmit={handleSubmit}
                  >

                    {/* EMAIL */}

                    <div className="login-input-group">
                      <UserRound size={18} />

                      <input
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        autoComplete="email"
                        required
                      />
                    </div>

                    {/* PASSWORD */}

                    <div className="login-input-group">
                      <LockKeyhole size={18} />

                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        autoComplete="current-password"
                        required
                      />

                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        aria-label={
                          showPassword
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>

                    {/* OPTIONS */}

                    <div className="login-options">

                      <label className="remember-me">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(event) =>
                            setRememberMe(event.target.checked)
                          }
                        />

                        <span className="custom-checkbox">
                          {rememberMe && <Check size={13} />}
                        </span>

                        Remember me
                      </label>

                      <button
                        type="button"
                        className="forgot-password"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </button>

                    </div>

                    {/* ERROR MESSAGE */}

                    {message && (
                      <p className="login-message" role="alert">
                        {message}
                      </p>
                    )}

                    {/* LOGIN BUTTON */}

                    <button
                      type="submit"
                      className="login-submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        "Signing in..."
                      ) : (
                        <>
                          Sign In
                          <ArrowRight size={17} />
                        </>
                      )}
                    </button>

                  </form>

                  {/* DIVIDER */}

                  <div className="login-divider">
                    <span />
                    <p>OR CONTINUE WITH</p>
                    <span />
                  </div>

                  {/* SOCIAL LOGIN */}

                  <div className="social-login">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                    >
                      <svg
                        viewBox="0 0 48 48"
                        width="21"
                        height="21"
                        aria-hidden="true"
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                          transform="translate(0 4)"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.75 7.18l7.26 5.64c4.23-3.91 6.53-9.67 6.53-17.29z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.19a23.94 23.94 0 0 0 0 21.56l7.98-6.19z"
                          transform="translate(0 0)"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.9-5.79l-7.26-5.64c-2.01 1.35-4.59 2.15-8.64 2.15-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>

                      Continue with Google
                    </button>
                  </div>

                  {/* REGISTER */}

                  <p className="login-register">
                    Don't have an account?

                    {onRegisterClick ? (
                      <button
                        type="button"
                        onClick={onRegisterClick}
                      >
                        Create account
                      </button>
                    ) : (
                      <Link
                        to="/register"
                        onClick={closeModal}
                      >
                        Create account
                      </Link>
                    )}
                  </p>

                </>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
