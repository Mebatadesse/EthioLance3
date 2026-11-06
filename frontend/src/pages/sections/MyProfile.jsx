
import { useState } from "react";
import {
  MapPin,
  BriefcaseBusiness,
  Clock3,
  Star,
  Edit3,
  Camera,
  Plus,
  X,
  Check,
  Eye,
  Mail,
  Globe,
  GraduationCap,
  Award,
  Code2,
  CalendarDays,
  DollarSign,
  ShieldCheck,
  ExternalLink,
  UserRound,
  Languages,
} from "lucide-react";

import "./MyProfile.css";

const defaultProfile = {
  name: "Your Name",
  title: "Full Stack Developer",
  location: "Add your location",
  bio: "Write a short professional introduction about yourself, your experience, and the value you bring to clients.",
  email: "",
  hourlyRate: "500",
  experience: "2",
  availability: "Available",
  languages: "Amharic, English",
  website: "",
  education: "Bachelor's Degree in Software Engineering",
  university: "",
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
  completion: 75,
};

function getInitialProfile() {
  try {
    const savedProfile = localStorage.getItem("ethioLanceProfile");
    const savedUser =
      localStorage.getItem("ethioLanceUser") ||
      sessionStorage.getItem("ethioLanceUser");

    const user = savedUser ? JSON.parse(savedUser) : {};

    return {
      ...defaultProfile,
      name: user.name || user.firstName || defaultProfile.name,
      email: user.email || "",
      ...(savedProfile ? JSON.parse(savedProfile) : {}),
    };
  } catch {
    return defaultProfile;
  }
}

