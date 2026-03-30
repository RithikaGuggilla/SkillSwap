import { useState } from "react";
import Spinner from "react-bootstrap/Spinner";
import { toast } from "react-toastify";
import axios from "axios";

const GOALS     = ["Get a Job", "Build a Project", "Freelancing", "Learn for Fun"];
const HOURS     = ["1-2 hrs", "3-5 hrs", "5+ hrs"];
const TIMELINES = ["1 month", "3 months", "6 months", "No rush"];
const LEVELS    = ["Beginner", "Some Experience", "Intermediate"];

const LearningPathTab = ({ onNext }) => {
  const [form, setForm] = useState({ goal: "", hoursPerWeek: "", timeline: "", currentLevel: "", specificGoal: "" });
  const [loading, setLoading] = useState(false);
  const [path, setPath] = useState(null);

  const select = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const generate = async () => {
    if (!form.goal)                { toast.error("Select your main goal");       return; }
    if (!form.hoursPerWeek)        { toast.error("Select hours per week");       return; }
    if (!form.timeline)            { toast.error("Select your timeline");        return; }
    if (!form.currentLevel)        { toast.error("Select your current level");   return; }
    if (!form.specificGoal.trim()) { toast.error("Describe your specific goal"); return; }
    setLoading(true);
    try {
      const { data } = await axios.post("/learningpath/generate", form);
      setPath(data.data);
      toast.success("Learning path generated!");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to generate");
    } finally { setLoading(false); }
  };

  const stars = (r) => { const n = Math.round(r || 0); return "★".repeat(n) + "☆".repeat(5 - n); };

  const intro = { fontSize: "0.85rem", color: "#999", marginBottom: "36px", lineHeight: 1.7, letterSpacing: "0.01em" };
  const qBlock = { marginBottom: "32px" };
  const qLabel = { display: "block", fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "#bbbbbb", marginBottom: "12px", fontFamily: "'DM Mono', monospace" };
  const optionsRow = { display: "flex", flexWrap: "wrap", gap: "10px" };

  const chip = (selected) => ({
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "12px 22px",
    borderRadius: "40px",
    border: selected ? "1.5px solid #ffffff" : "1px solid #2e2e2e",
    background: selected ? "#ffffff" : "#181818",
    color: selected ? "#000000" : "#999",
    cursor: "pointer",
    transition: "all 0.18s",
    fontWeight: selected ? "600" : "400",
    boxShadow: selected ? "0 0 0 3px rgba(255,255,255,0.1)" : "none",
  });

  const textareaStyle = {
    width: "100%",
    background: "#1c1c1c",
    border: "1px solid #383838",
    borderRadius: "12px",
    color: "#f0f0f0",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.88rem",
    padding: "18px 20px",
    outline: "none",
    resize: "vertical",
    minHeight: "110px",
    lineHeight: 1.7,
    transition: "border-color 0.2s, box-shadow 0.2s",
    boxShadow: "none",
  };

  const hint = { display: "block", fontSize: "0.68rem", color: "#666", marginTop: "8px", fontStyle: "italic" };
  const divider = { borderTop: "1px solid #1e1e1e", marginTop: "36px", paddingTop: "28px" };

  const generateBtn = (isLoading) => ({
    width: "100%",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.78rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    padding: "20px 28px",
    borderRadius: "14px",
    border: "none",
    background: isLoading ? "#333" : "#ffffff",
    color: isLoading ? "#999" : "#000000",
    cursor: isLoading ? "not-allowed" : "pointer",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    transition: "all 0.2s",
    boxShadow: isLoading ? "none" : "0 4px 24px rgba(255,255,255,0.12)",
  });

  const skipBtn = {
    width: "100%",
    fontFamily: "'DM Mono', monospace",
    fontSize: "0.68rem",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    padding: "14px 28px",
    borderRadius: "12px",
    border: "1px solid #2a2a2a",
    background: "transparent",
    color: "#777",
    cursor: "pointer",
    marginTop: "10px",
    transition: "all 0.2s",
  };

  const successBar = {
    borderLeft: "3px solid #ffffff",
    borderRadius: "14px",
    border: "1px solid #2a2a2a",
    padding: "16px 20px",
    marginBottom: "24px",
    background: "#141414",
  };

  return (
    <div>
      <p style={intro}>
        Answer 4 quick questions — AI builds a personalized roadmap and matches you
        with real swap partners on SkillSwap for each phase of your journey.
      </p>

      {/* Q1 */}
      <div style={qBlock}>
        <label style={qLabel}>What is your main goal?</label>
        <div style={optionsRow}>
          {GOALS.map(g => (
            <button key={g} style={chip(form.goal === g)} onClick={() => select("goal", g)}
              onMouseEnter={e => { if (form.goal !== g) { e.target.style.borderColor = "#555"; e.target.style.color = "#eee"; }}}
              onMouseLeave={e => { if (form.goal !== g) { e.target.style.borderColor = "#2e2e2e"; e.target.style.color = "#999"; }}}
            >{g}</button>
          ))}
        </div>
      </div>

      {/* Q2 */}
      <div style={qBlock}>
        <label style={qLabel}>How much time per week?</label>
        <div style={optionsRow}>
          {HOURS.map(h => (
            <button key={h} style={chip(form.hoursPerWeek === h)} onClick={() => select("hoursPerWeek", h)}
              onMouseEnter={e => { if (form.hoursPerWeek !== h) { e.target.style.borderColor = "#555"; e.target.style.color = "#eee"; }}}
              onMouseLeave={e => { if (form.hoursPerWeek !== h) { e.target.style.borderColor = "#2e2e2e"; e.target.style.color = "#999"; }}}
            >{h}</button>
          ))}
        </div>
      </div>

      {/* Q3 */}
      <div style={qBlock}>
        <label style={qLabel}>What is your goal timeline?</label>
        <div style={optionsRow}>
          {TIMELINES.map(t => (
            <button key={t} style={chip(form.timeline === t)} onClick={() => select("timeline", t)}
              onMouseEnter={e => { if (form.timeline !== t) { e.target.style.borderColor = "#555"; e.target.style.color = "#eee"; }}}
              onMouseLeave={e => { if (form.timeline !== t) { e.target.style.borderColor = "#2e2e2e"; e.target.style.color = "#999"; }}}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Q4 */}
      <div style={qBlock}>
        <label style={qLabel}>Your current level?</label>
        <div style={optionsRow}>
          {LEVELS.map(l => (
            <button key={l} style={chip(form.currentLevel === l)} onClick={() => select("currentLevel", l)}
              onMouseEnter={e => { if (form.currentLevel !== l) { e.target.style.borderColor = "#555"; e.target.style.color = "#eee"; }}}
              onMouseLeave={e => { if (form.currentLevel !== l) { e.target.style.borderColor = "#2e2e2e"; e.target.style.color = "#999"; }}}
            >{l}</button>
          ))}
        </div>
      </div>

      {/* Q5 — mandatory */}
      <div style={qBlock}>
        <label style={qLabel}>
          What do you specifically want to achieve?{" "}
          <span style={{ color: "#cc4444", fontSize: "0.6rem" }}>* required</span>
        </label>
        <textarea
          style={textareaStyle}
          value={form.specificGoal}
          onChange={e => setForm(prev => ({ ...prev, specificGoal: e.target.value }))}
          placeholder="e.g. I want to become a Full Stack Developer and get hired"
          onFocus={e => { e.target.style.borderColor = "#555"; e.target.style.boxShadow = "0 0 0 3px rgba(255,255,255,0.05)"; }}
          onBlur={e => { e.target.style.borderColor = "#383838"; e.target.style.boxShadow = "none"; }}
        />
        <span style={hint}>💡 Be specific — the more detail, the better your roadmap</span>
      </div>

      {/* Buttons */}
      <div style={divider}>
        <button
          style={generateBtn(loading)}
          onClick={generate}
          disabled={loading}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#e8e8e8"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.2)"; }}}
          onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,255,255,0.12)"; }}}
        >
          {loading ? <><Spinner animation="border" size="sm" /> Generating your path…</> : "✦ Generate My Learning Path"}
        </button>

        {!path && (
          <button style={skipBtn} onClick={onNext}
            onMouseEnter={e => { e.target.style.borderColor = "#444"; e.target.style.color = "#ccc"; }}
            onMouseLeave={e => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#777"; }}
          >Skip for now →</button>
        )}
      </div>

      {/* Generated path */}
      {path && (
        <div style={{ marginTop: "32px" }}>
          <div style={successBar}>
            <div className="reg-success-title">Path Generated ✓</div>
            <div className="reg-success-sub">Saved to your profile — visible on dashboard after registration</div>
          </div>

          {path.generatedPath.map(phase => (
            <div key={phase.phase} className="reg-phase-card">
              <div className="reg-phase-header">
                <div className="reg-phase-title">{phase.title}</div>
                <div className="reg-phase-duration">{phase.duration}</div>
              </div>
              <div className="reg-phase-reason">{phase.reason}</div>
              <div className="reg-topic-tags">
                {phase.topics.map((t, i) => <span key={i} className="reg-topic-tag">{t}</span>)}
              </div>
              <div className="reg-teachers-label">Swap partners for {phase.skillTag}</div>
              {phase.teachers?.length > 0 ? (
                phase.teachers.map((t, i) => (
                  <a key={i} href={`/profile/${t.username}`} className="reg-teacher-card">
                    <img src={t.picture} alt={t.name} className="reg-teacher-pic" />
                    <div style={{ flex: 1 }}>
                      <div className="reg-teacher-name">{t.name}</div>
                      <div className="reg-teacher-rating">{stars(t.rating)} {t.rating > 0 ? `(${t.rating})` : "No ratings yet"}</div>
                    </div>
                    {t.swapMatch && <span className="reg-swap-badge">Perfect Swap</span>}
                  </a>
                ))
              ) : (
                <div className="reg-no-teachers">No swap partners yet for {phase.skillTag} — check back as more people join!</div>
              )}
            </div>
          ))}

          <div style={{ marginTop: "24px" }}>
            <button
              style={generateBtn(false)}
              onClick={onNext}
              onMouseEnter={e => { e.currentTarget.style.background = "#e8e8e8"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,255,255,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(255,255,255,0.12)"; }}
            >Next — Confirm Details →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPathTab;