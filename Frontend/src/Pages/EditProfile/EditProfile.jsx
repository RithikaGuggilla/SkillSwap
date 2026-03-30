
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Form from "react-bootstrap/Form";
import { skills } from "./Skills";
import axios from "axios";
import Badge from "react-bootstrap/Badge";
import { v4 as uuidv4 } from "uuid";
import { useUser } from "../../util/UserContext";

/* ══════════════════════════════════════════════
   SHARED STYLES
══════════════════════════════════════════════ */
const inputStyle = {
  width: "100%", background: "#111",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10, color: "#eee",
  fontFamily: "'DM Mono', monospace", fontSize: "0.82rem",
  padding: "11px 14px", outline: "none",
  marginTop: 6,
};

const labelStyle = {
  fontFamily: "'DM Mono', monospace", fontSize: "0.6rem",
  letterSpacing: "0.14em", textTransform: "uppercase",
  color: "#666", display: "block", marginTop: 18,
};

const sectionCard = {
  background: "#0f0f0f",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 14, padding: "24px 28px", marginBottom: 16,
};

/* ══════════════════════════════════════════════
   TAB BUTTON
══════════════════════════════════════════════ */
const TabBtn = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      padding: "10px 20px", borderRadius: 10, cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
      letterSpacing: "0.1em", textTransform: "uppercase",
      background: active ? "#fff" : "transparent",
      color: active ? "#000" : "#666",
      border: active ? "none" : "1px solid rgba(255,255,255,0.1)",
      fontWeight: active ? 700 : 400,
      transition: "all 0.15s",
    }}
  >
    {children}
  </button>
);

/* ══════════════════════════════════════════════
   SAVE BUTTON
══════════════════════════════════════════════ */
const SaveBtn = ({ onClick, loading, label = "Save Changes" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      padding: "12px 32px", borderRadius: 10, cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: "0.65rem",
      letterSpacing: "0.12em", textTransform: "uppercase",
      background: "#fff", color: "#000", border: "none",
      fontWeight: 700, opacity: loading ? 0.6 : 1, transition: "opacity 0.15s",
    }}
  >
    {loading ? "Saving…" : label}
  </button>
);

