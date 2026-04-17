'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WelcomePage() {
  const router = useRouter();

  const dismiss = () => {
    try {
      sessionStorage.setItem('packempire_welcome_seen', '1');
    } catch (e) {
      // sessionStorage unavailable — just navigate
    }
    router.push('/games/pack-empire');
  };

  // Preload home route for snappier transition
  useEffect(() => {
    router.prefetch('/games/pack-empire');
  }, [router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,700;0,9..144,900;1,9..144,500&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap');

        :root {
          --parchment: #f4ecd8;
          --parchment-deep: #e8dcc0;
          --ink: #1a2438;
          --ink-soft: #2d3a55;
          --gold: #b8893a;
          --gold-bright: #d4a84b;
          --gold-dark: #8a6528;
          --crimson: #8b2020;
          --cream: #faf6ea;

          /* Rarity palette — muted to match parchment/ink aesthetic */
          --rar-common: #8b6544;
          --rar-rare: #3a6578;
          --rar-dynasty: #b8893a;
          --rar-transcendent: #6b3a6e;
          --rar-immortal: #4a6b3a;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: var(--parchment);
          color: var(--ink);
          font-family: 'Inter', sans-serif;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .grain {
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(139, 101, 40, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(26, 36, 56, 0.03) 0%, transparent 50%),
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='3' seed='5'/><feColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.08 0 0 0 0 0.05 0 0 0 0.08 0'/></filter><rect width='200' height='200' filter='url(%23n)' opacity='0.5'/></svg>");
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        .vignette {
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 40%, rgba(26, 36, 56, 0.25) 100%);
          pointer-events: none;
          z-index: 2;
        }

        .container {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 0 auto;
          padding: 3rem 2rem 5rem;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(26, 36, 56, 0.15);
          margin-bottom: 4rem;
          opacity: 0;
          animation: fadeDown 0.8s ease-out 0.1s forwards;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-dark);
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--crimson);
          box-shadow: 0 0 0 3px rgba(139, 32, 32, 0.15);
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(139, 32, 32, 0.15); }
          50% { box-shadow: 0 0 0 6px rgba(139, 32, 32, 0.05); }
        }

        .header-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ink-soft);
          opacity: 0.7;
        }

        .hero {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 4rem;
          align-items: end;
          margin-bottom: 5rem;
          position: relative;
        }

        .hero-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--gold-dark);
          margin-bottom: 1.5rem;
          opacity: 0;
          animation: fadeUp 0.7s ease-out 0.3s forwards;
        }

        .hero-label::before {
          content: '※  ';
        }

        h1 {
          font-family: 'Fraunces', serif;
          font-weight: 900;
          font-size: clamp(3.5rem, 9vw, 8rem);
          line-height: 0.9;
          letter-spacing: -0.03em;
          color: var(--ink);
          margin: 0 0 1.5rem;
          opacity: 0;
          animation: fadeUp 0.9s ease-out 0.45s forwards;
        }

        .gilt {
          font-style: italic;
          font-weight: 500;
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 50%, var(--gold-dark) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          position: relative;
        }

        .hero-sub {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: clamp(1.1rem, 1.8vw, 1.4rem);
          line-height: 1.5;
          color: var(--ink-soft);
          max-width: 42ch;
          margin: 0 0 2.5rem;
          opacity: 0;
          animation: fadeUp 0.7s ease-out 0.6s forwards;
        }

        .hero-seal {
          width: 140px;
          height: 140px;
          opacity: 0;
          animation: fadeIn 1.2s ease-out 0.8s forwards;
          transform-origin: center;
        }

        .seal-rotate {
          transform-origin: center;
          animation: rotate 30s linear infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .modes-intro {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 1.25rem;
          border-bottom: 2px solid var(--ink);
          margin-bottom: 2.5rem;
          opacity: 0;
          animation: fadeUp 0.6s ease-out 0.9s forwards;
        }

        .modes-title {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-style: italic;
          font-size: 1.5rem;
          letter-spacing: -0.01em;
        }

        .modes-count {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-dark);
        }

        .modes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 5rem;
        }

        .mode {
          position: relative;
          background: var(--cream);
          border: 1px solid rgba(26, 36, 56, 0.18);
          padding: 1.75rem 1.5rem 1.5rem;
          aspect-ratio: 5 / 7;
          display: flex;
          flex-direction: column;
          transition: transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
                      box-shadow 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          box-shadow:
            0 1px 0 rgba(26, 36, 56, 0.05),
            0 4px 12px rgba(26, 36, 56, 0.08);
          cursor: default;
          opacity: 0;
          animation: cardDeal 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          overflow: hidden;
        }

        .mode::before {
          content: '';
          position: absolute;
          inset: 8px;
          border: 1px solid rgba(184, 137, 58, 0.35);
          pointer-events: none;
        }

        .mode::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 0%, transparent 60%, rgba(212, 168, 75, 0.08) 100%);
          pointer-events: none;
        }

        .mode:nth-child(1) { animation-delay: 1.0s; }
        .mode:nth-child(2) { animation-delay: 1.12s; }
        .mode:nth-child(3) { animation-delay: 1.24s; }
        .mode:nth-child(4) { animation-delay: 1.36s; }

        .mode:hover {
          transform: translateY(-8px) rotate(-0.5deg);
          box-shadow:
            0 1px 0 rgba(26, 36, 56, 0.05),
            0 20px 40px rgba(26, 36, 56, 0.15);
        }

        .mode:nth-child(even):hover {
          transform: translateY(-8px) rotate(0.5deg);
        }

        .mode-corner {
          position: absolute;
          top: 1rem;
          right: 1rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: var(--gold-dark);
        }

        .mode-number {
          font-family: 'Fraunces', serif;
          font-weight: 300;
          font-size: 3.5rem;
          line-height: 1;
          color: var(--gold);
          opacity: 0.85;
          margin-bottom: auto;
          letter-spacing: -0.02em;
        }

        .mode-name {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 1.6rem;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin-bottom: 0.4rem;
        }

        .mode-name .italic {
          font-style: italic;
          font-weight: 500;
        }

        .mode-desc {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          line-height: 1.5;
          color: var(--ink-soft);
        }

        .mode-divider {
          width: 32px;
          height: 1px;
          background: var(--gold);
          margin: 0.75rem 0;
        }

        .mode.regular .mode-number { color: var(--crimson); }
        .mode.versus { background: linear-gradient(180deg, var(--cream) 0%, #f6ecd0 100%); }
        .mode.versus .mode-number { color: var(--ink); }
        .mode.draft { background: linear-gradient(180deg, var(--cream) 0%, #f2e4c0 100%); }
        .mode.draft .mode-number {
          background: linear-gradient(135deg, var(--gold) 0%, var(--gold-bright) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .mode.league { background: var(--ink); color: var(--parchment); }
        .mode.league::before { border-color: rgba(212, 168, 75, 0.5); }
        .mode.league .mode-name { color: var(--parchment); }
        .mode.league .mode-desc { color: rgba(244, 236, 216, 0.75); }
        .mode.league .mode-number {
          background: linear-gradient(135deg, var(--gold-bright) 0%, var(--gold) 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .mode.league .mode-corner { color: var(--gold-bright); }

        /* ===== RARITIES ===== */
        .rarities {
          margin-bottom: 4rem;
          opacity: 0;
          animation: fadeUp 0.7s ease-out 1.5s forwards;
        }

        .rarities-intro {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid rgba(26, 36, 56, 0.2);
          margin-bottom: 1.75rem;
        }

        .rarities-title {
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-style: italic;
          font-size: 1.5rem;
          letter-spacing: -0.01em;
        }

        .rarities-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold-dark);
        }

        .rarities-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 0.75rem;
        }

        .rar {
          position: relative;
          background: var(--cream);
          border: 1px solid rgba(26, 36, 56, 0.15);
          padding: 1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .rar::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: var(--rar-color);
        }

        .rar:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(26, 36, 56, 0.1);
        }

        .rar-top {
          display: flex;
          align-items: center;
          gap: 0.55rem;
        }

        .rar-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--rar-color);
          box-shadow: 0 0 0 2px rgba(244, 236, 216, 0.8),
                      0 0 8px rgba(var(--rar-rgb), 0.4);
          flex-shrink: 0;
        }

        .rar-label {
          font-family: 'Fraunces', serif;
          font-weight: 700;
          font-size: 0.85rem;
          letter-spacing: 0.02em;
          color: var(--rar-color);
        }

        .rar-pct {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-soft);
          opacity: 0.7;
        }

        .cta-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(26, 36, 56, 0.15);
          opacity: 0;
          animation: fadeUp 0.7s ease-out 1.7s forwards;
        }

        .cta-line {
          font-family: 'Fraunces', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 1.2rem;
          color: var(--ink-soft);
          text-align: center;
          margin: 0;
        }

        .enter-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 3rem;
          background: var(--ink);
          color: var(--parchment);
          border: none;
          font-family: 'Fraunces', serif;
          font-weight: 500;
          font-size: 1.15rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          overflow: hidden;
        }

        .enter-btn::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid var(--gold);
          pointer-events: none;
          transition: inset 0.3s ease;
        }

        .enter-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212, 168, 75, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .enter-btn:hover {
          background: var(--ink-soft);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(26, 36, 56, 0.25);
        }

        .enter-btn:hover::before { inset: 2px; }
        .enter-btn:hover::after { left: 100%; }

        .arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .enter-btn:hover .arrow {
          transform: translateX(6px);
        }

        .skip {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ink-soft);
          opacity: 0.6;
          text-decoration: none;
          transition: opacity 0.2s ease;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .skip:hover { opacity: 1; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cardDeal {
          0% { opacity: 0; transform: translateY(40px) rotate(-6deg); }
          100% { opacity: 1; transform: translateY(0) rotate(0); }
        }

        @media (max-width: 900px) {
          .modes { grid-template-columns: repeat(2, 1fr); }
          .rarities-list { grid-template-columns: repeat(2, 1fr); }
          .hero { grid-template-columns: 1fr; gap: 2rem; }
          .hero-seal { width: 100px; height: 100px; }
        }

        @media (max-width: 520px) {
          .container { padding: 2rem 1.25rem 3rem; }
          .modes { grid-template-columns: 1fr; gap: 1rem; }
          .mode { aspect-ratio: auto; min-height: 220px; }
          .rarities-list { grid-template-columns: 1fr; }
          .header { margin-bottom: 2.5rem; }
          .hero { margin-bottom: 3rem; }
          .enter-btn { padding: 1rem 2rem; font-size: 1rem; }
        }
      `}</style>

      <div className="page">
        <div className="grain" />
        <div className="vignette" />

        <div className="container">
          {/* HEADER */}
          <div className="header">
            <div className="badge">
              <span className="badge-dot" />
              <span>EST. Pack Empire — Card Collection Co.</span>
            </div>
            <div className="header-meta">Series № 01 / Welcome</div>
          </div>

          {/* HERO */}
          <div className="hero">
            <div>
              <div className="hero-label">A trading card experience</div>
              <h1>
                Pack<br />Empire<span className="gilt">.</span>
              </h1>
              <p className="hero-sub">
                Rip packs. Build rosters. Draft legends. Run your own league.
                A collector&apos;s world built for every kind of player — from a quick
                rip-and-flip to a full season of bragging rights.
              </p>
            </div>

            <svg className="hero-seal" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4a84b" />
                  <stop offset="50%" stopColor="#b8893a" />
                  <stop offset="100%" stopColor="#8a6528" />
                </linearGradient>
                <path id="circlePath" d="M 70,70 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0" />
              </defs>
              <g className="seal-rotate">
                <circle cx="70" cy="70" r="62" fill="none" stroke="url(#gold)" strokeWidth="1" strokeDasharray="2 3" />
                <circle cx="70" cy="70" r="54" fill="none" stroke="url(#gold)" strokeWidth="0.5" />
                <text fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="3" fill="#8a6528">
                  <textPath href="#circlePath">PACK EMPIRE · SINCE DAY ONE · COLLECT · COMPETE · </textPath>
                </text>
              </g>
              <circle cx="70" cy="70" r="28" fill="none" stroke="url(#gold)" strokeWidth="1.5" />
              <text x="70" y="68" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="14" fontStyle="italic" fill="#8a6528">PE</text>
              <text x="70" y="82" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="5" letterSpacing="2" fill="#b8893a">CARD CO.</text>
            </svg>
          </div>

          {/* MODES */}
          <div className="modes-intro">
            <div className="modes-title">Four ways to play —</div>
            <div className="modes-count">№ 01 — 04</div>
          </div>

          <div className="modes">
            <div className="mode regular">
              <div className="mode-corner">№ 01</div>
              <div className="mode-number">I</div>
              <div className="mode-divider" />
              <div className="mode-name">
                Regular<br /><span className="italic">Mode</span>
              </div>
              <div className="mode-desc">
                The classic pull. Rip packs, chase hits, and build the collection at your pace — the soul of the experience.
              </div>
            </div>

            <div className="mode versus">
              <div className="mode-corner">№ 02</div>
              <div className="mode-number">II</div>
              <div className="mode-divider" />
              <div className="mode-name">
                Versus<br /><span className="italic">Mode</span>
              </div>
              <div className="mode-desc">
                Head-to-head showdowns. Pit your pulls against a rival and let the cards decide who walks away with the win.
              </div>
            </div>

            <div className="mode draft">
              <div className="mode-corner">№ 03</div>
              <div className="mode-number">III</div>
              <div className="mode-divider" />
              <div className="mode-name">
                Mega<br /><span className="italic">Draft</span>
              </div>
              <div className="mode-desc">
                High-stakes selection. Draft from a vast pool, make every pick count, and assemble a lineup nobody else can touch.
              </div>
            </div>

            <div className="mode league">
              <div className="mode-corner">№ 04</div>
              <div className="mode-number">IV</div>
              <div className="mode-divider" />
              <div className="mode-name">
                League<br /><span className="italic">Mode</span>
              </div>
              <div className="mode-desc">
                The long game. Full seasons, standings, and rivalries that carry weight — the deepest way to play Pack Empire.
              </div>
            </div>
          </div>

          {/* RARITIES */}
          <div className="rarities">
            <div className="rarities-intro">
              <div className="rarities-title">Five rarity tiers —</div>
              <div className="rarities-sub">base pull odds</div>
            </div>

            <div className="rarities-list">
              <div className="rar" style={{ ['--rar-color' as any]: 'var(--rar-common)', ['--rar-rgb' as any]: '139, 101, 68' }}>
                <div className="rar-top">
                  <span className="rar-dot" />
                  <span className="rar-label">Common</span>
                </div>
                <div className="rar-pct">45% odds</div>
              </div>

              <div className="rar" style={{ ['--rar-color' as any]: 'var(--rar-rare)', ['--rar-rgb' as any]: '58, 101, 120' }}>
                <div className="rar-top">
                  <span className="rar-dot" />
                  <span className="rar-label">Rare</span>
                </div>
                <div className="rar-pct">27% odds</div>
              </div>

              <div className="rar" style={{ ['--rar-color' as any]: 'var(--rar-dynasty)', ['--rar-rgb' as any]: '184, 137, 58' }}>
                <div className="rar-top">
                  <span className="rar-dot" />
                  <span className="rar-label">Dynasty</span>
                </div>
                <div className="rar-pct">17% odds</div>
              </div>

              <div className="rar" style={{ ['--rar-color' as any]: 'var(--rar-transcendent)', ['--rar-rgb' as any]: '107, 58, 110' }}>
                <div className="rar-top">
                  <span className="rar-dot" />
                  <span className="rar-label">Transcendent</span>
                </div>
                <div className="rar-pct">10% odds</div>
              </div>

              <div className="rar" style={{ ['--rar-color' as any]: 'var(--rar-immortal)', ['--rar-rgb' as any]: '74, 107, 58' }}>
                <div className="rar-top">
                  <span className="rar-dot" />
                  <span className="rar-label">Immortal</span>
                </div>
                <div className="rar-pct">1% odds</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta-section">
            <p className="cta-line">The pack is sealed. Only you can break it.</p>
            <button className="enter-btn" onClick={dismiss}>
              <span>Enter the Empire</span>
              <span className="arrow">→</span>
            </button>
            <button className="skip" onClick={dismiss}>skip intro →</button>
          </div>
        </div>
      </div>
    </>
  );
}