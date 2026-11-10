
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  MapPin,
  Building2,
  Globe,
  FileText,
  Pencil,
  Save,
  X,
  BriefcaseBusiness,
} from "lucide-react";
import "./MyProfile.css";

// API CONFIGURATION
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

const PROFILE_ENDPOINT = `${API_BASE_URL}/api/profiles/client/me`;

const readResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

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

// GET SAVED USER
const getSavedUser = () => {
  try {
    const savedUser =
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser");

    return savedUser ? JSON.parse(savedUser) : {};
  } catch (error) {
    console.error("Could not load user:", error);
    return {};
  }
};

// GET JWT TOKEN
const getToken = () => {
  return (
    localStorage.getItem("ethioLanceToken") ||
    sessionStorage.getItem("ethioLanceToken")
  );
};

export default function MyProfile() {
  const [profile, setProfile] = useState(defaultProfile);
  const [formData, setFormData] = useState(defaultProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileExists, setProfileExists] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // LOAD CLIENT PROFILE FROM BACKEND
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);

      try {
        const user = getSavedUser();
        const token = getToken();

        if (!token) {
          throw new Error("Authentication token not found. Please log in again.");
        }

        if (user.role && user.role !== "CLIENT") {
          throw new Error("This profile is only available to client accounts.");
        }

        const response = await fetch(PROFILE_ENDPOINT, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await readResponse(response);

        if (!response.ok && response.status !== 404) {
          throw new Error(
            data.message || "Failed to load your client profile."
          );
        }

        // ACCOUNT INFORMATION COMES FROM THE USER
        // COMPANY INFORMATION COMES FROM CLIENT PROFILE
        const initialProfile = {
          ...defaultProfile,

          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",

          companyName: data.profile?.companyName || "",
          location: data.profile?.location || "",
          website: data.profile?.website || "",
          bio: data.profile?.bio || "",
        };

        if (cancelled) return;

        setProfile(initialProfile);
        setFormData(initialProfile);
        setProfileExists(response.ok && Boolean(data.profile));
      } catch (error) {
        console.error("LOAD CLIENT PROFILE ERROR:", error);

        if (!cancelled) {
          setMessage(error.message || "Unable to load your profile.");
          setMessageType("error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  // INPUT CHANGE
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE PROFILE TO BACKEND
  const handleSave = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const token = getToken();

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      setMessageType("error");
      return;
    }

    const updatedProfile = {
      ...formData,
      companyName: formData.companyName.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
      bio: formData.bio.trim(),
    };

    // Only send fields supported by your clientProfile model.
    const payload = {
      companyName: updatedProfile.companyName,
      location: updatedProfile.location,
      website: updatedProfile.website,
      bio: updatedProfile.bio,
    };

    try {
      setIsSaving(true);

      const response = await fetch(PROFILE_ENDPOINT, {
        method: profileExists ? "PUT" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save your profile."
        );
      }

      const savedProfile = {
        ...updatedProfile,
        companyName: data.profile?.companyName ?? payload.companyName,
        location: data.profile?.location ?? payload.location,
        website: data.profile?.website ?? payload.website,
        bio: data.profile?.bio ?? payload.bio,
      };

      setProfile(savedProfile);
      setFormData(savedProfile);
      setProfileExists(true);
      setIsEditing(false);

      setMessage("Your profile has been saved successfully.");
      setMessageType("success");
    } catch (error) {
      console.error("SAVE CLIENT PROFILE ERROR:", error);

      setMessage(error.message || "Unable to save your profile.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  // CANCEL EDITING
  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
    setMessage("");
  };

  // DISPLAY INFORMATION
  const fullName =
    `${profile.firstName} ${profile.lastName}`.trim() || "Your Name";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (isLoading) {
    return (
      <div className="ethio-client-profile">
        <div className="ethio-profile-message">
          Loading your profile...
        </div>
      </div>
    );
  }

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
            type="button"
            className="ethio-profile-edit-btn"
            onClick={() => {
              setFormData(profile);
              setIsEditing(true);
              setMessage("");
            }}
          >
            <Pencil size={17} />
            Edit Profile
          </button>
        )}
      </div>

      {message && (
        <div
          className={`ethio-profile-message ${messageType}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <div className="ethio-profile-layout">
        {/* PROFILE SUMMARY */}
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

        {/* PROFILE DETAILS */}
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
              {/* ACCOUNT INFORMATION - READ ONLY */}
              <div className="ethio-profile-field">
                <label htmlFor="firstName">First Name</label>

                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  disabled
                  placeholder="First name"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="lastName">Last Name</label>

                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  disabled
                  placeholder="Last name"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="example@email.com"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  disabled
                  placeholder="Phone number"
                />
              </div>

              {/* DATABASE PROFILE INFORMATION */}
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
                  disabled={isSaving}
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ethio-profile-save-btn"
                  disabled={isSaving}
                >
                  <Save size={17} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}
