
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Edit3,
  Plus,
  X,
  Check,
  Mail,
  GraduationCap,
  Award,
  Code2,
  UserRound,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Save,
  LoaderCircle,
  AlertCircle,
  CalendarDays,
  DollarSign,
  Clock3,
} from "lucide-react";

import "./MyProfile.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PROFILE_ENDPOINT = `${API_BASE_URL}/api/profiles/freelancer/me`;

const EMPTY_PROFILE = {
  id: null,
  name: "Your Name",
  email: "",
  title: "",
  bio: "",
  location: "",
  hourlyRate: "",
  profileImageUrl: "",
  skills: [],
  experienceHistory: [],
  educations: [],
  certifications: [],
  portfolio: [],
};

const createTemporaryId = () =>
  `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getStoredUser = () => {
  try {
    return JSON.parse(
      localStorage.getItem("ethioLanceUser") ||
        sessionStorage.getItem("ethioLanceUser") ||
        "{}"
    );
  } catch {
    return {};
  }
};

const getToken = () =>
  localStorage.getItem("ethioLanceToken") ||
  sessionStorage.getItem("ethioLanceToken") ||
  "";

const getUserName = (user) => {
  if (user.name) return user.name;

  return [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ") || "Your Name";
};

const getDateInput = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("en", {
    month: "short",
    year: "numeric",
  });
};

const safeUrl = (value) => {
  if (!value) return "";

  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "";
  } catch {
    return "";
  }
};

const isDatabaseId = (id) =>
  id !== null &&
  id !== undefined &&
  /^\d+$/.test(String(id));

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || fallback;

const request = async (url, token, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";

  let data = {};

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `Server returned ${response.status}. Check that the API URL and route are correct.`
      );
    }

    throw new Error("The server returned an unexpected response.");
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data, `Request failed (${response.status})`)
    );
  }

  return data;
};

/* -------------------------------------------------------
   BACKEND DATA MAPPING
------------------------------------------------------- */

const mapBackendProfile = (data, user) => ({
  id: data.id ?? null,

  name: getUserName(user),
  email: user.email || "",

  title: data.headline || "",
  bio: data.bio || "",
  location: data.location || "",
  hourlyRate: data.hourlyRate ?? "",

  profileImageUrl: data.profileImageUrl || "",

  skills: Array.isArray(data.skills) ? data.skills : [],

  experienceHistory: (data.experiences || []).map((item) => ({
    id: item.id,
    jobTitle: item.jobTitle || "",
    company: item.company || "",
    location: item.location || "",
    description: item.description || "",
    startDate: getDateInput(item.startDate),
    endDate: getDateInput(item.endDate),
    isCurrent: Boolean(item.isCurrent),
  })),

  educations: (data.educations || []).map((item) => ({
    id: item.id,
    institution: item.institution || "",
    degree: item.degree || "",
    fieldOfStudy: item.fieldOfStudy || "",
    startDate: getDateInput(item.startDate),
    endDate: getDateInput(item.endDate),
    description: item.description || "",
  })),

  certifications: (data.certifications || []).map((item) => ({
    id: item.id,
    name: item.name || "",
    issuingOrganization: item.issuingOrganization || "",
    issueDate: getDateInput(item.issueDate),
    expiryDate: getDateInput(item.expiryDate),
    credentialId: item.credentialId || "",
    credentialUrl: item.credentialUrl || "",
  })),

  portfolio: (data.portfolioItems || []).map((item) => ({
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    projectUrl: item.projectUrl || "",
    imageUrl: item.imageUrl || "",
    technologies: Array.isArray(item.technologies)
      ? item.technologies.join(", ")
      : item.technologies || "",
  })),
});

const getProfileCompletion = (profile) => {
  const checks = [
    Boolean(profile.title),
    Boolean(profile.bio),
    Boolean(profile.location),
    Boolean(profile.hourlyRate),
    profile.skills.length > 0,
    profile.experienceHistory.length > 0,
    profile.educations.length > 0,
    profile.certifications.length > 0,
    profile.portfolio.length > 0,
  ];

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );
};

/* -------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------- */

function MyProfile() {
  const user = useMemo(() => getStoredUser(), []);

  const [profile, setProfile] = useState({
    ...EMPTY_PROFILE,
    name: getUserName(user),
    email: user.email || "",
  });

  const [draft, setDraft] = useState(profile);

  const [editing, setEditing] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);

  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const completion = getProfileCompletion(profile);

  /* -----------------------------------------------------
     LOAD PROFILE
  ----------------------------------------------------- */

  const loadBackendProfile = useCallback(async (showLoading = true) => {
    const token = getToken();

    if (!token) {
      setErrorMessage(
        "Your login session was not found. Please log in again to load your profile."
      );
      setLoading(false);
      return;
    }

    if (showLoading) setLoading(true);

    try {
      const data = await request(PROFILE_ENDPOINT, token);

      if (!data.profile) {
        throw new Error("The server did not return a freelancer profile.");
      }

      const mapped = mapBackendProfile(data.profile, user);

      setProfile(mapped);
      setDraft(mapped);
      setProfileExists(true);
      setErrorMessage("");
    } catch (error) {
      // A 404 means the freelancer has not created a profile yet.
      if (error.message?.toLowerCase().includes("not found")) {
        const empty = {
          ...EMPTY_PROFILE,
          name: getUserName(user),
          email: user.email || "",
        };

        setProfile(empty);
        setDraft(empty);
        setProfileExists(false);
        setErrorMessage("");
      } else {
        setErrorMessage(error.message || "Unable to load your profile.");
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBackendProfile();
  }, [loadBackendProfile]);

  /* -----------------------------------------------------
     EDITING HELPERS
  ----------------------------------------------------- */

  const updateDraft = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const openEditor = () => {
    setDraft({
      ...profile,
      skills: [...profile.skills],
      experienceHistory: profile.experienceHistory.map((item) => ({
        ...item,
      })),
      educations: profile.educations.map((item) => ({
        ...item,
      })),
      certifications: profile.certifications.map((item) => ({
        ...item,
      })),
      portfolio: profile.portfolio.map((item) => ({
        ...item,
      })),
    });

    setEditing(true);
    setErrorMessage("");
    setStatusMessage("");
  };

  const closeEditor = () => {
    setDraft(profile);
    setEditing(false);
    setSkillInput("");
  };

  /* -----------------------------------------------------
     SKILLS
  ----------------------------------------------------- */

  const addSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    if (
      draft.skills.some(
        (skill) => skill.toLowerCase() === value.toLowerCase()
      )
    ) {
      return;
    }

    updateDraft("skills", [...draft.skills, value]);
    setSkillInput("");
  };

  const removeSkill = (skill) => {
    updateDraft(
      "skills",
      draft.skills.filter((item) => item !== skill)
    );
  };

  /* -----------------------------------------------------
     EXPERIENCE
  ----------------------------------------------------- */

  const addExperience = () => {
    updateDraft("experienceHistory", [
      ...draft.experienceHistory,
      {
        id: createTemporaryId(),
        jobTitle: "",
        company: "",
        location: "",
        description: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
      },
    ]);
  };

  const updateExperience = (id, field, value) => {
    updateDraft(
      "experienceHistory",
      draft.experienceHistory.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeExperience = (id) => {
    updateDraft(
      "experienceHistory",
      draft.experienceHistory.filter((item) => item.id !== id)
    );
  };

  /* -----------------------------------------------------
     EDUCATION
  ----------------------------------------------------- */

  const addEducation = () => {
    updateDraft("educations", [
      ...draft.educations,
      {
        id: createTemporaryId(),
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const updateEducation = (id, field, value) => {
    updateDraft(
      "educations",
      draft.educations.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeEducation = (id) => {
    updateDraft(
      "educations",
      draft.educations.filter((item) => item.id !== id)
    );
  };

  /* -----------------------------------------------------
     CERTIFICATIONS
  ----------------------------------------------------- */

  const addCertification = () => {
    updateDraft("certifications", [
      ...draft.certifications,
      {
        id: createTemporaryId(),
        name: "",
        issuingOrganization: "",
        issueDate: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      },
    ]);
  };

  const updateCertification = (id, field, value) => {
    updateDraft(
      "certifications",
      draft.certifications.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeCertification = (id) => {
    updateDraft(
      "certifications",
      draft.certifications.filter((item) => item.id !== id)
    );
  };

  /* -----------------------------------------------------
     PORTFOLIO
  ----------------------------------------------------- */

  const addProject = () => {
    updateDraft("portfolio", [
      ...draft.portfolio,
      {
        id: createTemporaryId(),
        title: "",
        description: "",
        projectUrl: "",
        imageUrl: "",
        technologies: "",
      },
    ]);
  };

  const updateProject = (id, field, value) => {
    updateDraft(
      "portfolio",
      draft.portfolio.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const removeProject = (id) => {
    updateDraft(
      "portfolio",
      draft.portfolio.filter((item) => item.id !== id)
    );
  };

  /* -----------------------------------------------------
     SAVE REPEATED RECORDS
  ----------------------------------------------------- */

  const saveCollection = async ({
    endpoint,
    originalItems,
    draftItems,
    mapPayload,
  }) => {
    const token = getToken();

    const originalIds = new Set(
      originalItems
        .filter((item) => isDatabaseId(item.id))
        .map((item) => String(item.id))
    );

    const draftIds = new Set(
      draftItems
        .filter((item) => isDatabaseId(item.id))
        .map((item) => String(item.id))
    );

    // Update existing records and create new records.
    for (const item of draftItems) {
      const payload = mapPayload(item);

      if (isDatabaseId(item.id)) {
        await request(
          `${API_BASE_URL}/api/profiles/freelancer/${endpoint}/${item.id}`,
          token,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          }
        );
      } else {
        await request(
          `${API_BASE_URL}/api/profiles/freelancer/${endpoint}`,
          token,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
      }
    }

    // Delete records removed by the user.
    for (const id of originalIds) {
      if (!draftIds.has(id)) {
        await request(
          `${API_BASE_URL}/api/profiles/freelancer/${endpoint}/${id}`,
          token,
          {
            method: "DELETE",
          }
        );
      }
    }
  };

  /* -----------------------------------------------------
     SAVE EVERYTHING
  ----------------------------------------------------- */

  const saveProfile = async (event) => {
    event.preventDefault();

    const token = getToken();

    if (!token) {
      setErrorMessage("Your login session has expired. Please log in again.");
      return;
    }

    if (!draft.title.trim()) {
      setErrorMessage("Please enter your professional title.");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const profilePayload = {
        headline: draft.title.trim(),
        bio: draft.bio.trim(),
        location: draft.location.trim(),
        skills: draft.skills,
      };

      if (draft.hourlyRate !== "") {
        profilePayload.hourlyRate = Number(draft.hourlyRate);
      }

      // Create or update the main freelancer profile.
      await request(PROFILE_ENDPOINT, token, {
        method: profileExists ? "PUT" : "POST",
        body: JSON.stringify(profilePayload),
      });

      // Save work experience.
      await saveCollection({
        endpoint: "experiences",
        originalItems: profile.experienceHistory,
        draftItems: draft.experienceHistory,
        mapPayload: (item) => ({
          jobTitle: item.jobTitle,
          company: item.company,
          location: item.location,
          description: item.description,
          startDate: item.startDate || null,
          endDate: item.isCurrent ? null : item.endDate || null,
          isCurrent: item.isCurrent,
        }),
      });

      // Save education.
      await saveCollection({
        endpoint: "educations",
        originalItems: profile.educations,
        draftItems: draft.educations,
        mapPayload: (item) => ({
          institution: item.institution,
          degree: item.degree,
          fieldOfStudy: item.fieldOfStudy,
          startDate: item.startDate || null,
          endDate: item.endDate || null,
          description: item.description,
        }),
      });

      // Save certifications.
      await saveCollection({
        endpoint: "certifications",
        originalItems: profile.certifications,
        draftItems: draft.certifications,
        mapPayload: (item) => ({
          name: item.name,
          issuingOrganization: item.issuingOrganization,
          issueDate: item.issueDate || null,
          expiryDate: item.expiryDate || null,
          credentialId: item.credentialId,
          credentialUrl: item.credentialUrl,
        }),
      });

      // Save portfolio projects.
      await saveCollection({
        endpoint: "portfolio",
        originalItems: profile.portfolio,
        draftItems: draft.portfolio,
        mapPayload: (item) => ({
          title: item.title,
          description: item.description,
          projectUrl: item.projectUrl,
          imageUrl: item.imageUrl,
          technologies: item.technologies
            .split(",")
            .map((technology) => technology.trim())
            .filter(Boolean),
        }),
      });

      setProfileExists(true);
      setEditing(false);
      setSkillInput("");

      // Reload from the database to get real IDs and saved values.
      await loadBackendProfile(false);

      setStatusMessage("Your freelancer profile has been saved successfully.");
    } catch (error) {
      console.error("SAVE PROFILE ERROR:", error);

      setErrorMessage(
        error.message ||
          "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  /* -----------------------------------------------------
     LOADING STATE
  ----------------------------------------------------- */

  if (loading) {
    return (
      <div className="ethio-profile-page">
        <div className="ethio-profile-loading">
          <LoaderCircle className="ethio-profile-spinner" size={32} />
          <p>Loading your freelancer profile...</p>
        </div>
      </div>
    );
  }

  /* -----------------------------------------------------
     MAIN PAGE
  ----------------------------------------------------- */

  return (
    <div className="ethio-profile-page">
      {/* PAGE HEADER */}
      <div className="ethio-profile-page-header">
        <div>
          <span className="ethio-profile-eyebrow">
            FREELANCER ACCOUNT
          </span>

          <h1>My Profile</h1>

          <p>
            Manage your professional identity and showcase your skills.
          </p>
        </div>

        <button
          type="button"
          className="ethio-profile-edit-button"
          onClick={openEditor}
        >
          <Edit3 size={17} />
          {profileExists ? "Edit Profile" : "Create Profile"}
        </button>
      </div>

      {/* FEEDBACK */}
      {statusMessage && (
        <div className="ethio-profile-status-message">
          <Check size={17} />
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="ethio-profile-error-message">
          <AlertCircle size={17} />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* PROFILE HERO */}
      <section className="ethio-profile-hero">
        <div className="ethio-profile-avatar-wrapper">
          {safeUrl(profile.profileImageUrl) ? (
            <img
              src={safeUrl(profile.profileImageUrl)}
              alt="Profile"
              className="ethio-profile-avatar"
            />
          ) : (
            <div className="ethio-profile-avatar-placeholder">
              <UserRound size={42} />
            </div>
          )}
        </div>

        <div className="ethio-profile-hero-info">
          <div className="ethio-profile-name-row">
            <h2>{profile.name}</h2>

            <span className="ethio-profile-account-badge">
              <ShieldCheck size={15} />
              Freelancer
            </span>
          </div>

          <p className="ethio-profile-profession">
            {profile.title || "Add your professional title"}
          </p>

          <div className="ethio-profile-meta">
            {profile.location && (
              <span>
                <MapPin size={15} />
                {profile.location}
              </span>
            )}

            <span>
              <BriefcaseBusiness size={15} />
              {profile.experienceHistory.length} work experience record(s)
            </span>
          </div>
        </div>

        <div className="ethio-profile-hero-rate">
          <span>Hourly Rate</span>
          <strong>
            {profile.hourlyRate !== ""
              ? `ETB ${Number(profile.hourlyRate).toLocaleString()}`
              : "Not set"}
          </strong>
          <small>per hour</small>
        </div>
      </section>

      {/* PROFILE COMPLETION */}
      <section className="ethio-profile-completion-card">
        <div className="ethio-profile-completion-top">
          <div>
            <h3>Profile Completion</h3>
            <p>
              Complete your profile to make a stronger impression on clients.
            </p>
          </div>

          <strong>{completion}%</strong>
        </div>

        <div className="ethio-profile-progress-track">
          <div
            className="ethio-profile-progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>

        <button
          type="button"
          className="ethio-profile-completion-action"
          onClick={openEditor}
        >
          Complete your profile <span>→</span>
        </button>
      </section>

      {/* CONTENT GRID */}
      <div className="ethio-profile-content-grid">
        <main className="ethio-profile-main-column">
          {/* ABOUT */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>About Me</h3>
            </div>

            <p className="ethio-profile-about-text">
              {profile.bio ||
                "You haven't added a professional introduction yet. Tell clients about your experience, strengths, and the value you provide."}
            </p>
          </section>

          {/* SKILLS */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Skills & Expertise</h3>
              <Code2 size={19} />
            </div>

            {profile.skills.length > 0 ? (
              <div className="ethio-profile-skills-list">
                {profile.skills.map((skill, index) => (
                  <span
                    className="ethio-profile-skill"
                    key={`${skill}-${index}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="ethio-profile-empty-text">
                No skills added yet.
              </p>
            )}
          </section>

          {/* EXPERIENCE */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Work Experience</h3>
              <BriefcaseBusiness size={19} />
            </div>

            {profile.experienceHistory.length > 0 ? (
              <div className="ethio-profile-timeline">
                {profile.experienceHistory.map((item) => (
                  <div
                    className="ethio-profile-timeline-item"
                    key={item.id}
                  >
                    <div className="ethio-profile-timeline-icon">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div>
                      <h4>{item.jobTitle}</h4>
                      <strong>{item.company}</strong>

                      <span>
                        {formatDate(item.startDate)}
                        {item.startDate ? " – " : ""}
                        {item.isCurrent
                          ? "Present"
                          : formatDate(item.endDate)}
                      </span>

                      {item.location && <span>{item.location}</span>}

                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ethio-profile-empty-text">
                No work experience added yet.
              </p>
            )}
          </section>

          {/* EDUCATION */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Education</h3>
              <GraduationCap size={19} />
            </div>

            {profile.educations.length > 0 ? (
              <div className="ethio-profile-timeline">
                {profile.educations.map((item) => (
                  <div
                    className="ethio-profile-timeline-item"
                    key={item.id}
                  >
                    <div className="ethio-profile-timeline-icon">
                      <GraduationCap size={17} />
                    </div>

                    <div>
                      <h4>{item.degree}</h4>
                      <strong>{item.institution}</strong>

                      {item.fieldOfStudy && (
                        <span>{item.fieldOfStudy}</span>
                      )}

                      <span>
                        {formatDate(item.startDate)}
                        {item.startDate ? " – " : ""}
                        {formatDate(item.endDate)}
                      </span>

                      {item.description && <p>{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ethio-profile-empty-text">
                No education records added yet.
              </p>
            )}
          </section>

          {/* PORTFOLIO */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Portfolio Projects</h3>
              <FolderOpen size={19} />
            </div>

            {profile.portfolio.length > 0 ? (
              <div className="ethio-profile-project-list">
                {profile.portfolio.map((project) => (
                  <article
                    className="ethio-profile-project-card"
                    key={project.id}
                  >
                    {safeUrl(project.imageUrl) && (
                      <img
                        src={safeUrl(project.imageUrl)}
                        alt={project.title}
                        className="ethio-profile-project-image"
                      />
                    )}

                    <h4>{project.title}</h4>
                    <p>{project.description}</p>

                    {project.technologies && (
                      <span className="ethio-profile-project-tech">
                        {project.technologies}
                      </span>
                    )}

                    {safeUrl(project.projectUrl) && (
                      <a
                        href={safeUrl(project.projectUrl)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Project <ExternalLink size={14} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="ethio-profile-empty-text">
                Add projects to demonstrate your work to potential clients.
              </p>
            )}
          </section>
        </main>

        {/* RIGHT COLUMN */}
        <aside className="ethio-profile-side-column">
          <section className="ethio-profile-card">
            <h3>Professional Details</h3>

            <div className="ethio-profile-detail-list">
              <div>
                <DollarSign size={18} />
                <span>
                  <small>Hourly Rate</small>
                  <strong>
                    {profile.hourlyRate !== ""
                      ? `ETB ${profile.hourlyRate}`
                      : "Not set"}
                  </strong>
                </span>
              </div>

              <div>
                <BriefcaseBusiness size={18} />
                <span>
                  <small>Experience Records</small>
                  <strong>{profile.experienceHistory.length}</strong>
                </span>
              </div>

              <div>
                <Mail size={18} />
                <span>
                  <small>Email</small>
                  <strong>{profile.email || "Not available"}</strong>
                </span>
              </div>

              {profile.location && (
                <div>
                  <MapPin size={18} />
                  <span>
                    <small>Location</small>
                    <strong>{profile.location}</strong>
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* CERTIFICATIONS */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Certifications</h3>
              <Award size={19} />
            </div>

            {profile.certifications.length > 0 ? (
              <div className="ethio-profile-certification-list">
                {profile.certifications.map((cert) => (
                  <div
                    className="ethio-profile-certification-item"
                    key={cert.id}
                  >
                    <Award size={17} />

                    <div>
                      <strong>{cert.name}</strong>
                      <span>{cert.issuingOrganization}</span>

                      {cert.issueDate && (
                        <span>
                          Issued {formatDate(cert.issueDate)}
                        </span>
                      )}

                      {safeUrl(cert.credentialUrl) && (
                        <a
                          href={safeUrl(cert.credentialUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View Credential
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="ethio-profile-empty-text">
                No certifications added yet.
              </p>
            )}
          </section>

          <section className="ethio-profile-card ethio-profile-rating-card">
            <h3>Client Rating</h3>
            <strong>Not rated yet</strong>
            <p>
              Your rating will appear after completed client projects.
            </p>
          </section>
        </aside>
      </div>

      {/* EDIT PROFILE MODAL */}
      {editing && (
        <div
          className="ethio-profile-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeEditor();
            }
          }}
        >
          <div
            className="ethio-profile-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ethio-profile-editor-title"
          >
            <div className="ethio-profile-modal-header">
              <div>
                <span className="ethio-profile-eyebrow">
                  PROFILE SETTINGS
                </span>

                <h2 id="ethio-profile-editor-title">
                  {profileExists ? "Edit Your Profile" : "Create Your Profile"}
                </h2>

                <p>
                  Update your professional information and experience.
                </p>
              </div>

              <button
                type="button"
                className="ethio-profile-close-button"
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close editor"
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="ethio-profile-editor-form"
              onSubmit={saveProfile}
            >
              <div className="ethio-profile-editor-body">
                {/* BASIC INFORMATION */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <UserRound size={19} />
                    <div>
                      <h3>Professional Information</h3>
                      <p>Your basic professional identity.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-form-grid">
                    <label className="ethio-profile-field">
                      Full Name
                      <input
                        value={draft.name}
                        disabled
                        readOnly
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Email Address
                      <input
                        type="email"
                        value={draft.email}
                        disabled
                        readOnly
                      />
                    </label>

                    <label className="ethio-profile-field ethio-profile-field-full">
                      Professional Title *
                      <input
                        value={draft.title}
                        onChange={(event) =>
                          updateDraft("title", event.target.value)
                        }
                        placeholder="e.g. Full Stack Developer"
                        required
                      />
                    </label>

                    <label className="ethio-profile-field ethio-profile-field-full">
                      Location
                      <input
                        value={draft.location}
                        onChange={(event) =>
                          updateDraft("location", event.target.value)
                        }
                        placeholder="e.g. Addis Ababa, Ethiopia"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Hourly Rate (ETB)
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.hourlyRate}
                        onChange={(event) =>
                          updateDraft("hourlyRate", event.target.value)
                        }
                        placeholder="500"
                      />
                    </label>

                    <label className="ethio-profile-field ethio-profile-field-full">
                      Professional Bio
                      <textarea
                        rows={5}
                        value={draft.bio}
                        onChange={(event) =>
                          updateDraft("bio", event.target.value)
                        }
                        placeholder="Describe your experience, strengths, and what you can offer clients..."
                      />
                    </label>
                  </div>
                </section>

                {/* SKILLS */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <Code2 size={19} />
                    <div>
                      <h3>Skills & Expertise</h3>
                      <p>Add the skills you use in your work.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-skill-input-row">
                    <input
                      value={skillInput}
                      onChange={(event) =>
                        setSkillInput(event.target.value)
                      }
                      placeholder="Enter a skill, e.g. React"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addSkill();
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={addSkill}
                      className="ethio-profile-add-button"
                    >
                      <Plus size={17} />
                      Add Skill
                    </button>
                  </div>

                  <div className="ethio-profile-skills-list">
                    {draft.skills.map((skill, index) => (
                      <span
                        className="ethio-profile-skill ethio-profile-editable-skill"
                        key={`${skill}-${index}`}
                      >
                        {skill}

                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          aria-label={`Remove ${skill}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </section>

                {/* EXPERIENCE */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-title-with-action">
                    <div className="ethio-profile-editor-section-title">
                      <BriefcaseBusiness size={19} />
                      <div>
                        <h3>Work Experience</h3>
                        <p>Show clients where you have worked.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ethio-profile-add-button"
                      onClick={addExperience}
                    >
                      <Plus size={16} />
                      Add Experience
                    </button>
                  </div>

                  {draft.experienceHistory.map((item) => (
                    <div
                      className="ethio-profile-repeat-card"
                      key={item.id}
                    >
                      <button
                        type="button"
                        className="ethio-profile-remove-button"
                        onClick={() => removeExperience(item.id)}
                        aria-label="Remove experience"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="ethio-profile-form-grid">
                        <label className="ethio-profile-field">
                          Job Title
                          <input
                            value={item.jobTitle}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "jobTitle",
                                event.target.value
                              )
                            }
                            placeholder="e.g. Frontend Developer"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Company
                          <input
                            value={item.company}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "company",
                                event.target.value
                              )
                            }
                            placeholder="Company name"
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Location
                          <input
                            value={item.location}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "location",
                                event.target.value
                              )
                            }
                            placeholder="City or remote"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Start Date
                          <input
                            type="date"
                            value={item.startDate}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "startDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-field">
                          End Date
                          <input
                            type="date"
                            value={item.endDate}
                            disabled={item.isCurrent}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "endDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-checkbox-field ethio-profile-field-full">
                          <input
                            type="checkbox"
                            checked={item.isCurrent}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "isCurrent",
                                event.target.checked
                              )
                            }
                          />
                          I currently work here
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Description
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(event) =>
                              updateExperience(
                                item.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Describe your responsibilities and achievements..."
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>

                {/* EDUCATION */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-title-with-action">
                    <div className="ethio-profile-editor-section-title">
                      <GraduationCap size={19} />
                      <div>
                        <h3>Education</h3>
                        <p>Your academic background.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ethio-profile-add-button"
                      onClick={addEducation}
                    >
                      <Plus size={16} />
                      Add Education
                    </button>
                  </div>

                  {draft.educations.map((item) => (
                    <div
                      className="ethio-profile-repeat-card"
                      key={item.id}
                    >
                      <button
                        type="button"
                        className="ethio-profile-remove-button"
                        onClick={() => removeEducation(item.id)}
                        aria-label="Remove education"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="ethio-profile-form-grid">
                        <label className="ethio-profile-field">
                          Degree / Qualification
                          <input
                            value={item.degree}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "degree",
                                event.target.value
                              )
                            }
                            placeholder="Bachelor's Degree"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Institution
                          <input
                            value={item.institution}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "institution",
                                event.target.value
                              )
                            }
                            placeholder="University or institution"
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Field of Study
                          <input
                            value={item.fieldOfStudy}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "fieldOfStudy",
                                event.target.value
                              )
                            }
                            placeholder="Software Engineering"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Start Date
                          <input
                            type="date"
                            value={item.startDate}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "startDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-field">
                          End Date
                          <input
                            type="date"
                            value={item.endDate}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "endDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Description
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(event) =>
                              updateEducation(
                                item.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Additional details about your education..."
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>

                {/* CERTIFICATIONS */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-title-with-action">
                    <div className="ethio-profile-editor-section-title">
                      <Award size={19} />
                      <div>
                        <h3>Certifications</h3>
                        <p>List relevant certificates and qualifications.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ethio-profile-add-button"
                      onClick={addCertification}
                    >
                      <Plus size={16} />
                      Add Certificate
                    </button>
                  </div>

                  {draft.certifications.map((cert) => (
                    <div
                      className="ethio-profile-repeat-card"
                      key={cert.id}
                    >
                      <button
                        type="button"
                        className="ethio-profile-remove-button"
                        onClick={() => removeCertification(cert.id)}
                        aria-label="Remove certification"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="ethio-profile-form-grid">
                        <label className="ethio-profile-field">
                          Certificate Name
                          <input
                            value={cert.name}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder="Certificate name"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Issuing Organization
                          <input
                            value={cert.issuingOrganization}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "issuingOrganization",
                                event.target.value
                              )
                            }
                            placeholder="Organization"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Issue Date
                          <input
                            type="date"
                            value={cert.issueDate}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "issueDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Expiry Date
                          <input
                            type="date"
                            value={cert.expiryDate}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "expiryDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Credential ID
                          <input
                            value={cert.credentialId}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "credentialId",
                                event.target.value
                              )
                            }
                            placeholder="Certificate ID"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Credential URL
                          <input
                            type="url"
                            value={cert.credentialUrl}
                            onChange={(event) =>
                              updateCertification(
                                cert.id,
                                "credentialUrl",
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>

                {/* PORTFOLIO */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-title-with-action">
                    <div className="ethio-profile-editor-section-title">
                      <FolderOpen size={19} />
                      <div>
                        <h3>Portfolio Projects</h3>
                        <p>Showcase projects you have completed.</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="ethio-profile-add-button"
                      onClick={addProject}
                    >
                      <Plus size={16} />
                      Add Project
                    </button>
                  </div>

                  {draft.portfolio.map((project) => (
                    <div
                      className="ethio-profile-repeat-card"
                      key={project.id}
                    >
                      <button
                        type="button"
                        className="ethio-profile-remove-button"
                        onClick={() => removeProject(project.id)}
                        aria-label="Remove project"
                      >
                        <Trash2 size={16} />
                      </button>

                      <div className="ethio-profile-form-grid">
                        <label className="ethio-profile-field ethio-profile-field-full">
                          Project Title
                          <input
                            value={project.title}
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "title",
                                event.target.value
                              )
                            }
                            placeholder="Project name"
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Description
                          <textarea
                            rows={3}
                            value={project.description}
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "description",
                                event.target.value
                              )
                            }
                            placeholder="Describe what you built..."
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Technologies
                          <input
                            value={project.technologies}
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "technologies",
                                event.target.value
                              )
                            }
                            placeholder="React, Node.js, PostgreSQL"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Project URL
                          <input
                            type="url"
                            value={project.projectUrl}
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "projectUrl",
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Project Image URL
                          <input
                            type="url"
                            value={project.imageUrl}
                            onChange={(event) =>
                              updateProject(
                                project.id,
                                "imageUrl",
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </section>
              </div>

              {/* MODAL FOOTER */}
              <div className="ethio-profile-modal-footer">
                <button
                  type="button"
                  className="ethio-profile-cancel-button"
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ethio-profile-save-button"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <LoaderCircle
                        size={17}
                        className="ethio-profile-spinner"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
