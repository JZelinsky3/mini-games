'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function PackEmpireHub() {
  const [showModeSelector, setShowModeSelector] = useState(false);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="pe-hub-root">

        {/* Nav */}
        <nav className="pe-hub-nav">
          <Link href="/" className="pe-hub-back">← Hub</Link>
          <div className="pe-hub-nav-title">PACK EMPIRE</div>
          <Link href="/games/pack-empire/leaderboard" className="pe-hub-lb-nav">🏆 Leaderboard</Link>
        </nav>

        {/* Hero */}
        <div className="pe-hub-hero">
          <div className="pe-hub-sup">NFL</div>
          <h1 className="pe-hub-title">PACK EMPIRE</h1>
          <p className="pe-hub-sub">Build your ultimate NFL squad by opening card packs. Draft legends, stack rarities, climb the leaderboard.</p>
        </div>

        {/* Mode cards */}
        <div className="pe-hub-modes">

          {/* OFFENSE — opens mode selector */}
          <div 
            onClick={() => setShowModeSelector(true)}
            className="pe-hub-mode offense"
            style={{ cursor: 'pointer' }}
          >
            <div className="pe-hub-mode-badge live">LIVE</div>
            <div className="pe-hub-mode-icon">⚔️</div>
            <div className="pe-hub-mode-title">OFFENSE</div>
            <div className="pe-hub-mode-desc">
              Draft your 11-man offense. Choose between building your best solo lineup or challenging a friend head-to-head.
            </div>
            <div className="pe-hub-mode-slots">
              {['QB','HB','WR','WR','WR','TE','LT','LG','C','RG','RT'].map((pos, i) => (
                <span key={i} className="pe-hub-slot">{pos}</span>
              ))}
            </div>
            <div className="pe-hub-mode-cta">Choose Mode →</div>
          </div>

          {/* DEFENSE — coming soon */}
          <div className="pe-hub-mode defense coming-soon">
            <div className="pe-hub-mode-badge soon">COMING SOON</div>
            <div className="pe-hub-mode-icon">🛡️</div>
            <div className="pe-hub-mode-title">DEFENSE</div>
            <div className="pe-hub-mode-desc">Draft your defensive unit — DL, LB, CB, and safeties. Go head-to-head with offense scores from other players.</div>
            <div className="pe-hub-mode-slots">
              {['DT','DT','DE','DE','MLB','OLB','OLB','CB','CB','SS','FS'].map((pos, i) => (
                <span key={i} className="pe-hub-slot">{pos}</span>
              ))}
            </div>
            <div className="pe-hub-mode-cta soon-cta">In Development</div>
          </div>

        </div>

        {/* Leaderboard CTA */}
        <div className="pe-hub-lb-cta">
          <div className="pe-hub-lb-cta-inner">
            <div className="pe-hub-lb-cta-left">
              <div className="pe-hub-lb-cta-title">🏆 Top 100 Leaderboard</div>
              <div className="pe-hub-lb-cta-sub">See who's built the highest-scoring offense. Click any draft to view their full lineup.</div>
            </div>
            <Link href="/games/pack-empire/leaderboard" className="pe-hub-lb-btn">View Leaderboard →</Link>
          </div>
        </div>

        {/* Rarity legend */}
        <div className="pe-hub-rarities">
          <div className="pe-hub-rar-title">CARD RARITIES</div>
          <div className="pe-hub-rar-list">
            {[
              { label: 'COMMON',       color: '#c87840', pct: '54%' },
              { label: 'RARE',         color: '#42c0f8', pct: '28%' },
              { label: 'DYNASTY',      color: '#ffd700', pct: '14%' },
              { label: 'TRANSCENDENT', color: '#e040ff', pct: '3%'  },
              { label: 'IMMORTAL',     color: '#28dc78', pct: '1%'  },
            ].map(r => (
              <div key={r.label} className="pe-hub-rar-row">
                <div className="pe-hub-rar-dot" style={{ background: r.color, boxShadow: `0 0 8px ${r.color}` }} />
                <div className="pe-hub-rar-label" style={{ color: r.color }}>{r.label}</div>
                <div className="pe-hub-rar-pct">{r.pct} base odds</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Selector Modal */}
        {showModeSelector && (
          <div className="pe-mode-modal-overlay" onClick={() => setShowModeSelector(false)}>
            <div className="pe-mode-modal" onClick={e => e.stopPropagation()}>
              <div className="pe-modal-header">
                <h2>OFFENSE MODE</h2>
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
                  <div className="pe-mode-option-icon">🏗️</div>
                  <div className="pe-mode-option-title">Empire Builder</div>
                  <div className="pe-mode-option-desc">
                    Build your ultimate solo offense.<br />
                    Post your best score on the leaderboard.
                  </div>
                  <div className="pe-mode-option-cta">Play Solo →</div>
                </Link>

                {/* Versus Challenge */}
                <Link 
                  href="/games/pack-empire/offense/versus"
                  className="pe-mode-option versus"
                  onClick={() => setShowModeSelector(false)}
                >
                  <div className="pe-mode-option-icon">⚔️</div>
                  <div className="pe-mode-option-title">Versus Challenge</div>
                  <div className="pe-mode-option-desc">
                    Challenge a friend head-to-head.<br />
                    Both draft — highest score wins.
                  </div>
                  <div className="pe-mode-option-cta versus-cta">Challenge Friend →</div>
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
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Barlow Condensed',sans-serif;background:#050a18}

.pe-hub-root{min-height:100vh;background:#050a18;
  background-image:radial-gradient(ellipse at 50% -10%,rgba(255,215,0,.05),transparent 55%),
    repeating-linear-gradient(0deg,transparent,transparent 70px,rgba(255,255,255,.012) 70px,rgba(255,255,255,.012) 71px);
  padding-bottom:4rem}

/* nav */
.pe-hub-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;
  padding:.7rem 1.4rem;border-bottom:2px solid #0d1835;
  position:sticky;top:0;background:#050a18;z-index:30}
.pe-hub-back{color:#2a4060;text-decoration:none;font-family:'Barlow Condensed',sans-serif;
  font-size:.82rem;letter-spacing:.08em;transition:.15s;justify-self:start}
.pe-hub-back:hover{color:#d4e8f8}
.pe-hub-nav-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.9rem;
  letter-spacing:.24em;color:#ffd700;text-shadow:0 0 20px rgba(255,215,0,.5)}
.pe-hub-lb-nav{color:#3a6080;text-decoration:none;font-family:'Barlow Condensed',sans-serif;
  font-size:.78rem;font-weight:700;letter-spacing:.08em;transition:.15s;
  justify-self:end;border:1px solid #1a3050;padding:.28rem .7rem;border-radius:5px}
.pe-hub-lb-nav:hover{color:#ffd700;border-color:#ffd700}

/* hero */
.pe-hub-hero{text-align:center;padding:2.5rem 1.5rem 1.5rem;
  background:radial-gradient(ellipse at 50% 0%,rgba(255,215,0,.08),transparent 60%)}
.pe-hub-sup{font-size:.6rem;letter-spacing:.48em;color:#3a6080;margin-bottom:.4rem}
.pe-hub-title{font-family:'Orbitron',sans-serif;font-weight:900;
  font-size:clamp(2.2rem,7vw,4.5rem);line-height:.92;letter-spacing:.04em;
  background:linear-gradient(135deg,#c8a820,#ffd700 40%,#f0c030 70%,#c8a820);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  margin-bottom:.8rem}
.pe-hub-sub{font-size:.95rem;color:#3a6080;letter-spacing:.04em;
  max-width:520px;margin:0 auto;line-height:1.6}

/* mode cards */
.pe-hub-modes{display:grid;grid-template-columns:1fr 1fr;gap:1.2rem;
  max-width:820px;margin:2.5rem auto 0;padding:0 1.2rem}
@media(max-width:620px){.pe-hub-modes{grid-template-columns:1fr}}

.pe-hub-mode{position:relative;border-radius:16px;padding:1.8rem 1.5rem;
  display:flex;flex-direction:column;gap:.8rem;text-decoration:none;
  border:2px solid;transition:all .22s;overflow:hidden}
.pe-hub-mode.offense{
  background:linear-gradient(160deg,#0a1830,#0d2040);
  border-color:rgba(255,215,0,.4);
  box-shadow:0 0 30px rgba(255,215,0,.08)}
.pe-hub-mode.offense:hover{
  border-color:rgba(255,215,0,.8);
  box-shadow:0 0 50px rgba(255,215,0,.18);
  transform:translateY(-4px)}
.pe-hub-mode.coming-soon{
  background:rgba(8,14,30,.6);
  border-color:rgba(255,255,255,.06);
  opacity:.7;cursor:default}

.pe-hub-mode-badge{display:inline-block;font-family:'Orbitron',sans-serif;font-weight:700;
  font-size:.5rem;letter-spacing:.24em;padding:3px 10px;border-radius:3px;
  align-self:flex-start}
.pe-hub-mode-badge.live{background:rgba(40,220,120,.15);color:#28dc78;border:1px solid rgba(40,220,120,.35)}
.pe-hub-mode-badge.soon{background:rgba(255,255,255,.06);color:#3a6080;border:1px solid rgba(255,255,255,.1)}

.pe-hub-mode-icon{font-size:2.2rem}
.pe-hub-mode-title{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.6rem;
  letter-spacing:.08em;color:#d4e8f8}
.pe-hub-mode.offense .pe-hub-mode-title{
  background:linear-gradient(135deg,#c8a820,#ffd700);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pe-hub-mode-desc{font-family:'Barlow',sans-serif;font-size:.85rem;
  color:#3a6080;line-height:1.6;flex:1}

.pe-hub-mode-slots{display:flex;flex-wrap:wrap;gap:4px;margin-top:.2rem}
.pe-hub-slot{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.52rem;
  letter-spacing:.1em;padding:2px 7px;border-radius:3px;
  background:rgba(255,255,255,.06);color:#2a4060;border:1px solid #0d1835}
.pe-hub-mode.offense .pe-hub-slot{
  background:rgba(255,215,0,.08);color:#a07020;border-color:rgba(255,215,0,.2)}

.pe-hub-mode-cta{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.85rem;
  letter-spacing:.1em;color:#ffd700;margin-top:.4rem;transition:.15s}
.pe-hub-mode.offense:hover .pe-hub-mode-cta{color:#fff}
.soon-cta{color:#2a4060!important}

/* leaderboard CTA */
.pe-hub-lb-cta{max-width:820px;margin:1.5rem auto 0;padding:0 1.2rem}
.pe-hub-lb-cta-inner{display:flex;align-items:center;justify-content:space-between;
  gap:1.2rem;flex-wrap:wrap;
  background:rgba(255,215,0,.04);border:1px solid rgba(255,215,0,.15);
  border-radius:12px;padding:1.1rem 1.4rem}
.pe-hub-lb-cta-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;
  font-size:.95rem;color:#d4e8f8;letter-spacing:.06em;margin-bottom:.2rem}
.pe-hub-lb-cta-sub{font-family:'Barlow',sans-serif;font-size:.78rem;color:#3a6080;line-height:1.5}
.pe-hub-lb-btn{display:inline-block;background:linear-gradient(135deg,#a07020,#ffd700);
  color:#050a18;font-family:'Barlow Condensed',sans-serif;font-weight:800;
  font-size:.82rem;letter-spacing:.1em;padding:.65rem 1.3rem;border-radius:8px;
  text-decoration:none;white-space:nowrap;transition:.2s;flex-shrink:0}
.pe-hub-lb-btn:hover{filter:brightness(1.1)}

/* rarity legend */
.pe-hub-rarities{max-width:820px;margin:2rem auto 0;padding:0 1.2rem}
.pe-hub-rar-title{font-family:'Orbitron',sans-serif;font-weight:700;font-size:.55rem;
  letter-spacing:.28em;color:#1a3050;margin-bottom:.8rem}
.pe-hub-rar-list{display:flex;flex-wrap:wrap;gap:.5rem}
.pe-hub-rar-row{display:flex;align-items:center;gap:.5rem;
  background:rgba(8,14,30,.8);border:1px solid #0d1835;border-radius:6px;
  padding:.4rem .75rem}
.pe-hub-rar-dot{width:7px;height:7px;border-radius:50%;flex-shrink:0}
.pe-hub-rar-label{font-family:'Barlow Condensed',sans-serif;font-weight:800;
  font-size:.6rem;letter-spacing:.14em}
.pe-hub-rar-pct{font-family:'Barlow Condensed',sans-serif;font-size:.58rem;
  color:#2a4060;letter-spacing:.06em}

/* Mode Selector Modal */
.pe-mode-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(5,10,24,0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.pe-mode-modal {
  background: #0a1830;
  border: 2px solid #ffd700;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  margin: 20px;
  overflow: hidden;
}

.pe-modal-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #1a3050;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pe-modal-header h2 {
  font-family: 'Orbitron', sans-serif;
  font-size: 1.35rem;
  color: #ffd700;
  margin: 0;
}

.pe-modal-close {
  background: none;
  border: none;
  color: #3a6080;
  font-size: 1.4rem;
  cursor: pointer;
}

.pe-modes-grid {
  padding: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.pe-mode-option {
  border-radius: 12px;
  padding: 1.4rem 1.2rem;
  text-align: center;
  border: 2px solid #1a3050;
  transition: all 0.2s;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.pe-mode-option:hover {
  border-color: #ffd700;
  transform: translateY(-4px);
  box-shadow: 0 0 25px rgba(255,215,0,0.15);
}

.pe-mode-option.solo {
  background: linear-gradient(160deg, #0a1830, #0d2040);
}

.pe-mode-option.versus {
  background: rgba(40, 60, 100, 0.6);
  border-color: #42c0f8;
}

.pe-mode-option-icon {
  font-size: 2.8rem;
  margin-bottom: 0.8rem;
}

.pe-mode-option-title {
  font-family: 'Orbitron', sans-serif;
  font-weight: 900;
  font-size: 1.35rem;
  color: #d4e8f8;
  margin-bottom: 0.6rem;
}

.pe-mode-option-desc {
  font-size: 0.86rem;
  color: #3a6080;
  line-height: 1.5;
  margin-bottom: 1.2rem;
}

.pe-mode-option-cta {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  color: #ffd700;
}

.versus-cta {
  color: #42c0f8 !important;
}
`;