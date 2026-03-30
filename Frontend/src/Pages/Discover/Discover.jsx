


import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../util/UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import "./Discover.css";

/* ══════════════════════════════════════════════
   HORIZONTAL PROFILE CARD
══════════════════════════════════════════════ */
const ProfileCard = ({ profileImageUrl, bio, name, skills, rating, username }) => (
  <div className="pc">
    {/* Avatar */}
    <div className="pc-avatar-wrap">
      <img
        className="pc-avatar"
        src={profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`}
        alt={name}
        onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`; }}
      />
    </div>

    {/* Body */}
    <div className="pc-body">
      <div className="pc-top">
        <div>
          <h3 className="pc-name">{name}</h3>
          {username && <div className="pc-handle">@{username}</div>}
        </div>
        <div className="pc-rating">
          <span className="pc-stars">{"★".repeat(Math.round(rating ?? 5))}</span>
          <span className="pc-rating-num">{rating ?? 5}.0</span>
        </div>
      </div>

      <p className="pc-bio">{bio || "No bio provided."}</p>

      {skills && skills.length > 0 && (
        <div className="pc-skills">
          {skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="pc-skill-tag">{skill}</span>
          ))}
          {skills.length > 4 && <span className="pc-skill-more">+{skills.length - 4}</span>}
        </div>
      )}
    </div>

    {/* Action */}
    <div className="pc-action">
      <Link to={`/profile/${username}`} state={{ from: "/discover" }} className="pc-btn-link">
        <button className="pc-btn">View Profile →</button>
      </Link>
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   SECTION HEADER
══════════════════════════════════════════════ */
const SectionHeader = ({ id, title, count }) => (
  <div className="sec-header" id={id}>
    <div className="sec-header-left">
      <span className="sec-dot" />
      <h2 className="sec-title">{title}</h2>
    </div>
    {count > 0 && <span className="sec-badge">{count} people</span>}
  </div>
);

const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-icon">◎</div>
    <p>No users in this category yet.</p>
  </div>
);

/* ══════════════════════════════════════════════
   MAIN DISCOVER
══════════════════════════════════════════════ */
const Discover = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [loading, setLoading]           = useState(false);
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [webDevUsers, setWebDevUsers]   = useState([]);
  const [mlUsers, setMlUsers]           = useState([]);
  const [otherUsers, setOtherUsers]     = useState([]);
  const [searchQuery, setSearchQuery]   = useState("");
  const [searchTerm, setSearchTerm]     = useState("");
  const [activeTab, setActiveTab]       = useState("for-you");
  const searchRef = useRef(null);

  const tabs = [
    { id: "for-you",          label: "For You" },
    { id: "popular",          label: "Popular" },
    { id: "web-development",  label: "Web Dev" },
    { id: "machine-learning", label: "ML / AI" },
    { id: "others",           label: "Others" },
  ];

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/user/registered/getDetails`);
        setUser(data.data);
        localStorage.setItem("userInfo", JSON.stringify(data.data));
      } catch (error) {
        if (error?.response?.data?.message) toast.error(error.response.data.message);
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      }
    };
    const getDiscoverUsers = async () => {
      try {
        const { data } = await axios.get("/user/discover");
        setDiscoverUsers(data.data.forYou);
        setWebDevUsers(data.data.webDev);
        setMlUsers(data.data.ml);
        setOtherUsers(data.data.others);
      } catch (error) {
        if (error?.response?.data?.message) toast.error(error.response.data.message);
        localStorage.removeItem("userInfo");
        setUser(null);
        await axios.get("/auth/logout");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    getUser();
    getDiscoverUsers();
  }, []);

  const handleTabClick = (id) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = () => {
    const term = searchQuery.trim();
    setSearchTerm(term);
    setTimeout(() => {
      if (filterUsers(discoverUsers)?.length > 0) document.getElementById("for-you")?.scrollIntoView({ behavior: "smooth" });
      else if (filterUsers(webDevUsers)?.length > 0) document.getElementById("web-development")?.scrollIntoView({ behavior: "smooth" });
      else if (filterUsers(mlUsers)?.length > 0) document.getElementById("machine-learning")?.scrollIntoView({ behavior: "smooth" });
      else if (filterUsers(otherUsers)?.length > 0) document.getElementById("others")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filterUsers = (users) => {
    if (!users) return [];
    if (!searchTerm) return users;
    const q = searchTerm.toLowerCase();
    return users.filter(u =>
      u?.name?.toLowerCase().includes(q) ||
      u?.username?.toLowerCase().includes(q) ||
      u?.bio?.toLowerCase().includes(q) ||
      u?.skillsProficientAt?.some(s => s.toLowerCase().includes(q))
    );
  };

  const renderCards = (users, defaultRating = 5) =>
    filterUsers(users)?.length > 0 ? (
      <div className="card-grid">
        {filterUsers(users).map(u => (
          <ProfileCard
            key={u?.username}
            profileImageUrl={u?.picture}
            name={u?.name}
            rating={u?.rating ?? defaultRating}
            bio={u?.bio}
            skills={u?.skillsProficientAt}
            username={u?.username}
          />
        ))}
      </div>
    ) : <EmptyState />;

  const hasResults =
    filterUsers(discoverUsers).length > 0 ||
    filterUsers(webDevUsers).length > 0 ||
    filterUsers(mlUsers).length > 0 ||
    filterUsers(otherUsers).length > 0;

  return (
    <div className="discover-page">

      {/* ── Hero ── */}
      <div className="discover-hero">
        <div className="hero-bg-grid" />
        <div className="hero-content">
          <p className="hero-label">SKILL NETWORK</p>
          <h1 className="hero-title">Discover Talent</h1>
          <p className="hero-sub">Find developers, designers, and creators to collaborate with</p>

          <div className="search-wrap" ref={searchRef}>
            <div className="search-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            <input
              className="search-input" type="text"
              placeholder="Search by name, skill, or username…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(""); setSearchTerm(""); }}>✕</button>
            )}
            <button className="search-btn" onClick={handleSearch}>Search</button>
          </div>

          <div className="quick-filters">
            {["React", "Python", "Machine Learning", "Node.js", "UI/UX", "TypeScript"].map(tag => (
              <button
                key={tag}
                className={`quick-tag ${searchQuery === tag ? "quick-tag-active" : ""}`}
                onClick={() => { setSearchQuery(tag); setSearchTerm(tag); }}
              >{tag}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="discover-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`discover-tab ${activeTab === tab.id ? "active-tab" : ""}`}
            onClick={() => handleTabClick(tab.id)}
          >{tab.label}</button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="content-container">
        {searchTerm && !hasResults && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No users found for "{searchTerm}"</p>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner-ring" /></div>
        ) : (
          (!searchTerm || hasResults) && (
            <>
              <SectionHeader id="for-you" title="For You" count={filterUsers(discoverUsers)?.length} />
              {renderCards(discoverUsers)}

              <SectionHeader id="popular" title="Popular" count={filterUsers(discoverUsers)?.length} />
              {renderCards(discoverUsers)}

              <SectionHeader id="web-development" title="Web Development" count={filterUsers(webDevUsers)?.length} />
              {renderCards(webDevUsers, 4)}

              <SectionHeader id="machine-learning" title="Machine Learning" count={filterUsers(mlUsers)?.length} />
              {renderCards(mlUsers, 4)}

              <SectionHeader id="others" title="Others" count={filterUsers(otherUsers)?.length} />
              {renderCards(otherUsers, 4)}
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Discover;