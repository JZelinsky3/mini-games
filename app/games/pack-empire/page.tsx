'use client';
import Link from 'next/link';
import { useState } from 'react';
import PackEmpireWelcomeGate from '@/components/WelcomeGate';

export default function PackEmpireHub() {
  const [showModeSelector, setShowModeSelector] = useState(false);

  return (
    <>
      <PackEmpireWelcomeGate />
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="pe-hub-root">

        {/* Grain + glow backdrop */}
        <div className="pe-hub-glow" />
        <div className="pe-hub-grain" />

        {/* Ticker */}
        <div className="pe-hub-ticker">
          <div className="pe-hub-ticker-track">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="pe-hub-ticker-group">
                <span className="pe-hub-ticker-item"><span className="pe-hub-ticker-star">★</span> PACK EMPIRE — LIVE</span>
                <span className="pe-hub-ticker-item"><span className="pe-hub-ticker-star">★</span> FOUR WAYS TO PLAY</span>
                <span className="pe-hub-ticker-item"><span className="pe-hub-ticker-star">★</span> FIVE RARITY TIERS</span>
                <span className="pe-hub-ticker-item"><span className="pe-hub-ticker-star">★</span> TOP 100 LEADERBOARD</span>
                <span className="pe-hub-ticker-item"><span className="pe-hub-ticker-star">★</span> BUILD · COMPETE · COLLECT</span>
              </div>
            ))}
          </div>
        </div>

        {/* Nav / Masthead */}
        <nav className="pe-hub-nav">
          <Link href="/" className="pe-hub-back">← The Hub</Link>
          <div className="pe-hub-nav-center">
            <div className="pe-hub-nav-kicker">NFL MiniGames · Vol. 01</div>
            <div className="pe-hub-nav-title">PACK EMPIRE</div>
          </div>
          <Link href="/games/pack-empire/leaderboard" className="pe-hub-lb-nav">Leaderboard →</Link>
        </nav>

        {/* Hero */}
        <div className="pe-hub-hero">
          <div className="pe-hub-sup">★ NFL · Card Collection Co. ★</div>
          <h1 className="pe-hub-title">
            Pack<br />
            <span className="pe-hub-title-italic">Empire.</span>
          </h1>
          <p className="pe-hub-sub">
            Build your ultimate NFL squad by opening card packs. Draft legends,
            stack rarities, and climb the leaderboard.
          </p>
        </div>

        {/* Section: Modes */}
        <div className="pe-hub-section">
          <div className="pe-hub-section-header">
            <span className="pe-hub-section-num">§ 01 · Modes</span>
            <span className="pe-hub-section-title">Pick your formation —</span>
            <span className="pe-hub-section-meta">2 units · more soon</span>
          </div>

          <div className="pe-hub-modes">

            {/* OFFENSE — opens mode selector */}
            <div
              onClick={() => setShowModeSelector(true)}
              className="pe-hub-mode offense"
              style={{ cursor: 'pointer' }}
            >
              <div className="pe-hub-mode-corner">№ 01</div>
              <div className="pe-hub-mode-header">
                <div className="pe-hub-mode-badge live">
                  <span className="pe-hub-badge-dot" /> LIVE NOW
                </div>
              </div>
              <div className="pe-hub-mode-roman">I.</div>
              <div className="pe-hub-mode-title">
                <span>Offense</span>
                <span className="pe-hub-mode-title-italic">Unit.</span>
              </div>
              <div className="pe-hub-mode-desc">
                Draft your 11-man offense. Choose between building your best solo
                lineup or challenging a friend head-to-head.
              </div>
              <div className="pe-hub-mode-slots">
                {['QB','HB','WR','WR','WR','TE','LT','LG','C','RG','RT'].map((pos, i) => (
                  <span key={i} className="pe-hub-slot">{pos}</span>
                ))}
              </div>
              <div className="pe-hub-mode-cta">
                <span>Choose a mode</span>
                <span className="pe-hub-mode-arrow">→</span>
              </div>
            </div>

            {/* DEFENSE — coming soon */}
            <div className="pe-hub-mode defense coming-soon">
              <div className="pe-hub-mode-corner">№ 02</div>
              <div className="pe-hub-mode-header">
                <div className="pe-hub-mode-badge soon">
                  <span className="pe-hub-badge-dot soon" /> IN DEVELOPMENT
                </div>
              </div>
              <div className="pe-hub-mode-roman">II.</div>
              <div className="pe-hub-mode-title">
                <span>Defense</span>
                <span className="pe-hub-mode-title-italic">Unit.</span>
              </div>
              <div className="pe-hub-mode-desc">
                Draft your defensive unit — DL, LB, CB, and safeties. Go head-to-head
                with offense scores from other players.
              </div>
              <div className="pe-hub-mode-slots">
                {['DT','DT','DE','DE','MLB','OLB','OLB','CB','CB','SS','FS'].map((pos, i) => (
                  <span key={i} className="pe-hub-slot">{pos}</span>
                ))}
              </div>
              <div className="pe-hub-mode-cta soon-cta">
                <span>Coming soon</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section: Rarities */}
        <div className="pe-hub-section">
          <div className="pe-hub-section-header">
            <span className="pe-hub-section-num">§ 02 · Index</span>
            <span className="pe-hub-section-title">Five rarity tiers —</span>
            <span className="pe-hub-section-meta">base pull odds</span>
          </div>

          <div className="pe-hub-rar-list">
            {[
              { label: 'COMMON',       color: '#c87840', pct: '45%' },
              { label: 'RARE',         color: '#6ba8c0', pct: '27%' },
              { label: 'DYNASTY',      color: '#e8a84b', pct: '17%' },
              { label: 'TRANSCENDENT', color: '#b06090', pct: '10%' },
              { label: 'IMMORTAL',     color: '#68a878', pct: '1%'  },
            ].map(r => (
              <div key={r.label} className="pe-hub-rar-row" style={{ ['--rar-color' as string]: r.color }}>
                <div className="pe-hub-rar-stripe" />
                <div className="pe-hub-rar-top">
                  <div className="pe-hub-rar-dot" />
                  <div className="pe-hub-rar-label">{r.label}</div>
                </div>
                <div className="pe-hub-rar-pct">{r.pct} base odds</div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Leaderboard CTA */}
        <div className="pe-hub-section">
          <div className="pe-hub-lb-cta">
            <div className="pe-hub-lb-cta-glow" />
            <div className="pe-hub-lb-cta-inner">
              <div className="pe-hub-lb-cta-left">
                <div className="pe-hub-lb-cta-kicker">★ Standings</div>
                <div className="pe-hub-lb-cta-title">
                  The Top 100 <span className="pe-hub-italic">Leaderboard.</span>
                </div>
                <div className="pe-hub-lb-cta-sub">
                  See who&apos;s built the highest-scoring offense. Click any draft
                  to view the full lineup.
                </div>
              </div>
              <Link href="/games/pack-empire/leaderboard" className="pe-hub-lb-btn">
                <span>View leaderboard</span>
                <span className="pe-hub-lb-btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mode Selector Modal */}
        {showModeSelector && (
          <div className="pe-mode-modal-overlay" onClick={() => setShowModeSelector(false)}>
            <div className="pe-mode-modal" onClick={e => e.stopPropagation()}>
              <div className="pe-modal-header">
                <div>
                  <div className="pe-modal-kicker">§ Offense · Select a mode</div>
                  <h2>Four ways <span className="pe-hub-italic">to play.</span></h2>
                </div>
                <button
                  onClick={() => setShowModeSelector(false)}
                  className="pe-modal-close"
                >
                  ✕
                </button>
              </div>

              <div className="pe-modes-grid">
                {/* Empire Builder - Solo */}
                <Link
                  href="/games/pack-empire/offense"
                  className="pe-mode-option solo"
                  onClick={() => setShowModeSelector(false)}
                >
                  <div className="pe-mode-option-corner">№ 01</div>
                  <div className="pe-mode-option-roman">I</div>
                  <div className="pe-mode-option-divider" />
                  <div className="pe-mode-option-title">
                    Empire<br /><span className="pe-hub-italic">Builder.</span>
                  </div>
                  <div className="pe-mode-option-desc">
                    Build your ultimate solo offense. Post your best score on the leaderboard.
                  </div>
                  <div className="pe-mode-option-cta">Play solo →</div>
                </Link>

                {/* Versus Challenge */}
                <Link
                  href="/games/pack-empire/offense/versus"
                  className="pe-mode-option versus"
                  onClick={() => setShowModeSelector(false)}
                >
                  <div className="pe-mode-option-corner">№ 02</div>
                  <div className="pe-mode-option-roman">II</div>
                  <div className="pe-mode-option-divider" />
                  <div className="pe-mode-option-title">
                    Versus<br /><span className="pe-hub-italic">Challenge.</span>
                  </div>
                  <div className="pe-mode-option-desc">
                    Challenge a friend head-to-head. Both draft — highest score wins.
                  </div>
                  <div className="pe-mode-option-cta versus-cta">Challenge a friend →</div>
                </Link>

                {/* Mega Draft */}
                <Link
                  href="/games/pack-empire/offense/mega-draft"
                  className="pe-mode-option mega"
                  onClick={() => setShowModeSelector(false)}
                >
                  <div className="pe-mode-option-corner">№ 03</div>
                  <div className="pe-mode-option-roman">III</div>
                  <div className="pe-mode-option-divider" />
                  <div className="pe-mode-option-title">
                    Mega<br /><span className="pe-hub-italic">Draft.</span>
                  </div>
                  <div className="pe-mode-option-desc">
                    Go head-to-head in a full draft. Outpick your opponent and build the highest-scoring offense.
                  </div>
                  <div className="pe-mode-option-cta mega-cta">Enter the draft →</div>
                </Link>

                {/* League */}
                <Link
                  href="/games/pack-empire/offense/league"
                  className="pe-mode-option league"
                  onClick={() => setShowModeSelector(false)}
                >
                  <div className="pe-mode-option-corner">№ 04</div>
                  <div className="pe-mode-option-roman">IV</div>
                  <div className="pe-mode-option-divider" />
                  <div className="pe-mode-option-title">
                    League<br /><span className="pe-hub-italic">Mode.</span>
                  </div>
                  <div className="pe-mode-option-desc">
                    Full seasons. Standings. Rivalries that carry weight — the deepest way to play.
                  </div>
                  <div className="pe-mode-option-cta league-cta">Run a season →</div>
                </Link>

              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

:root{
  --pe-bg:#141311;
  --pe-bg-soft:#1c1b18;
  --pe-bg-card:#201e1a;
  --pe-ink:#f4ebd8;
  --pe-ink-soft:#bfb5a0;
  --pe-ink-mute:#7d7463;
  --pe-amber:#e8a84b;
  --pe-amber-bright:#f4c06a;
  --pe-amber-deep:#a87420;
  --pe-rust:#c04820;
  --pe-line:#3a3630;
  --pe-line-soft:#2a2620;
}

body{font-family:'Space Grotesk',sans-serif;background:var(--pe-bg);color:var(--pe-ink)}

.pe-hub-root{
  min-height:100vh;
  background:var(--pe-bg);
  color:var(--pe-ink);
  position:relative;
  padding-bottom:4rem;
  overflow-x:hidden;
}

.pe-hub-glow{
  position:fixed;inset:0;pointer-events:none;z-index:0;
  background-image:
    radial-gradient(circle at 15% 20%,rgba(232,168,75,.06) 0%,transparent 45%),
    radial-gradient(circle at 85% 80%,rgba(192,72,32,.04) 0%,transparent 50%);
}

.pe-hub-grain{
  position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.7;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='3'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 0.92 0 0 0 0 0.8 0 0 0 0.04 0'/></filter><rect width='180' height='180' filter='url(%23n)'/></svg>");
}

/* ═══ TICKER ═══ */
.pe-hub-ticker{
  position:relative;z-index:10;
  background:var(--pe-amber);
  color:var(--pe-bg);
  border-bottom:3px solid var(--pe-bg);
  height:38px;
  display:flex;align-items:center;overflow:hidden;
}
.pe-hub-ticker-track{
  display:flex;gap:3rem;white-space:nowrap;padding-left:3rem;
  animation:pe-ticker-scroll 40s linear infinite;
}
.pe-hub-ticker-group{display:flex;gap:3rem}
.pe-hub-ticker-item{
  font-family:'JetBrains Mono',monospace;font-size:.72rem;font-weight:700;
  letter-spacing:.2em;text-transform:uppercase;
  display:inline-flex;align-items:center;gap:.6rem;
}
.pe-hub-ticker-star{color:var(--pe-rust)}
@keyframes pe-ticker-scroll{
  from{transform:translateX(0)}
  to{transform:translateX(-50%)}
}

/* ═══ NAV / MASTHEAD ═══ */
.pe-hub-nav{
  position:sticky;top:0;z-index:30;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:1rem;
  padding:1.2rem 2rem;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(12px);
  border-bottom:1px solid var(--pe-line);
}
.pe-hub-back{
  color:var(--pe-amber);text-decoration:none;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;
  justify-self:start;transition:color .2s;
}
.pe-hub-back:hover{color:var(--pe-amber-bright)}

.pe-hub-nav-center{text-align:center;justify-self:center}
.pe-hub-nav-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.3em;text-transform:uppercase;
  color:var(--pe-ink-mute);margin-bottom:.3rem;
}
.pe-hub-nav-title{
  font-family:'DM Serif Display',serif;
  font-size:1.4rem;letter-spacing:.02em;color:var(--pe-ink);
}

.pe-hub-lb-nav{
  color:var(--pe-bg);text-decoration:none;
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;
  background:var(--pe-amber);
  padding:.55rem .95rem;border-radius:2px;
  justify-self:end;transition:all .2s;
  white-space:nowrap;
}
.pe-hub-lb-nav:hover{
  background:var(--pe-amber-bright);
  transform:translateY(-1px);
  box-shadow:0 6px 18px rgba(232,168,75,.2);
}

/* ═══ HERO ═══ */
.pe-hub-hero{
  position:relative;z-index:10;
  text-align:center;
  padding:4rem 1.5rem 3rem;
  max-width:1000px;margin:0 auto;
}
.pe-hub-sup{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.65rem;letter-spacing:.4em;text-transform:uppercase;
  color:var(--pe-amber);margin-bottom:1.5rem;
}
.pe-hub-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(3.5rem,10vw,8rem);
  line-height:.92;letter-spacing:-.025em;
  color:var(--pe-ink);margin-bottom:1.8rem;
}
.pe-hub-title-italic{
  font-style:italic;color:var(--pe-amber);
}
.pe-hub-sub{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:clamp(1.05rem,1.6vw,1.3rem);
  line-height:1.55;color:var(--pe-ink-soft);
  max-width:540px;margin:0 auto;
}

/* ═══ SECTION LAYOUT ═══ */
.pe-hub-section{
  position:relative;z-index:10;
  max-width:1100px;margin:3rem auto 0;
  padding:0 2rem;
}

.pe-hub-section-header{
  display:flex;flex-wrap:wrap;justify-content:space-between;align-items:baseline;
  gap:.75rem;padding-bottom:1rem;margin-bottom:2rem;
  border-bottom:3px double var(--pe-line);
}
.pe-hub-section-num{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.7rem;letter-spacing:.22em;text-transform:uppercase;
  color:var(--pe-amber);
}
.pe-hub-section-title{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:clamp(1.5rem,3vw,2rem);letter-spacing:-.01em;
  color:var(--pe-ink);
}
.pe-hub-section-meta{
  font-family:'JetBrains Mono',monospace;
  font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;
  color:var(--pe-ink-mute);
}

.pe-hub-italic{font-style:italic;color:var(--pe-amber)}

/* ═══ MODE CARDS ═══ */
.pe-hub-modes{
  display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;
}
@media(max-width:720px){.pe-hub-modes{grid-template-columns:1fr}}

.pe-hub-mode{
  position:relative;
  padding:2rem 1.75rem 1.75rem;
  display:flex;flex-direction:column;gap:.9rem;
  background:linear-gradient(160deg,var(--pe-bg-card),var(--pe-bg-soft));
  border:1px solid var(--pe-line);
  text-decoration:none;
  transition:transform .3s cubic-bezier(.2,.8,.2,1),
             box-shadow .3s,border-color .3s;
  overflow:hidden;
}
.pe-hub-mode::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;
  background:var(--pe-amber);transition:width .3s ease;
}
.pe-hub-mode.offense:hover{
  border-color:rgba(232,168,75,.5);
  box-shadow:0 20px 40px rgba(0,0,0,.4),0 0 30px rgba(232,168,75,.08);
  transform:translateY(-4px);
}
.pe-hub-mode.offense:hover::before{width:5px}

.pe-hub-mode.coming-soon{
  opacity:.55;cursor:default;
}
.pe-hub-mode.coming-soon::before{background:var(--pe-ink-mute)}

.pe-hub-mode-corner{
  position:absolute;top:1.2rem;right:1.4rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.2em;
  color:var(--pe-amber);
}
.pe-hub-mode.coming-soon .pe-hub-mode-corner{color:var(--pe-ink-mute)}

.pe-hub-mode-header{display:flex;align-items:center;gap:.5rem;margin-bottom:.2rem}

.pe-hub-mode-badge{
  display:inline-flex;align-items:center;gap:.45rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.58rem;letter-spacing:.22em;text-transform:uppercase;
  padding:.35rem .65rem;border-radius:2px;
}
.pe-hub-mode-badge.live{
  background:rgba(232,168,75,.1);
  color:var(--pe-amber);
  border:1px solid rgba(232,168,75,.3);
}
.pe-hub-mode-badge.soon{
  background:rgba(125,116,99,.08);
  color:var(--pe-ink-mute);
  border:1px solid rgba(125,116,99,.2);
}
.pe-hub-badge-dot{
  width:5px;height:5px;border-radius:50%;
  background:var(--pe-rust);
  box-shadow:0 0 8px rgba(192,72,32,.6);
  animation:pe-hub-pulse 1.8s ease-in-out infinite;
}
.pe-hub-badge-dot.soon{
  background:var(--pe-ink-mute);
  box-shadow:none;animation:none;
}
@keyframes pe-hub-pulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:.5;transform:scale(.8)}
}

