import { useEffect, useMemo, useRef, useState } from "react";
import {
  Award, BriefcaseBusiness, Camera, Check, Clock3,
  ExternalLink, FolderOpen, GraduationCap, Languages, MapPin, Pencil,
  Plus, Save, Trash2, UserRound, X, Globe, DollarSign, Mail, Link2, FileText,
} from "lucide-react";
import "./MyProfile.css";
import { apiRequest, getCurrentUser, readUserData, writeUserData } from "../../services/api";

const STORAGE_KEY = "ethioLanceProfile";
const DEFAULT_PROFILE = {
  name: "Your Name", title: "Add your professional title", location: "",
  bio: "", email: "", hourlyRate: "", experience: "", availability: "Available",
  languages: "Amharic, English", website: "", avatar: "", skills: [],
  experienceHistory: [], educationHistory: [], certifications: [], portfolio: [],
};

function readProfile() {
  try {
    const saved = readUserData(STORAGE_KEY, {});
    const user = getCurrentUser();
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
    return {
      ...DEFAULT_PROFILE, ...saved,
      name: saved.name || user.name || fullName || DEFAULT_PROFILE.name,
      email: saved.email || user.email || DEFAULT_PROFILE.email,
      skills: Array.isArray(saved.skills) ? saved.skills : [],
      experienceHistory: Array.isArray(saved.experienceHistory) ? saved.experienceHistory : [],
      educationHistory: Array.isArray(saved.educationHistory) ? saved.educationHistory : [],
      certifications: Array.isArray(saved.certifications) ? saved.certifications : [],
      portfolio: Array.isArray(saved.portfolio) ? saved.portfolio : [],
    };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const validUrl = (value) => /^https?:\/\//i.test(String(value || "").trim());
const toDateLabel = (value) => value ? new Date(value).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "";

function mapApiProfile(apiProfile, currentProfile) {
  const user = getCurrentUser();
  const experienceHistory = (apiProfile.experiences || []).map((item) => {
    const start = toDateLabel(item.startDate);
    const end = item.isCurrent ? "Present" : toDateLabel(item.endDate);
    return {
      id: item.id,
      position: item.jobTitle || "",
      company: item.company || "",
      duration: [start, end].filter(Boolean).join(" - "),
      description: item.description || "",
    };
  });
  const educationHistory = (apiProfile.educations || []).map((item) => ({
    id: item.id,
    degree: [item.degree, item.fieldOfStudy].filter(Boolean).join(", "),
    institution: item.institution || "",
    year: toDateLabel(item.endDate) || toDateLabel(item.startDate),
  }));
  const certifications = (apiProfile.certifications || []).map((item) => ({
    ...item,
    issueDate: item.issueDate ? item.issueDate.slice(0, 10) : "",
    expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
  }));
  const portfolio = (apiProfile.portfolioItems || []).map((item) => ({
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    url: item.projectUrl || "",
    skills: Array.isArray(item.technologies) ? item.technologies : [],
    technologies: Array.isArray(item.technologies) ? item.technologies.join(", ") : "",
    status: "published",
  }));

  return {
    ...currentProfile,
    name: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name || currentProfile.name,
    email: user.email || currentProfile.email,
    title: apiProfile.headline || "",
    location: apiProfile.location || "",
    bio: apiProfile.bio || "",
    hourlyRate: apiProfile.hourlyRate ?? "",
    avatar: apiProfile.profileImageUrl || "",
    skills: Array.isArray(apiProfile.skills) ? apiProfile.skills : [],
    experienceHistory,
    educationHistory,
    certifications,
    portfolio,
  };
}

function EditAction({ onClick, label = "Edit section" }) {
  return <button type="button" className="mp-edit" onClick={onClick} aria-label={label} title={label}><Pencil size={15} /></button>;
}

function Field({ label, value, onChange, placeholder = "", type = "text", textarea = false, full = false, min }) {
  return <label className={`mp-field ${full ? "mp-field-full" : ""}`}>
    <span>{label}</span>
    {textarea ? <textarea rows={4} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /> :
      <input type={type} min={min} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />}
  </label>;
}

function Actions({ onSave, onCancel, saving = false }) {
  return <div className="mp-actions"><button type="button" className="mp-btn mp-btn-light" onClick={onCancel} disabled={saving}>Cancel</button><button type="button" className="mp-btn mp-btn-gold" onClick={onSave} disabled={saving}><Save size={15} /> {saving ? "Saving…" : "Save changes"}</button></div>;
}

function Empty({ children = "Nothing added yet." }) { return <p className="mp-empty">{children}</p>; }

export default function MyProfile() {
  const [profile, setProfile] = useState(readProfile);
  const [draft, setDraft] = useState(readProfile);
  const [editing, setEditing] = useState(null);
  const [skillText, setSkillText] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [profileLoadError, setProfileLoadError] = useState("");
  const [certificationsLoading, setCertificationsLoading] = useState(true);
  const [certificationsSaving, setCertificationsSaving] = useState(false);
  const photoRef = useRef(null);
  const portfolioFileRef = useRef(null);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [portfolioDraft, setPortfolioDraft] = useState(null);
  const [portfolioSkillInput, setPortfolioSkillInput] = useState("");
  const [portfolioLinkInput, setPortfolioLinkInput] = useState("");
  const [showPortfolioLinkInput, setShowPortfolioLinkInput] = useState(false);

  useEffect(() => {
    let active = true;
    apiRequest("/profiles/freelancer/me")
      .then(({ profile: apiProfile }) => {
        if (!active || !apiProfile) return;
        const next = mapApiProfile(apiProfile, readProfile());
        setProfile(next);
        setDraft(next);
        setProfileLoadError("");
        setError("");
      })
      .catch((requestError) => {
        if (active && requestError.message !== "Freelancer profile not found") {
          setProfileLoadError(requestError.message || "Could not load your freelancer profile.");
        }
      });
    apiRequest("/profiles/freelancer/certifications")
      .then(({ certifications = [] }) => {
        if (!active) return;
        const normalized = certifications.map((item) => ({
          ...item,
          issueDate: item.issueDate ? item.issueDate.slice(0, 10) : "",
          expiryDate: item.expiryDate ? item.expiryDate.slice(0, 10) : "",
        }));
        setProfile((old) => ({ ...old, certifications: normalized }));
        setDraft((old) => ({ ...old, certifications: normalized }));
        setError("");
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setCertificationsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    try { writeUserData(STORAGE_KEY, profile); }
    catch (e) { console.error("Could not persist profile", e); }
  }, [profile]);

  const completion = useMemo(() => {
    const checks = [profile.name, profile.title, profile.location, profile.bio, profile.avatar,
      profile.hourlyRate, profile.skills.length, profile.experienceHistory.length,
      profile.educationHistory.length, profile.portfolio.length, profile.certifications.length];
    return Math.round(checks.filter(Boolean).length / checks.length * 100);
  }, [profile]);

  const begin = (section) => { setDraft({ ...profile }); setEditing(section); setNotice(""); setError(""); setSkillText(""); };
  const cancel = () => { setDraft({ ...profile }); setEditing(null); setError(""); setSkillText(""); };
  const update = (key, value) => setDraft((old) => ({ ...old, [key]: value }));
  const save = () => {
    try {
      writeUserData(STORAGE_KEY, draft);
      setProfile({ ...draft }); setEditing(null); setNotice("Your profile changes have been saved on this device."); setError("");
    } catch (e) { setError("Could not save. Try using a smaller profile photo."); }
  };
  const saveCertifications = async () => {
    setCertificationsSaving(true);
    setError("");
    try {
      // Certification records belong to a FreelancerProfile. Some users can reach
      // this screen without completing the separate profile setup flow.
      try {
        await apiRequest("/profiles/freelancer/me");
      } catch (profileError) {
        if (profileError.message !== "Freelancer profile not found") throw profileError;
        await apiRequest("/profiles/freelancer/me", {
          method: "POST",
          body: JSON.stringify({
            headline: draft.title && draft.title !== DEFAULT_PROFILE.title ? draft.title : null,
            bio: draft.bio || null,
            location: draft.location || null,
            hourlyRate: draft.hourlyRate ? Number(draft.hourlyRate) : null,
            skills: draft.skills,
          }),
        });
      }
      const before = profile.certifications;
      const after = draft.certifications;
      for (const item of before) {
        if (!after.some((next) => next.id === item.id)) {
          await apiRequest(`/profiles/freelancer/certifications/${item.id}`, { method: "DELETE" });
        }
      }
      const saved = [];
      for (const item of after) {
        if (!item.name.trim() || !item.issuingOrganization.trim()) {
          throw new Error("Certificate name and issuing organization are required.");
        }
        const payload = {
          name: item.name.trim(),
          issuingOrganization: item.issuingOrganization.trim(),
          issueDate: item.issueDate || null,
          expiryDate: item.expiryDate || null,
          credentialId: String(item.credentialId || "").trim() || null,
          credentialUrl: String(item.credentialUrl || "").trim() || null,
        };
        const isExisting = before.some((old) => old.id === item.id);
        const result = await apiRequest(
          isExisting ? `/profiles/freelancer/certifications/${item.id}` : "/profiles/freelancer/certifications",
          { method: isExisting ? "PUT" : "POST", body: JSON.stringify(payload) },
        );
        const certification = result.certification;
        saved.push({ ...certification, issueDate: certification.issueDate ? certification.issueDate.slice(0, 10) : "", expiryDate: certification.expiryDate ? certification.expiryDate.slice(0, 10) : "" });
      }
      const nextProfile = { ...profile, certifications: saved };
      writeUserData(STORAGE_KEY, nextProfile);
      setProfile(nextProfile); setDraft(nextProfile); setEditing(null);
      setNotice("Certifications saved to your profile.");
    } catch (requestError) {
      setError(requestError.message || "Could not save certifications.");
    } finally { setCertificationsSaving(false); }
  };
  const addItem = (key, item) => update(key, [...draft[key], { id: uid(), ...item }]);
  const changeItem = (key, id, field, value) => update(key, draft[key].map((item) => item.id === id ? { ...item, [field]: value } : item));
  const removeItem = (key, id) => update(key, draft[key].filter((item) => item.id !== id));

  const openPortfolio = (item = null) => {
    setPortfolioDraft(item ? { ...item, skills: Array.isArray(item.skills) ? [...item.skills] : (item.technologies ? String(item.technologies).split(",").map(x => x.trim()).filter(Boolean) : []), content: Array.isArray(item.content) ? [...item.content] : [] } : { id: uid(), title: "", role: "", description: "", skills: [], content: [], url: "", status: "published" });
    setPortfolioSkillInput(""); setPortfolioLinkInput(""); setShowPortfolioLinkInput(false); setPortfolioOpen(true); setEditing(null); setError("");
  };
  const closePortfolio = () => { setPortfolioOpen(false); setPortfolioDraft(null); setPortfolioSkillInput(""); setPortfolioLinkInput(""); setShowPortfolioLinkInput(false); };
  const addPortfolioSkill = () => {
    const value = portfolioSkillInput.trim();
    if (!value || !portfolioDraft || portfolioDraft.skills.length >= 5 || portfolioDraft.skills.some(x => x.toLowerCase() === value.toLowerCase())) return;
    setPortfolioDraft(old => ({ ...old, skills: [...old.skills, value] })); setPortfolioSkillInput("");
  };
  const handlePortfolioFile = (event) => {
    const file = event.target.files?.[0]; if (!file || !portfolioDraft) return;
    if (file.size > 1024 * 1024) { setError("For browser storage, each attachment must be 1 MB or smaller."); event.target.value = ""; return; }
    const reader = new FileReader();
    reader.onload = () => { setPortfolioDraft(old => ({ ...old, content: [...old.content, { id: uid(), name: file.name, type: file.type || "application/octet-stream", data: reader.result }] })); setError(""); };
    reader.onerror = () => setError("Could not read this file."); reader.readAsDataURL(file); event.target.value = "";
  };
  const addPortfolioLink = () => {
    const value = portfolioLinkInput.trim();
    let parsedUrl;
    try { parsedUrl = new URL(value); }
    catch { setError("Enter a valid link beginning with http:// or https://."); return; }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) { setError("Enter a valid link beginning with http:// or https://."); return; }
    setPortfolioDraft(old => ({ ...old, content: [...old.content, { id: uid(), name: value, type: "link", data: value }], url: value }));
    setPortfolioLinkInput(""); setShowPortfolioLinkInput(false); setError("");
  };
  const savePortfolio = (status = "published") => {
    if (status !== "draft" && (!portfolioDraft?.title.trim() || !portfolioDraft?.description.trim() || !portfolioDraft?.skills.length)) { setError("Add a project title, description, and at least one skill before publishing."); return; }
    const item = { ...portfolioDraft, status, technologies: portfolioDraft.skills.join(", ") };
    const next = profile.portfolio.some(x => x.id === item.id) ? profile.portfolio.map(x => x.id === item.id ? item : x) : [...profile.portfolio, item];
    try { writeUserData(STORAGE_KEY, { ...profile, portfolio: next }); setProfile(old => ({ ...old, portfolio: next })); setNotice(status === "draft" ? "Portfolio project saved as a draft on this device." : "Portfolio project added to your profile."); setError(""); closePortfolio(); }
    catch (e) { setError("Could not save. Remove a large attachment and try again."); }
  };

  const handlePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { setError("Choose a JPG, PNG, or WEBP image."); return; }
    if (file.size > 1024 * 1024) { setError("Photo must be 1 MB or smaller."); return; }
    const reader = new FileReader();
    reader.onload = () => { update("avatar", reader.result); setError(""); };
    reader.onerror = () => setError("Could not read this image.");
    reader.readAsDataURL(file);
  };

  const editingPanel = (section, title, body) => editing === section && <section className="mp-card mp-editor">
    <div className="mp-card-heading"><div><span className="mp-kicker">EDIT PROFILE</span><h2>{title}</h2></div><button className="mp-close" type="button" onClick={cancel} aria-label="Close editor"><X size={18} /></button></div>
    {body}
    {error && <p className="mp-error">{error}</p>}
    <Actions onSave={save} onCancel={cancel} />
  </section>;

  return <div className="mp-page">
    <header className="mp-page-header"><div><span className="mp-kicker">FREELANCER WORKSPACE</span><h1>My Profile</h1><p>Build a strong profile that helps clients understand the value you bring.</p></div><div className="mp-header-status"><span className="mp-status-dot" /> Profile visibility <strong>Public preview</strong></div></header>
    {notice && <div className="mp-notice"><Check size={17} />{notice}<button type="button" onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div>}
    {profileLoadError && <p className="mp-error" role="alert">{profileLoadError}</p>}

    <div className="mp-layout">
      <aside className="mp-sidebar">
        <section className="mp-card mp-identity">
          <div className="mp-avatar-wrap">{profile.avatar ? <img src={profile.avatar} alt="Profile" /> : <div className="mp-avatar-placeholder"><UserRound size={42} /></div>}<button type="button" className="mp-avatar-edit" onClick={() => begin("photo")} aria-label="Change profile photo"><Camera size={15} /></button></div>
          <h2>{profile.name || "Your Name"}</h2><p className="mp-role">{profile.title || "Add your professional title"}</p>
          {profile.location && <p className="mp-location"><MapPin size={14} />{profile.location}</p>}
          <div className="mp-identity-divider" />
          <div className="mp-rate"><span>Hourly rate</span><strong>{profile.hourlyRate ? `ETB ${Number(profile.hourlyRate).toLocaleString()}` : "Not set"}</strong><small>per hour</small></div>
          <button type="button" className="mp-btn mp-btn-outline mp-full" onClick={() => begin("personal")}><Pencil size={14} /> Edit profile</button>
        </section>

        <section className="mp-card mp-completion"><div className="mp-completion-top"><div><h3>Profile strength</h3><p>Complete your profile to stand out to clients.</p></div><strong>{completion}%</strong></div><div className="mp-progress"><span style={{ width: `${completion}%` }} /></div><small>{completion === 100 ? "Your profile is complete." : "Keep adding details to improve your profile."}</small></section>

        <section className="mp-card mp-side-details"><div className="mp-card-heading"><h3>Professional details</h3><EditAction onClick={() => begin("professional")} /></div>
          <div className="mp-detail"><DollarSign /><div><small>Hourly rate</small><strong>{profile.hourlyRate ? `ETB ${profile.hourlyRate}` : "Not set"}</strong></div></div>
          <div className="mp-detail"><BriefcaseBusiness /><div><small>Experience</small><strong>{profile.experience ? `${profile.experience} years` : "Not added"}</strong></div></div>
          <div className="mp-detail"><Clock3 /><div><small>Availability</small><strong>{profile.availability || "Not set"}</strong></div></div>
          <div className="mp-detail"><Languages /><div><small>Languages</small><strong>{profile.languages || "Not added"}</strong></div></div>
          <div className="mp-detail"><Mail /><div><small>Email</small><strong className="mp-break">{profile.email || "Not added"}</strong></div></div>
          {profile.website && validUrl(profile.website) && <div className="mp-detail"><Globe /><div><small>Website</small><a href={profile.website} target="_blank" rel="noreferrer">Visit website <ExternalLink size={12} /></a></div></div>}
        </section>
      </aside>

      <main className="mp-main">
        {editingPanel("photo", "Update profile photo", <div className="mp-photo-edit"><div className="mp-avatar-wrap mp-avatar-large">{draft.avatar ? <img src={draft.avatar} alt="Preview" /> : <div className="mp-avatar-placeholder"><UserRound size={38} /></div>}</div><div><button type="button" className="mp-btn mp-btn-outline" onClick={() => photoRef.current?.click()}><Camera size={15} /> Choose photo</button><input ref={photoRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={handlePhoto} /><p>JPG, PNG or WEBP. Maximum 1 MB.</p></div></div>)}

        <section className="mp-card mp-about"><div className="mp-card-heading"><div><span className="mp-kicker">INTRODUCTION</span><h2>About me</h2></div>{editing !== "personal" && <EditAction onClick={() => begin("personal")} />}</div>
          {editing === "personal" ? <div className="mp-form-grid"><Field label="Full name" value={draft.name} onChange={(v) => update("name", v)} /><Field label="Professional title" value={draft.title} onChange={(v) => update("title", v)} placeholder="e.g. Full Stack Developer" /><Field label="Email address" value={draft.email} onChange={(v) => update("email", v)} type="email" /><Field label="Location" value={draft.location} onChange={(v) => update("location", v)} placeholder="City, Ethiopia" /><Field label="About you" value={draft.bio} onChange={(v) => update("bio", v)} textarea full placeholder="Describe your expertise, experience, and the value you offer clients." /><div className="mp-form-actions-full"><Actions onSave={save} onCancel={cancel} /></div></div> : <p className="mp-body-text">{profile.bio || <span className="mp-muted">Introduce yourself, your experience, and the kind of work you do.</span>}</p>}
        </section>

        {editingPanel("professional", "Professional details", <div className="mp-form-grid"><Field label="Hourly rate (ETB)" value={draft.hourlyRate} onChange={(v) => update("hourlyRate", v)} type="number" min="0" /><Field label="Years of experience" value={draft.experience} onChange={(v) => update("experience", v)} type="number" min="0" /><label className="mp-field"><span>Availability</span><select value={draft.availability} onChange={(e) => update("availability", e.target.value)}><option>Available</option><option>Busy</option><option>Not Available</option></select></label><Field label="Languages" value={draft.languages} onChange={(v) => update("languages", v)} placeholder="Amharic, English" /><Field label="Personal website" value={draft.website} onChange={(v) => update("website", v)} placeholder="https://example.com" /><div className="mp-form-actions-full"><Actions onSave={save} onCancel={cancel} /></div></div>)}

        <section className="mp-card"><div className="mp-card-heading"><div><span className="mp-kicker">WHAT I DO</span><h2>Skills</h2></div>{editing !== "skills" && <EditAction onClick={() => begin("skills")} />}</div>
          {editing === "skills" ? <div className="mp-edit-stack"><div className="mp-add-row"><input value={skillText} onChange={(e) => setSkillText(e.target.value)} placeholder="Add a skill (e.g. React)" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const s = skillText.trim(); if (s && !draft.skills.some((x) => x.toLowerCase() === s.toLowerCase())) update("skills", [...draft.skills, s]); setSkillText(""); } }} /><button type="button" className="mp-btn mp-btn-gold" onClick={() => { const s = skillText.trim(); if (s && !draft.skills.some((x) => x.toLowerCase() === s.toLowerCase())) update("skills", [...draft.skills, s]); setSkillText(""); }}><Plus size={15} /> Add</button></div><div className="mp-tags">{draft.skills.map((skill, i) => <span className="mp-tag mp-tag-edit" key={`${skill}-${i}`}>{skill}<button type="button" onClick={() => update("skills", draft.skills.filter((_, index) => index !== i))} aria-label={`Remove ${skill}`}><X size={13} /></button></span>)}</div><Actions onSave={save} onCancel={cancel} /></div> : profile.skills.length ? <div className="mp-tags">{profile.skills.map((skill, i) => <span className="mp-tag" key={`${skill}-${i}`}>{skill}</span>)}</div> : <Empty>Add the skills that best describe your work.</Empty>}
        </section>

        <section className="mp-card"><div className="mp-card-heading"><div><span className="mp-kicker">SELECTED WORK</span><h2>Portfolio</h2></div><button type="button" className="mp-btn mp-btn-gold" onClick={() => openPortfolio()}><Plus size={15} /> Add project</button></div>
          {profile.portfolio.length ? <div className="mp-project-grid">{profile.portfolio.map((item) => <article className="mp-project" key={item.id}><div className="mp-card-heading"><div className="mp-project-icon"><FolderOpen size={19} /></div><button type="button" className="mp-edit" onClick={() => openPortfolio(item)} aria-label="Edit project"><Pencil size={14} /></button></div><h3>{item.title || "Untitled project"}</h3><p>{item.description}</p>{(item.skills?.length || item.technologies) && <small>{(item.skills || item.technologies.split(",")).join(", ")}</small>}{item.status === "draft" && <span className="mp-draft-label">Draft</span>}{validUrl(item.url) && <a href={item.url} target="_blank" rel="noreferrer">View project <ExternalLink size={13} /></a>}</article>)}</div> : <Empty>Showcase projects you have completed or are proud of.</Empty>}
        </section>

        <section className="mp-card"><div className="mp-card-heading"><div><span className="mp-kicker">CAREER HISTORY</span><h2>Work experience</h2></div>{editing !== "experience" && <EditAction onClick={() => begin("experience")} />}</div>
          {editing === "experience" ? <div className="mp-edit-stack"><button type="button" className="mp-btn mp-btn-outline mp-add-button" onClick={() => addItem("experienceHistory", { position: "", company: "", duration: "", description: "" })}><Plus size={15} /> Add experience</button>{draft.experienceHistory.map((item) => <div className="mp-repeat" key={item.id}><button className="mp-remove" type="button" onClick={() => removeItem("experienceHistory", item.id)} aria-label="Remove experience"><Trash2 size={15} /></button><div className="mp-form-grid"><Field label="Position" value={item.position} onChange={(v) => changeItem("experienceHistory", item.id, "position", v)} placeholder="Frontend Developer" /><Field label="Company" value={item.company} onChange={(v) => changeItem("experienceHistory", item.id, "company", v)} /><Field label="Duration" value={item.duration} onChange={(v) => changeItem("experienceHistory", item.id, "duration", v)} placeholder="Jan 2024 – Present" full /><Field label="Description" value={item.description} onChange={(v) => changeItem("experienceHistory", item.id, "description", v)} textarea full /></div></div>)}<Actions onSave={save} onCancel={cancel} /></div> : profile.experienceHistory.length ? <div className="mp-timeline">{profile.experienceHistory.map((item) => <article className="mp-timeline-item" key={item.id}><span className="mp-timeline-mark"><BriefcaseBusiness size={17} /></span><div><h3>{item.position}</h3><strong>{item.company}</strong>{item.duration && <small>{item.duration}</small>}<p>{item.description}</p></div></article>)}</div> : <Empty>Add your previous roles, internships, or freelance experience.</Empty>}
        </section>

        <section className="mp-card"><div className="mp-card-heading"><div><span className="mp-kicker">ACADEMIC BACKGROUND</span><h2>Education</h2></div>{editing !== "education" && <EditAction onClick={() => begin("education")} />}</div>
          {editing === "education" ? <div className="mp-edit-stack"><button type="button" className="mp-btn mp-btn-outline mp-add-button" onClick={() => addItem("educationHistory", { degree: "", institution: "", year: "" })}><Plus size={15} /> Add education</button>{draft.educationHistory.map((item) => <div className="mp-repeat" key={item.id}><button className="mp-remove" type="button" onClick={() => removeItem("educationHistory", item.id)} aria-label="Remove education"><Trash2 size={15} /></button><div className="mp-form-grid"><Field label="Degree / qualification" value={item.degree} onChange={(v) => changeItem("educationHistory", item.id, "degree", v)} /><Field label="Institution" value={item.institution} onChange={(v) => changeItem("educationHistory", item.id, "institution", v)} /><Field label="Year" value={item.year} onChange={(v) => changeItem("educationHistory", item.id, "year", v)} /></div></div>)}<Actions onSave={save} onCancel={cancel} /></div> : profile.educationHistory.length ? <div className="mp-timeline">{profile.educationHistory.map((item) => <article className="mp-timeline-item" key={item.id}><span className="mp-timeline-mark"><GraduationCap size={18} /></span><div><h3>{item.degree}</h3><strong>{item.institution}</strong>{item.year && <small>{item.year}</small>}</div></article>)}</div> : <Empty>Add your degree, institution, and graduation year.</Empty>}
        </section>

        <section className="mp-card"><div className="mp-card-heading"><div><span className="mp-kicker">PROFESSIONAL CREDENTIALS</span><h2>Certifications</h2></div>{editing !== "certifications" && <EditAction onClick={() => begin("certifications")} />}</div>
          {editing === "certifications" ? <div className="mp-edit-stack"><button type="button" className="mp-btn mp-btn-outline mp-add-button" onClick={() => addItem("certifications", { name: "", issuingOrganization: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" })}><Plus size={15} /> Add certification</button>{draft.certifications.map((item) => <div className="mp-repeat" key={item.id}><button className="mp-remove" type="button" onClick={() => removeItem("certifications", item.id)} aria-label="Remove certification"><Trash2 size={15} /></button><div className="mp-form-grid"><Field label="Certificate name" value={item.name} onChange={(v) => changeItem("certifications", item.id, "name", v)} /><Field label="Issuing organization" value={item.issuingOrganization} onChange={(v) => changeItem("certifications", item.id, "issuingOrganization", v)} /><Field label="Issue date" type="date" value={item.issueDate} onChange={(v) => changeItem("certifications", item.id, "issueDate", v)} /><Field label="Expiry date" type="date" value={item.expiryDate} onChange={(v) => changeItem("certifications", item.id, "expiryDate", v)} /><Field label="Credential ID" value={item.credentialId} onChange={(v) => changeItem("certifications", item.id, "credentialId", v)} /><Field label="Credential URL" value={item.credentialUrl} onChange={(v) => changeItem("certifications", item.id, "credentialUrl", v)} placeholder="https://..." /></div></div>)}{error && <p className="mp-error">{error}</p>}<Actions onSave={saveCertifications} onCancel={cancel} saving={certificationsSaving} /></div> : certificationsLoading ? <p className="mp-empty">Loading certifications…</p> : profile.certifications.length ? <div className="mp-cert-list">{profile.certifications.map((item) => <article className="mp-cert" key={item.id}><span className="mp-timeline-mark"><Award size={17} /></span><div><h3>{item.name}</h3><strong>{item.issuingOrganization}</strong>{item.issueDate && <small>Issued {new Date(`${item.issueDate}T00:00:00`).toLocaleDateString()}</small>}{item.expiryDate && <small>Expires {new Date(`${item.expiryDate}T00:00:00`).toLocaleDateString()}</small>}{item.credentialId && <small>Credential ID: {item.credentialId}</small>}{validUrl(item.credentialUrl) && <a href={item.credentialUrl} target="_blank" rel="noreferrer">View credential <ExternalLink size={12} /></a>}</div></article>)}</div> : <Empty>Add certificates and professional credentials.</Empty>}
        </section>
      </main>
    </div>
    {portfolioOpen && portfolioDraft && <div className="mp-portfolio-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) closePortfolio(); }}>
      <section className="mp-portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="mp-portfolio-title">
        <header className="mp-portfolio-modal-head"><div><h2 id="mp-portfolio-title">Add a portfolio project</h2><p>Add your project details, then save it to your profile.</p></div><button type="button" className="mp-portfolio-close" onClick={closePortfolio} aria-label="Close"><X size={23} /></button></header>
        <div className="mp-portfolio-form">
          <div className="mp-portfolio-left">
            <label className="mp-portfolio-field"><span>Project title <b>*</b></span><input maxLength={70} value={portfolioDraft.title} onChange={e => setPortfolioDraft(old => ({ ...old, title: e.target.value }))} placeholder="Enter a brief but descriptive title."/><small>{70 - portfolioDraft.title.length} characters left</small></label>
            <label className="mp-portfolio-field"><span>Your role <em>(optional)</em></span><input maxLength={50} value={portfolioDraft.role} onChange={e => setPortfolioDraft(old => ({ ...old, role: e.target.value }))} placeholder="e.g., Front-end engineer or Marketing analyst"/><small>{50 - portfolioDraft.role.length} characters left</small></label>
            <label className="mp-portfolio-field"><span>Project description <b>*</b></span><textarea maxLength={600} rows={3} value={portfolioDraft.description} onChange={e => setPortfolioDraft(old => ({ ...old, description: e.target.value }))} placeholder="Briefly describe the project's goals, your solution and the impact you made here."/><small>{600 - portfolioDraft.description.length} characters left</small></label>
            <div className="mp-portfolio-field"><span>Skills and deliverables <b>*</b></span><div className="mp-portfolio-skill-entry"><input value={portfolioSkillInput} onChange={e => setPortfolioSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPortfolioSkill(); } }} disabled={portfolioDraft.skills.length >= 5} placeholder="Type to add skills relevant to this project"/><button type="button" onClick={addPortfolioSkill} disabled={!portfolioSkillInput.trim() || portfolioDraft.skills.length >= 5}><Plus size={15}/></button></div><small>{5 - portfolioDraft.skills.length} skills left</small><div className="mp-tags">{portfolioDraft.skills.map((skill, i) => <span className="mp-tag mp-tag-edit" key={`${skill}-${i}`}>{skill}<button type="button" onClick={() => setPortfolioDraft(old => ({ ...old, skills: old.skills.filter((_, index) => index !== i) }))}><X size={12}/></button></span>)}</div></div>
          </div>
          <div className="mp-portfolio-right">
            <div className="mp-content-drop">
              <strong>Add project files or a link</strong>
              <span>Attach a file up to 1 MB or add a web link.</span>
              <div className="mp-content-tools">
                <button type="button" title="Add file" onClick={() => portfolioFileRef.current?.click()}><FileText size={20} /><span>Add file</span></button>
                <button type="button" title="Add link" onClick={() => { setShowPortfolioLinkInput(value => !value); setError(""); }}><Link2 size={20} /><span>Add link</span></button>
              </div>
              <input ref={portfolioFileRef} type="file" hidden accept="*/*" onChange={handlePortfolioFile}/>
            </div>
            {showPortfolioLinkInput && (
              <div className="mp-portfolio-link-entry">
                <label htmlFor="mp-portfolio-link">Project URL</label>
                <div>
                  <input
                    id="mp-portfolio-link"
                    type="url"
                    value={portfolioLinkInput}
                    onChange={event => setPortfolioLinkInput(event.target.value)}
                    onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); addPortfolioLink(); } }}
                    placeholder="https://your-project.com"
                  />
                  <button type="button" onClick={addPortfolioLink} disabled={!portfolioLinkInput.trim()}>Add link</button>
                </div>
              </div>
            )}
            {portfolioDraft.content.length > 0 && <div className="mp-portfolio-attachments">{portfolioDraft.content.map(file => <div key={file.id}>{file.type === "link" && validUrl(file.data) ? <a href={file.data} target="_blank" rel="noreferrer">{file.name}</a> : <span>{file.name}</span>}<button type="button" onClick={() => setPortfolioDraft(old => ({ ...old, content: old.content.filter(x => x.id !== file.id), ...(file.type === "link" && old.url === file.data ? { url: "" } : {}) }))} aria-label={`Remove ${file.name}`}><X size={14}/></button></div>)}</div>}
            <label className="mp-portfolio-field mp-portfolio-url"><span>Project link <em>(optional)</em></span><input value={portfolioDraft.url || ""} onChange={e => setPortfolioDraft(old => ({ ...old, url: e.target.value }))} placeholder="https://your-project.com"/></label>
          </div>
        </div>
        {error && <p className="mp-error mp-portfolio-error">{error}</p>}
        <footer className="mp-portfolio-footer"><button type="button" className="mp-portfolio-draft" onClick={() => savePortfolio("draft")}>Save as draft</button><button type="button" className="mp-btn mp-btn-gold" onClick={() => savePortfolio("published")}>Save project</button></footer>
      </section>
    </div>}
  </div>;
}
