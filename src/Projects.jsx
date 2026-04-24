import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgVideo from "./assets/main4.mp4";

const GH_USER     = "sailorsammyy";
const CACHE_KEY   = "gh_repos_cache";
const CACHE_TTL   = 5 * 60 * 1000;

async function fetchTopRepos(username) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL) return { data, fromCache: true };
    }
  } catch { /* ignore */ }

  const res = await fetch(
    `https://api.github.com/users/${username}/repos?per_page=100&sort=pushed`,
    { headers: { Accept: "application/vnd.github+json" } }
  );

  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get("X-RateLimit-Reset");
    throw Object.assign(new Error("rate_limited"), {
      resetAt: reset ? Number(reset) * 1000 : null,
    });
  }
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const repos = await res.json();

  const sorted = [...repos]
    .filter(r => !r.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at))
    .slice(0, 5);

  const data = sorted.map(r => ({
    id:       r.id,
    title:    r.name,
    desc:     r.description || "No description provided.",
    tags:     r.topics?.slice(0, 4) ?? (r.language ? [r.language] : []),
    href:     r.html_url,
    stars:    r.stargazers_count,
    lang:     r.language,
    status:   r.archived ? "ARCHIVED" : r.pushed_at > new Date(Date.now() - 30 * 86400000).toISOString() ? "ACTIVE" : "COMPLETE",
  }));

  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); } catch { /* ignore */ }
  return { data, fromCache: false };
}

function StatusBadge({ status }) {
  const cls = status === "ACTIVE" ? "active" : status === "ARCHIVED" ? "archived" : "complete";
  return <span className={`sp-status ${cls}`}>{status}</span>;
}

