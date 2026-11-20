
import { useRef, useState } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Camera,
  Plus,
  X,
  Check,
  Mail,
  Globe,
  GraduationCap,
  Award,
  Code2,
  DollarSign,
  UserRound,
  Languages,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Save,
  Pencil,
  ChevronRight,
} from "lucide-react";
import "./MyProfile.css";

const defaultProfile = {
  name: "Your Name",
  title: "Full Stack Developer",
  location: "",
  bio: "",
  email: "",
  hourlyRate: "500",
  experience: "2",
  availability: "Available",
  languages: "Amharic, English",
  website: "",
  education: "",
  university: "",
  avatar: "",
  skills: [
    "React",
    "JavaScript",
    "Node.js",
    "Express.js",
    "PostgreSQL",
    "HTML & CSS",
  ],
  experienceHistory: [],
  certifications: [],
  portfolio: [],
};

const loadProfile = () => {
  try {
    const saved = JSON.parse(
      localStorage.getItem("ethioLanceProfile") || "{}"
    );

    const user = JSON.parse(
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser") ||
      "{}"
    );

    return {
      ...defaultProfile,
      ...saved,
      name: saved.name || user.name || defaultProfile.name,
      email: saved.email || user.email || defaultProfile.email,
      skills: Array.isArray(saved.skills)
        ? saved.skills
        : [...defaultProfile.skills],
      experienceHistory: Array.isArray(saved.experienceHistory)
        ? saved.experienceHistory
        : [],
      certifications: Array.isArray(saved.certifications)
        ? saved.certifications
        : [],
      portfolio: Array.isArray(saved.portfolio)
        ? saved.portfolio
        : [],
    };
  } catch (error) {
    console.error("Could not load profile:", error);
    return { ...defaultProfile };
  }
};

const safeUrl = (url) => {
  if (!url) return "";

  const trimmed = url.trim();

  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
};

const getCompletion = (profile) => {
  const checks = [
    Boolean(profile.name),
    Boolean(profile.title),
    Boolean(profile.location),
    Boolean(profile.bio),
    Boolean(profile.avatar),
    Boolean(profile.hourlyRate),
    Boolean(profile.education),
    Boolean(profile.university),
    profile.skills.length > 0,
    profile.experienceHistory.length > 0,
    profile.portfolio.length > 0,
    Boolean(profile.languages),
  ];

  return Math.round(
    (checks.filter(Boolean).length / checks.length) * 100
  );
};

