'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/create/page.tsx

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { createLeague, joinLeague } from '@/lib/league/db';

export default function CreateLeaguePage() {
  const supabase = createClient();
  const router = useRouter();
  const [userId, setUserId]      = useState<string | null>(null);
  const [name, setName]          = useState('');
  const [visibility, setVis]     = useState<'public' | 'invite'>('public');
  const [maxPlayers, setMax]     = useState(8);
  const [playoffSize, setPoSize] = useState<string>('half');
  const [creating, setCreating]  = useState(false);
  const [error, setError]        = useState('');
  const [step, setStep]          = useState(1);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  async function handleCreate() {
    if (!userId || !name.trim()) return;
    setCreating(true);
    setError('');
    try {
      const league = await createLeague({
        name: name.trim(),
        commissionerId: userId,
        visibility,
        maxPlayers,
        playoffSize,
      });
      await joinLeague(league.id, userId);
      router.push(`/games/pack-empire/offense/league/${league.id}`);
    } catch (e: any) {
      setError(e.message ?? 'Failed to create league.');
      setCreating(false);
    }
  }

  const maxPlayoffOptions = [
    'half',
    ...Array.from({ length: Math.floor(maxPlayers / 2) - 1 }, (_, i) => String(i + 2)),
  ];

  const qualCount = playoffSize === 'half'
    ? `${Math.floor(maxPlayers / 2)} teams`
    : `${playoffSize} teams`;

  const stepTitles = ['NAME YOUR LEAGUE', 'SET THE RULES', 'READY TO LAUNCH'];
  const stepSubs   = [
    'A great name strikes fear before the first snap.',
    'Configure your league format and playoff structure.',
    'Review your settings and open the doors.',
  ];

  return (
    <>
      <div className="lcr-root">

        {/* Nav */}
        <nav className="lcr-nav">
          <Link href="/games/pack-empire/offense/league" className="lcr-back">← League Hub</Link>
          <div className="lcr-nav-label">CREATE LEAGUE</div>
          <div className="lcr-pips">
            {[1,2,3].map(s => (
              <div key={s} className={`lcr-pip${step === s ? ' cur' : step > s ? ' done' : ''}`} />
            ))}
          </div>
        </nav>

        {/* Hero */}
        <div className="lcr-hero">
          <div className="lcr-hero-bg">
            <div className="lcr-hero-grid" />
            <div className="lcr-hero-glow" />
          </div>
          <div className="lcr-hero-inner">
            <div className="lcr-hero-step">STEP {step} OF 3</div>
            <div className="lcr-hero-title">{stepTitles[step - 1]}</div>
            <div className="lcr-hero-sub">{stepSubs[step - 1]}</div>
          </div>
        </div>

        {!userId ? (
          <div className="lcr-gated">Sign in to create a league.</div>
        ) : (
          <div className="lcr-body">

            {/* ── Step 1 ── */}
            {step === 1 && (
              <div className="lcr-panel">
                <div className="lcr-field">
                  <label className="lcr-label">LEAGUE NAME</label>
                  <input
                    className="lcr-input"
                    placeholder="e.g. Friday Night Gridiron…"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    maxLength={40}
                    autoFocus
                    onKeyDown={e => e.key === 'Enter' && name.trim().length >= 2 && setStep(2)}
                  />
                  <div className="lcr-hint">{name.length}/40</div>
                </div>

                <div className="lcr-field">
                  <label className="lcr-label">WHO CAN JOIN</label>
                  <div className="lcr-vis-row">
                    {([
                      ['public', '🌐', 'PUBLIC',       'Anyone with your code'],
                      ['invite', '🔒', 'INVITE ONLY',  'Friends you share with'],
                    ] as const).map(([v, icon, lbl, sub]) => (
                      <button
                        key={v}
                        className={`lcr-vis-card${visibility === v ? ' active' : ''}`}
                        onClick={() => setVis(v)}
                      >
                        <span className="lcr-vis-icon">{icon}</span>
                        <span className="lcr-vis-lbl">{lbl}</span>
                        <span className="lcr-vis-sub">{sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="lcr-btn-primary"
                  disabled={name.trim().length < 2}
                  onClick={() => setStep(2)}
                >
                  NEXT: SET THE RULES →
                </button>
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="lcr-panel">
                <div className="lcr-field">
                  <label className="lcr-label">MAX TEAMS</label>
                  <div className="lcr-chips">
                    {[4,6,8,10,12].map(n => (
                      <button
                        key={n}
                        className={`lcr-chip${maxPlayers === n ? ' active' : ''}`}
                        onClick={() => {
                          setMax(n);
                          if (playoffSize !== 'half' && parseInt(playoffSize) >= Math.floor(n / 2)) setPoSize('half');
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div className="lcr-hint">{maxPlayers} managers · 8-week regular season</div>
                </div>

                <div className="lcr-field">
                  <label className="lcr-label">PLAYOFF SPOTS — {qualCount}</label>
                  <div className="lcr-chips" style={{ flexWrap: 'wrap' }}>
                    {maxPlayoffOptions.map(v => (
                      <button
                        key={v}
                        className={`lcr-chip${playoffSize === v ? ' active' : ''}`}
                        onClick={() => setPoSize(v)}
                      >
                        {v === 'half' ? 'TOP HALF' : v}
                      </button>
                    ))}
                  </div>
                  <div className="lcr-hint">Gauntlet until 2 remain → best-of-3 finals</div>
                </div>

                <div className="lcr-step-btns">
                  <button className="lcr-btn-ghost" onClick={() => setStep(1)}>← BACK</button>
                  <button className="lcr-btn-primary" style={{ flex: 1 }} onClick={() => setStep(3)}>
                    REVIEW →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div className="lcr-panel">
                <div className="lcr-summary">
                  <div className="lcr-summary-name">{name}</div>
                  <div className="lcr-summary-rows">
                    {[
                      ['Visibility',    visibility === 'public' ? '🌐 Public' : '🔒 Invite only'],
                      ['Max teams',     `${maxPlayers} managers`],
                      ['Playoff spots', qualCount],
                      ['Season',        '8 weeks + playoffs'],
                      ['Format',        'Open packs · lock 1 player/week'],
                    ].map(([k, v]) => (
                      <div key={k} className="lcr-summary-row">
                        <span className="lcr-summary-key">{k}</span>
                        <span className="lcr-summary-val">{v}</span>
                      </div>
                    ))}
                  </div>
                  <button className="lcr-edit-link" onClick={() => setStep(1)}>Edit settings</button>
                </div>

                {error && <div className="lcr-error">{error}</div>}

                <button className="lcr-btn-launch" onClick={handleCreate} disabled={creating}>
                  {creating
                    ? <><span className="lcr-btn-spin" /> CREATING…</>
                    : '⚡ LAUNCH LEAGUE'}
                </button>

                <button className="lcr-btn-ghost" style={{ width: '100%', marginTop: '.5rem' }} onClick={() => setStep(2)}>
                  ← BACK
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

        *{box-sizing:border-box}
        .lcr-root{font-family:'Rajdhani',sans-serif;color:#ffd4a8;background:#1c0a00;min-height:100vh}

        /* Nav */
        .lcr-nav{display:flex;align-items:center;justify-content:space-between;padding:.8rem 2rem;background:rgba(28,10,0,.98);border-bottom:1px solid #4a2000;position:sticky;top:0;z-index:40}
        .lcr-back{color:#7a3a10;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s;white-space:nowrap}
        .lcr-back:hover{color:#ff8c00}
        .lcr-nav-label{font-family:'Orbitron',sans-serif;font-size:.62rem;letter-spacing:.18em;color:#7a3a10}
        .lcr-pips{display:flex;gap:.4rem;align-items:center}
        .lcr-pip{width:22px;height:3px;border-radius:2px;background:#2e1200;transition:.3s}
        .lcr-pip.done{background:#7a3a10}
        .lcr-pip.cur{background:#ff4500;width:30px;box-shadow:0 0 6px rgba(255,69,0,.5)}

        /* Hero */
        .lcr-hero{position:relative;overflow:hidden;padding:2rem 2rem 1.6rem;border-bottom:1px solid #2e1200}
        .lcr-hero-bg{position:absolute;inset:0;background:linear-gradient(180deg,#2e1200,#1c0a00)}
        .lcr-hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,69,0,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,69,0,.1) 1px,transparent 1px);background-size:36px 36px;mask-image:radial-gradient(ellipse 90% 100% at 50% 0%,black,transparent)}
        .lcr-hero-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:400px;height:240px;background:radial-gradient(ellipse,rgba(255,69,0,.22) 0%,transparent 70%);pointer-events:none}
        .lcr-hero-inner{position:relative;z-index:1;max-width:900px;margin:0 auto}
        .lcr-hero-step{font-family:'Orbitron',sans-serif;font-size:.58rem;letter-spacing:.24em;color:#7a3a10;margin-bottom:.3rem}
        .lcr-hero-title{font-family:'Orbitron',sans-serif;font-size:clamp(1.3rem,4vw,2rem);font-weight:900;color:#ff4500;letter-spacing:.04em;margin-bottom:.3rem;text-shadow:0 0 24px rgba(255,69,0,.35)}
        .lcr-hero-sub{font-size:.9rem;color:#7a3a10;font-weight:500}

        /* Body */
        .lcr-body{max-width:900px;margin:0 auto;padding:1.8rem 2rem 4rem}
        .lcr-gated{color:#7a3a10;padding:3rem 2rem;text-align:center;font-size:.95rem;max-width:900px;margin:0 auto}

        /* Panel */
        .lcr-panel{display:flex;flex-direction:column;gap:1.4rem;max-width:600px}

        /* Field */
        .lcr-field{display:flex;flex-direction:column;gap:.5rem}
        .lcr-label{font-family:'Orbitron',sans-serif;font-size:.6rem;letter-spacing:.2em;color:#ff4500}
        .lcr-input{width:100%;background:#1c0a00;border:1.5px solid #4a2000;border-radius:9px;padding:.8rem 1rem;font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:600;color:#fff0e8;outline:none;transition:.15s}
        .lcr-input:focus{border-color:#ff4500;box-shadow:0 0 0 2px rgba(255,69,0,.12)}
        .lcr-input::placeholder{color:#4a2000}
        .lcr-hint{font-size:.7rem;color:#4a2000;font-weight:500}

        /* Visibility */
        .lcr-vis-row{display:grid;grid-template-columns:1fr 1fr;gap:.6rem}
        .lcr-vis-card{display:flex;flex-direction:column;align-items:flex-start;gap:.15rem;background:#2e1200;border:1.5px solid #4a2000;border-radius:10px;padding:1rem 1.1rem;cursor:pointer;transition:.15s;text-align:left}
        .lcr-vis-card:hover{border-color:#7a3a10}
        .lcr-vis-card.active{border-color:#ff4500;background:#3a1800;box-shadow:0 0 0 1px rgba(255,69,0,.15) inset}
        .lcr-vis-icon{font-size:1.3rem}
        .lcr-vis-lbl{font-family:'Orbitron',sans-serif;font-size:.68rem;letter-spacing:.1em;color:#ffd4a8;font-weight:800}
        .lcr-vis-card.active .lcr-vis-lbl{color:#ff8c00}
        .lcr-vis-sub{font-size:.75rem;color:#7a3a10;font-weight:500}

        /* Chips */
        .lcr-chips{display:flex;gap:.5rem;flex-wrap:nowrap}
        .lcr-chip{background:#2e1200;border:1.5px solid #4a2000;border-radius:7px;padding:.5rem 1rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.08em;color:#7a3a10;cursor:pointer;transition:.15s;white-space:nowrap}
        .lcr-chip:hover{border-color:#7a3a10;color:#ffd4a8}
        .lcr-chip.active{border-color:#ff4500;color:#ff8c00;background:#3a1800}

        /* Buttons */
        .lcr-step-btns{display:flex;gap:.6rem}
        .lcr-btn-primary{display:flex;align-items:center;justify-content:center;gap:.4rem;width:100%;background:linear-gradient(135deg,#cc2200,#ff4500,#ff8c00);color:#fff0e8;border:none;border-radius:10px;padding:.9rem;font-family:'Orbitron',sans-serif;font-weight:800;font-size:.78rem;letter-spacing:.14em;cursor:pointer;transition:.2s}
        .lcr-btn-primary:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 4px 20px rgba(255,69,0,.3)}
        .lcr-btn-primary:disabled{opacity:.35;cursor:default}
        .lcr-btn-ghost{background:transparent;border:1.5px solid #4a2000;color:#7a3a10;border-radius:10px;padding:.85rem 1.2rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.85rem;letter-spacing:.1em;cursor:pointer;transition:.15s;white-space:nowrap}
        .lcr-btn-ghost:hover{border-color:#7a3a10;color:#ffd4a8}

        /* Summary */
        .lcr-summary{background:#2e1200;border:1.5px solid #4a2000;border-radius:12px;padding:1.2rem 1.3rem 1rem;position:relative;overflow:hidden}
        .lcr-summary::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#ff4500,#ff8c00,#ff4500)}
        .lcr-summary-name{font-family:'Orbitron',sans-serif;font-size:1.2rem;font-weight:900;color:#ff8c00;margin-bottom:1rem;text-shadow:0 0 12px rgba(255,140,0,.25)}
        .lcr-summary-rows{display:flex;flex-direction:column}
        .lcr-summary-row{display:flex;justify-content:space-between;align-items:center;padding:.45rem 0;border-bottom:1px solid #2e1200}
        .lcr-summary-row:last-child{border-bottom:none}
        .lcr-summary-key{font-size:.82rem;color:#7a3a10;font-weight:600}
        .lcr-summary-val{font-size:.88rem;color:#ffd4a8;font-weight:700;text-align:right}
        .lcr-edit-link{background:none;border:none;color:#4a2000;font-family:'Rajdhani',sans-serif;font-size:.75rem;cursor:pointer;text-decoration:underline;margin-top:.7rem;padding:0;transition:.15s}
        .lcr-edit-link:hover{color:#7a3a10}

        .lcr-btn-launch{display:flex;align-items:center;justify-content:center;gap:.5rem;width:100%;background:linear-gradient(135deg,#cc2200,#ff4500,#ff8c00);color:#fff0e8;border:none;border-radius:10px;padding:1rem;font-family:'Orbitron',sans-serif;font-weight:900;font-size:.88rem;letter-spacing:.16em;cursor:pointer;transition:.2s}
        .lcr-btn-launch:hover:not(:disabled){filter:brightness(1.1);box-shadow:0 6px 28px rgba(255,69,0,.4);transform:scale(1.01)}
        .lcr-btn-launch:disabled{opacity:.5;cursor:default;transform:none}
        .lcr-btn-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:lcr-spin .7s linear infinite;flex-shrink:0}
        @keyframes lcr-spin{to{transform:rotate(360deg)}}

        .lcr-error{color:#ff6060;font-size:.82rem;font-weight:600;padding:.6rem .8rem;background:rgba(180,0,0,.2);border:1px solid rgba(255,60,60,.3);border-radius:7px}

        @media(max-width:640px){
          .lcr-nav{padding:.8rem 1rem}
          .lcr-hero{padding:1.6rem 1rem 1.2rem}
          .lcr-body{padding:1.4rem 1rem 3rem}
          .lcr-panel{max-width:100%}
          .lcr-vis-row{grid-template-columns:1fr 1fr}
        }
      `}</style>
    </>
  );
}