/* ══════════════════════════════════════════════
   SKILL TAG
══════════════════════════════════════════════ */
const SkillTag = ({ skill, onRemove }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 6,
    fontFamily: "'DM Mono', monospace", fontSize: "0.65rem",
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, padding: "5px 10px", color: "#ddd",
    margin: "4px 4px 0 0",
  }}>
    {skill}
    <span
      onClick={onRemove}
      style={{ cursor: "pointer", color: "#666", fontSize: "0.7rem", lineHeight: 1 }}
    >✕</span>
  </span>
);

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
const EditProfile = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeTab, setActiveTab]     = useState("basic");

  const [form, setForm] = useState({
    profilePhoto: null, name: "", email: "", username: "",
    portfolioLink: "", githubLink: "", linkedinLink: "",
    skillsProficientAt: [], skillsToLearn: [],
    education: [{ id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }],
    bio: "", projects: [],
  });

  const [skillsProficientAt, setSkillsProficientAt] = useState("Select some skill");
  const [skillsToLearn, setSkillsToLearn]           = useState("Select some skill");
  const [techStack, setTechStack]                   = useState([]);

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        name: user.name, email: user.email, username: user.username,
        skillsProficientAt: user.skillsProficientAt || [],
        skillsToLearn: user.skillsToLearn || [],
        portfolioLink: user.portfolioLink || "", githubLink: user.githubLink || "",
        linkedinLink: user.linkedinLink || "", education: user.education || prev.education,
        bio: user.bio || "", projects: user.projects || [],
      }));
      setTechStack((user.projects || []).map(() => "Select some Tech Stack"));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 500) { toast.error("Bio max 500 chars"); return; }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const data = new FormData();
    data.append("picture", e.target.files[0]);
    try {
      toast.info("Uploading photo…");
      const response = await axios.post("/user/uploadPicture", data);
      toast.success("Photo uploaded!");
      setForm(prev => ({ ...prev, picture: response.data.data.url }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Upload failed");
    }
  };

  const addSkill = (type) => {
    const skill = type === "teach" ? skillsProficientAt : skillsToLearn;
    if (skill === "Select some skill") { toast.error("Select a skill first"); return; }
    const field = type === "teach" ? "skillsProficientAt" : "skillsToLearn";
    const other = type === "teach" ? "skillsToLearn" : "skillsProficientAt";
    if (form[field].includes(skill)) { toast.error("Already added"); return; }
    if (form[other].includes(skill)) { toast.error("Already in the other list"); return; }
    setForm(prev => ({ ...prev, [field]: [...prev[field], skill] }));
  };

  const removeSkill = (skill, field) => {
    setForm(prev => ({ ...prev, [field]: prev[field].filter(s => s !== skill) }));
  };

  const handleEducationChange = (e, index) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, education: prev.education.map((item, i) => i === index ? { ...item, [name]: value } : item) }));
  };

  const addEducation = () => {
    setForm(prev => ({ ...prev, education: [...prev.education, { id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }] }));
  };

  const removeEducation = (id) => {
    setForm(prev => ({ ...prev, education: prev.education.filter(e => e._id !== id && e.id !== id) }));
  };

  const handleProjectChange = (e, index) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, [name]: value } : item) }));
  };

  const addTechStack = (index) => {
    const ts = techStack[index];
    if (ts === "Select some Tech Stack") { toast.error("Select a tech stack"); return; }
    if (form.projects[index].techStack.includes(ts)) { toast.error("Already added"); return; }
    setForm(prev => ({ ...prev, projects: prev.projects.map((item, i) => i === index ? { ...item, techStack: [...item.techStack, ts] } : item) }));
  };

  const validateBasic = () => {
    if (!form.username) { toast.error("Username required"); return false; }
    if (!form.skillsProficientAt.length) { toast.error("Add at least one skill you can teach"); return false; }
    if (!form.skillsToLearn.length) { toast.error("Add at least one skill to learn"); return false; }
    if (!form.portfolioLink && !form.githubLink && !form.linkedinLink) { toast.error("Add at least one link"); return false; }
    return true;
  };

  const handleSaveBasic = async () => {
    if (!validateBasic()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveRegDetails", form);
      toast.success("Basic info saved!");
    } catch (e) { toast.error(e?.response?.data?.message || "Save failed"); }
    finally { setSaveLoading(false); }
  };

  const handleSaveEducation = async () => {
    if (!validateBasic()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveEduDetail", form);
      toast.success("Education saved!");
    } catch (e) { toast.error(e?.response?.data?.message || "Save failed"); }
    finally { setSaveLoading(false); }
  };

  const handleSaveAdditional = async () => {
    if (!validateBasic()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registered/saveAddDetail", form);
      toast.success("Additional info saved!");
    } catch (e) { toast.error(e?.response?.data?.message || "Save failed"); }
    finally { setSaveLoading(false); }
  };

  const tabs = [
    { id: "basic",      label: "Basic Info" },
    { id: "education",  label: "Education" },
    { id: "additional", label: "Additional" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ccc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@700&family=Syne:wght@400;600;700&family=DM+Mono:wght@300;400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .ep-input:focus { border-color: rgba(255,255,255,0.3) !important; }
        .ep-select { appearance: none; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px 80px" }}>

        {/* ── Back button ── */}
        <button
          onClick={() => navigate(`/profile/${user?.username}`)}
          style={{
            background: "transparent", border: "none", color: "#555",
            fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer", padding: 0, marginBottom: 24,
            display: "flex", alignItems: "center", gap: 6, transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#fff"}
          onMouseLeave={e => e.currentTarget.style.color = "#555"}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Profile
        </button>

        {/* ── Page title ── */}
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: "2rem",
          fontWeight: 700, color: "#fff", margin: "0 0 8px",
        }}>
          Edit Profile
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.62rem", color: "#555", letterSpacing: "0.08em", margin: "0 0 28px" }}>
          @{user?.username}
        </p>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {tabs.map(t => (
            <TabBtn key={t.id} active={activeTab === t.id} onClick={() => setActiveTab(t.id)}>
              {t.label}
            </TabBtn>
          ))}
        </div>

        {/* ════════════════════════════════
            TAB: BASIC INFO
        ════════════════════════════════ */}
        {activeTab === "basic" && (
          <>
            {/* Identity */}
            <div style={sectionCard}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Identity</h2>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#555", margin: "0 0 16px" }}>Basic account information</p>

              <label style={labelStyle}>Name</label>
              <input className="ep-input" style={{ ...inputStyle, opacity: 0.5 }} value={form.name} disabled />

              <label style={labelStyle}>Email</label>
              <input className="ep-input" style={{ ...inputStyle, opacity: 0.5 }} value={form.email} disabled />

              <label style={labelStyle}>Username</label>
              <input className="ep-input" style={inputStyle} name="username" value={form.username} onChange={handleInputChange} placeholder="your_username" />

              <label style={labelStyle}>Profile Photo</label>
              <div style={{ marginTop: 8 }}>
                <label style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 10, cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.1)", color: "#888",
                  fontFamily: "'DM Mono', monospace", fontSize: "0.62rem",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
            </div>

            {/* Links */}
            <div style={sectionCard}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Links</h2>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#555", margin: "0 0 16px" }}>Add at least one</p>

              <label style={labelStyle}>GitHub</label>
              <input className="ep-input" style={inputStyle} name="githubLink" value={form.githubLink} onChange={handleInputChange} placeholder="https://github.com/username" />

              <label style={labelStyle}>LinkedIn</label>
              <input className="ep-input" style={inputStyle} name="linkedinLink" value={form.linkedinLink} onChange={handleInputChange} placeholder="https://linkedin.com/in/username" />

              <label style={labelStyle}>Portfolio</label>
              <input className="ep-input" style={inputStyle} name="portfolioLink" value={form.portfolioLink} onChange={handleInputChange} placeholder="https://yoursite.com" />
            </div>

            {/* Skills I Can Teach */}
            <div style={sectionCard}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Skills I Can Teach</h2>
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                <select
                  className="ep-select"
                  style={{ ...inputStyle, marginTop: 0, flex: 1, cursor: "pointer" }}
                  value={skillsProficientAt}
                  onChange={e => setSkillsProficientAt(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => addSkill("teach")}
                  style={{ padding: "11px 18px", background: "#fff", color: "#000", border: "none", borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap" }}>
                {form.skillsProficientAt.map((s, i) => (
                  <SkillTag key={i} skill={s} onRemove={() => removeSkill(s, "skillsProficientAt")} />
                ))}
              </div>
            </div>

            {/* Skills I Want to Learn */}
            <div style={sectionCard}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Skills I Want to Learn</h2>
              <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
                <select
                  className="ep-select"
                  style={{ ...inputStyle, marginTop: 0, flex: 1, cursor: "pointer" }}
                  value={skillsToLearn}
                  onChange={e => setSkillsToLearn(e.target.value)}
                >
                  <option>Select some skill</option>
                  {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button
                  onClick={() => addSkill("learn")}
                  style={{ padding: "11px 18px", background: "#fff", color: "#000", border: "none", borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", flexShrink: 0 }}
                >
                  Add
                </button>
              </div>
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap" }}>
                {form.skillsToLearn.map((s, i) => (
                  <SkillTag key={i} skill={s} onRemove={() => removeSkill(s, "skillsToLearn")} />
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <SaveBtn onClick={handleSaveBasic} loading={saveLoading} />
            </div>
          </>
        )}

        {/* ════════════════════════════════
            TAB: EDUCATION
        ════════════════════════════════ */}
        {activeTab === "education" && (
          <>
            {form.education.map((edu, index) => (
              <div key={edu._id || edu.id} style={sectionCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                    Education {index + 1}
                  </h2>
                  {index > 0 && (
                    <button
                      onClick={() => removeEducation(edu._id || edu.id)}
                      style={{ background: "transparent", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.58rem" }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <label style={labelStyle}>Institution</label>
                <input className="ep-input" style={inputStyle} name="institution" value={edu.institution} onChange={e => handleEducationChange(e, index)} placeholder="University / College name" />

                <label style={labelStyle}>Degree</label>
                <input className="ep-input" style={inputStyle} name="degree" value={edu.degree} onChange={e => handleEducationChange(e, index)} placeholder="B.Tech, MBA, etc." />

                <label style={labelStyle}>Grade / Percentage</label>
                <input className="ep-input" style={inputStyle} name="score" type="number" value={edu.score} onChange={e => handleEducationChange(e, index)} placeholder="8.5 / 85%" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input className="ep-input" style={inputStyle} name="startDate" type="date" value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""} onChange={e => handleEducationChange(e, index)} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input className="ep-input" style={inputStyle} name="endDate" type="date" value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""} onChange={e => handleEducationChange(e, index)} />
                  </div>
                </div>

                <label style={labelStyle}>Description</label>
                <input className="ep-input" style={inputStyle} name="description" value={edu.description} onChange={e => handleEducationChange(e, index)} placeholder="Achievements, activities, notes…" />
              </div>
            ))}

            <button
              onClick={addEducation}
              style={{ width: "100%", padding: "12px", marginBottom: 20, background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              + Add Education
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={handleSaveEducation} loading={saveLoading} />
            </div>
          </>
        )}

        {/* ════════════════════════════════
            TAB: ADDITIONAL
        ════════════════════════════════ */}
        {activeTab === "additional" && (
          <>
            {/* Bio */}
            <div style={sectionCard}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Bio</h2>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "0.58rem", color: "#555", margin: "0 0 12px" }}>Max 500 characters · {form.bio.length}/500</p>
              <textarea
                name="bio" value={form.bio} onChange={handleInputChange}
                placeholder="Tell people about yourself…"
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6, fontFamily: "'Syne', sans-serif" }}
              />
            </div>

            {/* Projects */}
            {form.projects.map((project, index) => (
              <div key={project._id || project.id} style={sectionCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.9rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                    Project {index + 1}
                  </h2>
                  <button
                    onClick={() => {
                      setForm(prev => ({ ...prev, projects: prev.projects.filter((_, i) => i !== index) }));
                      setTechStack(prev => prev.filter((_, i) => i !== index));
                    }}
                    style={{ background: "transparent", border: "1px solid #ef444433", color: "#ef4444", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: "0.58rem" }}
                  >
                    Remove
                  </button>
                </div>

                <label style={labelStyle}>Title</label>
                <input className="ep-input" style={inputStyle} name="title" value={project.title} onChange={e => handleProjectChange(e, index)} placeholder="Project name" />

                <label style={labelStyle}>Project Link</label>
                <input className="ep-input" style={inputStyle} name="projectLink" value={project.projectLink} onChange={e => handleProjectChange(e, index)} placeholder="https://github.com/…" />

                <label style={labelStyle}>Tech Stack</label>
                <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                  <select
                    className="ep-select"
                    style={{ ...inputStyle, marginTop: 0, flex: 1, cursor: "pointer" }}
                    value={techStack[index] || "Select some Tech Stack"}
                    onChange={e => setTechStack(prev => prev.map((item, i) => i === index ? e.target.value : item))}
                  >
                    <option>Select some Tech Stack</option>
                    {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => addTechStack(index)}
                    style={{ padding: "11px 18px", background: "#fff", color: "#000", border: "none", borderRadius: 10, fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
                  >Add</button>
                </div>
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap" }}>
                  {project.techStack.map((ts, i) => (
                    <SkillTag key={i} skill={ts} onRemove={() => {
                      setForm(prev => ({ ...prev, projects: prev.projects.map((item, pi) => pi === index ? { ...item, techStack: item.techStack.filter(t => t !== ts) } : item) }));
                    }} />
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 4 }}>
                  <div>
                    <label style={labelStyle}>Start Date</label>
                    <input className="ep-input" style={inputStyle} name="startDate" type="date" value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""} onChange={e => handleProjectChange(e, index)} />
                  </div>
                  <div>
                    <label style={labelStyle}>End Date</label>
                    <input className="ep-input" style={inputStyle} name="endDate" type="date" value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""} onChange={e => handleProjectChange(e, index)} />
                  </div>
                </div>

                <label style={labelStyle}>Description</label>
                <input className="ep-input" style={inputStyle} name="description" value={project.description} onChange={e => handleProjectChange(e, index)} placeholder="What does this project do?" />
              </div>
            ))}

            <button
              onClick={() => {
                setTechStack(prev => [...prev, "Select some Tech Stack"]);
                setForm(prev => ({ ...prev, projects: [...prev.projects, { id: uuidv4(), title: "", techStack: [], startDate: "", endDate: "", projectLink: "", description: "" }] }));
              }}
              style={{ width: "100%", padding: "12px", marginBottom: 20, background: "transparent", border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, color: "#666", fontFamily: "'DM Mono', monospace", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
            >
              + Add Project
            </button>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <SaveBtn onClick={handleSaveAdditional} loading={saveLoading} />
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default EditProfile;