
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Bell,
  Shield,
  Lock,
  Eye,
  Palette,
  Trash2,
  Save,
  Camera,
  ChevronRight,
  Mail,
  Smartphone,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import "./Settings.css";

const defaultSettings = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  bio: "",
  emailNotifications: true,
  jobNotifications: true,
  messageNotifications: true,
  marketingNotifications: false,
  profileVisibility: "public",
  showEmail: false,
  showPhone: false,
  theme: "light",
};

const sections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "privacy", label: "Privacy", icon: Eye },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "danger", label: "Danger Zone", icon: Trash2 },
];

export default function SettingsPage() {
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("profile");
  const [settings, setSettings] = useState(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem("ethioLanceSettings") || "{}"
      );

      const profile = JSON.parse(
        localStorage.getItem("ethioLanceProfile") || "{}"
      );

      setSettings((previous) => ({
        ...previous,
        ...stored,
        fullName: stored.fullName || profile.fullName || "",
        email: stored.email || profile.email || "",
        phone: stored.phone || profile.phone || "",
        location: stored.location || profile.location || "",
        bio: stored.bio || profile.bio || "",
      }));
    } catch {
      console.error("Could not load saved settings.");
    }
  }, []);

  const updateSetting = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
  };

  const saveSettings = () => {
    localStorage.setItem("ethioLanceSettings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage("Your new password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("The new passwords do not match.");
      return;
    }

    setPasswordMessage(
      "Password change UI is ready. Connect it to your backend API to update your password."
    );
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmation !== "DELETE") return;

    setShowDelete(false);
    setDeleteConfirmation("");

    alert(
      "Account deletion requires a backend endpoint. No database account has been deleted."
    );
  };

  const Toggle = ({ label, description, checked, onChange }) => (
    <div className="settings-toggle-row">
      <div className="settings-toggle-text">
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`settings-switch ${checked ? "active" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );

  return (
    <div className="ethio-settings-page">
      <div className="settings-header">
        <div>
          <span className="settings-eyebrow">ACCOUNT MANAGEMENT</span>
          <h1>Settings</h1>
          <p>Manage your account, preferences and security.</p>
        </div>

        <button className="settings-logout-button" onClick={handleLogout}>
          <LogOut size={17} />
          Log out
        </button>
      </div>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <h3>Settings menu</h3>

          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`settings-nav-item ${
                activeSection === id ? "active" : ""
              }`}
              onClick={() => setActiveSection(id)}
            >
              <Icon size={19} />
              <span>{label}</span>
              <ChevronRight size={16} />
            </button>
          ))}
        </aside>

        <main className="settings-content">
          {activeSection === "profile" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Profile settings</h2>
                  <p>Update your personal information.</p>
                </div>
                <UserRound size={24} />
              </div>

              <div className="settings-avatar-area">
                <div className="settings-avatar">
                  {settings.fullName
                    ? settings.fullName.charAt(0).toUpperCase()
                    : "U"}
                </div>
                <div>
                  <strong>Profile information</strong>
                  <p>Your profile details help others recognize you.</p>
                </div>
                <Camera size={20} />
              </div>

              <div className="settings-form-grid">
                <label>
                  Full name
                  <input
                    value={settings.fullName}
                    onChange={(e) =>
                      updateSetting("fullName", e.target.value)
                    }
                    placeholder="Enter your full name"
                  />
                </label>

                <label>
                  Email address
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => updateSetting("email", e.target.value)}
                    placeholder="example@email.com"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    value={settings.phone}
                    onChange={(e) => updateSetting("phone", e.target.value)}
                    placeholder="+251 9..."
                  />
                </label>

                <label>
                  Location
                  <input
                    value={settings.location}
                    onChange={(e) => updateSetting("location", e.target.value)}
                    placeholder="City, Ethiopia"
                  />
                </label>

                <label className="settings-full-width">
                  About me
                  <textarea
                    rows="4"
                    value={settings.bio}
                    onChange={(e) => updateSetting("bio", e.target.value)}
                    placeholder="Tell people a little about yourself..."
                  />
                </label>
              </div>

              <div className="settings-save-area">
                {saved && (
                  <span className="settings-success">
                    <CheckCircle2 size={17} /> Settings saved
                  </span>
                )}
                <button className="settings-save-button" onClick={saveSettings}>
                  <Save size={17} /> Save changes
                </button>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Notifications</h2>
                  <p>Choose which updates you want to receive.</p>
                </div>
                <Bell size={24} />
              </div>

              <div className="settings-options">
                <Toggle
                  label="Email notifications"
                  description="Receive important account updates by email."
                  checked={settings.emailNotifications}
                  onChange={(v) => updateSetting("emailNotifications", v)}
                />
                <Toggle
                  label="Job notifications"
                  description="Get notified about relevant jobs and applications."
                  checked={settings.jobNotifications}
                  onChange={(v) => updateSetting("jobNotifications", v)}
                />
                <Toggle
                  label="Messages"
                  description="Get notified when someone sends you a message."
                  checked={settings.messageNotifications}
                  onChange={(v) => updateSetting("messageNotifications", v)}
                />
                <Toggle
                  label="Promotional updates"
                  description="Receive platform news, offers and announcements."
                  checked={settings.marketingNotifications}
                  onChange={(v) =>
                    updateSetting("marketingNotifications", v)
                  }
                />
              </div>

              <div className="settings-save-area">
                <button className="settings-save-button" onClick={saveSettings}>
                  <Save size={17} /> Save preferences
                </button>
              </div>
            </section>
          )}

          {activeSection === "security" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Security</h2>
                  <p>Protect your EthioLance account.</p>
                </div>
                <Shield size={24} />
              </div>

              <div className="settings-security-card">
                <div className="settings-security-icon">
                  <Lock size={21} />
                </div>
                <div>
                  <strong>Change password</strong>
                  <p>Use a strong password that you do not use elsewhere.</p>
                </div>
              </div>

              <form
                className="settings-password-form"
                onSubmit={handlePasswordChange}
              >
                <label>
                  Current password
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </label>

                <label>
                  New password
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                  />
                </label>

                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </label>

                {passwordMessage && (
                  <p className="settings-message">{passwordMessage}</p>
                )}

                <button className="settings-save-button" type="submit">
                  <Lock size={17} /> Update password
                </button>
              </form>

              <div className="settings-info-note">
                <Shield size={18} />
                <p>
                  For real password changes, connect this form to your
                  authenticated backend password-update endpoint.
                </p>
              </div>
            </section>
          )}

          {activeSection === "privacy" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Privacy</h2>
                  <p>Choose what other users can see.</p>
                </div>
                <Eye size={24} />
              </div>

              <div className="settings-form-grid">
                <label className="settings-full-width">
                  Profile visibility
                  <select
                    value={settings.profileVisibility}
                    onChange={(e) =>
                      updateSetting("profileVisibility", e.target.value)
                    }
                  >
                    <option value="public">Public – everyone can see it</option>
                    <option value="registered">
                      Registered users only
                    </option>
                    <option value="private">Private</option>
                  </select>
                </label>
              </div>

              <div className="settings-options">
                <Toggle
                  label="Show email address"
                  description="Allow other users to see your email."
                  checked={settings.showEmail}
                  onChange={(v) => updateSetting("showEmail", v)}
                />
                <Toggle
                  label="Show phone number"
                  description="Allow other users to see your phone number."
                  checked={settings.showPhone}
                  onChange={(v) => updateSetting("showPhone", v)}
                />
              </div>

              <div className="settings-save-area">
                <button className="settings-save-button" onClick={saveSettings}>
                  <Save size={17} /> Save privacy settings
                </button>
              </div>
            </section>
          )}

          {activeSection === "appearance" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Appearance</h2>
                  <p>Choose how EthioLance looks on your device.</p>
                </div>
                <Palette size={24} />
              </div>

              <div className="settings-theme-options">
                <button
                  className={`settings-theme-card ${
                    settings.theme === "light" ? "selected" : ""
                  }`}
                  onClick={() => updateSetting("theme", "light")}
                >
                  <div className="settings-theme-preview light-preview" />
                  <strong>Light mode</strong>
                  <span>Clean and bright</span>
                </button>

                <button
                  className={`settings-theme-card ${
                    settings.theme === "dark" ? "selected" : ""
                  }`}
                  onClick={() => updateSetting("theme", "dark")}
                >
                  <div className="settings-theme-preview dark-preview" />
                  <strong>Dark mode</strong>
                  <span>Comfortable in low light</span>
                </button>
              </div>

              <p className="settings-message">
                Theme preference is saved here. Applying dark mode across the
                entire application requires connecting it to your app's theme
                system.
              </p>

              <div className="settings-save-area">
                <button className="settings-save-button" onClick={saveSettings}>
                  <Save size={17} /> Save appearance
                </button>
              </div>
            </section>
          )}

          {activeSection === "danger" && (
            <section>
              <div className="settings-section-heading">
                <div>
                  <h2>Danger zone</h2>
                  <p>Actions that can affect your account permanently.</p>
                </div>
                <AlertTriangle size={24} />
              </div>

              <div className="settings-danger-card">
                <div>
                  <h3>Delete account</h3>
                  <p>
                    Permanently deleting your account may remove your profile
                    and account information. This action cannot be undone.
                  </p>
                </div>

                <button
                  className="settings-delete-button"
                  onClick={() => setShowDelete(true)}
                >
                  <Trash2 size={17} /> Delete account
                </button>
              </div>

              <div className="settings-info-note">
                <AlertTriangle size={18} />
                <p>
                  Account deletion is not connected yet. A secure backend
                  endpoint is required to delete your account from PostgreSQL.
                </p>
              </div>
            </section>
          )}
        </main>
      </div>

      {showDelete && (
        <div className="settings-modal-overlay">
          <div className="settings-delete-modal">
            <div className="settings-delete-icon">
              <Trash2 size={25} />
            </div>
            <h2>Delete your account?</h2>
            <p>
              This action is permanent. Type <strong>DELETE</strong> below to
              confirm that you understand.
            </p>

            <input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
            />

            <div className="settings-modal-actions">
              <button
                className="settings-cancel-button"
                onClick={() => {
                  setShowDelete(false);
                  setDeleteConfirmation("");
                }}
              >
                Cancel
              </button>
              <button
                className="settings-delete-button"
                disabled={deleteConfirmation !== "DELETE"}
                onClick={handleDeleteAccount}
              >
                Confirm deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