.pe-hub-mode-roman{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:3.2rem;line-height:1;
  color:var(--pe-amber);
  letter-spacing:-.02em;margin-top:.2rem;
}
.pe-hub-mode.coming-soon .pe-hub-mode-roman{color:var(--pe-ink-mute)}

.pe-hub-mode-title{
  font-family:'DM Serif Display',serif;
  font-size:2.1rem;line-height:.95;letter-spacing:-.02em;
  color:var(--pe-ink);
  display:flex;flex-direction:column;gap:.1rem;
}
.pe-hub-mode-title-italic{
  font-style:italic;color:var(--pe-amber);
}
.pe-hub-mode.coming-soon .pe-hub-mode-title-italic{color:var(--pe-ink-mute)}

.pe-hub-mode-desc{
  font-family:'Space Grotesk',sans-serif;
  font-size:.92rem;line-height:1.55;
  color:var(--pe-ink-soft);flex:1;
}

.pe-hub-mode-slots{
  display:flex;flex-wrap:wrap;gap:5px;margin-top:.3rem;
}
.pe-hub-slot{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.55rem;letter-spacing:.12em;text-transform:uppercase;
  padding:3px 8px;
  background:rgba(232,168,75,.08);
  color:var(--pe-amber-deep);
  border:1px solid rgba(232,168,75,.2);
  border-radius:2px;
}
.pe-hub-mode.coming-soon .pe-hub-slot{
  background:rgba(125,116,99,.06);
  color:var(--pe-ink-mute);
  border-color:rgba(125,116,99,.15);
}

