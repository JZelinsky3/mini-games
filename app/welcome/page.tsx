'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SiteWelcomePage() {
  const router = useRouter();

  const dismiss = () => {
    try {
      localStorage.setItem('nflhub_welcome_seen', '1');
    } catch (e) {
      // storage blocked — navigate anyway
    }
    router.push('/');
  };

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
          --bg: #141311;
          --bg-soft: #1c1b18;
          --bg-card: #201e1a;
          --ink: #f4ebd8;
          --ink-soft: #bfb5a0;
          --ink-mute: #7d7463;
          --amber: #e8a84b;
          --amber-bright: #f4c06a;
          --amber-deep: #a87420;
          --rust: #c04820;
          --line: #3a3630;
        }

        html, body {
          margin: 0;
          padding: 0;
          background: var(--bg);
          color: var(--ink);
          font-family: 'Space Grotesk', sans-serif;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .page::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 20%, rgba(232, 168, 75, 0.06) 0%, transparent 45%),
            radial-gradient(circle at 85% 80%, rgba(192, 72, 32, 0.04) 0%, transparent 50%);
          pointer-events: none;
          z-index: 0;
        }

        .page::after {
          content: '';
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.8 0 0 0 0.04 0'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>");
          pointer-events: none;
          z-index: 1;
          opacity: 0.7;
        }

        /* ===== TICKER ===== */
        .ticker {
          position: relative;
          z-index: 10;
          background: var(--amber);
          color: var(--bg);
          border-bottom: 3px solid var(--bg);
          overflow: hidden;
          height: 38px;
          display: flex;
          align-items: center;
          opacity: 0;
          animation: fadeDown 0.6s ease-out 0.05s forwards;
        }

        .ticker-track {
          display: flex;
          gap: 3rem;
          white-space: nowrap;
          animation: scroll 40s linear infinite;
          padding-left: 3rem;
        }

        .ticker-item {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
        }

        .ticker-star {
          color: var(--rust);
        }

        @keyframes scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ===== CONTAINER ===== */
        .container {
          position: relative;
          z-index: 10;
          max-width: 1320px;
          margin: 0 auto;
          padding: 3rem 2.5rem 5rem;
        }

        /* ===== MASTHEAD ===== */
        .masthead {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 1.75rem;
          border-bottom: 1px solid var(--line);
          margin-bottom: 3.5rem;
          opacity: 0;
          animation: fadeDown 0.8s ease-out 0.15s forwards;
        }

        .masthead-left {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          color: var(--ink-mute);
          line-height: 1.6;
        }

        .masthead-left strong {
          color: var(--amber);
          font-weight: 700;
        }

        .masthead-right {
          text-align: right;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
          line-height: 1.6;
        }

        .masthead-right span {
          color: var(--ink-soft);
        }

        /* ===== HERO ===== */
        .hero {
          margin-bottom: 5rem;
          position: relative;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 2rem;
          padding: 0.35rem 0.85rem;
          background: rgba(232, 168, 75, 0.08);
          border: 1px solid rgba(232, 168, 75, 0.25);
          border-radius: 2px;
          opacity: 0;
          animation: fadeUp 0.7s ease-out 0.3s forwards;
        }

        .hero-dot {
          width: 6px;
          height: 6px;
          background: var(--rust);
          border-radius: 50%;
          animation: pulse 1.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        h1 {
          font-family: 'DM Serif Display', serif;
          font-weight: 400;
          font-size: clamp(3.8rem, 10vw, 9.5rem);
          line-height: 0.92;
          letter-spacing: -0.025em;
          color: var(--ink);
          margin: 0;
          opacity: 0;
          animation: fadeUp 1s ease-out 0.45s forwards;
        }

        h1 .accent {
          font-style: italic;
          color: var(--amber);
        }

        h1 .accent-rust {
          font-style: italic;
          color: var(--rust);
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--line);
          opacity: 0;
          animation: fadeUp 0.8s ease-out 0.7s forwards;
        }

        .hero-lead {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(1.15rem, 1.6vw, 1.45rem);
          line-height: 1.45;
          color: var(--ink-soft);
          font-style: italic;
        }

        .hero-lead::first-letter {
          font-size: 2.2em;
          float: left;
          line-height: 0.9;
          padding: 0.1em 0.1em 0 0;
          color: var(--amber);
          font-style: normal;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          align-self: end;
        }

        .stat {
          padding: 0.9rem 0;
          border-top: 2px solid var(--amber);
        }

        .stat-num {
          font-family: 'DM Serif Display', serif;
          font-size: 2.8rem;
          line-height: 1;
          color: var(--ink);
          margin-bottom: 0.3rem;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
          line-height: 1.4;
        }

        /* ===== SECTION HEADER ===== */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 1rem;
          border-bottom: 3px double var(--line);
          margin-bottom: 2.5rem;
        }

        .section-number {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--amber);
        }

        .section-title {
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: 2rem;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .section-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }

        /* ===== FEATURE: PACK EMPIRE ===== */
        .feature {
          margin-bottom: 5rem;
          opacity: 0;
          animation: fadeUp 0.8s ease-out 0.9s forwards;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 3.5rem;
          align-items: start;
        }

        .feature-visual {
          position: relative;
          aspect-ratio: 4 / 5;
          background: linear-gradient(160deg, #1e1b16 0%, #2a241c 100%);
          border: 1px solid var(--line);
          overflow: hidden;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
        }

        .feature-visual::before {
          content: '';
          position: absolute;
          inset: 10px;
          border: 1px solid rgba(232, 168, 75, 0.3);
          pointer-events: none;
        }

        .feature-visual::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(232, 168, 75, 0.2) 0%, transparent 70%);
          pointer-events: none;
        }

        .feature-mark {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--amber);
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
        }

        .feature-bigname {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2.8rem, 6vw, 4.5rem);
          line-height: 0.95;
          color: var(--ink);
          margin: auto 0;
          letter-spacing: -0.02em;
        }

        .feature-bigname .italic {
          font-style: italic;
          color: var(--amber);
        }

        .feature-modes {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.6rem;
          margin-top: 1.5rem;
        }

        .feature-mode {
          padding: 0.6rem 0.75rem;
          background: rgba(232, 168, 75, 0.06);
          border-left: 2px solid var(--amber);
        }

        .feature-mode-name {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          color: var(--ink);
          margin-bottom: 0.15rem;
        }

        .feature-mode-desc {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }

        .feature-article {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .feature-byline {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--rust);
        }

        .feature-headline {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          line-height: 1.05;
          letter-spacing: -0.015em;
          color: var(--ink);
          margin: 0;
        }

        .feature-headline .italic {
          font-style: italic;
          color: var(--amber);
        }

        .feature-body {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          line-height: 1.65;
          color: var(--ink-soft);
        }

        .feature-body p {
          margin: 0 0 1rem;
        }

        .feature-body p:last-child {
          margin-bottom: 0;
        }

        .feature-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--amber);
          padding: 0.85rem 0;
          border-top: 1px solid var(--line);
          margin-top: 0.5rem;
          align-self: flex-start;
        }

        .feature-cta-arrow {
          transition: transform 0.3s ease;
        }

        /* ===== GAMES TOC ===== */
        .games {
          margin-bottom: 5rem;
          opacity: 0;
          animation: fadeUp 0.8s ease-out 1.1s forwards;
        }

        .games-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0 3rem;
        }

        .game {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.25rem;
          align-items: baseline;
          padding: 1.1rem 0;
          border-bottom: 1px solid var(--line);
          transition: padding 0.3s ease;
          position: relative;
        }

        .game:hover {
          padding-left: 0.5rem;
        }

        .game:hover .game-name {
          color: var(--amber);
        }

        .game-num {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          color: var(--ink-mute);
          min-width: 2rem;
        }

        .game-body {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .game-name {
          font-family: 'DM Serif Display', serif;
          font-size: 1.55rem;
          line-height: 1.1;
          letter-spacing: -0.01em;
          color: var(--ink);
          transition: color 0.3s ease;
        }

        .game-desc {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.82rem;
          color: var(--ink-mute);
          line-height: 1.4;
        }

        .game-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.58rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ink-soft);
          padding: 0.25rem 0.6rem;
          border: 1px solid var(--line);
          border-radius: 2px;
        }

        /* ===== FEATURES STRIP ===== */
        .features {
          margin-bottom: 5rem;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border-top: 1px solid var(--line);
          border-bottom: 1px solid var(--line);
          opacity: 0;
          animation: fadeUp 0.8s ease-out 1.3s forwards;
        }

        .feat {
          padding: 2rem 1.5rem;
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .feat:last-child { border-right: none; }

        .feat-num {
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: 2.4rem;
          line-height: 1;
          color: var(--amber);
          letter-spacing: -0.02em;
        }

        .feat-title {
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: var(--ink);
          margin-top: 0.5rem;
        }

        .feat-desc {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.8rem;
          color: var(--ink-mute);
          line-height: 1.5;
        }

        /* ===== CTA ===== */
        .cta {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.75rem;
          padding: 3.5rem 0 1rem;
          border-top: 3px double var(--line);
          opacity: 0;
          animation: fadeUp 0.8s ease-out 1.5s forwards;
        }

        .cta-line {
          font-family: 'DM Serif Display', serif;
          font-style: italic;
          font-size: clamp(1.3rem, 2.2vw, 1.8rem);
          color: var(--ink-soft);
          text-align: center;
          max-width: 30ch;
          line-height: 1.3;
          margin: 0;
        }

        .enter-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 1.2rem;
          padding: 1.3rem 3.5rem;
          background: var(--amber);
          color: var(--bg);
          border: none;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
          overflow: hidden;
        }

        .enter-btn::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 1px solid rgba(20, 19, 17, 0.3);
          pointer-events: none;
          transition: inset 0.3s ease;
        }

        .enter-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          transition: left 0.6s ease;
        }

        .enter-btn:hover {
          background: var(--amber-bright);
          transform: translateY(-2px);
          box-shadow: 0 14px 30px rgba(232, 168, 75, 0.25);
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
          font-size: 0.72rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-mute);
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s ease;
        }

        .skip:hover { color: var(--ink-soft); }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; gap: 2rem; }
          .hero-stats { grid-template-columns: repeat(3, 1fr); }
          .feature-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .games-list { grid-template-columns: 1fr; gap: 0; }
          .features { grid-template-columns: repeat(2, 1fr); }
          .feat { border-right: none; border-bottom: 1px solid var(--line); }
          .feat:nth-last-child(-n+2) { border-bottom: none; }
          .feat:nth-child(odd) { border-right: 1px solid var(--line); }
          .feat:last-child { border-right: none; }
        }

        @media (max-width: 560px) {
          .container { padding: 2rem 1.25rem 3rem; }
          .masthead { flex-direction: column; gap: 1rem; align-items: flex-start; }
          .masthead-right { text-align: left; }
          .section-header { flex-wrap: wrap; gap: 0.5rem; }
          .features { grid-template-columns: 1fr; }
          .feat { border-right: none !important; border-bottom: 1px solid var(--line); }
          .feat:last-child { border-bottom: none; }
          .hero-stats { grid-template-columns: 1fr 1fr 1fr; gap: 0.5rem; }
          .stat-num { font-size: 2rem; }
          .enter-btn { padding: 1.1rem 2.2rem; font-size: 0.9rem; }
          .game { grid-template-columns: auto 1fr; }
          .game-tag { grid-column: 2; justify-self: start; margin-top: 0.3rem; }
        }
      `}</style>

      <div className="page">
        {/* TICKER */}
        <div className="ticker">
          <div className="ticker-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '3rem' }}>
                <span className="ticker-item"><span className="ticker-star">★</span> DAILY CHALLENGES LIVE</span>
                <span className="ticker-item"><span className="ticker-star">★</span> 9 GAMES · ONE HUB</span>
                <span className="ticker-item"><span className="ticker-star">★</span> PACK EMPIRE — NOW OPEN</span>
                <span className="ticker-item"><span className="ticker-star">★</span> BUILD YOUR STREAK</span>
                <span className="ticker-item"><span className="ticker-star">★</span> FREE TO PLAY</span>
                <span className="ticker-item"><span className="ticker-star">★</span> LEADERBOARD RESETS SEASONALLY</span>
              </div>
            ))}
          </div>
        </div>

        <div className="container">
          {/* MASTHEAD */}
          <div className="masthead">
            <div className="masthead-left">
              <strong>NFL MINIGAMES HUB</strong><br />
              The Almanac — Vol. 01
            </div>
            <div className="masthead-right">
              A <span>Collector&apos;s</span> Welcome<br />
              Issue № 001 / Intro
            </div>
          </div>

          {/* HERO */}
          <div className="hero">
            <div className="hero-kicker">
              <span className="hero-dot" />
              <span>Now entering the hub</span>
            </div>

            <h1>
              Every game<br />
              <span className="accent">an NFL fan</span><br />
              didn&apos;t know<br />
              <span className="accent-rust">they needed.</span>
            </h1>

            <div className="hero-grid">
              <p className="hero-lead">
                Nine games. Daily puzzles. Real football history. A hub built for
                fans who can name the third-string QB on the &apos;07 Patriots —
                and for everyone still learning the sport.
              </p>

              <div className="hero-stats">
                <div className="stat">
                  <div className="stat-num">9</div>
                  <div className="stat-label">Distinct<br />game modes</div>
                </div>
                <div className="stat">
                  <div className="stat-num">3</div>
                  <div className="stat-label">Daily<br />challenges</div>
                </div>
                <div className="stat">
                  <div className="stat-num">∞</div>
                  <div className="stat-label">Leaderboard<br />bragging rights</div>
                </div>
              </div>
            </div>
          </div>

          {/* FEATURE: PACK EMPIRE */}
          <div className="feature">
            <div className="section-header">
              <span className="section-number">§ 01 · Cover Story</span>
              <span className="section-title">The flagship —</span>
              <span className="section-meta">Est. 2025</span>
            </div>

            <div className="feature-grid">
              <div className="feature-visual">
                <div className="feature-mark">
                  <span>★ PACK EMPIRE ★</span>
                  <span>№ 01</span>
                </div>
                <div className="feature-bigname">
                  Pack<br />
                  <span className="italic">Empire.</span>
                </div>
                <div className="feature-modes">
                  <div className="feature-mode">
                    <div className="feature-mode-name">Empire Builder</div>
                    <div className="feature-mode-desc">Solo draft</div>
                  </div>
                  <div className="feature-mode">
                    <div className="feature-mode-name">Versus</div>
                    <div className="feature-mode-desc">Head-to-head</div>
                  </div>
                  <div className="feature-mode">
                    <div className="feature-mode-name">Mega Draft</div>
                    <div className="feature-mode-desc">Full rounds</div>
                  </div>
                  <div className="feature-mode">
                    <div className="feature-mode-name">League</div>
                    <div className="feature-mode-desc">Full season</div>
                  </div>
                </div>
              </div>

              <div className="feature-article">
                <div className="feature-byline">★ Cover Feature · The Main Event</div>
                <h2 className="feature-headline">
                  A card collector&apos;s world, <span className="italic">built inside an NFL trivia hub.</span>
                </h2>
                <div className="feature-body">
                  <p>
                    Pack Empire is the deepest game on the site — and the one that rewards
                    coming back. Rip packs, pull rarities from Common up to Immortal,
                    and build a roster that actually scores against real NFL stats.
                  </p>
                  <p>
                    Play solo to climb the leaderboard. Challenge a friend head-to-head.
                    Run a full Mega Draft. Or commit to a season of League play where every
                    pick carries weight. Four modes, one collector&apos;s obsession.
                  </p>
                </div>
                <div className="feature-cta">
                  <span>Find it in the hub under &quot;Strategy&quot;</span>
                  <span className="feature-cta-arrow">→</span>
                </div>
              </div>
            </div>
          </div>

          {/* GAMES TOC */}
          <div className="games">
            <div className="section-header">
              <span className="section-number">§ 02 · Index</span>
              <span className="section-title">Eight more to explore —</span>
              <span className="section-meta">№ 02 — 09</span>
            </div>

            <div className="games-list">
              <div className="game">
                <span className="game-num">02 ·</span>
                <div className="game-body">
                  <div className="game-name">Career Path</div>
                  <div className="game-desc">Guess the player from their team journey</div>
                </div>
                <span className="game-tag">Trivia</span>
              </div>

              <div className="game">
                <span className="game-num">03 ·</span>
                <div className="game-body">
                  <div className="game-name">Stat Shadow</div>
                  <div className="game-desc">Reveal clues to identify the mystery player</div>
                </div>
                <span className="game-tag">Trivia</span>
              </div>

              <div className="game">
                <span className="game-num">04 ·</span>
                <div className="game-body">
                  <div className="game-name">Timeline Builder</div>
                  <div className="game-desc">Sort 8 players by rookie season</div>
                </div>
                <span className="game-tag">History</span>
              </div>

              <div className="game">
                <span className="game-num">05 ·</span>
                <div className="game-body">
                  <div className="game-name">Play Simulator</div>
                  <div className="game-desc">Call plays, drive the field, score</div>
                </div>
                <span className="game-tag">Strategy</span>
              </div>

              <div className="game">
                <span className="game-num">06 ·</span>
                <div className="game-body">
                  <div className="game-name">Penalty Flag</div>
                  <div className="game-desc">Spot the foul in real play descriptions</div>
                </div>
                <span className="game-tag">Rules</span>
              </div>

              <div className="game">
                <span className="game-num">07 ·</span>
                <div className="game-body">
                  <div className="game-name">Rivalry Chain</div>
                  <div className="game-desc">Build the longest rival connection chain</div>
                </div>
                <span className="game-tag">History</span>
              </div>

              <div className="game">
                <span className="game-num">08 ·</span>
                <div className="game-body">
                  <div className="game-name">Draft Room</div>
                  <div className="game-desc">Guess the pick from combine stats alone</div>
                </div>
                <span className="game-tag">History</span>
              </div>

              <div className="game">
                <span className="game-num">09 ·</span>
                <div className="game-body">
                  <div className="game-name">NFL Redraft</div>
                  <div className="game-desc">Redo history — pick better than the pros</div>
                </div>
                <span className="game-tag">Strategy</span>
              </div>
            </div>
          </div>

          {/* FEATURES STRIP */}
          <div className="features">
            <div className="feat">
              <div className="feat-num">I.</div>
              <div className="feat-title">Daily challenges</div>
              <div className="feat-desc">Three fresh puzzles every midnight ET. Miss a day, break the streak.</div>
            </div>
            <div className="feat">
              <div className="feat-num">II.</div>
              <div className="feat-title">Real scoring</div>
              <div className="feat-desc">Points, speed bonuses, and streak multipliers across every game.</div>
            </div>
            <div className="feat">
              <div className="feat-num">III.</div>
              <div className="feat-title">Live leaderboard</div>
              <div className="feat-desc">Your score is public. See exactly who you&apos;re chasing.</div>
            </div>
            <div className="feat">
              <div className="feat-num">IV.</div>
              <div className="feat-title">Free to play</div>
              <div className="feat-desc">No paywalls. No ads. Sign up to save your streak — that&apos;s it.</div>
            </div>
          </div>

          {/* CTA */}
          <div className="cta">
            <p className="cta-line">
              The whistle&apos;s blown.<br />
              <em style={{ color: 'var(--amber)' }}>Pick your game.</em>
            </p>
            <button className="enter-btn" onClick={dismiss}>
              <span>Enter the Hub</span>
              <span className="arrow">→</span>
            </button>
            <button className="skip" onClick={dismiss}>skip intro →</button>
          </div>
        </div>
      </div>
    </>
  );
}