export default function Projects() {
  const [active, setActive]           = useState(0);
  const [mounted, setMounted]         = useState(false);
  const [mobileDetail, setMobileDetail] = useState(null);
  const [repos, setRepos]             = useState([]);
  const [fetchState, setFetchState]   = useState("loading");
  const [errorMsg, setErrorMsg]       = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchTopRepos(GH_USER)
      .then(({ data }) => { if (!cancelled) { setRepos(data); setFetchState("ok"); } })
      .catch(err => {
        if (!cancelled) {
          setErrorMsg(err.message === "rate_limited"
            ? `GitHub rate limit hit.${err.resetAt ? ` Resets at ${new Date(err.resetAt).toLocaleTimeString()}.` : ""}`
            : "Could not load repos.");
          setFetchState("error");
        }
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (!repos.length) return;
      if (e.key === "ArrowUp")   setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown") setActive(i => Math.min(repos.length - 1, i + 1));
      if (e.key === "Enter")     window.open(repos[active]?.href, "_blank", "noopener");
      if (e.key === "Escape" || e.key === "Backspace") navigate(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, repos, navigate]);

  const proj       = repos[active];
  const mobileProj = mobileDetail !== null ? repos[mobileDetail] : null;

  return (
    <div id="menu-screen">
      <video src={bgVideo} autoPlay loop muted playsInline />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Montserrat:wght@300;400&display=swap');

        .sp-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .sp-state {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
          pointer-events: none;
        }
        .sp-state-msg {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(12px, 1.5vw, 16px);
          letter-spacing: 4px;
          color: rgba(200,169,110,0.7);
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sp-state-msg.error { color: rgba(192,57,43,0.85); }
        .sp-pulse {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #8b1a1a;
          animation: sp-blink 1s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes sp-blink { 0%,100%{opacity:1} 50%{opacity:0.15} }

        .sp-list {
          position: relative;
          z-index: 20;
          padding: clamp(16px, 4vw, 56px) 0 clamp(16px, 4vw, 56px) clamp(16px, 4vw, 48px);
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: all;
          flex-shrink: 0;
        }

        .sp-row {
          cursor: pointer;
          display: flex;
          align-items: center;
          opacity: 0;
          transform: translateX(-32px);
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .sp-row.mounted { opacity: 1; transform: translateX(0); }

        .sp-row-bar {
          height: clamp(56px, 7vw, 82px);
          width: clamp(240px, 40vw, 540px);
          background: rgba(10,3,3,0.82);
          clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 clamp(14px, 2vw, 26px);
          border-left: 3px solid rgba(139,26,26,0.5);
          transition: border-color 0.2s ease;
          position: relative;
          overflow: hidden;
          gap: 10px;
        }
        .sp-row.active .sp-row-bar { border-left-color: #8b1a1a; }

        .sp-row-bar::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #f5e6c8;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
          z-index: 0;
        }
        .sp-row.active .sp-row-bar::before { transform: scaleX(1); }

        .sp-row-left {
          display: flex;
          flex-direction: column;
          gap: 2px;
          position: relative;
          z-index: 1;
          min-width: 0;
        }
        .sp-row-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(12px, 1.8vw, 22px);
          letter-spacing: 2px;
          color: #fff;
          text-shadow:
            0 0 12px rgba(0,0,0,0.95),
            0 0 20px rgba(139,26,26,0.8),
            -2px -2px 0 rgba(0,0,0,0.9),
             2px  2px 0 rgba(0,0,0,0.9),
            -2px  2px 0 rgba(0,0,0,0.9),
             2px -2px 0 rgba(0,0,0,0.9);
          transition: color 0.15s ease, text-shadow 0.15s ease;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: clamp(140px, 25vw, 340px);
        }
        .sp-row.active .sp-row-title { color: #1a0505; text-shadow: none; }

        .sp-row-lang {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(9px, 0.9vw, 11px);
          color: rgba(255,220,150,0.9);
          letter-spacing: 1px;
          text-shadow: 0 0 8px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.8);
          transition: color 0.15s ease;
        }
        .sp-row.active .sp-row-lang { color: rgba(100,30,30,0.7); text-shadow: none; }

        .sp-row-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
        .sp-status {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(7px, 0.85vw, 10px);
          letter-spacing: 2px;
          padding: 3px 8px;
          border-radius: 2px;
        }
        .sp-status.complete { background: rgba(139,26,26,0.85); color: #f5e6c8; }
        .sp-status.active   { background: rgba(30,140,60,0.85);  color: #e8f5e8; }
        .sp-status.archived { background: rgba(80,80,80,0.85);   color: #ccc; }
        .sp-row.active .sp-status.complete { background: #8b1a1a; }
        .sp-row.active .sp-status.active   { background: #1a8c3c; }

        .sp-stars {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(9px, 0.9vw, 11px);
          color: rgba(212,160,23,0.7);
          letter-spacing: 1px;
          transition: color 0.15s ease;
        }
        .sp-row.active .sp-stars { color: rgba(139,80,10,0.8); }

        .sp-detail {
          flex: 1;
          padding: clamp(16px, 3vw, 48px);
          pointer-events: none;
          display: flex;
          flex-direction: column;
          gap: 18px;
          max-width: 500px;
        }
        .sp-detail-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(18px, 2.8vw, 38px);
          color: #fff;
          letter-spacing: 2px;
          text-shadow: 
            0 0 16px rgba(0,0,0,0.95),
            0 0 24px rgba(139,26,26,0.9),
            -2px -2px 0 rgba(0,0,0,0.9),
             2px  2px 0 rgba(0,0,0,0.9),
            -2px  2px 0 rgba(0,0,0,0.9),
             2px -2px 0 rgba(0,0,0,0.9);
          opacity: 0;
          transform: translateY(10px);
          animation: sp-fade-up 0.32s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .sp-detail-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(10px);
          animation: sp-fade-up 0.32s cubic-bezier(0.22,1,0.36,1) 0.04s forwards;
        }
        .sp-detail-desc {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: clamp(13px, 1.4vw, 16px);
          color: rgba(255,250,240,0.95);
          line-height: 1.7;
          text-shadow: 
            0 0 12px rgba(0,0,0,0.95),
            0 2px 8px rgba(0,0,0,0.9),
            0 1px 3px rgba(0,0,0,0.8);
          opacity: 0;
          transform: translateY(10px);
          animation: sp-fade-up 0.32s cubic-bezier(0.22,1,0.36,1) 0.08s forwards;
        }
        .sp-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          opacity: 0;
          transform: translateY(10px);
          animation: sp-fade-up 0.32s cubic-bezier(0.22,1,0.36,1) 0.14s forwards;
        }
        .sp-tag {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(8px, 0.85vw, 10px);
          letter-spacing: 2px;
          padding: 3px 10px;
          border: 1px solid rgba(139,26,26,0.5);
          color: rgba(212,160,23,0.9);
          background: rgba(10,3,3,0.55);
        }
        .sp-open-btn {
          pointer-events: all;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(10px, 1vw, 13px);
          letter-spacing: 3px;
          color: #f5e6c8;
          background: rgba(139,26,26,0.88);
          border: none;
          padding: clamp(8px, 1vw, 12px) clamp(16px, 2vw, 24px);
          cursor: pointer;
          clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
          transition: background 0.2s ease;
          opacity: 0;
          animation: sp-fade-up 0.32s cubic-bezier(0.22,1,0.36,1) 0.2s forwards;
          text-decoration: none;
        }
        .sp-open-btn:hover { background: rgba(192,57,43,0.95); }

        @keyframes sp-fade-up { to { opacity: 1; transform: translateY(0); } }

        .sp-stripe  { position:absolute; right:0; top:0; bottom:0; width:5px; background:#8b1a1a; z-index:10; pointer-events:none; }
        .sp-stripe2 { position:absolute; right:9px; top:0; bottom:0; width:2px; background:rgba(212,160,23,0.28); z-index:10; pointer-events:none; }

        .sp-hint {
          position: absolute;
          bottom: clamp(12px, 2vw, 24px); right: clamp(14px, 2vw, 28px);
          z-index: 20;
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 5px;
          font-family: 'Cinzel Decorative', serif;
          opacity: 0;
          transition: opacity 0.5s ease 0.6s;
          pointer-events: none;
        }
        .sp-hint.mounted { opacity: 1; }
        .sp-hint-row { display: flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 3px; color: rgba(200,169,110,0.35); }
        .sp-hint-key { border: 1px solid rgba(200,169,110,0.25); border-radius: 2px; padding: 1px 6px; font-size: 10px; color: rgba(200,169,110,0.5); }

        .sp-mobile-bar {
          display: none;
          position: fixed;
          bottom: 0; left: 0; right: 0;
          z-index: 30;
          padding: 10px 16px max(14px, env(safe-area-inset-bottom));
          background: rgba(8,2,2,0.92);
          border-top: 1px solid rgba(139,26,26,0.4);
          gap: 10px;
          align-items: center;
          justify-content: space-between;
        }
        .sp-mobile-btn {
          font-family: 'Cinzel Decorative', serif;
          font-size: 11px;
          letter-spacing: 2px;
          border: none;
          padding: 10px 18px;
          cursor: pointer;
          clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
          flex: 1;
          text-align: center;
        }
        .sp-mobile-btn.back  { background: rgba(139,26,26,0.7);  color: #f5e6c8; }
        .sp-mobile-btn.open  { background: rgba(139,26,26,0.95); color: #f5e6c8; }
        .sp-mobile-btn.ghost { background: rgba(30,10,10,0.7); color: rgba(200,169,110,0.55); border: 1px solid rgba(139,26,26,0.3); clip-path: none; font-size: 10px; }

        .sp-mobile-detail {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 25;
          background: rgba(6,1,1,0.97);
          flex-direction: column;
          padding: clamp(24px, 6vw, 48px) clamp(20px, 5vw, 40px);
          padding-bottom: 90px;
          overflow-y: auto;
          gap: 18px;
          animation: sp-slide-up 0.32s cubic-bezier(0.22,1,0.36,1);
        }
        .sp-mobile-detail.open { display: flex; }
        @keyframes sp-slide-up { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .sp-mobile-detail-title {
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(20px, 6.5vw, 34px);
          color: #fff;
          letter-spacing: 2px;
          text-shadow: 
            0 0 16px rgba(0,0,0,0.95),
            0 0 24px rgba(139,26,26,0.9),
            -2px -2px 0 rgba(0,0,0,0.9),
             2px  2px 0 rgba(0,0,0,0.9);
          border-bottom: 1px solid rgba(139,26,26,0.3);
          padding-bottom: 14px;
        }
        .sp-mobile-detail-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .sp-mobile-detail-desc {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: clamp(14px, 4vw, 17px);
          color: rgba(255,250,240,0.95);
          line-height: 1.7;
          text-shadow: 0 0 10px rgba(0,0,0,0.9), 0 2px 6px rgba(0,0,0,0.8);
        }
        .sp-mobile-detail-tags { display: flex; flex-wrap: wrap; gap: 8px; }

        @media (max-width: 768px) {
          .sp-detail  { display: none; }
          .sp-hint    { display: none; }
          .sp-mobile-bar { display: flex; }
          .sp-overlay { align-items: flex-start; padding-top: 10vh; }
          .sp-list { padding-bottom: 90px; width: 100%; }
          .sp-row-bar { width: calc(100vw - 32px); }
          .sp-row-title { max-width: 55vw; }
        }
      `}</style>

      {fetchState !== "ok" && (
        <div className="sp-state">
          <div className={`sp-state-msg${fetchState === "error" ? " error" : ""}`}>
            {fetchState === "loading" && <><span className="sp-pulse" />FETCHING REPOS…</>}
            {fetchState === "error"   && <>⚠ {errorMsg}</>}
          </div>
        </div>
      )}

      <div className="sp-overlay">
        <div className="sp-stripe" />
        <div className="sp-stripe2" />

        {fetchState === "ok" && (
          <nav className="sp-list">
            {repos.map((p, i) => (
              <div
                key={p.id}
                className={`sp-row${active === i ? " active" : ""}${mounted ? " mounted" : ""}`}
                style={{ transitionDelay: mounted ? `${i * 70}ms` : "0ms" }}
                onClick={() => { setActive(i); setMobileDetail(i); }}
                onMouseEnter={() => setActive(i)}
              >
                <div className="sp-row-bar">
                  <div className="sp-row-left">
                    <span className="sp-row-title">{p.title}</span>
                    {p.lang && <span className="sp-row-lang">{p.lang}</span>}
                  </div>
                  <div className="sp-row-right">
                    <StatusBadge status={p.status} />
                    {p.stars > 0 && <span className="sp-stars">★ {p.stars}</span>}
                  </div>
                </div>
              </div>
            ))}
          </nav>
        )}

        {fetchState === "ok" && proj && (
          <div className="sp-detail" key={proj.id}>
            <div className="sp-detail-title">{proj.title}</div>
            <div className="sp-detail-meta">
              <StatusBadge status={proj.status} />
              {proj.lang && <span className="sp-tag">{proj.lang}</span>}
              {proj.stars > 0 && <span className="sp-stars">★ {proj.stars}</span>}
            </div>
            <div className="sp-detail-desc">{proj.desc}</div>
            {proj.tags.length > 0 && (
              <div className="sp-tags">
                {proj.tags.map(t => <span key={t} className="sp-tag">{t}</span>)}
              </div>
            )}
            <a className="sp-open-btn" href={proj.href} target="_blank" rel="noopener noreferrer">
              VIEW ON GITHUB ↗
            </a>
          </div>
        )}

        <div className={`sp-hint${mounted ? " mounted" : ""}`}>
          <div className="sp-hint-row"><span className="sp-hint-key">↑↓</span><span>NAVIGATE</span></div>
          <div className="sp-hint-row"><span className="sp-hint-key">↵</span><span>OPEN</span></div>
          <div className="sp-hint-row"><span className="sp-hint-key">ESC</span><span>BACK</span></div>
        </div>
      </div>

      {mobileProj && (
        <div className={`sp-mobile-detail${mobileDetail !== null ? " open" : ""}`}>
          <div className="sp-mobile-detail-title">{mobileProj.title}</div>
          <div className="sp-mobile-detail-meta">
            <StatusBadge status={mobileProj.status} />
            {mobileProj.lang && <span className="sp-tag">{mobileProj.lang}</span>}
            {mobileProj.stars > 0 && <span className="sp-stars">★ {mobileProj.stars}</span>}
          </div>
          <div className="sp-mobile-detail-desc">{mobileProj.desc}</div>
          {mobileProj.tags.length > 0 && (
            <div className="sp-mobile-detail-tags">
              {mobileProj.tags.map(t => <span key={t} className="sp-tag">{t}</span>)}
            </div>
          )}
        </div>
      )}

      <div className="sp-mobile-bar">
        {mobileDetail !== null ? (
          <>
            <button className="sp-mobile-btn back" onClick={() => setMobileDetail(null)}>← BACK</button>
            <a className="sp-mobile-btn open" href={repos[mobileDetail]?.href} target="_blank" rel="noopener noreferrer">
              GITHUB ↗
            </a>
          </>
        ) : (
          <>
            <button className="sp-mobile-btn back" onClick={() => navigate(-1)}>← MENU</button>
            <button className="sp-mobile-btn ghost" disabled>TAP TO VIEW</button>
          </>
        )}
      </div>
    </div>
  );
}