.pe-hub-mode-cta{
  display:inline-flex;align-items:center;gap:.5rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--pe-amber);
  margin-top:.7rem;padding-top:1rem;
  border-top:1px solid var(--pe-line);
  transition:color .2s;
}
.pe-hub-mode-arrow{
  display:inline-block;transition:transform .25s ease;
}
.pe-hub-mode.offense:hover .pe-hub-mode-cta{color:var(--pe-amber-bright)}
.pe-hub-mode.offense:hover .pe-hub-mode-arrow{transform:translateX(4px)}
.pe-hub-mode-cta.soon-cta{color:var(--pe-ink-mute)}

/* ═══ RARITY LIST ═══ */
.pe-hub-rar-list{
  display:grid;grid-template-columns:repeat(5,1fr);gap:.75rem;
}
@media(max-width:800px){.pe-hub-rar-list{grid-template-columns:repeat(2,1fr)}}
@media(max-width:480px){.pe-hub-rar-list{grid-template-columns:1fr}}

.pe-hub-rar-row{
  position:relative;
  padding:1rem 1.1rem 1rem 1.25rem;
  background:var(--pe-bg-card);
  border:1px solid var(--pe-line);
  display:flex;flex-direction:column;gap:.5rem;
  transition:transform .3s ease,box-shadow .3s ease;
}
.pe-hub-rar-row:hover{
  transform:translateY(-2px);
  box-shadow:0 6px 16px rgba(0,0,0,.3);
}
.pe-hub-rar-stripe{
  position:absolute;top:0;left:0;width:3px;height:100%;
  background:var(--rar-color);
}
.pe-hub-rar-top{display:flex;align-items:center;gap:.55rem}
.pe-hub-rar-dot{
  width:8px;height:8px;border-radius:50%;flex-shrink:0;
  background:var(--rar-color);
  box-shadow:0 0 0 2px rgba(20,19,17,.8),0 0 10px var(--rar-color);
}
.pe-hub-rar-label{
  font-family:'DM Serif Display',serif;font-weight:700;
  font-size:.92rem;letter-spacing:.02em;
  color:var(--rar-color);
}
.pe-hub-rar-pct{
  font-family:'JetBrains Mono',monospace;
  font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--pe-ink-mute);
}

