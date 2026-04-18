import { useState, useEffect } from "react";

const ITEMS = [
  { id: "about",   label: "ABOUT ME",    href: "#about",                        scale: 1.00, offsetX: 0,  offsetY: 0  },
  { id: "github",  label: "GITHUB LINK", href: "https://github.com/sailorsammyy",   scale: 0.68, offsetX: 14, offsetY: -6 },
];

const CLIP_SHAPES = [
  (w, h) => `polygon(0px ${h*0.06}px, ${w - h*0.55}px 0px, ${w}px ${h*0.42}px, ${w - h*0.18}px ${h}px, 0px ${h*0.94}px)`,
  (w, h) => `polygon(${h*0.12}px 0px, ${w - h*0.3}px ${h*0.04}px, ${w}px ${h*0.5}px, ${w - h*0.08}px ${h}px, 0px ${h*0.88}px)`,
  (w, h) => `polygon(0px ${h*0.1}px, ${w - h*0.4}px 0px, ${w}px ${h*0.45}px, ${w - h*0.25}px ${h}px, ${h*0.05}px ${h*0.9}px)`,
];

export default function P3Menu() {
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowUp")   setActive(i => Math.max(0, i - 1));
      if (e.key === "ArrowDown") setActive(i => Math.min(ITEMS.length - 1, i + 1));
      if (e.key === "Enter")     window.location.href = ITEMS[active].href;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&display=swap');

        .p3-root {
          position: relative;
          width: 100%;
          min-height: 100svh;
          background: #07030a;
          overflow: hidden;
          display: flex;
          align-items: center;
        }
        .p3-video {
          position: absolute;
          inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          opacity: 0.4;
          z-index: 0;
          pointer-events: none;
        }

        .p3-clock-ring {
          position: absolute;
          right: -10vw; top: 50%;
          transform: translateY(-50%);
          width: clamp(280px, 55vw, 640px);
          height: clamp(280px, 55vw, 640px);
          border: 1.5px solid rgba(139,26,26,0.22);
          border-radius: 50%;
          z-index: 1;
          pointer-events: none;
          animation: p3-ring-spin 60s linear infinite;
        }
        .p3-clock-ring::before {
          content: '';
          position: absolute;
          inset: 16px;
          border: 1px solid rgba(212,160,23,0.14);
          border-radius: 50%;
        }
        .p3-clock-ring::after {
          content: '';
          position: absolute;
          inset: 32px;
          border: 1px dashed rgba(139,26,26,0.10);
          border-radius: 50%;
        }
        @keyframes p3-ring-spin { to { transform: translateY(-50%) rotate(360deg); } }

        .p3-bg-word {
          position: absolute;
          bottom: -2vw; left: -1vw;
          font-family: 'Cinzel Decorative', serif;
          font-size: clamp(80px, 16vw, 220px);
          color: rgba(139,26,26,0.04);
          letter-spacing: -4px;
          pointer-events: none;
          z-index: 2;
          white-space: nowrap;
          user-select: none;
        }
        .p3-scanlines {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px
          );
          z-index: 3;
          pointer-events: none;
        }
        .p3-mask {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(7,3,10,0.88) 0%, rgba(7,3,10,0.45) 55%, transparent 100%);
          z-index: 4;
          pointer-events: none;
        }

        .p3-stripe  { position:absolute; right:0; top:0; bottom:0; width:5px; background:#8b1a1a; z-index:10; }
        .p3-stripe2 { position:absolute; right:9px; top:0; bottom:0; width:2px; background:rgba(212,160,23,0.28); z-index:10; }
        .p3-stripe3 { position:absolute; right:14px; top:0; bottom:0; width:1px; background:rgba(139,26,26,0.15); z-index:10; }

        .p3-menu {
          position: relative;
          z-index: 20;
          padding: clamp(16px, 3vw, 48px) 0 clamp(16px, 3vw, 48px) clamp(20px, 4vw, 48px);
          display: flex;
          flex-direction: column;
          --p3-base-fs: clamp(52px, 11vw, 130px);
        }
        @media (max-width: 480px) {
          .p3-menu { --p3-base-fs: clamp(56px, 14vw, 96px); }
        }

        .p3-row {
          position: relative;
          cursor: pointer;
          display: flex;
          align-items: center;
          line-height: 1;
          text-decoration: none;
          opacity: 0;
          transform: translateX(-36px);
          transition: opacity 0.38s ease, transform 0.38s cubic-bezier(0.22,1,0.36,1);
        }
        .p3-row.mounted {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }

        .p3-highlight {
          position: absolute;
          left: -48px; top: 50%;
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
          background: #f5e6c8;
          z-index: -1;
          transition: transform 0.22s cubic-bezier(0.22,1,0.36,1);
          pointer-events: none;
        }
        .p3-row.active .p3-highlight { transform: translateY(-50%) scaleX(1); }

        .p3-shadow {
          position: absolute;
          left: -48px; top: 50%;
          transform: translateY(-50%) scaleX(0);
          transform-origin: left center;
          background: rgba(100,10,10,0.85);
          z-index: -2;
          pointer-events: none;
        }

        .p3-label {
          font-family: 'Cinzel Decorative', serif;
          display: block;
          color: #f5ede0;
          letter-spacing: clamp(1px, 0.3vw, 3px);
          line-height: 0.85;
          position: relative;
          z-index: 1;
          white-space: nowrap;
          font-size: calc(var(--p3-base-fs) * var(--p3-scale, 1));
          text-shadow:
            0 0 8px rgba(139,26,26,0.9),
            0 2px 16px rgba(0,0,0,0.85),
            -1px -1px 0 rgba(0,0,0,0.6),
             1px -1px 0 rgba(0,0,0,0.6),
            -1px  1px 0 rgba(0,0,0,0.6),
             1px  1px 0 rgba(0,0,0,0.6);
          transition: color 0.12s ease;
        }
        .p3-row.active .p3-label  { color: #1a0505; text-shadow: none; }
        .p3-row:hover:not(.active) .p3-label { color: #ffffff; }

        .p3-hint {
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
        .p3-hint.mounted { opacity: 1; }
        .p3-hint-row {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; letter-spacing: 3px;
          color: rgba(200,169,110,0.35);
        }
        .p3-hint-key {
          border: 1px solid rgba(200,169,110,0.25);
          border-radius: 2px;
          padding: 1px 6px; font-size: 10px;
          color: rgba(200,169,110,0.5);
        }

        .p3-divider {
          width: 55%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,26,26,0.25), transparent);
          margin: 3px 0;
          pointer-events: none;
        }
      `}</style>

      <div className="p3-root">
        <video className="p3-video" src="/bg.mp4" autoPlay loop muted playsInline />
        <div className="p3-clock-ring" aria-hidden="true" />
        <div className="p3-bg-word">TOKISAKI</div>
        <div className="p3-scanlines" />
        <div className="p3-mask" />
        <div className="p3-stripe" />
        <div className="p3-stripe2" />
        <div className="p3-stripe3" />

        <nav className="p3-menu">
          {ITEMS.map((item, i) => {
            const isActive = active === i;
            const dist = Math.abs(i - active);
            const opacity = isActive ? 1 : Math.max(0.82, 1 - dist * 0.08);
            const baseFs = 130;
            const estW = item.label.length * baseFs * item.scale * 0.6 + 80;
            const estH = baseFs * item.scale * 0.94;
            const clipFn = CLIP_SHAPES[i] ?? CLIP_SHAPES[0];

            return (
              <div key={item.id}>
                <a
                  href={item.href}
                  className={`p3-row ${isActive ? "active" : ""} ${mounted ? "mounted" : ""}`}
                  style={{
                    marginLeft: `clamp(0px, ${item.offsetX * 0.08}vw, ${item.offsetX}px)`,
                    marginTop:  `clamp(0px, ${Math.abs(item.offsetY) * 0.08}vw, ${Math.abs(item.offsetY)}px)`,
                    transitionDelay: mounted ? `${i * 80}ms` : "0ms",
                    "--p3-scale": item.scale,
                  }}
                  onMouseEnter={() => setActive(i)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <div
                    className="p3-shadow"
                    style={{ width: estW, height: estH, clipPath: clipFn(estW, estH) }}
                  />
                  <div
                    className="p3-highlight"
                    style={{ width: estW, height: estH, clipPath: clipFn(estW, estH) }}
                  />
                  <span className="p3-label" style={{ opacity }}>
                    {item.label}
                  </span>
                </a>
                {i < ITEMS.length - 1 && <div className="p3-divider" />}
              </div>
            );
          })}
        </nav>

        <div className={`p3-hint ${mounted ? "mounted" : ""}`}>
          <div className="p3-hint-row"><span className="p3-hint-key">↑↓</span><span>NAVIGATE</span></div>
          <div className="p3-hint-row"><span className="p3-hint-key">↵</span><span>CONFIRM</span></div>
        </div>
      </div>
    </>
  );
}
