
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "react-bootstrap/Spinner";
import { skills } from "./Skills";
import axios from "axios";
import "./Register.css";
import { v4 as uuidv4 } from "uuid";
import LearningPathTab from "./LearningPathTab";

const TABS = ["registration", "education", "additional", "learningpath", "preview"];
const TAB_LABELS = ["Profile", "Education", "About", "Learning Path", "Confirm"];
const TAB_STEPS  = ["01", "02", "03", "04", "05"];

const Register = () => {
  const navigate = useNavigate();
  const [loading,     setLoading]     = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activeKey,   setActiveKey]   = useState("registration");

  const [form, setForm] = useState({
    name: "", email: "", username: "",
    portfolioLink: "", githubLink: "", linkedinLink: "",
    skillsProficientAt: [], skillsToLearn: [],
    education: [{ id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }],
    bio: "", projects: [],
  });

  const [skillProfInput,  setSkillProfInput]  = useState("Select some skill");
  const [skillLearnInput, setSkillLearnInput] = useState("Select some skill");
  const [techStack,       setTechStack]       = useState([]);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get("/user/unregistered/getDetails");
        const edu = data?.data?.education;
        edu.forEach(e => { e.id = uuidv4(); });
        if (!edu.length) edu.push({ id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" });
        const proj = data?.data?.projects || [];
        proj.forEach(e => { e.id = uuidv4(); });
        setTechStack(proj.map(() => "Select some Tech Stack"));
        setForm(prev => ({
          ...prev,
          name: data?.data?.name, email: data?.data?.email,
          username: data?.data?.username || "",
          skillsProficientAt: data?.data?.skillsProficientAt || [],
          skillsToLearn: data?.data?.skillsToLearn || [],
          linkedinLink: data?.data?.linkedinLink || "",
          githubLink: data?.data?.githubLink || "",
          portfolioLink: data?.data?.portfolioLink || "",
          education: edu, bio: data?.data?.bio || "",
          projects: proj.length ? proj : prev.projects,
        }));
      } catch (err) {
        toast.error(err?.response?.data?.message || "Some error occurred");
        navigate("/login");
      } finally { setLoading(false); }
    };
    getUser();
  }, []);

  const goNext = () => {
    const i = TABS.indexOf(activeKey);
    if (i < TABS.length - 1) setActiveKey(TABS[i + 1]);
  };

  const handleInput = e => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 500) { toast.error("Bio max 500 characters"); return; }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = (type) => {
    if (type === "learn") {
      if (skillLearnInput === "Select some skill") { toast.error("Select a skill"); return; }
      if (form.skillsToLearn.includes(skillLearnInput)) { toast.error("Already added"); return; }
      if (form.skillsProficientAt.includes(skillLearnInput)) { toast.error("Already in proficient skills"); return; }
      setForm(prev => ({ ...prev, skillsToLearn: [...prev.skillsToLearn, skillLearnInput] }));
    } else {
      if (skillProfInput === "Select some skill") { toast.error("Select a skill"); return; }
      if (form.skillsProficientAt.includes(skillProfInput)) { toast.error("Already added"); return; }
      if (form.skillsToLearn.includes(skillProfInput)) { toast.error("Already in skills to learn"); return; }
      setForm(prev => ({ ...prev, skillsProficientAt: [...prev.skillsProficientAt, skillProfInput] }));
    }
  };

  const removeSkill = (skill, type) => {
    if (type === "prof") setForm(prev => ({ ...prev, skillsProficientAt: prev.skillsProficientAt.filter(s => s !== skill) }));
    else setForm(prev => ({ ...prev, skillsToLearn: prev.skillsToLearn.filter(s => s !== skill) }));
  };

  const handleEduChange = (e, i) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, education: prev.education.map((item, idx) => idx === i ? { ...item, [name]: value } : item) }));
  };

  const handleProjChange = (e, i) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, projects: prev.projects.map((item, idx) => idx === i ? { ...item, [name]: value } : item) }));
  };

  const validateReg = () => {
    if (!form.username) { toast.error("Username is required"); return false; }
    if (!form.linkedinLink && !form.githubLink) { toast.error("LinkedIn or GitHub link is required"); return false; }
    const ghReg = /^(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/;
    if (form.githubLink && !ghReg.test(form.githubLink)) { toast.error("Invalid GitHub link"); return false; }
    const liReg = /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;
    if (form.linkedinLink && !liReg.test(form.linkedinLink)) { toast.error("Invalid LinkedIn link"); return false; }
    if (form.portfolioLink && !form.portfolioLink.includes("http")) { toast.error("Invalid portfolio link"); return false; }
    if (!form.skillsProficientAt.length) { toast.error("Add at least one skill you can teach"); return false; }
    if (!form.skillsToLearn.length) { toast.error("Add at least one skill to learn"); return false; }
    return true;
  };

  const validateEdu = () => {
    for (let i = 0; i < form.education.length; i++) {
      const e = form.education[i];
      if (!e.institution) { toast.error(`Education ${i+1}: Institution required`); return false; }
      if (!e.degree)      { toast.error(`Education ${i+1}: Degree required`); return false; }
      if (!e.startDate)   { toast.error(`Education ${i+1}: Start date required`); return false; }
      if (!e.endDate)     { toast.error(`Education ${i+1}: End date required`); return false; }
      if (!e.score)       { toast.error(`Education ${i+1}: Score required`); return false; }
    }
    return true;
  };

  const validateAdd = () => {
    if (!form.bio)            { toast.error("Bio is required"); return false; }
    if (form.bio.length < 50) { toast.error("Bio must be at least 50 characters"); return false; }
    if (form.bio.length > 500){ toast.error("Bio max 500 characters"); return false; }
    let ok = true;
    form.projects.forEach((p, i) => {
      if (!p.title)           { toast.error(`Project ${i+1}: Title required`); ok = false; }
      if (!p.techStack.length){ toast.error(`Project ${i+1}: Tech stack required`); ok = false; }
      if (!p.startDate)       { toast.error(`Project ${i+1}: Start date required`); ok = false; }
      if (!p.endDate)         { toast.error(`Project ${i+1}: End date required`); ok = false; }
      if (!p.projectLink)     { toast.error(`Project ${i+1}: Project link required`); ok = false; }
      if (!p.description)     { toast.error(`Project ${i+1}: Description required`); ok = false; }
      if (p.startDate > p.endDate) { toast.error(`Project ${i+1}: Start date must be before end date`); ok = false; }
      if (p.projectLink && !p.projectLink.match(/^(http|https):\/\/[^ "]+$/)) { toast.error(`Project ${i+1}: Invalid project link`); ok = false; }
    });
    return ok;
  };

  const saveReg = async () => {
    if (!validateReg()) return;
    setSaveLoading(true);
    try { await axios.post("/user/unregistered/saveRegDetails", form); toast.success("Saved"); }
    catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setSaveLoading(false); }
  };

  const saveEdu = async () => {
    if (!validateReg() || !validateEdu()) return;
    setSaveLoading(true);
    try { await axios.post("/user/unregistered/saveEduDetail", form); toast.success("Saved"); }
    catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setSaveLoading(false); }
  };

  const saveAdd = async () => {
    if (!validateReg() || !validateEdu() || !validateAdd()) return;
    setSaveLoading(true);
    try { await axios.post("/user/unregistered/saveAddDetail", form); toast.success("Saved"); }
    catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setSaveLoading(false); }
  };

  const handleSubmit = async () => {
    if (!validateReg() || !validateEdu() || !validateAdd()) return;
    setSaveLoading(true);
    try {
      await axios.post("/user/registerUser", form);
      toast.success("Registration successful!");
      navigate("/discover");
    } catch (e) { toast.error(e?.response?.data?.message || "Error"); }
    finally { setSaveLoading(false); }
  };

  const bioLen = form.bio.length;
  const activeIdx = TABS.indexOf(activeKey);

  if (loading) return (
    <div className="register_page">
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spinner animation="border" style={{ color: "white" }} />
      </div>
    </div>
  );

  return (
    <div className="register_page">
      <h1>SkillSwap</h1>
      <p className="register_subtitle">Complete your profile to get started</p>

      <div className="register_section">

        {/* ── Stepper tab nav ── */}
        <div className="reg-tab-nav">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              data-step={TAB_STEPS[i]}
              className={`reg-tab-btn ${activeKey === tab ? "active" : ""} ${i < activeIdx ? "completed" : ""}`}
              onClick={() => setActiveKey(tab)}
            >
              {TAB_LABELS[i]}
            </button>
          ))}
        </div>

        {/* ── TAB 1: Registration ── */}
        {activeKey === "registration" && (
          <div className="reg-tab-content">
            <div className="reg-step-header">
              <div className="reg-step-number">01</div>
              <div>
                <div className="reg-step-title">Your Profile</div>
                <div className="reg-step-desc">Basic info, links, and skills</div>
              </div>
            </div>

            <div className="reg-field-row">
              <div>
                <label className="reg-label">Name</label>
                <input className="reg-input" value={form.name} disabled />
              </div>
              <div>
                <label className="reg-label">Email</label>
                <input className="reg-input" value={form.email} disabled />
              </div>
            </div>

            <div className="reg-field">
              <label className="reg-label">Username <span className="reg-label-required">* required</span></label>
              <input className="reg-input" name="username" value={form.username} onChange={handleInput} placeholder="choose a unique username" />
            </div>

            <div className="reg-field-row">
              <div>
                <label className="reg-label">LinkedIn <span className="reg-label-required">* one required</span></label>
                <input className="reg-input" name="linkedinLink" value={form.linkedinLink} onChange={handleInput} placeholder="linkedin.com/in/yourname" />
              </div>
              <div>
                <label className="reg-label">GitHub <span className="reg-label-required">* one required</span></label>
                <input className="reg-input" name="githubLink" value={form.githubLink} onChange={handleInput} placeholder="github.com/yourname" />
              </div>
            </div>

            <div className="reg-field">
              <label className="reg-label">Portfolio <span className="reg-label-optional">(optional)</span></label>
              <input className="reg-input" name="portfolioLink" value={form.portfolioLink} onChange={handleInput} placeholder="https://yourportfolio.com" />
            </div>

            <div className="reg-field">
              <label className="reg-label">Skills I Can Teach <span className="reg-label-required">* at least 1</span></label>
              <div className="reg-skill-row">
                <select className="reg-select" value={skillProfInput} onChange={e => setSkillProfInput(e.target.value)}>
                  <option>Select some skill</option>
                  {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button className="reg-skill-add-btn" onClick={() => addSkill("prof")}>Add</button>
              </div>
              {form.skillsProficientAt.length > 0 && (
                <div className="reg-badges">
                  {form.skillsProficientAt.map((s, i) => (
                    <span key={i} className="reg-badge" onClick={() => removeSkill(s, "prof")}>
                      {s} <span className="reg-badge-x">✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="reg-field">
              <label className="reg-label">Skills I Want to Learn <span className="reg-label-required">* at least 1</span></label>
              <div className="reg-skill-row">
                <select className="reg-select" value={skillLearnInput} onChange={e => setSkillLearnInput(e.target.value)}>
                  <option>Select some skill</option>
                  {skills.map((s, i) => <option key={i} value={s}>{s}</option>)}
                </select>
                <button className="reg-skill-add-btn" onClick={() => addSkill("learn")}>Add</button>
              </div>
              {form.skillsToLearn.length > 0 && (
                <div className="reg-badges">
                  {form.skillsToLearn.map((s, i) => (
                    <span key={i} className="reg-badge" onClick={() => removeSkill(s, "learn")}>
                      {s} <span className="reg-badge-x">✕</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="reg-btn-row">
              <button className="reg-btn reg-btn-secondary" onClick={saveReg} disabled={saveLoading}>
                {saveLoading ? <Spinner animation="border" size="sm" /> : "Save"}
              </button>
              <button className="reg-btn reg-btn-primary" onClick={goNext}>
                Next — Education →
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: Education ── */}
        {activeKey === "education" && (
          <div className="reg-tab-content">
            <div className="reg-step-header">
              <div className="reg-step-number">02</div>
              <div>
                <div className="reg-step-title">Education</div>
                <div className="reg-step-desc">Your academic background</div>
              </div>
            </div>

            {form.education.map((edu, i) => (
              <div key={edu.id} className="reg-card">
                <div className="reg-card-header">
                  <span className="reg-card-title">Education {i + 1}</span>
                  {i > 0 && (
                    <button className="reg-remove-btn" onClick={() => setForm(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))}>
                      Remove ✕
                    </button>
                  )}
                </div>
                <div className="reg-field">
                  <label className="reg-label">Institution Name</label>
                  <input className="reg-input" name="institution" value={edu.institution} onChange={e => handleEduChange(e, i)} placeholder="University or school name" />
                </div>
                <div className="reg-field-row">
                  <div>
                    <label className="reg-label">Degree</label>
                    <input className="reg-input" name="degree" value={edu.degree} onChange={e => handleEduChange(e, i)} placeholder="B.Tech, B.Sc, etc." />
                  </div>
                  <div>
                    <label className="reg-label">Grade / Percentage</label>
                    <input className="reg-input" type="number" name="score" value={edu.score} onChange={e => handleEduChange(e, i)} placeholder="8.5 or 85%" />
                  </div>
                </div>
                <div className="reg-field-row">
                  <div>
                    <label className="reg-label">Start Date</label>
                    <input className="reg-input" type="date" name="startDate" value={edu.startDate ? new Date(edu.startDate).toISOString().split("T")[0] : ""} onChange={e => handleEduChange(e, i)} />
                  </div>
                  <div>
                    <label className="reg-label">End Date</label>
                    <input className="reg-input" type="date" name="endDate" value={edu.endDate ? new Date(edu.endDate).toISOString().split("T")[0] : ""} onChange={e => handleEduChange(e, i)} />
                  </div>
                </div>
                <div className="reg-field">
                  <label className="reg-label">Description <span className="reg-label-optional">(optional)</span></label>
                  <input className="reg-input" name="description" value={edu.description} onChange={e => handleEduChange(e, i)} placeholder="Achievements, activities..." />
                </div>
              </div>
            ))}

            <button className="reg-btn reg-btn-add" onClick={() => setForm(prev => ({ ...prev, education: [...prev.education, { id: uuidv4(), institution: "", degree: "", startDate: "", endDate: "", score: "", description: "" }] }))}>
              + Add Another Education
            </button>

            <div className="reg-btn-row">
              <button className="reg-btn reg-btn-secondary" onClick={saveEdu} disabled={saveLoading}>
                {saveLoading ? <Spinner animation="border" size="sm" /> : "Save"}
              </button>
              <button className="reg-btn reg-btn-primary" onClick={goNext}>
                Next — About You →
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 3: Additional ── */}
        {activeKey === "additional" && (
          <div className="reg-tab-content">
            <div className="reg-step-header">
              <div className="reg-step-number">03</div>
              <div>
                <div className="reg-step-title">About You</div>
                <div className="reg-step-desc">Bio and projects</div>
              </div>
            </div>

            <div className="reg-field">
              <label className="reg-label">
                Bio <span className="reg-label-required">* required, min 50 chars</span>
              </label>
              <textarea
                className={`reg-textarea ${bioLen > 0 && bioLen < 50 ? "error" : ""}`}
                name="bio"
                value={form.bio}
                onChange={handleInput}
                placeholder="Tell others about yourself, what you know, and what you're looking to learn..."
              />
              <span className={`reg-char-count ${bioLen < 50 && bioLen > 0 ? "error" : bioLen > 450 ? "warn" : ""}`}>
                {bioLen}/500
                {bioLen > 0 && bioLen < 50 && ` — ${50 - bioLen} more needed`}
                {bioLen === 0 && " — Bio is required"}
              </span>
            </div>

            <label className="reg-label" style={{ marginBottom: 12, marginTop: 8 }}>
              Projects <span className="reg-label-optional">(optional)</span>
            </label>

            {form.projects.map((project, i) => (
              <div key={project.id} className="reg-card">
                <div className="reg-card-header">
                  <span className="reg-card-title">Project {i + 1}</span>
                  <button className="reg-remove-btn" onClick={() => setForm(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== project.id) }))}>
                    Remove ✕
                  </button>
                </div>
                <div className="reg-field">
                  <label className="reg-label">Title</label>
                  <input className="reg-input" name="title" value={project.title} onChange={e => handleProjChange(e, i)} placeholder="Project name" />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Tech Stack</label>
                  <div className="reg-skill-row">
                    <select className="reg-select" value={techStack[i]} onChange={e => setTechStack(prev => prev.map((t, ti) => ti === i ? e.target.value : t))}>
                      <option>Select some Tech Stack</option>
                      {skills.map((s, si) => <option key={si} value={s}>{s}</option>)}
                    </select>
                    <button className="reg-skill-add-btn" onClick={() => {
                      if (techStack[i] === "Select some Tech Stack") { toast.error("Select a tech stack"); return; }
                      if (form.projects[i].techStack.includes(techStack[i])) { toast.error("Already added"); return; }
                      setForm(prev => ({ ...prev, projects: prev.projects.map((p, pi) => pi === i ? { ...p, techStack: [...p.techStack, techStack[i]] } : p) }));
                    }}>Add</button>
                  </div>
                  {project.techStack.length > 0 && (
                    <div className="reg-badges">
                      {project.techStack.map((s, si) => (
                        <span key={si} className="reg-badge" onClick={() => setForm(prev => ({ ...prev, projects: prev.projects.map((p, pi) => pi === i ? { ...p, techStack: p.techStack.filter(t => t !== s) } : p) }))}>
                          {s} <span className="reg-badge-x">✕</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="reg-field-row">
                  <div>
                    <label className="reg-label">Start Date</label>
                    <input className="reg-input" type="date" name="startDate" value={project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : ""} onChange={e => handleProjChange(e, i)} />
                  </div>
                  <div>
                    <label className="reg-label">End Date</label>
                    <input className="reg-input" type="date" name="endDate" value={project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : ""} onChange={e => handleProjChange(e, i)} />
                  </div>
                </div>
                <div className="reg-field">
                  <label className="reg-label">Project Link</label>
                  <input className="reg-input" name="projectLink" value={project.projectLink} onChange={e => handleProjChange(e, i)} placeholder="https://github.com/..." />
                </div>
                <div className="reg-field">
                  <label className="reg-label">Description</label>
                  <input className="reg-input" name="description" value={project.description} onChange={e => handleProjChange(e, i)} placeholder="What does this project do?" />
                </div>
              </div>
            ))}

            <button className="reg-btn reg-btn-add" onClick={() => {
              setTechStack(prev => [...prev, "Select some Tech Stack"]);
              setForm(prev => ({ ...prev, projects: [...prev.projects, { id: uuidv4(), title: "", techStack: [], startDate: "", endDate: "", projectLink: "", description: "" }] }));
            }}>+ Add Project</button>

            <div className="reg-btn-row">
              <button className="reg-btn reg-btn-secondary" onClick={saveAdd} disabled={saveLoading}>
                {saveLoading ? <Spinner animation="border" size="sm" /> : "Save"}
              </button>
              <button className="reg-btn reg-btn-primary" onClick={goNext}>
                Next — Learning Path →
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 4: Learning Path ── */}
        {activeKey === "learningpath" && (
          <div className="reg-tab-content">
            <div className="reg-step-header">
              <div className="reg-step-number">04</div>
              <div>
                <div className="reg-step-title">Learning Path</div>
                <div className="reg-step-desc">AI generates your personal roadmap</div>
              </div>
            </div>
            <LearningPathTab onNext={goNext} />
          </div>
        )}

        {/* ── TAB 5: Preview ── */}
        {activeKey === "preview" && (
          <div className="reg-tab-content">
            <div className="reg-step-header">
              <div className="reg-step-number">05</div>
              <div>
                <div className="reg-step-title">Confirm Details</div>
                <div className="reg-step-desc">Review everything before submitting</div>
              </div>
            </div>

            <div className="previewForm">
              {[
                ["Name",               form.name],
                ["Email",              form.email],
                ["Username",           form.username],
                ["LinkedIn",           form.linkedinLink],
                ["GitHub",             form.githubLink],
                ["Portfolio",          form.portfolioLink],
                ["Skills I Can Teach", form.skillsProficientAt.join(", ")],
                ["Skills to Learn",    form.skillsToLearn.join(", ")],
                ["Bio",                form.bio],
              ].map(([label, value]) => (
                <div key={label} className="preview-row">
                  <span className="preview-label">{label}</span>
                  <span className="preview-value">{value || "—"}</span>
                </div>
              ))}
            </div>

            <div className="reg-btn-row" style={{ marginTop: 32 }}>
              <button className="reg-btn reg-btn-primary" onClick={handleSubmit} disabled={saveLoading}>
                {saveLoading ? <><Spinner animation="border" size="sm" /> Submitting…</> : "Submit Registration →"}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Register;