/* ═══ LEADERBOARD CTA ═══ */
.pe-hub-lb-cta{
  position:relative;
  background:linear-gradient(160deg,var(--pe-bg-card) 0%,var(--pe-bg-soft) 100%);
  border:1px solid var(--pe-line);
  padding:2rem 2.25rem;
  overflow:hidden;
}
.pe-hub-lb-cta-glow{
  position:absolute;top:-60px;left:50%;transform:translateX(-50%);
  width:400px;height:200px;
  background:radial-gradient(ellipse,rgba(232,168,75,.15) 0%,transparent 70%);
  pointer-events:none;
}
.pe-hub-lb-cta-inner{
  position:relative;
  display:flex;align-items:center;justify-content:space-between;
  gap:2rem;flex-wrap:wrap;
}
.pe-hub-lb-cta-left{flex:1;min-width:260px}
.pe-hub-lb-cta-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.28em;text-transform:uppercase;
  color:var(--pe-amber);margin-bottom:.55rem;
}
.pe-hub-lb-cta-title{
  font-family:'DM Serif Display',serif;
  font-size:clamp(1.5rem,3vw,2rem);line-height:1.1;letter-spacing:-.015em;
  color:var(--pe-ink);margin-bottom:.6rem;
}
.pe-hub-lb-cta-sub{
  font-family:'Space Grotesk',sans-serif;
  font-size:.9rem;color:var(--pe-ink-soft);line-height:1.55;
  max-width:44ch;
}
.pe-hub-lb-btn{
  display:inline-flex;align-items:center;gap:.8rem;
  padding:1rem 1.8rem;
  background:var(--pe-amber);color:var(--pe-bg);
  font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:.85rem;letter-spacing:.16em;text-transform:uppercase;
  border-radius:2px;text-decoration:none;
  flex-shrink:0;transition:all .25s;
  box-shadow:0 8px 20px rgba(232,168,75,.12);
}
.pe-hub-lb-btn:hover{
  background:var(--pe-amber-bright);
  transform:translateY(-2px);
  box-shadow:0 14px 30px rgba(232,168,75,.25);
}
.pe-hub-lb-btn-arrow{transition:transform .25s ease}
.pe-hub-lb-btn:hover .pe-hub-lb-btn-arrow{transform:translateX(4px)}

