
import { useState, useEffect } from "react";
import {
  User,
  Bell,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Save,
  Trash2,
  Mail,
  Smartphone,
  Globe,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import "./Settings.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("Account");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [message, setMessage] = useState("");

  const savedUser =
    JSON.parse(
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser") ||
      "{}"
    );

  const [account, setAccount] = useState({
    firstName: savedUser.firstName || "",
    lastName: savedUser.lastName || "",
    email: savedUser.email || "",
    phone: savedUser.phone || "",
    language: "English",
    timezone: "Africa/Addis_Ababa",
  });

  const [notifications, setNotifications] = useState({
    emailProposals: true,
    emailMessages: true,
    emailPayments: true,
    emailUpdates: false,
    pushProposals: true,
    pushMessages: true,
    pushUpdates: false,
  });

  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showOnlineStatus: true,
    allowMessages: true,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3500);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleAccountChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleToggle = (group, name) => {
    if (group === "notifications") {
      setNotifications((prev) => ({
        ...prev,
        [name]: !prev[name],
      }));
    } else {
      setPrivacy((prev) => ({
        ...prev,
        [name]: !prev[name],
      }));
    }
  };

  const saveAccount = () => {
    const profile = JSON.parse(
      localStorage.getItem("ethioLanceClientProfile") || "{}"
    );

    localStorage.setItem(
      "ethioLanceClientProfile",
      JSON.stringify({
        ...profile,
        ...account,
      })
    );

    setMessage("Account settings saved successfully.");
  };

  const saveNotifications = () => {
    localStorage.setItem(
      "ethioLanceNotificationSettings",
      JSON.stringify(notifications)
    );
    setMessage("Notification preferences saved.");
  };

  const savePrivacy = () => {
    localStorage.setItem(
      "ethioLancePrivacySettings",
      JSON.stringify(privacy)
    );
    setMessage("Privacy settings saved.");
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setMessage("Please complete all password fields.");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage("New password must contain at least 8 characters.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    const token =
      localStorage.getItem("ethioLanceToken") ||
      sessionStorage.getItem("ethioLanceToken");

    if (!token) {
      setMessage("Please log in again to change your password.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to change password.");
      }

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setMessage("Password changed successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    setMessage(
      "Account deletion is not connected to the backend yet. Please contact support."
    );
  };

  const tabs = [
    { name: "Account", icon: User },
    { name: "Notifications", icon: Bell },
    { name: "Privacy", icon: Shield },
    { name: "Security", icon: Lock },
  ];

  const Toggle = ({ checked, onChange }) => (
    <button
      type="button"
      className={`ethio-settings-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-pressed={checked}
    >
      <span />
    </button>
  );

  return (
    <div className="ethio-settings-page">
      <div className="ethio-settings-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage your account preferences and security.</p>
        </div>
      </div>

      {message && (
        <div className="ethio-settings-message">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="ethio-settings-layout">
        <aside className="ethio-settings-sidebar">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.name}
                className={
                  activeTab === tab.name
                    ? "ethio-settings-tab active"
                    : "ethio-settings-tab"
                }
                onClick={() => setActiveTab(tab.name)}
              >
                <Icon size={19} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </aside>

        <main className="ethio-settings-content">
          {activeTab === "Account" && (
            <section className="ethio-settings-card">
              <div className="ethio-settings-card-heading">
                <div>
                  <h2>Account Information</h2>
                  <p>Update your personal account details.</p>
                </div>
                <User size={22} />
              </div>

              <div className="ethio-settings-form-grid">
                <div className="ethio-settings-field">
                  <label>First Name</label>
                  <input
                    name="firstName"
                    value={account.firstName}
                    onChange={handleAccountChange}
                    placeholder="First name"
                  />
                </div>

                <div className="ethio-settings-field">
                  <label>Last Name</label>
                  <input
                    name="lastName"
                    value={account.lastName}
                    onChange={handleAccountChange}
                    placeholder="Last name"
                  />
                </div>

                <div className="ethio-settings-field">
                  <label>Email Address</label>
                  <div className="ethio-settings-input-icon">
                    <Mail size={17} />
                    <input
                      name="email"
                      type="email"
                      value={account.email}
                      onChange={handleAccountChange}
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className="ethio-settings-field">
                  <label>Phone Number</label>
                  <div className="ethio-settings-input-icon">
                    <Smartphone size={17} />
                    <input
                      name="phone"
                      value={account.phone}
                      onChange={handleAccountChange}
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="ethio-settings-field">
                  <label>Language</label>
                  <select
                    name="language"
                    value={account.language}
                    onChange={handleAccountChange}
                  >
                    <option>English</option>
                    <option>Amharic</option>
                  </select>
                </div>

                <div className="ethio-settings-field">
                  <label>Timezone</label>
                  <div className="ethio-settings-input-icon">
                    <Globe size={17} />
                    <select
                      name="timezone"
                      value={account.timezone}
                      onChange={handleAccountChange}
                    >
                      <option value="Africa/Addis_Ababa">
                        Africa/Addis Ababa (EAT)
                      </option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="ethio-settings-actions">
                <button
                  className="ethio-settings-save"
                  onClick={saveAccount}
                >
                  <Save size={17} /> Save Changes
                </button>
              </div>
            </section>
          )}

          {activeTab === "Notifications" && (
            <section className="ethio-settings-card">
              <div className="ethio-settings-card-heading">
                <div>
                  <h2>Notification Preferences</h2>
                  <p>Choose which notifications you want to receive.</p>
                </div>
                <Bell size={22} />
              </div>

              <div className="ethio-settings-group">
                <h3>Email Notifications</h3>

                {[
                  ["emailProposals", "New Proposals", "When freelancers submit proposals to your jobs."],
                  ["emailMessages", "Messages", "When you receive a new message."],
                  ["emailPayments", "Payments", "Updates about payments and transactions."],
                  ["emailUpdates", "Platform Updates", "News and important platform announcements."],
                ].map(([key, title, description]) => (
                  <div className="ethio-settings-option" key={key}>
                    <div>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                    <Toggle
                      checked={notifications[key]}
                      onChange={() => handleToggle("notifications", key)}
                    />
                  </div>
                ))}
              </div>

              <div className="ethio-settings-group">
                <h3>Push Notifications</h3>

                {[
                  ["pushProposals", "New Proposals", "Receive proposal alerts."],
                  ["pushMessages", "Messages", "Receive new message alerts."],
                  ["pushUpdates", "Platform Updates", "Receive platform announcements."],
                ].map(([key, title, description]) => (
                  <div className="ethio-settings-option" key={key}>
                    <div>
                      <h4>{title}</h4>
                      <p>{description}</p>
                    </div>
                    <Toggle
                      checked={notifications[key]}
                      onChange={() => handleToggle("notifications", key)}
                    />
                  </div>
                ))}
              </div>

              <button
                className="ethio-settings-save"
                onClick={saveNotifications}
              >
                <Save size={17} /> Save Preferences
              </button>
            </section>
          )}

          {activeTab === "Privacy" && (
            <section className="ethio-settings-card">
              <div className="ethio-settings-card-heading">
                <div>
                  <h2>Privacy Settings</h2>
                  <p>Control how other users interact with your account.</p>
                </div>
                <Shield size={22} />
              </div>

              {[
                ["showProfile", "Public Profile", "Allow freelancers to view your client profile."],
                ["showOnlineStatus", "Online Status", "Show when you are active on EthioLance."],
                ["allowMessages", "Allow Messages", "Allow freelancers to send you messages."],
              ].map(([key, title, description]) => (
                <div className="ethio-settings-option" key={key}>
                  <div>
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                  <Toggle
                    checked={privacy[key]}
                    onChange={() => handleToggle("privacy", key)}
                  />
                </div>
              ))}

              <button
                className="ethio-settings-save"
                onClick={savePrivacy}
              >
                <Save size={17} /> Save Privacy Settings
              </button>
            </section>
          )}

          {activeTab === "Security" && (
            <>
              <section className="ethio-settings-card">
                <div className="ethio-settings-card-heading">
                  <div>
                    <h2>Change Password</h2>
                    <p>Keep your account secure with a strong password.</p>
                  </div>
                  <Lock size={22} />
                </div>

                <form
                  className="ethio-settings-password-form"
                  onSubmit={handlePasswordChange}
                >
                  <div className="ethio-settings-field">
                    <label>Current Password</label>
                    <div className="ethio-settings-password-input">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="ethio-settings-field">
                    <label>New Password</label>
                    <div className="ethio-settings-password-input">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="ethio-settings-field">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <button type="submit" className="ethio-settings-save">
                    <Lock size={17} /> Update Password
                  </button>
                </form>
              </section>

              <section className="ethio-settings-card ethio-settings-danger-card">
                <div className="ethio-settings-card-heading">
                  <div>
                    <h2>Delete Account</h2>
                    <p>Permanently remove your EthioLance account.</p>
                  </div>
                  <AlertTriangle size={22} />
                </div>

                <p className="ethio-settings-danger-text">
                  Deleting your account is permanent. Your jobs, contracts,
                  and account information may be affected.
                </p>

                <button
                  className="ethio-settings-delete"
                  onClick={handleDeleteAccount}
                >
                  <Trash2 size={17} /> Delete Account
                </button>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
