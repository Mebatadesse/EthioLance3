
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserRound,
  Mail,
  MapPin,
  Building2,
  Globe,
  FileText,
  Save,
  BriefcaseBusiness,
  ArrowRight,
  SkipForward,
} from "lucide-react";

import "./CreateClientProfile.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/api\/?$/, "").replace(/\/$/, "");

const PROFILE_ENDPOINT = `${API_BASE_URL}/api/profiles/client/me`;

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

const readResponse = async (response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

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

const getToken = () =>
  localStorage.getItem("ethioLanceToken") ||
  sessionStorage.getItem("ethioLanceToken");

export default function CreateClientProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(defaultProfile);
  const [profileExists, setProfileExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // LOAD REGISTERED USER AND EXISTING CLIENT PROFILE
  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const user = getSavedUser();
        const token = getToken();

        if (!token) {
          throw new Error(
            "Authentication token not found. Please log in again."
          );
        }

        if (user.role && user.role !== "CLIENT") {
          throw new Error("This page is only available to client accounts.");
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

        const initialProfile = {
          ...defaultProfile,

          // Account information
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",

          // Client profile information
          companyName: data.profile?.companyName || "",
          location: data.profile?.location || "",
          website: data.profile?.website || "",
          bio: data.profile?.bio || "",
        };

        if (cancelled) return;

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

  // HANDLE INPUT CHANGES
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // SAVE CLIENT PROFILE
  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    const token = getToken();

    if (!token) {
      setMessage("Your session has expired. Please log in again.");
      setMessageType("error");
      return;
    }

    const payload = {
      companyName: formData.companyName.trim(),
      location: formData.location.trim(),
      website: formData.website.trim(),
      bio: formData.bio.trim(),
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
          data.message || "Failed to save your client profile."
        );
      }

      // Continue to the client dashboard after successful saving.
      navigate("/client-dashboard", { replace: true });
    } catch (error) {
      console.error("SAVE CLIENT PROFILE ERROR:", error);

      setMessage(error.message || "Unable to save your profile.");
      setMessageType("error");
    } finally {
      setIsSaving(false);
    }
  };

  // SKIP PROFILE CREATION
  const handleSkip = () => {
    navigate("/client-dashboard", { replace: true });
  };

  const fullName =
    `${formData.firstName} ${formData.lastName}`.trim() || "Your Name";

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
      {/* PAGE HEADER */}
      <div className="ethio-client-profile-header">
        <div>
          <span className="ethio-client-profile-eyebrow">
            CLIENT ACCOUNT SETUP
          </span>

          <h1>Create Your Client Profile</h1>

          <p>
            Tell freelancers about yourself or your company so they can
            understand your projects better.
          </p>
        </div>
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
        {/* ACCOUNT SUMMARY */}
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
            <span>{formData.email || "No email added"}</span>
          </div>

          <div className="ethio-profile-summary-item">
            <MapPin size={17} />
            <span>{formData.location || "Location not added"}</span>
          </div>

          <div className="ethio-profile-summary-item">
            <Building2 size={17} />
            <span>{formData.companyName || "Company not added"}</span>
          </div>

          <div className="ethio-profile-account-type">
            <span className="ethio-profile-status-dot" />
            Client Account
          </div>
        </section>

        {/* CLIENT PROFILE FORM */}
        <section className="ethio-profile-card ethio-profile-details">
          <div className="ethio-profile-section-heading">
            <div>
              <h2>Company & Contact Information</h2>
              <p>
                Complete your profile to help freelancers know who they
                will be working with.
              </p>
            </div>

            <UserRound size={22} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="ethio-profile-form-grid">
              {/* ACCOUNT INFORMATION - READ ONLY */}
              <div className="ethio-profile-field">
                <label htmlFor="firstName">First Name</label>

                <input
                  id="firstName"
                  value={formData.firstName}
                  disabled
                  placeholder="First name"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="lastName">Last Name</label>

                <input
                  id="lastName"
                  value={formData.lastName}
                  disabled
                  placeholder="Last name"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="email">Email Address</label>

                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  placeholder="Email address"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="phone">Phone Number</label>

                <input
                  id="phone"
                  value={formData.phone}
                  disabled
                  placeholder="Phone number"
                />
              </div>

              {/* CLIENT PROFILE INFORMATION */}
              <div className="ethio-profile-field">
                <label htmlFor="companyName">
                  <Building2 size={15} />
                  Company Name
                </label>

                <input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company name (optional)"
                />
              </div>

              <div className="ethio-profile-field">
                <label htmlFor="location">
                  <MapPin size={15} />
                  Location
                </label>

                <input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
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
                  placeholder="Tell freelancers about yourself, your company, or the type of projects you want to post..."
                  rows={5}
                />
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="ethio-profile-form-actions">
              <button
                type="button"
                className="ethio-profile-cancel-btn"
                onClick={handleSkip}
                disabled={isSaving}
              >
                <SkipForward size={17} />
                Skip for Now
              </button>

              <button
                type="submit"
                className="ethio-profile-save-btn"
                disabled={isSaving}
              >
                <Save size={17} />
                {isSaving ? "Saving..." : "Save & Continue"}
                {!isSaving && <ArrowRight size={17} />}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