/* ═══ MODE SELECTOR MODAL ═══ */
.pe-mode-modal-overlay{
  position:fixed;inset:0;z-index:100;
  background:rgba(20,19,17,.92);
  backdrop-filter:blur(8px);
  display:flex;align-items:center;justify-content:center;
  padding:1.5rem;
  animation:pe-modal-fade .25s ease-out;
}
@keyframes pe-modal-fade{
  from{opacity:0}to{opacity:1}
}

.pe-mode-modal{
  background:var(--pe-bg-card);
  border:1px solid var(--pe-line);
  width:100%;max-width:780px;max-height:90vh;overflow-y:auto;
  position:relative;
  animation:pe-modal-rise .35s cubic-bezier(.2,.8,.2,1);
}
@keyframes pe-modal-rise{
  from{opacity:0;transform:translateY(20px)}
  to{opacity:1;transform:translateY(0)}
}

.pe-modal-header{
  padding:1.5rem 1.75rem;
  border-bottom:1px solid var(--pe-line);
  display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;
}
.pe-modal-kicker{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.62rem;letter-spacing:.25em;text-transform:uppercase;
  color:var(--pe-amber);margin-bottom:.4rem;
}
.pe-modal-header h2{
  font-family:'DM Serif Display',serif;
  font-size:1.8rem;line-height:1.1;letter-spacing:-.015em;
  color:var(--pe-ink);margin:0;
}

