import { useRef, useState } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Edit3,
  Camera,
  Plus,
  X,
  Check,
  Mail,
  Globe,
  GraduationCap,
  Award,
  Code2,
  CalendarDays,
  DollarSign,
  UserRound,
  Languages,
  Trash2,
  ExternalLink,
  ShieldCheck,
  FolderOpen,
  Save,
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
        : defaultProfile.skills,
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

const safeUrl = (url) => {
  if (!url) return "";

  const trimmed = url.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return "";
};

function MyProfile() {
  const [profile, setProfile] = useState(loadProfile);
  const [draft, setDraft] = useState(loadProfile);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
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

  const openEditor = () => {
    setDraft({ ...profile });
    setEditing(true);
    setStatusMessage("");
    setAvatarError("");
  };

  const closeEditor = () => {
    setDraft({ ...profile });
    setEditing(false);
    setSkillInput("");
    setAvatarError("");
  };

  const saveProfile = (event) => {
    event.preventDefault();

    try {
      localStorage.setItem(
        "ethioLanceProfile",
        JSON.stringify(draft)
      );

      setProfile({ ...draft });
      setEditing(false);
      setStatusMessage("Your profile has been saved successfully.");

      setTimeout(() => setStatusMessage(""), 4000);
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
          Edit Profile
        </button>
      </div>

      {statusMessage && (
        <div className="ethio-profile-status-message">
          <Check size={17} />
          {statusMessage}
        </div>
      )}

      {/* PROFILE HERO */}
      <div className="ethio-profile-hero">
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
              {profile.experience || "0"} years experience
            </span>

            <span>
              <Clock3 size={15} />
              {profile.availability}
            </span>
          </div>
        </div>

        <div className="ethio-profile-hero-rate">
          <span>Hourly Rate</span>
          <strong>
            ETB {Number(profile.hourlyRate || 0).toLocaleString()}
          </strong>
          <small>per hour</small>
        </div>
      </div>

      {/* PROFILE COMPLETION */}
      <div className="ethio-profile-completion-card">
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
      </div>

      {/* PROFILE CONTENT */}
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
                      <h4>{item.position}</h4>
                      <strong>{item.company}</strong>
                      <span>{item.duration}</span>
                      <p>{item.description}</p>
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
                  <strong>ETB {profile.hourlyRate || "Not set"}</strong>
                </span>
              </div>

              <div>
                <BriefcaseBusiness size={18} />
                <span>
                  <small>Experience</small>
                  <strong>
                    {profile.experience || "Not set"} years
                  </strong>
                </span>
              </div>

              <div>
                <Clock3 size={18} />
                <span>
                  <small>Availability</small>
                  <strong>{profile.availability}</strong>
                </span>
              </div>

              <div>
                <Languages size={18} />
                <span>
                  <small>Languages</small>
                  <strong>{profile.languages || "Not set"}</strong>
                </span>
              </div>

              <div>
                <Mail size={18} />
                <span>
                  <small>Email</small>
                  <strong>{profile.email || "Not set"}</strong>
                </span>
              </div>

              {safeUrl(profile.website) && (
                <div>
                  <Globe size={18} />
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
          </section>

          <section className="ethio-profile-card">
            <div className="ethio-profile-section-heading">
              <h3>Education</h3>
              <GraduationCap size={19} />
            </div>

            <strong className="ethio-profile-education-title">
              {profile.education || "Education not added"}
            </strong>

            <p className="ethio-profile-education-school">
              {profile.university || "Add your institution"}
            </p>
          </section>

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
                      <span>
                        {cert.issuer} {cert.year && `• ${cert.year}`}
                      </span>
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
            <p>Your rating will appear after completed client projects.</p>
          </section>
        </aside>
      </div>

      {/* LARGE EDIT POPUP */}
      {editing && (
        <div
          className="ethio-profile-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
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
                  Edit Your Profile
                </h2>
                <p>
                  Update your information and make your profile stand out.
                </p>
              </div>

              <button
                type="button"
                className="ethio-profile-close-button"
                onClick={closeEditor}
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
                {/* PROFILE PHOTO */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <Camera size={19} />
                    <div>
                      <h3>Profile Photo</h3>
                      <p>Use a professional photo of yourself.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-photo-editor">
                    <div className="ethio-profile-avatar-wrapper ethio-profile-avatar-large">
                      {draft.avatar ? (
                        <img
                          src={draft.avatar}
                          alt="Profile"
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
                        Upload Photo
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
                </section>

                {/* PERSONAL INFORMATION */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <UserRound size={19} />
                    <div>
                      <h3>Personal Information</h3>
                      <p>Your basic professional identity.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-form-grid">
                    <label className="ethio-profile-field">
                      Full Name
                      <input
                        value={draft.name}
                        onChange={(e) =>
                          updateDraft("name", e.target.value)
                        }
                        placeholder="Enter your full name"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Professional Title
                      <input
                        value={draft.title}
                        onChange={(e) =>
                          updateDraft("title", e.target.value)
                        }
                        placeholder="e.g. Full Stack Developer"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Email Address
                      <input
                        type="email"
                        value={draft.email}
                        onChange={(e) =>
                          updateDraft("email", e.target.value)
                        }
                        placeholder="your@email.com"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Location
                      <input
                        value={draft.location}
                        onChange={(e) =>
                          updateDraft("location", e.target.value)
                        }
                        placeholder="e.g. Addis Ababa, Ethiopia"
                      />
                    </label>

                    <label className="ethio-profile-field ethio-profile-field-full">
                      Professional Bio
                      <textarea
                        rows={5}
                        value={draft.bio}
                        onChange={(e) =>
                          updateDraft("bio", e.target.value)
                        }
                        placeholder="Describe your experience, strengths, and what you can offer clients..."
                      />
                    </label>
                  </div>
                </section>

                {/* PROFESSIONAL DETAILS */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <BriefcaseBusiness size={19} />
                    <div>
                      <h3>Professional Details</h3>
                      <p>Set your rates and working preferences.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-form-grid">
                    <label className="ethio-profile-field">
                      Hourly Rate (ETB)
                      <input
                        type="number"
                        min="0"
                        value={draft.hourlyRate}
                        onChange={(e) =>
                          updateDraft("hourlyRate", e.target.value)
                        }
                        placeholder="500"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Years of Experience
                      <input
                        type="number"
                        min="0"
                        value={draft.experience}
                        onChange={(e) =>
                          updateDraft("experience", e.target.value)
                        }
                        placeholder="2"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      Availability
                      <select
                        value={draft.availability}
                        onChange={(e) =>
                          updateDraft("availability", e.target.value)
                        }
                      >
                        <option value="Available">Available</option>
                        <option value="Busy">Busy</option>
                        <option value="Not Available">Not Available</option>
                      </select>
                    </label>

                    <label className="ethio-profile-field">
                      Languages
                      <input
                        value={draft.languages}
                        onChange={(e) =>
                          updateDraft("languages", e.target.value)
                        }
                        placeholder="Amharic, English"
                      />
                    </label>

                    <label className="ethio-profile-field ethio-profile-field-full">
                      Personal Website
                      <input
                        type="url"
                        value={draft.website}
                        onChange={(e) =>
                          updateDraft("website", e.target.value)
                        }
                        placeholder="https://yourwebsite.com"
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

                  <div className="ethio-profile-skill-editor">
                    <div className="ethio-profile-skill-input-row">
                      <input
                        value={skillInput}
                        onChange={(e) =>
                          setSkillInput(e.target.value)
                        }
                        placeholder="Enter a skill, e.g. React"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
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
                            onClick={() => removeSkill(index)}
                            aria-label={`Remove ${skill}`}
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </section>

                {/* EDUCATION */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title">
                    <GraduationCap size={19} />
                    <div>
                      <h3>Education</h3>
                      <p>Your academic background.</p>
                    </div>
                  </div>

                  <div className="ethio-profile-form-grid">
                    <label className="ethio-profile-field">
                      Degree / Qualification
                      <input
                        value={draft.education}
                        onChange={(e) =>
                          updateDraft("education", e.target.value)
                        }
                        placeholder="Bachelor's Degree in Software Engineering"
                      />
                    </label>

                    <label className="ethio-profile-field">
                      University / Institution
                      <input
                        value={draft.university}
                        onChange={(e) =>
                          updateDraft("university", e.target.value)
                        }
                        placeholder="University name"
                      />
                    </label>
                  </div>
                </section>

                {/* WORK EXPERIENCE */}
                <section className="ethio-profile-editor-section">
                  <div className="ethio-profile-editor-section-title ethio-profile-editor-title-with-action">
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
                      <Plus size={16} /> Add Experience
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
                          Position
                          <input
                            value={item.position}
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "position",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Frontend Developer"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Company
                          <input
                            value={item.company}
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "company",
                                e.target.value
                              )
                            }
                            placeholder="Company name"
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Duration
                          <input
                            value={item.duration}
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Jan 2024 - Present"
                          />
                        </label>

                        <label className="ethio-profile-field ethio-profile-field-full">
                          Description
                          <textarea
                            rows={3}
                            value={item.description}
                            onChange={(e) =>
                              updateExperience(
                                item.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe your responsibilities and achievements..."
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
                      <Plus size={16} /> Add Certificate
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
                            onChange={(e) =>
                              updateCertification(
                                cert.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Certificate name"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Issuing Organization
                          <input
                            value={cert.issuer}
                            onChange={(e) =>
                              updateCertification(
                                cert.id,
                                "issuer",
                                e.target.value
                              )
                            }
                            placeholder="Organization"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Year
                          <input
                            value={cert.year}
                            onChange={(e) =>
                              updateCertification(
                                cert.id,
                                "year",
                                e.target.value
                              )
                            }
                            placeholder="2026"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Credential URL
                          <input
                            type="url"
                            value={cert.credentialUrl}
                            onChange={(e) =>
                              updateCertification(
                                cert.id,
                                "credentialUrl",
                                e.target.value
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
                      <Plus size={16} /> Add Project
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
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "title",
                                e.target.value
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
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe what you built..."
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Technologies
                          <input
                            value={project.technologies}
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "technologies",
                                e.target.value
                              )
                            }
                            placeholder="React, Node.js, PostgreSQL"
                          />
                        </label>

                        <label className="ethio-profile-field">
                          Project URL
                          <input
                            type="url"
                            value={project.url}
                            onChange={(e) =>
                              updateProject(
                                project.id,
                                "url",
                                e.target.value
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
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="ethio-profile-save-button"
                >
                  <Save size={17} />
                  Save Changes
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