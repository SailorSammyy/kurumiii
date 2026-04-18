import { useState, useEffect } from "react";

const ITEMS = [
  { id: "about",    label: "ABOUT ME",      page: "about",    scale: 1.00, offsetX: 0,  offsetY: 0,  skew: -6,  skewY: 10  },
  { id: "github",   label: "GITHUB",        page: "github",   scale: 0.88, offsetX: 8,  offsetY: 6,  skew: 0,   skewY: -4  },
  { id: "socials",  label: "SOCIALS",       page: "socials",  scale: 0.92, offsetX: 16, offsetY: 8,  skew: -3,  skewY: 5   },
  { id: "sideproj", label: "PROJECTS", page: "projects", scale: 0.70, offsetX: 10, offsetY: 6,  skew: -4,  skewY: 7   },
];

const CLIP_SHAPES = [
  (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`,
  (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`,
  (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`,
  (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`,
  (w, h) => `polygon(0px 0px, ${w}px ${h * 0.5}px, 0px ${h}px)`,
];

function ClockParticles() {
  return (
    <div className="kuru-particles" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className={`kuru-particle kuru-particle--${i % 6}`} />
      ))}
    </div>
  );
}

export default function KurumiMenu({ onNavigate }) {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  const activate = (idx) => {
    setActive(idx);
    setAnimKey(k => k + 1);
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp")   activate(Math.max(0, active - 1));
      if (e.key === "ArrowDown") activate(Math.min(ITEMS.length - 1, active + 1));
      if (e.key === "Enter") {
        const item = ITEMS[active];
        if (item.page === "github") {
          window.open("https://github.com/sailorsammyy", "_blank", "noopener");
        } else {
          onNavigate?.(item.page);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Anton&display=swap');

        .kuru-clock-ring {
          position: absolute;
          top: 50%; left: 50%;
          width: 520px; height: 520px;
          transform: translate(-50%, -50%);
          border: 1.5px solid rgba(180, 80, 20, 0.18);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
          animation: kuru-ring-spin 60s linear infinite;
        }
        .kuru-clock-ring::before {
          content: '';
          position: absolute;
          inset: 14px;
          border: 1px solid rgba(220, 120, 30, 0.12);
          border-radius: 50%;
        }
        .kuru-clock-ring::after {
          content: '';
          position: absolute;
          inset: 28px;
          border: 1px dashed rgba(180, 60, 10, 0.10);
          border-radius: 50%;
        }
        @keyframes kuru-ring-spin {
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        .kuru-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }
        .kuru-particle {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          animation: kuru-float 6s ease-in-out infinite;
        }
        .kuru-particle--0 { width:4px; height:4px; background:#c0392b; top:20%; left:30%; animation-delay:0s;   animation-duration:5.2s; }
        .kuru-particle--1 { width:3px; height:3px; background:#8b1a1a; top:60%; left:20%; animation-delay:1.1s; animation-duration:6.8s; }
        .kuru-particle--2 { width:5px; height:5px; background:#d4a017; top:35%; left:65%; animation-delay:2.3s; animation-duration:4.9s; }
        .kuru-particle--3 { width:3px; height:3px; background:#c0392b; top:75%; left:55%; animation-delay:0.7s; animation-duration:7.1s; }
        .kuru-particle--4 { width:4px; height:4px; background:#8b1a1a; top:15%; left:70%; animation-delay:3.5s; animation-duration:5.6s; }
        .kuru-particle--5 { width:2px; height:2px; background:#d4a017; top:50%; left:40%; animation-delay:1.9s; animation-duration:6.3s; }
        /* repeat with offset positions */
        .kuru-particle:nth-child(7)  { top:80%; left:75%; animation-delay:0.4s;  animation-duration:5.8s; }
        .kuru-particle:nth-child(8)  { top:25%; left:15%; animation-delay:2.8s;  animation-duration:6.1s; }
        .kuru-particle:nth-child(9)  { top:45%; left:82%; animation-delay:1.5s;  animation-duration:4.7s; }
        .kuru-particle:nth-child(10) { top:65%; left:10%; animation-delay:3.2s;  animation-duration:7.4s; }
        .kuru-particle:nth-child(11) { top:10%; left:50%; animation-delay:0.9s;  animation-duration:5.3s; }
        .kuru-particle:nth-child(12) { top:90%; left:35%; animation-delay:4.1s;  animation-duration:6.6s; }
        @keyframes kuru-float {
          0%   { opacity:0; transform: translateY(0) scale(1); }
          20%  { opacity:0.7; }
          80%  { opacity:0.4; }
          100% { opacity:0; transform: translateY(-60px) scale(0.5); }
        }

        .kuru-stripe  { position:absolute; right:0; top:0; bottom:0; width:5px; background:#8b1a1a; z-index:10; pointer-events:none; }
        .kuru-stripe2 { position:absolute; right:9px; top:0; bottom:0; width:2px; background:rgba(212,160,23,0.28); z-index:10; pointer-events:none; }
        .kuru-stripe3 { position:absolute; right:14px; top:0; bottom:0; width:1px; background:rgba(139,26,26,0.15); z-index:10; pointer-events:none; }

        .kuru-overlay {
          position: absolute;
          inset: 0;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .kuru-name-tag {
          position: absolute;
          top: 18px;
          left: 22px;
          z-index: 20;
          font-family: 'Cinzel Decorative', 'Anton', serif;
          font-style: normal;
          font-size: clamp(24px, 4vw, 52px);
          line-height: 1.0;
          letter-spacing: 1px;
          color: rgba(10, 5, 5, 0.72);
          transform: rotate(6deg);
          transform-origin: left top;
          user-select: none;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 2px;
        }
        .kuru-name-tag .line1 {
          color: rgba(139, 26, 26, 0.82);
          font-size: clamp(20px, 3.2vw, 44px);
          letter-spacing: 3px;
        }
        .kuru-name-tag .line2 {
          color: rgba(20, 10, 10, 0.68);
          font-size: clamp(16px, 2.6vw, 36px);
          letter-spacing: 6px;
        }
        .kuru-name-tag .line3 {
          font-size: clamp(9px, 1vw, 13px);
          letter-spacing: 8px;
          color: rgba(212, 160, 23, 0.55);
          margin-top: 4px;
        }

        .kuru-menu {
          position: relative;
          z-index: 20;
          padding: clamp(16px, 3vw, 48px);
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: all;
        }

        .kuru-row {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          text-decoration: none;
          opacity: 0;
          transform: translateX(36px);
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .kuru-row.mounted {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }

        .kuru-glow {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          width: 120%; height: 200%;
          background: radial-gradient(ellipse at center, rgba(180,30,30,0.38) 0%, rgba(212,160,23,0.12) 50%, transparent 70%);
          filter: blur(20px);
          z-index: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .kuru-row.active .kuru-glow { opacity: 1; }

        .kuru-skew-wrap {
          position: relative;
          display: flex;
          align-items: center;
          isolation: isolate;
        }

        @keyframes kuru-shadow-pop {
          0%   { transform: translateY(-40%) translateX(-12px) scaleX(0) scaleY(1); }
          55%  { transform: translateY(-46%) translateX(-15px) scaleX(1.22) scaleY(1.18); }
          75%  { transform: translateY(-39%) translateX(-11px) scaleX(0.96) scaleY(0.97); }
          100% { transform: translateY(-40%) translateX(-12px) scaleX(1) scaleY(1); }
        }

        .kuru-shadow-tri {
          position: absolute;
          top: 50%;
          transform-origin: left center;
          background: rgba(100, 10, 10, 0.88);
          z-index: 1;
          pointer-events: none;
          transform: translateY(-40%) translateX(-12px) scaleX(0);
          transition: transform 0.18s ease;
        }
        .kuru-shadow-tri.pop {
          animation: kuru-shadow-pop 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .kuru-highlight {
          position: absolute;
          top: 50%;
          transform-origin: left center;
          background: #f5e6c8;
          z-index: 2;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none;
        }

        .kuru-label-wrap {
          position: relative;
          z-index: 3;
        }

        .kuru-label-base {
          font-family: 'Cinzel Decorative', 'Anton', serif;
          font-style: normal;
          letter-spacing: clamp(1px, 0.3vw, 3px);
          line-height: 0.85;
          display: block;
          white-space: nowrap;
          user-select: none;
          font-size: calc(var(--kuru-base-fs) * var(--kuru-scale, 1));
        }

        .kuru-menu { --kuru-base-fs: clamp(42px, 9vw, 80px); }
        @media (max-width: 480px) {
          .kuru-menu { --kuru-base-fs: clamp(48px, 12vw, 72px); }
          .kuru-menu { padding: 8px 4px; }
          .kuru-row { justify-content: flex-start; }
        }

        .kuru-label-dark {
          color: #f5ede0;
          transition: color 0.12s ease;
          text-shadow:
            0 0 8px rgba(139,26,26,0.9),
            0 2px 16px rgba(0,0,0,0.85),
            -1px -1px 0 rgba(0,0,0,0.6),
             1px -1px 0 rgba(0,0,0,0.6),
            -1px  1px 0 rgba(0,0,0,0.6),
             1px  1px 0 rgba(0,0,0,0.6);
        }
        .kuru-row.active .kuru-label-dark { color: #1a0505; text-shadow: none; }
        .kuru-row:hover:not(.active) .kuru-label-dark { color: #ffffff; }

        .kuru-label-bright {
          color: #6b0000;
          position: absolute;
          inset: 0;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.12s ease;
        }
        .kuru-row.active .kuru-label-bright { opacity: 1; }

        .kuru-hint {
          position: absolute;
          bottom: clamp(12px, 2vw, 24px);
          right: clamp(14px, 2vw, 28px);
          z-index: 20;
          display: flex; flex-direction: column;
          align-items: flex-end; gap: 5px;
          font-family: 'Cinzel Decorative', serif;
          opacity: 0;
          transition: opacity 0.5s ease 0.9s;
        }
        .kuru-hint.mounted { opacity: 1; }
        .kuru-hint-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; letter-spacing: 3px;
          color: rgba(200,169,110,0.35);
        }
        .kuru-hint-key {
          border: 1px solid rgba(200,169,110,0.25);
          border-radius: 2px;
          padding: 1px 6px; font-size: 10px;
          color: rgba(200,169,110,0.5);
        }

        .kuru-divider {
          width: 60%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,26,26,0.22), transparent);
          margin: 2px auto;
          pointer-events: none;
        }
      `}</style>

      <div className="kuru-overlay">
        <div className="kuru-clock-ring" aria-hidden="true" />

        <ClockParticles />

        <div className="kuru-name-tag">
          <span className="line1">Sam's</span>
          <span className="line2">PORTFOLIO</span>
          <span className="line3">XII · X · IX · VI · III</span>
        </div>

        <div className="kuru-stripe" />
        <div className="kuru-stripe2" />
        <div className="kuru-stripe3" />

        <nav className="kuru-menu">
          {ITEMS.map((item, i) => {
            const isActive = active === i;
            const dist = Math.abs(i - active);
            const opacity = isActive ? 1 : Math.max(0.82, 1 - dist * 0.06);
            const estW = item.label.length * 80 * item.scale * 0.6 + 80;
            const estH = 80 * item.scale * 0.94;
            const clipFn = CLIP_SHAPES[i] ?? CLIP_SHAPES[0];

            return (
              <div key={item.id}>
                <a
                  href="#"
                  className={`kuru-row ${isActive ? "active" : ""} ${mounted ? "mounted" : ""}`}
                  style={{
                    marginRight: `clamp(0px, ${item.offsetX * 0.1}vw, ${item.offsetX}px)`,
                    marginTop: `clamp(0px, ${item.offsetY * 0.1}vw, ${item.offsetY}px)`,
                    transitionDelay: mounted ? `${i * 80}ms` : "0ms",
                    "--kuru-scale": item.scale,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.page === "github") {
                      window.open("https://github.com/sailorsammyy", "_blank", "noopener");
                    } else {
                      onNavigate?.(item.page);
                    }
                  }}
                  onMouseEnter={() => activate(i)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div className="kuru-glow" />
                  <div
                    className="kuru-skew-wrap"
                    style={{ transform: `skewX(${item.skew}deg) skewY(${item.skewY}deg)` }}
                  >
                    <div
                      key={isActive ? `pop-${i}-${animKey}` : `idle-${i}`}
                      className={`kuru-shadow-tri${isActive ? ' pop' : ''}`}
                      style={{ width: estW, height: estH, clipPath: clipFn(estW, estH) }}
                    />
                    <div
                      className="kuru-highlight"
                      style={{
                        width: estW,
                        height: estH,
                        clipPath: clipFn(estW, estH),
                        transform: `translateY(-50%) scaleX(${isActive ? 1 : 0})`,
                      }}
                    />
                    <div className="kuru-label-wrap" style={{ opacity }}>
                      <span className="kuru-label-base kuru-label-dark">
                        {item.label}
                      </span>
                      <span
                        className="kuru-label-base kuru-label-bright"
                        style={{ clipPath: clipFn(estW, estH) }}
                      >
                        {item.label}
                      </span>
                    </div>
                  </div>
                </a>
                {i < ITEMS.length - 1 && <div className="kuru-divider" />}
              </div>
            );
          })}
        </nav>

        <div className={`kuru-hint ${mounted ? "mounted" : ""}`}>
          <div className="kuru-hint-row"><span className="kuru-hint-key">↑↓</span><span>NAVIGATE</span></div>
          <div className="kuru-hint-row"><span className="kuru-hint-key">↵</span><span>CONFIRM</span></div>
        </div>
      </div>
    </>
  );
}