.pe-modal-close{
  background:none;border:1px solid var(--pe-line);
  color:var(--pe-ink-mute);
  width:32px;height:32px;
  font-size:.9rem;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  border-radius:2px;transition:all .2s;flex-shrink:0;
}
.pe-modal-close:hover{
  color:var(--pe-amber);
  border-color:var(--pe-amber);
}

.pe-modes-grid{
  padding:1.5rem;
  display:grid;grid-template-columns:1fr 1fr;gap:1rem;
}
@media(max-width:620px){.pe-modes-grid{grid-template-columns:1fr}}

.pe-mode-option{
  position:relative;
  padding:1.5rem 1.4rem 1.4rem;
  background:var(--pe-bg-soft);
  border:1px solid var(--pe-line);
  text-decoration:none;color:inherit;cursor:pointer;
  display:flex;flex-direction:column;gap:.5rem;
  transition:all .25s cubic-bezier(.2,.8,.2,1);
  overflow:hidden;
}
.pe-mode-option::before{
  content:'';position:absolute;top:0;left:0;width:3px;height:100%;
  background:var(--pe-amber);transition:width .3s ease;
}
.pe-mode-option:hover{
  transform:translateY(-3px);
  border-color:rgba(232,168,75,.5);
  box-shadow:0 14px 28px rgba(0,0,0,.3),0 0 20px rgba(232,168,75,.08);
}
.pe-mode-option:hover::before{width:5px}

