import { useEffect, useRef, useState } from "react";
import {
  Plus, X, Link2, FileText,
  FolderOpen, Pencil, ExternalLink, Trash2, Eye,
} from "lucide-react";
import "./Portfolio.css";
import { readUserData, writeUserData } from "../../services/api";

const STORAGE_KEY = "ethioLanceProfile";
const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const emptyProject = () => ({
  id: makeId(), title: "", role: "", description: "", skills: [], content: [],
  url: "", status: "published",
});

function readProjects() {
  try {
    const profile = readUserData(STORAGE_KEY, {});
    return Array.isArray(profile.portfolio) ? profile.portfolio : [];
  } catch {
    return [];
  }
}

export default function Portfolio() {
  const [projects, setProjects] = useState(readProjects);
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [error, setError] = useState("");
  const fileInput = useRef(null);
  const [linkInput, setLinkInput] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  useEffect(() => {
    try {
      const profile = readUserData(STORAGE_KEY, {});
      writeUserData(STORAGE_KEY, { ...profile, portfolio: projects });
    } catch (err) {
      console.error("Could not save portfolio projects", err);
    }
  }, [projects]);

  const openNew = () => {
    setDraft(emptyProject());
    setSkillInput("");
    setLinkInput("");
    setShowLinkInput(false);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (project) => {
    setDraft({
      ...project,
      skills: Array.isArray(project.skills)
        ? [...project.skills]
        : String(project.technologies || "").split(",").map((x) => x.trim()).filter(Boolean),
      content: Array.isArray(project.content) ? [...project.content] : [],
    });
    setSkillInput("");
    setLinkInput("");
    setShowLinkInput(false);
    setError("");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setDraft(null);
    setLinkInput("");
    setShowLinkInput(false);
    setError("");
  };

  const updateDraft = (field, value) => setDraft((old) => ({ ...old, [field]: value }));

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill || draft.skills.length >= 5) return;
    if (draft.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setSkillInput("");
      return;
    }
    updateDraft("skills", [...draft.skills, skill]);
    setSkillInput("");
  };

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    const allowedDocument = /\.(pdf|docx?|pptx?|xlsx?|zip|txt)$/i.test(file.name);
    if (file.type.startsWith("image/") || !allowedDocument) {
      setError("Portfolio attachments must be documents or ZIP files. Images are not supported.");
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Attachments must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraft((old) => ({ ...old, content: [...old.content, {
        id: makeId(), name: file.name, type: file.type || "application/octet-stream", data: reader.result,
      }] }));
      setError("");
    };
    reader.onerror = () => setError("Could not read this file. Please try again.");
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const addLink = () => {
    const value = linkInput.trim();
    let parsedUrl;
    try { parsedUrl = new URL(value); }
    catch { setError("Enter a valid link beginning with http:// or https://."); return; }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Enter a valid link beginning with http:// or https://.");
      return;
    }
    setDraft((old) => ({ ...old, content: [...old.content, { id: makeId(), name: value, type: "link", data: value }], url: value }));
    setLinkInput("");
    setShowLinkInput(false);
    setError("");
  };

  const saveProject = (status) => {
    if (status === "published" && (!draft.title.trim() || !draft.description.trim() || !draft.skills.length)) {
      setError("Add a project title, description, and at least one skill before publishing.");
      return;
    }
    const project = { ...draft, status, technologies: draft.skills.join(", ") };
    setProjects((old) => old.some((item) => item.id === project.id)
      ? old.map((item) => item.id === project.id ? project : item)
      : [...old, project]);
    closeModal();
  };

  const removeAttachment = (file) => {
    updateDraft("content", draft.content.filter((item) => item.id !== file.id));
    if (file.type === "link" && draft.url === file.data) updateDraft("url", "");
  };

  const deleteProject = (id) => {
    if (window.confirm("Delete this portfolio project?")) {
      setProjects((old) => old.filter((item) => item.id !== id));
    }
  };

  const publishedCount = projects.filter((project) => project.status !== "draft").length;
  const draftCount = projects.length - publishedCount;

  return (
    <div className="eth-portfolio-page">
      <div className="eth-portfolio-heading">
        <div>
          <span className="eth-portfolio-eyebrow">FREELANCER SHOWCASE</span>
          <h1>Portfolio</h1>
          <p>Highlight projects that demonstrate your skills and experience.</p>
        </div>
        <button className="eth-portfolio-primary" type="button" onClick={openNew}>
          <Plus size={17} /> Add project
        </button>
      </div>

      <div className="eth-portfolio-overview" aria-label="Portfolio overview">
        <div className="eth-portfolio-stat">
          <span className="eth-portfolio-stat-icon"><FolderOpen size={18} /></span>
          <span><small>Total projects</small><strong>{projects.length}</strong></span>
        </div>
        <div className="eth-portfolio-stat">
          <span className="eth-portfolio-stat-icon published"><Eye size={18} /></span>
          <span><small>Published</small><strong>{publishedCount}</strong></span>
        </div>
        <div className="eth-portfolio-stat">
          <span className="eth-portfolio-stat-icon draft"><FileText size={18} /></span>
          <span><small>Drafts</small><strong>{draftCount}</strong></span>
        </div>
      </div>

      {projects.length ? (
        <div className="eth-project-grid">
          {projects.map((project) => (
            <article className="eth-project-card" key={project.id}>
              <div className="eth-project-card-top">
                <span className="eth-project-folder"><FolderOpen size={20} /></span>
                <span className={`eth-project-status ${project.status === "draft" ? "draft" : "published"}`}>
                  {project.status === "draft" ? "Draft" : "Published"}
                </span>
                <div className="eth-project-actions">
                  <button type="button" onClick={() => openEdit(project)} aria-label={`Edit ${project.title || "project"}`} title="Edit project"><Pencil size={15} /></button>
                  <button type="button" onClick={() => deleteProject(project.id)} aria-label={`Delete ${project.title || "project"}`} title="Delete project"><Trash2 size={15} /></button>
                </div>
              </div>
              <h3>{project.title || "Untitled project"}</h3>
              {project.role && <span className="eth-project-role">{project.role}</span>}
              <p>{project.description || "No description added."}</p>
              <div className="eth-project-tags">{(project.skills || []).map((skill) => <span key={skill}>{skill}</span>)}</div>
              {project.content?.some((file) => file.type?.startsWith("image/")) && (
                <div className="eth-project-thumbnails">
                  {project.content.filter((file) => file.type?.startsWith("image/")).slice(0, 3).map((file) => <img key={file.id} src={file.data} alt={file.name} />)}
                </div>
              )}
              {project.url?.startsWith("http") && <a className="eth-project-link" href={project.url} target="_blank" rel="noreferrer">View project <ExternalLink size={13} /></a>}
            </article>
          ))}
        </div>
      ) : (
        <div className="eth-portfolio-empty">
          <span><FolderOpen size={27} /></span>
          <h2>Your portfolio is waiting</h2>
          <p>Add your first project to show clients what you can do.</p>
          <button type="button" className="eth-portfolio-primary" onClick={openNew}><Plus size={16} /> Add your first project</button>
        </div>
      )}

      {isOpen && draft && (
        <div className="eth-portfolio-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="eth-portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="eth-portfolio-modal-title">
          <header className="eth-portfolio-modal-head">
            <div>
              <h2 id="eth-portfolio-modal-title">Add a portfolio project</h2>
              <p>Add project details, attach a file or link, then save it to your profile.</p>
            </div>
            <button className="eth-portfolio-close" type="button" onClick={closeModal} aria-label="Close"><X size={25} /></button>
          </header>

          <div className="eth-portfolio-form">
                  <div className="eth-portfolio-fields">
                    <label className="eth-portfolio-field">
                      <span>Project title <b>*</b></span>
                      <input maxLength={70} value={draft.title} onChange={(e) => updateDraft("title", e.target.value)} placeholder="Enter a brief but descriptive title." />
                      <small>{70 - draft.title.length} characters left</small>
                    </label>
                    <label className="eth-portfolio-field">
                      <span>Your role <em>(optional)</em></span>
                      <input maxLength={50} value={draft.role} onChange={(e) => updateDraft("role", e.target.value)} placeholder="e.g., Front-end engineer or Marketing analyst" />
                      <small>{50 - draft.role.length} characters left</small>
                    </label>
                    <label className="eth-portfolio-field">
                      <span>Project description <b>*</b></span>
                      <textarea maxLength={600} rows={3} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} placeholder="Briefly describe the project's goals, your solution and the impact you made here." />
                      <small>{600 - draft.description.length} characters left</small>
                    </label>
                    <div className="eth-portfolio-field">
                      <span>Skills and deliverables <b>*</b></span>
                      <div className="eth-skill-entry">
                        <input value={skillInput} disabled={draft.skills.length >= 5} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }} placeholder="Type to add skills relevant to this project" />
                        <button type="button" onClick={addSkill} disabled={!skillInput.trim() || draft.skills.length >= 5}><Plus size={17} /></button>
                      </div>
                      <small>{5 - draft.skills.length} skills left</small>
                      <div className="eth-project-tags eth-project-tags-edit">{draft.skills.map((skill) => <span key={skill}>{skill}<button type="button" onClick={() => updateDraft("skills", draft.skills.filter((item) => item !== skill))}><X size={12} /></button></span>)}</div>
                    </div>
                  </div>

            <div className="eth-portfolio-content-column">
              <div className="eth-content-drop">
                <strong>Add project files or a link</strong>
                <span>Attach a document or ZIP file up to 1 MB, or add a web link. Images aren’t supported.</span>
                <div className="eth-content-tools">
                  <button type="button" onClick={() => fileInput.current?.click()} aria-label="Add file"><FileText size={18} /><span>Add file</span></button>
                  <button type="button" onClick={() => { setShowLinkInput((value) => !value); setError(""); }} aria-label="Add link"><Link2 size={18} /><span>Add link</span></button>
                </div>
                <input ref={fileInput} className="eth-hidden-file" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt" onChange={handleFile} />
              </div>
              {showLinkInput && (
                <div className="eth-link-entry">
                  <label htmlFor="eth-portfolio-link">Project URL</label>
                  <div>
                    <input
                      id="eth-portfolio-link"
                      type="url"
                      value={linkInput}
                      onChange={(event) => setLinkInput(event.target.value)}
                      onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addLink(); } }}
                      placeholder="https://your-project.com"
                    />
                    <button type="button" onClick={addLink} disabled={!linkInput.trim()}>Add link</button>
                  </div>
                </div>
              )}
              {draft.content.length > 0 && (
                <div className="eth-portfolio-attachments">
                  {draft.content.map((file) => (
                    <div key={file.id}>
                      {file.type === "link" && file.data?.startsWith("http")
                        ? <a href={file.data} target="_blank" rel="noreferrer">{file.name}</a>
                        : <span>{file.name}</span>}
                      <button type="button" onClick={() => removeAttachment(file)} aria-label={`Remove ${file.name}`}><X size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="eth-portfolio-field eth-portfolio-url">
                <span>Project link <em>(optional)</em></span>
                <input value={draft.url} onChange={(event) => updateDraft("url", event.target.value)} placeholder="https://your-project.com" />
              </label>
            </div>
          </div>
          {error && <p className="eth-portfolio-error" role="alert">{error}</p>}
          <footer className="eth-portfolio-footer">
            <button type="button" className="eth-portfolio-text-button" onClick={() => saveProject("draft")}>Save as draft</button>
            <button type="button" className="eth-portfolio-primary" onClick={() => saveProject("published")}>Save project</button>
          </footer>
          </section>
        </div>
      )}
    </div>
  );
}
