
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Code2,
  BriefcaseBusiness,
  X,
} from "lucide-react";

import "./RegisterPage.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

function RegisterPage({ onClose, onLoginClick }) {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [googleMessage, setGoogleMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/");
    }
  };

  const handleLoginLink = (event) => {
    if (onLoginClick) {
      event.preventDefault();
      onLoginClick();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, navigate]);

  function handleGoogleSignUp() {
    setGoogleMessage(
      "Google sign-up is not configured yet. Google authentication needs to be connected."
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setMessage("");
    setGoogleMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!role) {
      setMessage("Please select an account type.");
      return;
    }

    if (password.length < 8) {
      setMessage("Password must contain at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        setMessage(
          data.message ||
            "Registration failed. Please check your details and try again."
        );
        return;
      }

      const backendUser = data.user || data.data?.user || {};

      const registeredUser = {
        ...backendUser,
        firstName: backendUser.firstName || firstName.trim(),
        lastName: backendUser.lastName || lastName.trim(),
        email: backendUser.email || email.trim().toLowerCase(),
        role: backendUser.role || role,
      };

      if (
        typeof data.token !== "string" ||
        data.token.split(".").length !== 3
      ) {
        console.error("Registration response has no valid JWT:", {
          success: data.success,
          hasToken: !!data.token,
          tokenType: typeof data.token,
        });

        setMessage(
          "Account created, but authentication token was not received. Please log in."
        );
        return;
      }

      localStorage.setItem(
        "ethioLanceUser",
        JSON.stringify(registeredUser)
      );

      localStorage.setItem(
        "user",
        JSON.stringify(registeredUser)
      );

      localStorage.setItem("ethioLanceToken", data.token);

      sessionStorage.removeItem("ethioLanceToken");
      sessionStorage.removeItem("ethioLanceUser");

      localStorage.removeItem("ethioLanceProfile");
      localStorage.removeItem("ethioLanceProfileSkipped");
      localStorage.removeItem("token");

      if (registeredUser.role === "FREELANCER") {
        navigate("/freelancer/create-profile", {
          replace: true,
        });
      } else if (registeredUser.role === "CLIENT") {
        navigate("/client/create-profile", {
          replace: true,
        });
      } else {
        setMessage(
          "Account created, but the account type is invalid."
        );
      }
    } catch (error) {
      console.error("Registration error:", error);

      setMessage(
        "Could not connect to the server. Please make sure your backend is running and try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="ethio-register-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <main
        className="ethio-register-page"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ethio-register-title"
      >
        {/* Close button */}
        <button
          type="button"
          className="ethio-register-close-button"
          onClick={handleClose}
          aria-label="Close registration form"
        >
          <X size={20} />
        </button>

        {/* Registration form */}
        <section className="ethio-register-card">
          <Link
            to="/"
            className="ethio-register-brand"
            onClick={handleClose}
          >
            <img
              src="/ethiolance-emblem.png"
              alt="EthioLance emblem"
              className="ethio-register-brand-logo"
            />

            <span>
              Ethio<span className="ethio-register-brand-accent">Lance</span>
            </span>
          </Link>

          {/* Heading */}
          <div className="ethio-register-heading">
            <h1 id="ethio-register-title">
              Create your account
            </h1>

            <p>
              Join EthioLance and connect skills with opportunity.
            </p>
          </div>

          {/* Google registration */}
          <div className="ethio-register-social-section">
            <button
              type="button"
              className="ethio-register-google-button"
              onClick={handleGoogleSignUp}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.44a5.5 5.5 0 0 1-2.39 3.61l3.86 2.99c2.25-2.08 3.58-5.14 3.58-8.84Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.96-1.07 7.95-2.89l-3.86-2.99c-1.07.72-2.43 1.15-4.09 1.15-3.14 0-5.8-2.12-6.75-4.97l-3.99 3.09C3.23 21.02 7.25 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.25 14.3A7.24 7.24 0 0 1 4.87 12c0-.8.14-1.57.38-2.3L1.26 6.61A11.9 11.9 0 0 0 0 12c0 1.93.46 3.76 1.27 5.39l3.98-3.09Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.73c1.77 0 3.35.61 4.6 1.81l3.45-3.45C17.96 1.15 15.24 0 12 0 7.25 0 3.23 2.98 1.26 6.61l3.99 3.09C6.2 6.85 8.86 4.73 12 4.73Z"
                />
              </svg>

              <span>Continue with Google</span>
            </button>

            {googleMessage && (
              <p className="ethio-register-message" role="status">
                {googleMessage}
              </p>
            )}

            <div className="ethio-register-divider">
              <span>OR SIGN UP WITH EMAIL</span>
            </div>
          </div>

          {/* Form */}
          <form
            className="ethio-register-form"
            onSubmit={handleSubmit}
          >
            <div className="ethio-register-name-grid">
              <div className="ethio-register-field">
                <label htmlFor="register-first-name">
                  First name
                </label>

                <div className="ethio-register-input-wrapper">
                  <UserRound size={18} />

                  <input
                    id="register-first-name"
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(event) =>
                      setFirstName(event.target.value)
                    }
                    autoComplete="given-name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="ethio-register-field">
                <label htmlFor="register-last-name">
                  Last name
                </label>

                <div className="ethio-register-input-wrapper">
                  <UserRound size={18} />

                  <input
                    id="register-last-name"
                    type="text"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(event) =>
                      setLastName(event.target.value)
                    }
                    autoComplete="family-name"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="ethio-register-field">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="ethio-register-input-wrapper">
                <Mail size={18} />

                <input
                  id="register-email"
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
            </div>

            <div className="ethio-register-field">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="ethio-register-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="ethio-register-password-toggle"
                  onClick={() =>
                    setShowPassword((previous) => !previous)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="ethio-register-field">
              <label htmlFor="register-confirm-password">
                Confirm password
              </label>

              <div className="ethio-register-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Enter your password again"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  autoComplete="new-password"
                  required
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="ethio-register-password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Account type */}
            <fieldset
              className="ethio-register-role-fieldset"
              disabled={isLoading}
            >
              <legend>
                How do you want to use EthioLance?
              </legend>

              <div className="ethio-register-role-options">
                <label
                  className={`ethio-register-role-card ${
                    role === "FREELANCER" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="FREELANCER"
                    checked={role === "FREELANCER"}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                    required
                  />

                  <Code2 size={22} />

                  <span className="ethio-register-role-title">
                    I'm a freelancer
                  </span>

                  <span className="ethio-register-role-description">
                    I want to offer my skills and find work.
                  </span>
                </label>

                <label
                  className={`ethio-register-role-card ${
                    role === "CLIENT" ? "selected" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="CLIENT"
                    checked={role === "CLIENT"}
                    onChange={(event) =>
                      setRole(event.target.value)
                    }
                  />

                  <BriefcaseBusiness size={22} />

                  <span className="ethio-register-role-title">
                    I'm a client
                  </span>

                  <span className="ethio-register-role-description">
                    I want to hire skilled professionals.
                  </span>
                </label>
              </div>
            </fieldset>

            <button
              type="submit"
              className="ethio-register-submit"
              disabled={isLoading}
            >
              <span>
                {isLoading ? "Creating account..." : "Create account"}
              </span>

              {!isLoading && <ArrowRight size={19} />}
            </button>

            {message && (
              <p
                className="ethio-register-message"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </form>

          <p className="ethio-register-login">
            Already have an account?{" "}
            <Link to="/login" onClick={handleLoginLink}>
              Log in
            </Link>
          </p>
        </section>

        {/* Branding panel */}
        <aside className="ethio-register-brand-panel">
          <div className="ethio-register-brand-panel-content">
            <span className="ethio-register-panel-eyebrow">
              WELCOME TO ETHIOLANCE
            </span>

            <h2>
              Your skills deserve the right opportunity.
            </h2>

            <p>
              Build connections, collaborate on projects, and grow
              your professional journey with Ethiopian talent.
            </p>

            <div className="ethio-register-panel-decoration">
              <div className="ethio-register-decoration-circle ethio-register-circle-one" />

              <div className="ethio-register-decoration-circle ethio-register-circle-two" />

              <div className="ethio-register-decoration-icon">
                <BriefcaseBusiness size={38} />
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default RegisterPage;