function MyProfile() {
  const [profile, setProfile] = useState(getInitialProfile);
  const [editing, setEditing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newExperience, setNewExperience] = useState({
    position: "",
    company: "",
    period: "",
    description: "",
  });
  const [experienceFormOpen, setExperienceFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const updateProfile = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const saveProfile = () => {
    localStorage.setItem(
      "ethioLanceProfile",
      JSON.stringify(profile)
    );

    setEditing(false);
  };

  const addSkill = () => {
    const skill = newSkill.trim();

    if (!skill) return;

    if (
      profile.skills.some(
        (existing) =>
          existing.toLowerCase() === skill.toLowerCase()
      )
    ) {
      return;
    }

    updateProfile("skills", [...profile.skills, skill]);
    setNewSkill("");
  };

  const removeSkill = (skill) => {
    updateProfile(
      "skills",
      profile.skills.filter((item) => item !== skill)
    );
  };

  const addExperience = (event) => {
    event.preventDefault();

    if (!newExperience.position || !newExperience.company) {
      return;
    }

    updateProfile("experienceHistory", [
      ...profile.experienceHistory,
      { ...newExperience, id: Date.now() },
    ]);

    setNewExperience({
      position: "",
      company: "",
      period: "",
      description: "",
    });

    setExperienceFormOpen(false);
  };

  const removeExperience = (id) => {
    updateProfile(
      "experienceHistory",
      profile.experienceHistory.filter(
        (item) => item.id !== id
      )
    );
  };

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

  const completionItems = [
    Boolean(profile.name && profile.name !== "Your Name"),
    Boolean(profile.title),
    Boolean(profile.location && profile.location !== "Add your location"),
    Boolean(profile.bio && !profile.bio.startsWith("Write a short")),
    profile.skills.length > 0,
    Boolean(profile.education),
    profile.experienceHistory.length > 0,
  ];

  const completion = Math.round(
    (completionItems.filter(Boolean).length /
      completionItems.length) *
      100
  );

  return (
    <div className="mp-page">

      {/* PAGE HEADER */}

      <div className="mp-page-header">
        <div>
          <span className="mp-eyebrow">MY ACCOUNT</span>
          <h1>My Profile</h1>
          <p>Manage your professional identity and how clients see you.</p>
        </div>

        <div className="mp-header-actions">
          <button
            type="button"
            className="mp-btn mp-btn-secondary"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye size={17} />
            Preview Public Profile
          </button>

          <button
            type="button"
            className="mp-btn mp-btn-primary"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <X size={17} /> : <Edit3 size={17} />}
            {editing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* PROFILE HERO */}

      <section className="mp-hero-card">
        <div className="mp-hero-content">
          <div className="mp-avatar-wrapper">
            <div className="mp-avatar">
              {initials}
            </div>

            <button
              type="button"
              className="mp-avatar-camera"
              title="Profile photo upload coming soon"
              onClick={() =>
                alert("Connect image upload to enable profile photos.")
              }
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="mp-hero-info">
            <div className="mp-name-row">
              <h2>{profile.name}</h2>
              <span className="mp-verified-badge">
                <ShieldCheck size={15} />
                Freelancer
              </span>
            </div>

            <p className="mp-profession">{profile.title}</p>

            <div className="mp-meta">
              <span>
                <MapPin size={15} />
                {profile.location}
              </span>

              <span>
                <BriefcaseBusiness size={15} />
                {profile.experience} years experience
              </span>

              <span>
                <Clock3 size={15} />
                {profile.availability}
              </span>
            </div>
          </div>

          <div className="mp-hero-rating">
            <div className="mp-rating-value">
              <Star size={18} fill="currentColor" />
              <strong>New</strong>
            </div>
            <span>No client reviews yet</span>
          </div>
        </div>
      </section>

      {/* PROFILE COMPLETION */}

      <section className="mp-completion-card">
        <div className="mp-completion-top">
          <div>
            <h3>Profile strength</h3>
            <p>Complete your profile to build client confidence.</p>
          </div>

          <strong>{completion}%</strong>
        </div>

        <div className="mp-progress-track">
          <div
            className="mp-progress-fill"
            style={{ width: `${completion}%` }}
          />
        </div>

        <div className="mp-completion-tasks">
          <span className={completionItems[0] ? "done" : ""}>
            <Check size={13} /> Personal information
          </span>
          <span className={completionItems[4] ? "done" : ""}>
            <Check size={13} /> Skills
          </span>
          <span className={completionItems[5] ? "done" : ""}>
            <Check size={13} /> Education
          </span>
          <span className={completionItems[6] ? "done" : ""}>
            <Check size={13} /> Experience
          </span>
        </div>
      </section>

      {/* PROFILE TABS */}

      <div className="mp-tabs">
        <button
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          className={activeTab === "professional" ? "active" : ""}
          onClick={() => setActiveTab("professional")}
        >
          Professional Details
        </button>

        <button
          className={activeTab === "experience" ? "active" : ""}
          onClick={() => setActiveTab("experience")}
        >
          Experience & Education
        </button>
      </div>

      {/* EDIT FORM */}

      {editing && (
        <section className="mp-card mp-edit-card">
          <div className="mp-section-heading">
            <div>
              <h3>Edit Profile Information</h3>
              <p>Update your professional details.</p>
            </div>
          </div>

          <div className="mp-form-grid">
            <label>
              Full Name
              <input
                value={profile.name}
                onChange={(e) => updateProfile("name", e.target.value)}
                placeholder="Your full name"
              />
            </label>

            <label>
              Professional Title
              <input
                value={profile.title}
                onChange={(e) => updateProfile("title", e.target.value)}
                placeholder="e.g. Full Stack Developer"
              />
            </label>

            <label>
              Location
              <input
                value={profile.location}
                onChange={(e) => updateProfile("location", e.target.value)}
                placeholder="e.g. Addis Ababa, Ethiopia"
              />
            </label>

            <label>
              Years of Experience
              <input
                type="number"
                min="0"
                value={profile.experience}
                onChange={(e) => updateProfile("experience", e.target.value)}
              />
            </label>

            <label>
              Hourly Rate (ETB)
              <input
                type="number"
                min="0"
                value={profile.hourlyRate}
                onChange={(e) => updateProfile("hourlyRate", e.target.value)}
              />
            </label>

            <label>
              Availability
              <select
                value={profile.availability}
                onChange={(e) => updateProfile("availability", e.target.value)}
              >
                <option>Available</option>
                <option>Busy</option>
                <option>Unavailable</option>
              </select>
            </label>

            <label>
              Languages
              <input
                value={profile.languages}
                onChange={(e) => updateProfile("languages", e.target.value)}
                placeholder="Amharic, English"
              />
            </label>

            <label>
              Website / LinkedIn
              <input
                value={profile.website}
                onChange={(e) => updateProfile("website", e.target.value)}
                placeholder="https://..."
              />
            </label>

            <label className="mp-full-width">
              About Me
              <textarea
                rows="5"
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                placeholder="Describe your experience, skills and what you offer..."
              />
            </label>
          </div>

          <div className="mp-form-actions">
            <button
              className="mp-btn mp-btn-secondary"
              type="button"
              onClick={() => {
                setProfile(getInitialProfile());
                setEditing(false);
              }}
            >
              Cancel
            </button>

            <button
              className="mp-btn mp-btn-primary"
              type="button"
              onClick={saveProfile}
            >
              <Check size={17} />
              Save Changes
            </button>
          </div>
        </section>
      )}

      {/* OVERVIEW TAB */}

      {activeTab === "overview" && (
        <div className="mp-layout">

          <div className="mp-main-column">

            {/* ABOUT */}

            <section className="mp-card">
              <div className="mp-section-heading">
                <div>
                  <h3>About Me</h3>
                  <p>A short introduction about your professional background.</p>
                </div>
              </div>

              <p className="mp-about-text">{profile.bio}</p>
            </section>

            {/* SKILLS */}

            <section className="mp-card">
              <div className="mp-section-heading">
                <div>
                  <h3>Skills & Expertise</h3>
                  <p>Show clients what you are good at.</p>
                </div>

                <Code2 size={20} />
              </div>

              <div className="mp-skills-list">
                {profile.skills.map((skill) => (
                  <span className="mp-skill" key={skill}>
                    {skill}

                    {editing && (
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        aria-label={`Remove ${skill}`}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {editing && (
                <div className="mp-add-skill">
                  <input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addSkill();
                    }}
                  />

                  <button
                    type="button"
                    className="mp-btn mp-btn-primary"
                    onClick={addSkill}
                  >
                    <Plus size={16} />
                    Add Skill
                  </button>
                </div>
              )}
            </section>

            {/* EXPERIENCE */}

            <section className="mp-card">
              <div className="mp-section-heading">
                <div>
                  <h3>Work Experience</h3>
                  <p>Your professional journey.</p>
                </div>

                <button
                  type="button"
                  className="mp-icon-button"
                  onClick={() => setExperienceFormOpen(!experienceFormOpen)}
                  title="Add experience"
                >
                  <Plus size={19} />
                </button>
              </div>

              {experienceFormOpen && (
                <form className="mp-experience-form" onSubmit={addExperience}>
                  <input
                    required
                    placeholder="Position"
                    value={newExperience.position}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        position: e.target.value,
                      })
                    }
                  />

                  <input
                    required
                    placeholder="Company"
                    value={newExperience.company}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        company: e.target.value,
                      })
                    }
                  />

                  <input
                    placeholder="Period (e.g. 2024 - 2025)"
                    value={newExperience.period}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        period: e.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Describe your responsibilities..."
                    value={newExperience.description}
                    onChange={(e) =>
                      setNewExperience({
                        ...newExperience,
                        description: e.target.value,
                      })
                    }
                  />

                  <button className="mp-btn mp-btn-primary" type="submit">
                    Add Experience
                  </button>
                </form>
              )}

              {profile.experienceHistory.length === 0 ? (
                <div className="mp-empty-state">
                  <BriefcaseBusiness size={28} />
                  <strong>No work experience added</strong>
                  <span>Add your previous work or professional projects.</span>
                </div>
              ) : (
                <div className="mp-timeline">
                  {profile.experienceHistory.map((item) => (
                    <div className="mp-timeline-item" key={item.id}>
                      <div className="mp-timeline-icon">
                        <BriefcaseBusiness size={18} />
                      </div>

                      <div className="mp-timeline-content">
                        <div className="mp-timeline-title">
                          <strong>{item.position}</strong>
                          <button
                            type="button"
                            onClick={() => removeExperience(item.id)}
                            aria-label="Remove experience"
                          >
                            <X size={15} />
                          </button>
                        </div>

                        <span>{item.company}</span>
                        <small>{item.period}</small>
                        <p>{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN */}

          <aside className="mp-side-column">

            {/* RATE */}

            <section className="mp-card mp-rate-card">
              <span className="mp-side-label">HOURLY RATE</span>
              <h2>
                ETB {Number(profile.hourlyRate || 0).toLocaleString()}
                <small>/hr</small>
              </h2>
              <p>Your listed starting hourly rate.</p>
            </section>

            {/* DETAILS */}

            <section className="mp-card">
              <div className="mp-section-heading">
                <h3>Professional Details</h3>
              </div>

              <div className="mp-detail-list">
                <div>
                  <GraduationCap size={18} />
                  <span>
                    <small>Education</small>
                    <strong>{profile.education || "Not provided"}</strong>
                  </span>
                </div>

                <div>
                  <Languages size={18} />
                  <span>
                    <small>Languages</small>
                    <strong>{profile.languages || "Not provided"}</strong>
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
                  <DollarSign size={18} />
                  <span>
                    <small>Hourly Rate</small>
                    <strong>ETB {Number(profile.hourlyRate || 0).toLocaleString()}</strong>
                  </span>
                </div>

                {profile.website && (
                  <div>
                    <Globe size={18} />
                    <span>
                      <small>Website</small>
                      <a href={profile.website} target="_blank" rel="noreferrer">
                        Visit website <ExternalLink size={12} />
                      </a>
                    </span>
                  </div>
                )}
              </div>
            </section>

            {/* VERIFICATION */}

            <section className="mp-card">
              <div className="mp-section-heading">
                <h3>Account Verification</h3>
                <ShieldCheck size={20} />
              </div>

              <div className="mp-verification-item">
                <div>
                  <Mail size={17} />
                  <span>Email address</span>
                </div>
                <span className="mp-status-pending">Check account</span>
              </div>

              <div className="mp-verification-item">
                <div>
                  <ShieldCheck size={17} />
                  <span>Identity verification</span>
                </div>
                <span className="mp-status-pending">Not verified</span>
              </div>

              <p className="mp-verification-note">
                Verification status will be connected to your account verification system.
              </p>
            </section>
          </aside>
        </div>
      )}

      {/* PROFESSIONAL DETAILS TAB */}

      {activeTab === "professional" && (
        <div className="mp-layout">
          <section className="mp-card mp-main-column">
            <div className="mp-section-heading">
              <div>
                <h3>Professional Information</h3>
                <p>Your work identity and preferences.</p>
              </div>
            </div>

            <div className="mp-detail-list mp-detail-list-large">
              <div>
                <UserRound size={19} />
                <span><small>Professional Title</small><strong>{profile.title}</strong></span>
              </div>

              <div>
                <MapPin size={19} />
                <span><small>Location</small><strong>{profile.location}</strong></span>
              </div>

              <div>
                <BriefcaseBusiness size={19} />
                <span><small>Experience</small><strong>{profile.experience} years</strong></span>
              </div>

              <div>
                <DollarSign size={19} />
                <span><small>Hourly Rate</small><strong>ETB {profile.hourlyRate}</strong></span>
              </div>

              <div>
                <Languages size={19} />
                <span><small>Languages</small><strong>{profile.languages}</strong></span>
              </div>

              <div>
                <Globe size={19} />
                <span><small>Website</small><strong>{profile.website || "Not provided"}</strong></span>
              </div>
            </div>

            <button
              type="button"
              className="mp-btn mp-btn-primary mp-edit-full"
              onClick={() => setEditing(true)}
            >
              <Edit3 size={16} />
              Edit Professional Information
            </button>
          </section>
        </div>
      )}

      {/* EXPERIENCE & EDUCATION TAB */}

      {activeTab === "experience" && (
        <div className="mp-layout">
          <section className="mp-card mp-main-column">
            <div className="mp-section-heading">
              <div>
                <h3>Education</h3>
                <p>Your academic background.</p>
              </div>
              <GraduationCap size={21} />
            </div>

            <div className="mp-education-item">
              <div className="mp-timeline-icon">
                <GraduationCap size={20} />
              </div>
              <div>
                <strong>{profile.education || "Education not added"}</strong>
                <p>{profile.university || "Add your institution in profile editing."}</p>
              </div>
            </div>

            <div className="mp-section-heading mp-experience-heading">
              <div>
                <h3>Work Experience</h3>
                <p>Your previous roles and responsibilities.</p>
              </div>
              <BriefcaseBusiness size={21} />
            </div>

            {profile.experienceHistory.length === 0 ? (
              <div className="mp-empty-state">
                <BriefcaseBusiness size={28} />
                <strong>No experience added yet</strong>
                <span>Add your experience from the Overview tab.</span>
              </div>
            ) : (
              profile.experienceHistory.map((item) => (
                <div className="mp-education-item" key={item.id}>
                  <div className="mp-timeline-icon">
                    <BriefcaseBusiness size={19} />
                  </div>
                  <div>
                    <strong>{item.position}</strong>
                    <p>{item.company} · {item.period}</p>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))
            )}

            <div className="mp-section-heading mp-experience-heading">
              <div>
                <h3>Certifications</h3>
                <p>Professional qualifications and achievements.</p>
              </div>
              <Award size={21} />
            </div>

            <div className="mp-empty-state">
              <Award size={28} />
              <strong>No certifications added</strong>
              <span>Certification management can be added here.</span>
            </div>
          </section>
        </div>
      )}

      {/* PUBLIC PROFILE PREVIEW */}

      {previewOpen && (
        <div
          className="mp-modal-backdrop"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="mp-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mp-preview-header">
              <div>
                <span className="mp-eyebrow">PUBLIC PROFILE</span>
                <h3>Profile Preview</h3>
              </div>

              <button
                type="button"
                className="mp-icon-button"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close preview"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mp-preview-body">
              <div className="mp-avatar mp-preview-avatar">
                {initials}
              </div>

              <h2>{profile.name}</h2>
              <p className="mp-profession">{profile.title}</p>

              <span className="mp-preview-location">
                <MapPin size={15} /> {profile.location}
              </span>

              <div className="mp-preview-divider" />

              <h4>About Me</h4>
              <p>{profile.bio}</p>

              <h4>Skills</h4>
              <div className="mp-skills-list">
                {profile.skills.map((skill) => (
                  <span className="mp-skill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>

              <div className="mp-preview-divider" />

              <p className="mp-preview-rate">
                ETB {Number(profile.hourlyRate || 0).toLocaleString()} / hour
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyProfile;