.pe-mode-option-corner{
  position:absolute;top:1rem;right:1.1rem;
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.55rem;letter-spacing:.2em;
  color:var(--pe-amber);
}
.pe-mode-option-roman{
  font-family:'DM Serif Display',serif;font-style:italic;
  font-size:2.2rem;line-height:1;
  color:var(--pe-amber);
  letter-spacing:-.02em;
}
.pe-mode-option-divider{
  width:28px;height:1px;
  background:linear-gradient(90deg,var(--pe-amber),transparent);
  margin:.35rem 0;
}
.pe-mode-option-title{
  font-family:'DM Serif Display',serif;
  font-size:1.55rem;line-height:1.05;letter-spacing:-.015em;
  color:var(--pe-ink);
}
.pe-mode-option-desc{
  font-family:'Space Grotesk',sans-serif;
  font-size:.84rem;line-height:1.55;
  color:var(--pe-ink-soft);flex:1;
  margin-bottom:.5rem;
}
.pe-mode-option-cta{
  font-family:'JetBrains Mono',monospace;font-weight:700;
  font-size:.7rem;letter-spacing:.18em;text-transform:uppercase;
  color:var(--pe-amber);
  padding-top:.8rem;
  border-top:1px solid var(--pe-line);
  transition:color .2s;
}
.pe-mode-option:hover .pe-mode-option-cta{color:var(--pe-amber-bright)}

/* Mode variants — keep them all in editorial palette for consistency */
.pe-mode-option.versus .pe-mode-option-roman,
.pe-mode-option.versus .pe-mode-option-cta,
.pe-mode-option.versus .pe-mode-option-corner{color:var(--pe-amber)}
.pe-mode-option.mega .pe-mode-option-roman,
.pe-mode-option.mega .pe-mode-option-cta,
.pe-mode-option.mega .pe-mode-option-corner{color:var(--pe-amber)}
.pe-mode-option.league .pe-mode-option-roman,
.pe-mode-option.league .pe-mode-option-cta,
.pe-mode-option.league .pe-mode-option-corner{color:var(--pe-amber)}
`;