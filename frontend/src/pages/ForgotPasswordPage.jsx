import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, KeyRound, LoaderCircle, Mail, MailCheck, ShieldCheck } from "lucide-react";
import "./PasswordResetPages.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setIsSuccess(false);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not send the reset link.");
      setMessage(data.message || "If an account with that email exists, a reset link has been sent.");
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

        <section className="password-reset-card" aria-labelledby="forgot-password-title">
          {isSuccess ? (
            <div className="password-reset-sent" role="status">
              <div className="password-reset-icon success"><MailCheck size={23} aria-hidden="true" /></div>
              <span className="password-reset-kicker">REQUEST RECEIVED</span>
              <h1 id="forgot-password-title">Check your inbox</h1>
            
              <div className="password-reset-email-chip"><Mail size={16} aria-hidden="true" /><span>{email}</span></div>
              <div className="password-reset-security-note">
                <ShieldCheck size={17} aria-hidden="true" />
                <span>Your password reset link has been sent.</span>
              </div>
              <Link className="password-reset-back" to="/login"><ArrowLeft size={16} /> Back to login</Link>
            </div>
          ) : (
            <>
              <div className="password-reset-icon"><KeyRound size={23} aria-hidden="true" /></div>
              <span className="password-reset-kicker">ACCOUNT RECOVERY</span>
              <h1 id="forgot-password-title">Forgot your password?</h1>
              <p className="password-reset-description">Enter the email address linked to your EthioLance account. We’ll send you a link to create a new password.</p>

              <form onSubmit={handleSubmit}>
                <label htmlFor="reset-email">Email address</label>
                <div className="password-reset-input-wrap">
                  <Mail size={18} aria-hidden="true" />
                  <input
                    id="reset-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
                <button className="password-reset-submit" type="submit" disabled={isLoading}>
                  {isLoading ? <><LoaderCircle className="password-reset-spinner" size={18} /> Sending link…</> : <>Send reset link <ArrowRight size={18} /></>}
                </button>
              </form>

              {message && <div className="password-reset-message" role="alert"><span>{message}</span></div>}
              <Link className="password-reset-back" to="/login"><ArrowLeft size={16} /> Back to login</Link>
            </>
          )}
          <p className="password-reset-support">Need help? Contact the EthioLance support team.</p>
        </section>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
