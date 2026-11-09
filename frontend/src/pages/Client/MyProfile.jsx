
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  FileText,
  Pencil,
  Save,
  X,
  BriefcaseBusiness,
  CalendarDays,
} from "lucide-react";
import "./MyProfile.css";

const STORAGE_KEY = "ethioLanceClientProfile";

const defaultProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  companyName: "",
  location: "",
  website: "",
  bio: "",
};

export default function MyProfile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [formData, setFormData] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("ethioLanceUser") ||
        sessionStorage.getItem("ethioLanceUser");

      const user = savedUser ? JSON.parse(savedUser) : {};

      const savedProfile = localStorage.getItem(STORAGE_KEY);
      const customProfile = savedProfile ? JSON.parse(savedProfile) : {};

      const initialProfile = {
        ...defaultProfile,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        ...customProfile,
      };

      setProfile(initialProfile);
      setFormData(initialProfile);
    } catch (error) {
      console.error("Could not load client profile:", error);
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    const updatedProfile = {
      ...formData,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProfile));
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      setMessage("Your profile has been saved successfully.");

      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Could not save profile:", error);
      setMessage("Unable to save your profile.");
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage("");
  };

  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Your Name";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="ethio-client-profile">
      <div className="ethio-client-profile-header">
        <div>
          <span className="ethio-client-profile-eyebrow">
            ACCOUNT MANAGEMENT
          </span>
          <h1>My Profile</h1>
          <p>Manage your personal and company information.</p>
        </div>

        {!isEditing && (
          <button
            className="ethio-profile-edit-btn"
            onClick={() => {
              setFormData(profile);
              setIsEditing(true);
            }}
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div className="ethio-profile-message">
          {message}
        </div>
      )}

      <div className="ethio-profile-layout">
        <section className="ethio-profile-card ethio-profile-summary">
          <div className="ethio-profile-avatar">{initials}</div>

          <h2>{fullName}</h2>
          <p className="ethio-profile-role">
            <BriefcaseBusiness size={15} />
            Client Account
          </p>

          <div className="ethio-profile-summary-divider" />

          <div className="ethio-profile-summary-item">
            <Mail size={17} />
            <span>{profile.email || "No email added"}</span>
          </div>

          <div className="ethio-profile-summary-item">
            <MapPin size={17} />
            <span>{profile.location || "Location not added"}</span>
          </div>

          <div className="ethio-profile-summary-item">
            <Building2 size={17} />
            <span>{profile.companyName || "No company added"}</span>
          </div>

          <div className="ethio-profile-account-type">
            <span className="ethio-profile-status-dot" />
            Active Client
          </div>
        </section>

        <section className="ethio-profile-card ethio-profile-details">
          <div className="ethio-profile-section-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Your account and contact details</p>
            </div>
            <UserRound size={22} />
          </div>

          <form onSubmit={handleSave}>
            <div className="ethio-profile-form-grid">
              <div className="ethio-profile-field">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Enter last name"
                  required
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+251 9XX XXX XXX"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="companyName">Company Name</label>
                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your company name"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="City, Ethiopia"
                />
              </div>

              <div className="ethio-profile-field ethio-profile-full-width">
                <label htmlFor="website">
                  <Globe size={15} />
                  Website
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              <div className="ethio-profile-field ethio-profile-full-width">
                <label htmlFor="bio">
                  <FileText size={15} />
                  About You / Company
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Tell freelancers about yourself or your company..."
                  rows={5}
                />
              </div>
            </div>

            {isEditing && (
              <div className="ethio-profile-form-actions">
                <button
                  type="button"
                  className="ethio-profile-cancel-btn"
                  onClick={handleCancel}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ethio-profile-save-btn"
                >
                  <Save size={17} />
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
