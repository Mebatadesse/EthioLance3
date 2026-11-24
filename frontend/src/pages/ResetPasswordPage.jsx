import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle } from "lucide-react";
import "./PasswordResetPages.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    if (password !== confirmPassword) {
      setMessage("The passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Could not reset your password.");
      setMessage(data.message || "Password reset successfully. You can now log in.");
      setIsSuccess(true);
    } catch (error) {
      setMessage(error.message || "Unable to contact the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="password-reset-page">
      <div className="password-reset-layout">
        <aside className="password-reset-brand">
          <Link className="password-reset-brand-link" to="/" aria-label="EthioLance home">
            <img src="/ethiolance-emblem.png" alt="EthioLance emblem" className="password-reset-logo" />
            <h2 className="password-reset-brand-name">Ethio<span>Lance</span></h2>
          </Link>
          <div className="password-reset-brand-slogan">
            <span />
            <p>CONNECT <b>•</b> CREATE <b>•</b> GROW</p>
            <span />
          </div>
          <p className="password-reset-brand-description">Your talent. Your opportunity. Your future.</p>
        </aside>

        <section className="password-reset-card" aria-labelledby="reset-password-title">
          {isSuccess ? (
            <div className="password-reset-complete">
              <div className="password-reset-icon success"><CheckCircle2 size={24} aria-hidden="true" /></div>
              <span className="password-reset-kicker">PASSWORD UPDATED</span>
              <h1 id="reset-password-title">You’re all set.</h1>
              <p className="password-reset-description">Your password has been changed. You can now sign in with your new password.</p>
              <Link className="password-reset-submit password-reset-login-cta" to="/login">Go to login <ArrowRight size={18} /></Link>
            </div>
          ) : (
            <>
              <div className="password-reset-icon"><KeyRound size={23} aria-hidden="true" /></div>
              <span className="password-reset-kicker">CREATE A NEW PASSWORD</span>
              <h1 id="reset-password-title">Choose a new password</h1>
              <p className="password-reset-description"></p>

              <form onSubmit={handleSubmit}>
                <label htmlFor="new-password">New password</label>
                <div className="password-reset-input-wrap">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                  />
                  <button type="button" className="password-reset-visibility" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <label htmlFor="confirm-password">Confirm new password</label>
                <div className="password-reset-input-wrap">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your new password again"
                  />
                  <button type="button" className="password-reset-visibility" onClick={() => setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <p className="password-reset-password-hint">Use at least 8 characters. A unique password helps keep your account secure.Use a mix of words, numbers, and symbols for a stronger password.</p>
                <button className="password-reset-submit" type="submit" disabled={isLoading}>
                  {isLoading ? <><LoaderCircle className="password-reset-spinner" size={18} /> Updating password…</> : <>Reset password <ArrowRight size={18} /></>}
                </button>
              </form>

              {message && <div className="password-reset-message" role="alert"><span>{message}</span></div>}
              <Link className="password-reset-back" to="/forgot-password"><ArrowLeft size={16} /> Request a new reset link</Link>
            </>
          )}
          <p className="password-reset-support">Protected by EthioLance account security.</p>
        </section>
      </div>
    </main>
  );
}

export default ResetPasswordPage;