function EditButton({ onClick, label = "Edit section" }) {
  return (
    <button
      type="button"
      className="ethio-profile-pencil-button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Pencil size={15} />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  full = false,
  rows,
  min,
}) {
  return (
    <label
      className={`ethio-profile-field ${
        full ? "ethio-profile-field-full" : ""
      }`}
    >
      <span>{label}</span>

      {rows ? (
        <textarea
          rows={rows}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          min={min}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function SectionActions({ onSave, onCancel }) {
  return (
    <div className="ethio-profile-inline-actions">
      <button
        type="button"
        className="ethio-profile-cancel-button"
        onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="button"
        className="ethio-profile-save-button"
        onClick={onSave}
      >
        <Save size={15} />
        Save Changes
      </button>
    </div>
  );
}

function MyProfile() {
  const [profile, setProfile] = useState(loadProfile);
  const [draft, setDraft] = useState(loadProfile);
  const [editingSection, setEditingSection] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [avatarError, setAvatarError] = useState("");

  const avatarInputRef = useRef(null);

  const completion = getCompletion(profile);

  const updateDraft = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const startEditing = (section) => {
    setDraft({ ...profile });
    setEditingSection(section);
    setStatusMessage("");
    setAvatarError("");
    setSkillInput("");
  };

  const cancelEditing = () => {
    setDraft({ ...profile });
    setEditingSection(null);
    setSkillInput("");
    setAvatarError("");
  };

  const saveSection = () => {
    try {
      localStorage.setItem(
        "ethioLanceProfile",
        JSON.stringify(draft)
      );

      setProfile({ ...draft });
      setEditingSection(null);
      setSkillInput("");
      setAvatarError("");
      setStatusMessage("Your changes have been saved successfully.");

      window.setTimeout(() => {
        setStatusMessage("");
      }, 3500);
    } catch (error) {
      console.error("Profile save error:", error);
      setStatusMessage(
        "Unable to save. Your profile image may be too large."
      );
    }
  };

  const handleAvatar = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Please select a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setAvatarError("Image size must be less than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      updateDraft("avatar", reader.result);
      setAvatarError("");
    };

    reader.onerror = () => {
      setAvatarError("Unable to read this image.");
    };

    reader.readAsDataURL(file);
  };

  // SKILLS
  const addSkill = () => {
    const skill = skillInput.trim();

    if (
      !skill ||
      draft.skills.some(
        (item) => item.toLowerCase() === skill.toLowerCase()
      )
    ) {
      return;
    }

    updateDraft("skills", [...draft.skills, skill]);
    setSkillInput("");
  };

  const removeSkill = (index) => {
    updateDraft(
      "skills",
      draft.skills.filter((_, i) => i !== index)
    );
  };

  // EXPERIENCE
  const addExperience = () => {
    updateDraft("experienceHistory", [
      ...draft.experienceHistory,
      {
        id: Date.now(),
        position: "",
        company: "",
        duration: "",
        description: "",
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

  // CERTIFICATIONS
  const addCertification = () => {
    updateDraft("certifications", [
      ...draft.certifications,
      {
        id: Date.now(),
        name: "",
        issuer: "",
        year: "",
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

  // PORTFOLIO
  const addProject = () => {
    updateDraft("portfolio", [
      ...draft.portfolio,
      {
        id: Date.now(),
        title: "",
        description: "",
        technologies: "",
        url: "",
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

  const isEditing = (section) => editingSection === section;

  const displayedProfile =
    editingSection ? draft : profile;

  return (
    <div className="ethio-profile-page">
      {/* HEADER */}
      <header className="ethio-profile-page-header">
        <div>
          <span className="ethio-profile-eyebrow">
            FREELANCER ACCOUNT
          </span>
          <h1>My Profile</h1>
          <p>
            Manage your professional identity and showcase your skills.
          </p>
        </div>
      </header>

      {statusMessage && (
        <div className="ethio-profile-status-message">
          <Check size={17} />
          {statusMessage}
        </div>
      )}

      <div className="ethio-profile-layout">
        {/* LEFT PROFILE SUMMARY */}
        <aside className="ethio-profile-left-column">
          <section className="ethio-profile-summary-card">
            <div className="ethio-profile-avatar-area">
              <div className="ethio-profile-avatar-wrapper">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Profile"
                    className="ethio-profile-avatar"
                  />
                ) : (
                  <div className="ethio-profile-avatar-placeholder">
                    <UserRound size={42} />
                  </div>
                )}
              </div>

              <EditButton
                label="Edit profile photo"
                onClick={() => startEditing("photo")}
              />
            </div>

            <h2>{profile.name}</h2>

            <p className="ethio-profile-summary-title">
              {profile.title || "Add your professional title"}
            </p>

            <span className="ethio-profile-account-badge">
              <ShieldCheck size={15} />
              Verified Freelancer
            </span>

            <div className="ethio-profile-summary-meta">
              {profile.location && (
                <span>
                  <MapPin size={15} />
                  {profile.location}
                </span>
              )}

              <span>
                <BriefcaseBusiness size={15} />
                {profile.experience || "0"} years experience
              </span>

              <span>
                <Clock3 size={15} />
                {profile.availability}
              </span>
            </div>

            <div className="ethio-profile-summary-rate">
              <small>HOURLY RATE</small>
              <strong>
                ETB {Number(profile.hourlyRate || 0).toLocaleString()}
              </strong>
              <span>per hour</span>
            </div>
          </section>

          {/* COMPLETENESS */}
          <section className="ethio-profile-completion-card">
            <div className="ethio-profile-completion-top">
              <div>
                <h3>Profile completeness</h3>
                <p>
                  Complete your profile to help clients understand your
                  expertise.
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

            <span className="ethio-profile-completion-hint">
              {completion === 100
                ? "Your profile is complete."
                : "Keep adding information to improve your profile."}
            </span>
          </section>

          {/* PROFESSIONAL DETAILS */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Professional Details</h3>
              {!isEditing("professional") && (
                <EditButton
                  onClick={() => startEditing("professional")}
                />
              )}
            </div>

            {isEditing("professional") ? (
              <div className="ethio-profile-edit-fields">
                <Field
                  label="Hourly Rate (ETB)"
                  type="number"
                  min="0"
                  value={draft.hourlyRate}
                  onChange={(v) => updateDraft("hourlyRate", v)}
                />
                <Field
                  label="Years of Experience"
                  type="number"
                  min="0"
                  value={draft.experience}
                  onChange={(v) => updateDraft("experience", v)}
                />

                <label className="ethio-profile-field">
                  <span>Availability</span>
                  <select
                    value={draft.availability}
                    onChange={(e) =>
                      updateDraft("availability", e.target.value)
                    }
                  >
                    <option>Available</option>
                    <option>Busy</option>
                    <option>Not Available</option>
                  </select>
                </label>

                <Field
                  label="Languages"
                  value={draft.languages}
                  onChange={(v) => updateDraft("languages", v)}
                  placeholder="Amharic, English"
                />
                <Field
                  label="Personal Website"
                  value={draft.website}
                  onChange={(v) => updateDraft("website", v)}
                  placeholder="https://yourwebsite.com"
                />

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : (
              <div className="ethio-profile-detail-list">
                <div>
                  <DollarSign size={17} />
                  <span>
                    <small>Hourly Rate</small>
                    <strong>
                      ETB {profile.hourlyRate || "Not set"}
                    </strong>
                  </span>
                </div>

                <div>
                  <BriefcaseBusiness size={17} />
                  <span>
                    <small>Experience</small>
                    <strong>{profile.experience || "Not set"} years</strong>
                  </span>
                </div>

                <div>
                  <Clock3 size={17} />
                  <span>
                    <small>Availability</small>
                    <strong>{profile.availability}</strong>
                  </span>
                </div>

                <div>
                  <Languages size={17} />
                  <span>
                    <small>Languages</small>
                    <strong>{profile.languages || "Not set"}</strong>
                  </span>
                </div>

                <div>
                  <Mail size={17} />
                  <span>
                    <small>Email</small>
                    <strong>{profile.email || "Not set"}</strong>
                  </span>
                </div>

                {safeUrl(profile.website) && (
                  <div>
                    <Globe size={17} />
                    <span>
                      <small>Website</small>
                      <a
                        href={safeUrl(profile.website)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Visit Website
                      </a>
                    </span>
                  </div>
                )}
              </div>
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

        {/* RIGHT MAIN CONTENT */}
        <main className="ethio-profile-main-column">
          {/* PHOTO EDITOR */}
          {isEditing("photo") && (
            <section className="ethio-profile-card">
              <div className="ethio-profile-section-heading">
                <h3>Update Profile Photo</h3>
                <EditButton onClick={cancelEditing} label="Close photo editor" />
              </div>

              <div className="ethio-profile-photo-editor">
                <div className="ethio-profile-avatar-wrapper">
                  {draft.avatar ? (
                    <img
                      src={draft.avatar}
                      alt="Profile preview"
                      className="ethio-profile-avatar"
                    />
                  ) : (
                    <div className="ethio-profile-avatar-placeholder">
                      <UserRound size={38} />
                    </div>
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    className="ethio-profile-upload-button"
                    onClick={() => avatarInputRef.current?.click()}
                  >
                    <Camera size={16} />
                    Choose Photo
                  </button>

                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    hidden
                    onChange={handleAvatar}
                  />

                  <p>JPG, PNG or WEBP. Maximum 1 MB.</p>

                  {avatarError && (
                    <span className="ethio-profile-error">
                      {avatarError}
                    </span>
                  )}
                </div>
              </div>

              <SectionActions
                onSave={saveSection}
                onCancel={cancelEditing}
              />
            </section>
          )}

          {/* PERSONAL INFORMATION */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <div>
                <h3>Personal Information</h3>
                <p className="ethio-profile-section-description">
                  Your professional identity and introduction.
                </p>
              </div>

              {!isEditing("personal") && (
                <EditButton
                  onClick={() => startEditing("personal")}
                />
              )}
            </div>

            {isEditing("personal") ? (
              <div className="ethio-profile-edit-fields">
                <div className="ethio-profile-form-grid">
                  <Field
                    label="Full Name"
                    value={draft.name}
                    onChange={(v) => updateDraft("name", v)}
                    placeholder="Your full name"
                  />
                  <Field
                    label="Professional Title"
                    value={draft.title}
                    onChange={(v) => updateDraft("title", v)}
                    placeholder="e.g. Full Stack Developer"
                  />
                  <Field
                    label="Email Address"
                    type="email"
                    value={draft.email}
                    onChange={(v) => updateDraft("email", v)}
                    placeholder="your@email.com"
                  />
                  <Field
                    label="Location"
                    value={draft.location}
                    onChange={(v) => updateDraft("location", v)}
                    placeholder="Add your location"
                  />
                  <Field
                    label="Professional Bio"
                    full
                    rows={5}
                    value={draft.bio}
                    onChange={(v) => updateDraft("bio", v)}
                    placeholder="Describe your experience, strengths, and what you can offer clients..."
                  />
                </div>

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : (
              <div className="ethio-profile-personal-details">
                <div>
                  <small>Full Name</small>
                  <strong>{profile.name || "Not added"}</strong>
                </div>
                <div>
                  <small>Professional Title</small>
                  <strong>{profile.title || "Not added"}</strong>
                </div>
                <div>
                  <small>Email Address</small>
                  <strong>{profile.email || "Not added"}</strong>
                </div>
                <div>
                  <small>Location</small>
                  <strong>{profile.location || "Not added"}</strong>
                </div>
              </div>
            )}
          </section>

          {/* ABOUT */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>About Me</h3>
              {!isEditing("about") && (
                <EditButton onClick={() => startEditing("about")} />
              )}
            </div>

            {isEditing("about") ? (
              <div className="ethio-profile-edit-fields">
                <Field
                  label="Professional Introduction"
                  full
                  rows={6}
                  value={draft.bio}
                  onChange={(v) => updateDraft("bio", v)}
                  placeholder="Tell clients about your background, experience, and strengths..."
                />
                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : (
              <p className="ethio-profile-about-text">
                {profile.bio ||
                  "You haven't added a professional introduction yet. Tell clients about your experience, strengths, and the value you provide."}
              </p>
            )}
          </section>

          {/* SKILLS */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <div>
                <h3>Skills & Expertise</h3>
                <p className="ethio-profile-section-description">
                  Highlight the technologies and skills you work with.
                </p>
              </div>

              {!isEditing("skills") && (
                <EditButton onClick={() => startEditing("skills")} />
              )}
            </div>

            {isEditing("skills") ? (
              <div className="ethio-profile-edit-fields">
                <div className="ethio-profile-skill-input-row">
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addSkill();
                      }
                    }}
                    placeholder="Enter a skill, e.g. React"
                  />

                  <button
                    type="button"
                    className="ethio-profile-add-button"
                    onClick={addSkill}
                  >
                    <Plus size={16} />
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
                        onClick={() => removeSkill(index)}
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : profile.skills.length ? (
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

          {/* EDUCATION */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Education</h3>
              {!isEditing("education") && (
                <EditButton
                  onClick={() => startEditing("education")}
                />
              )}
            </div>

            {isEditing("education") ? (
              <div className="ethio-profile-edit-fields">
                <div className="ethio-profile-form-grid">
                  <Field
                    label="Degree / Qualification"
                    value={draft.education}
                    onChange={(v) => updateDraft("education", v)}
                    placeholder="Bachelor's Degree in Software Engineering"
                  />
                  <Field
                    label="University / Institution"
                    value={draft.university}
                    onChange={(v) => updateDraft("university", v)}
                    placeholder="University name"
                  />
                </div>

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : (
              <div className="ethio-profile-education">
                <div className="ethio-profile-education-icon">
                  <GraduationCap size={21} />
                </div>
                <div>
                  <strong>
                    {profile.education || "Education not added"}
                  </strong>
                  <p>
                    {profile.university || "Add your institution"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* EXPERIENCE */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <div>
                <h3>Work Experience</h3>
                <p className="ethio-profile-section-description">
                  Your professional background and previous roles.
                </p>
              </div>

              {!isEditing("experience") && (
                <EditButton
                  onClick={() => startEditing("experience")}
                />
              )}
            </div>

            {isEditing("experience") ? (
              <div className="ethio-profile-edit-fields">
                <button
                  type="button"
                  className="ethio-profile-add-button"
                  onClick={addExperience}
                >
                  <Plus size={16} />
                  Add Experience
                </button>

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
                      <Field
                        label="Position"
                        value={item.position}
                        onChange={(v) =>
                          updateExperience(item.id, "position", v)
                        }
                        placeholder="Frontend Developer"
                      />
                      <Field
                        label="Company"
                        value={item.company}
                        onChange={(v) =>
                          updateExperience(item.id, "company", v)
                        }
                        placeholder="Company name"
                      />
                      <Field
                        label="Duration"
                        full
                        value={item.duration}
                        onChange={(v) =>
                          updateExperience(item.id, "duration", v)
                        }
                        placeholder="Jan 2024 - Present"
                      />
                      <Field
                        label="Description"
                        full
                        rows={3}
                        value={item.description}
                        onChange={(v) =>
                          updateExperience(item.id, "description", v)
                        }
                        placeholder="Describe your responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : profile.experienceHistory.length ? (
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
                      <h4>{item.position}</h4>
                      <strong>{item.company}</strong>
                      <span>{item.duration}</span>
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

          {/* CERTIFICATIONS */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Certifications</h3>
              {!isEditing("certifications") && (
                <EditButton
                  onClick={() => startEditing("certifications")}
                />
              )}
            </div>

            {isEditing("certifications") ? (
              <div className="ethio-profile-edit-fields">
                <button
                  type="button"
                  className="ethio-profile-add-button"
                  onClick={addCertification}
                >
                  <Plus size={16} />
                  Add Certificate
                </button>

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
                      <Field
                        label="Certificate Name"
                        value={cert.name}
                        onChange={(v) =>
                          updateCertification(cert.id, "name", v)
                        }
                        placeholder="Certificate name"
                      />
                      <Field
                        label="Issuing Organization"
                        value={cert.issuer}
                        onChange={(v) =>
                          updateCertification(cert.id, "issuer", v)
                        }
                        placeholder="Organization"
                      />
                      <Field
                        label="Year"
                        value={cert.year}
                        onChange={(v) =>
                          updateCertification(cert.id, "year", v)
                        }
                        placeholder="2026"
                      />
                      <Field
                        label="Credential URL"
                        value={cert.credentialUrl}
                        onChange={(v) =>
                          updateCertification(
                            cert.id,
                            "credentialUrl",
                            v
                          )
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : profile.certifications.length ? (
              <div className="ethio-profile-certification-list">
                {profile.certifications.map((cert) => (
                  <div
                    className="ethio-profile-certification-item"
                    key={cert.id}
                  >
                    <Award size={18} />
                    <div>
                      <strong>{cert.name}</strong>
                      <span>
                        {cert.issuer}
                        {cert.year && ` • ${cert.year}`}
                      </span>
                      {safeUrl(cert.credentialUrl) && (
                        <a
                          href={safeUrl(cert.credentialUrl)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View credential <ExternalLink size={12} />
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

          {/* PORTFOLIO */}
          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <div>
                <h3>Portfolio Projects</h3>
                <p className="ethio-profile-section-description">
                  Showcase projects you have completed.
                </p>
              </div>

              {!isEditing("portfolio") && (
                <EditButton
                  onClick={() => startEditing("portfolio")}
                />
              )}
            </div>

            {isEditing("portfolio") ? (
              <div className="ethio-profile-edit-fields">
                <button
                  type="button"
                  className="ethio-profile-add-button"
                  onClick={addProject}
                >
                  <Plus size={16} />
                  Add Project
                </button>

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
                      <Field
                        label="Project Title"
                        full
                        value={project.title}
                        onChange={(v) =>
                          updateProject(project.id, "title", v)
                        }
                        placeholder="Project name"
                      />
                      <Field
                        label="Description"
                        full
                        rows={3}
                        value={project.description}
                        onChange={(v) =>
                          updateProject(project.id, "description", v)
                        }
                        placeholder="Describe what you built..."
                      />
                      <Field
                        label="Technologies"
                        value={project.technologies}
                        onChange={(v) =>
                          updateProject(project.id, "technologies", v)
                        }
                        placeholder="React, Node.js, PostgreSQL"
                      />
                      <Field
                        label="Project URL"
                        value={project.url}
                        onChange={(v) =>
                          updateProject(project.id, "url", v)
                        }
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ))}

                <SectionActions
                  onSave={saveSection}
                  onCancel={cancelEditing}
                />
              </div>
            ) : profile.portfolio.length ? (
              <div className="ethio-profile-project-list">
                {profile.portfolio.map((project) => (
                  <article
                    className="ethio-profile-project-card"
                    key={project.id}
                  >
                    <div className="ethio-profile-project-icon">
                      <FolderOpen size={19} />
                    </div>
                    <h4>{project.title}</h4>
                    <p>{project.description}</p>

                    {project.technologies && (
                      <span className="ethio-profile-project-tech">
                        {project.technologies}
                      </span>
                    )}

                    {safeUrl(project.url) && (
                      <a
                        href={safeUrl(project.url)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Project <ExternalLink size={13} />
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
      </div>
    </div>
  );
}

export default MyProfile;
