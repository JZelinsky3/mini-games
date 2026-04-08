'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ────────────────────────────────────────────────────────── */
type PlayResult = 'c' | 'w';
interface Play {
  down: string; matchup: string; quarter: string;
  desc: string; opts: string[];
  correct: number; flag: boolean;
  call: string; icon: string; exp: string;
}

/* ─── Play Database ─────────────────────────────────────────────────── */
const ALL_PLAYS: Play[] = [
  {
    down:'3rd & 8', matchup:'KC vs CIN', quarter:'Q2',
    desc:'The Chiefs quarterback drops back under heavy pressure. As he releases the ball, a Bengals linebacker drives into his throwing arm at the top of the motion. The ball wobbles forward 4 yards to an area with no receivers nearby.',
    opts:['Intentional Grounding','Roughing the Passer','Illegal Forward Pass','No Penalty — Legal Play'],
    correct:1, flag:true, call:'ROUGHING THE PASSER', icon:'🚩',
    exp:'When a defender strikes a quarterback\'s throwing arm during the throwing motion, it is Roughing the Passer — regardless of where the ball lands. The hit on the arm nullifies any grounding consideration. (Rule 12-2-9)',
  },
  {
    down:'1st & 10', matchup:'DAL vs PHI', quarter:'Q3',
    desc:'The Cowboys wide receiver runs a slant route. The Eagles cornerback makes contact with him at 3 yards past the line of scrimmage, bumping and re-routing him to the outside, then releases completely before the ball is thrown. The pass falls incomplete.',
    opts:['Pass Interference','Illegal Contact','Holding','No Penalty — Legal Play'],
    correct:3, flag:false, call:'NO FLAG — LEGAL PLAY', icon:'✅',
    exp:'Defensive backs may make contact with receivers within 5 yards of the line of scrimmage. A clean bump-and-release at 3 yards, fully releasing before the ball is thrown, is entirely legal. (Rule 8-4-2)',
  },
  {
    down:'2nd & 6', matchup:'GB vs CHI', quarter:'Q4',
    desc:'The Packers right tackle, in pass protection, wraps both arms around the Bears defensive end\'s neck and shoulders from behind, dragging him down to prevent a sack as the quarterback scrambles right.',
    opts:['Holding','Illegal Use of Hands','Face Mask','No Penalty — Legal Play'],
    correct:0, flag:true, call:'HOLDING — OFFENSE', icon:'🚩',
    exp:'Grabbing a defender around the neck or shoulders from behind and restricting their movement is textbook offensive holding. The tackle\'s hands went clearly outside the body frame. 10-yard penalty, repeat down. (Rule 12-1-3)',
  },
  {
    down:'4th & 1', matchup:'BUF vs NE', quarter:'Q1',
    desc:'Before the snap, the Patriots wide receiver — who is fully set — takes a distinct step toward the line of scrimmage and freezes. The Bills defense doesn\'t react. The center snaps the ball and the play unfolds normally.',
    opts:['False Start','Illegal Motion','Delay of Game','No Penalty — Legal Play'],
    correct:0, flag:true, call:'FALSE START', icon:'🚩',
    exp:'Any offensive player who is set and makes a forward movement before the snap has committed a false start. It is irrelevant whether the defense reacted — the motion itself is the infraction. Dead-ball foul: 5-yard penalty. (Rule 7-4-3)',
  },
  {
    down:'3rd & 15', matchup:'SF vs LAR', quarter:'Q2',
    desc:'Under intense pressure, the 49ers quarterback scrambles left and crosses the line of scrimmage by 2 yards. He then sets his feet and throws forward to a wide receiver positioned 1 yard behind the line of scrimmage. The receiver catches it.',
    opts:['Illegal Forward Pass','Intentional Grounding','Ineligible Receiver Downfield','No Penalty — Legal Play'],
    correct:0, flag:true, call:'ILLEGAL FORWARD PASS', icon:'🚩',
    exp:'A forward pass is only legal when the passer\'s entire body is behind the line of scrimmage at the moment of release. The QB was 2 yards beyond the line when he threw — even though the receiver was behind it. 5-yard penalty, loss of down. (Rule 8-1-1)',
  },
  {
    down:'1st & 10', matchup:'BAL vs PIT', quarter:'Q3',
    desc:'At the snap, the Ravens center and right guard simultaneously engage the Steelers nose tackle — the guard fires low at his thighs while the center engages his shoulders at the same time.',
    opts:['Chop Block','Illegal Use of Hands','Holding','No Penalty — Legal Play'],
    correct:0, flag:true, call:'CHOP BLOCK', icon:'🚩',
    exp:'A chop block occurs when two offensive players block the same defender simultaneously — one above the waist and one below. It is a dangerous and illegal technique regardless of intent. 15-yard penalty. (Rule 12-1-6)',
  },
  {
    down:'2nd & 8', matchup:'MIA vs NYJ', quarter:'Q2',
    desc:'The Dolphins receiver streaks down the left sideline. The Jets safety arrives as the underthrown ball comes in. Both players reach up simultaneously, making contact with each other at the exact moment the ball arrives. Both were clearly playing the ball.',
    opts:['Pass Interference','Defensive Holding','Unnecessary Roughness','No Penalty — Legal Play'],
    correct:3, flag:false, call:'NO FLAG — LEGAL PLAY', icon:'✅',
    exp:'When two players make simultaneous contact while both legitimately playing the ball, it is not pass interference. Both have equal right to the football in the air. Simultaneous contact while both play the ball is legal. (Rule 8-5-1 Note)',
  },
  {
    down:'3rd & 7', matchup:'CLE vs CIN', quarter:'Q4',
    desc:'The Browns quarterback faces intense pressure. With no receivers open and two defenders closing in, he throws the football directly into the ground at his own feet — 3 yards behind the line of scrimmage — with no eligible receiver anywhere near the area.',
    opts:['Intentional Grounding','Illegal Forward Pass','Roughing the Passer','No Penalty — Legal Play'],
    correct:0, flag:true, call:'INTENTIONAL GROUNDING', icon:'🚩',
    exp:'Intentional grounding is called when the QB deliberately throws to an area with no eligible receiver to avoid a sack. Spiking to stop the clock only applies immediately after a snap from center. 10-yard penalty and loss of down. (Rule 8-2-1)',
  },
  {
    down:'1st & 10', matchup:'KC vs LV', quarter:'Q1',
    desc:'The Chiefs right guard fires off the ball on a run play. He engages the Raiders nose tackle using open palms, keeping both hands inside the defender\'s shoulder pads. His hands remain inside the body frame throughout the block until the runner clears.',
    opts:['Holding','Illegal Use of Hands','Clipping','No Penalty — Legal Play'],
    correct:3, flag:false, call:'NO FLAG — LEGAL PLAY', icon:'✅',
    exp:'Offensive linemen may use open hands to block, provided their hands remain inside the body frame of the defender. Blocking inside the shoulders with open palms is proper, legal technique. No penalty. (Rule 12-1-2)',
  },
  {
    down:'2nd & 4', matchup:'PHI vs NYG', quarter:'Q3',
    desc:'The Eagles punt returner signals a fair catch with a clear wave of his arm. A Giants gunner arrives and makes contact with the returner\'s shoulder pads a full second before the ball arrives. The returner is hit early but recovers and catches the ball.',
    opts:['Unnecessary Roughness','Fair Catch Interference','Running Into the Kicker','No Penalty — Legal Play'],
    correct:1, flag:true, call:'FAIR CATCH INTERFERENCE', icon:'🚩',
    exp:'Once a fair catch signal is given, no member of the kicking team may hinder the receiver\'s opportunity to catch the ball. Contact before the ball arrives — regardless of whether a catch is made — is illegal. 15-yard penalty. (Rule 10-2-6)',
  },
];

/* ─── Helpers ──────────────────────────────────────────────────────── */
function shuffleIndices(n: number): number[] {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ─── Component ────────────────────────────────────────────────────── */
export default function PenaltyFlag() {
  const [order, setOrder]               = useState<number[]>([]);
  const [current, setCurrent]           = useState(0);
  const [score, setScore]               = useState(0);
  const [wrong, setWrong]               = useState(0);
  const [streak, setStreak]             = useState(0);
  const [results, setResults]           = useState<PlayResult[]>([]);
  const [answered, setAnswered]         = useState(false);
  const [selected, setSelected]         = useState<number | null>(null);
  const [showFinal, setShowFinal]       = useState(false);
  const [showHowTo, setShowHowTo]       = useState(false);
  const [flagAnim, setFlagAnim]         = useState(false);
  const [noFlagAnim, setNoFlagAnim]     = useState(false);
  const [cardKey, setCardKey]           = useState(0);
  const [showAuth, setShowAuth]         = useState(false);
  const [userInit, setUserInit]         = useState<string | null>(null);

  /* Auth */
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const n = user.user_metadata?.full_name || user.email || 'U';
        setUserInit(n[0].toUpperCase());
      }
    });
  }, []);

  /* Init */
  const initGame = useCallback(() => {
    setOrder(shuffleIndices(ALL_PLAYS.length));
    setCurrent(0);
    setScore(0);
    setWrong(0);
    setStreak(0);
    setResults([]);
    setAnswered(false);
    setSelected(null);
    setShowFinal(false);
    setCardKey(k => k + 1);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  const play = useMemo((): Play | null => {
    if (!order.length) return null;
    return ALL_PLAYS[order[current]] ?? null;
  }, [order, current]);

  const pct = useMemo(() => {
    const total = score + wrong;
    return total === 0 ? null : Math.round((score / total) * 100);
  }, [score, wrong]);

  const choose = useCallback((idx: number) => {
    if (answered || !play) return;
    setAnswered(true);
    setSelected(idx);
    const correct = idx === play.correct;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setWrong(w => w + 1);
      setStreak(0);
    }
    setResults(r => [...r, correct ? 'c' : 'w']);
    // Animate
    if (play.flag) { setFlagAnim(true); setTimeout(() => setFlagAnim(false), 900); }
    else           { setNoFlagAnim(true); setTimeout(() => setNoFlagAnim(false), 900); }
  }, [answered, play]);

  const nextPlay = useCallback(() => {
    const next = current + 1;
    if (next >= ALL_PLAYS.length) {
      setShowFinal(true);
      if (!userInit) setTimeout(() => setShowAuth(true), 1500);
      return;
    }
    setCurrent(next);
    setAnswered(false);
    setSelected(null);
    setCardKey(k => k + 1);
  }, [current, userInit]);

  if (!play) return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0f2015' }}>
        <span className="g-pulse" style={{ color:'#f5c518' }}>LOADING PLAY…</span>
      </div>
    </>
  );

  const TOTAL   = ALL_PLAYS.length;
  const letters = ['A','B','C','D'];
  const finalPct = Math.round((score / TOTAL) * 100);
  const finalBadge = finalPct === 100 ? '🏆' : finalPct >= 80 ? '🥇' : finalPct >= 60 ? '🥈' : finalPct >= 40 ? '🥉' : '📚';
  const finalMsg   = finalPct === 100 ? 'Perfect score. The NFL wants your number.' :
                     finalPct >= 80   ? 'Excellent officiating. You know your flags.' :
                     finalPct >= 60   ? 'Decent flag work — study those edge cases.' :
                     finalPct >= 40   ? 'Middle of the pack. More rulebook reading ahead.' :
                                        'Rough game. Hit the official NFL rulebook!';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* Flag animation overlay */}
      {flagAnim   && <div className="pf-flag-fly" aria-hidden="true">🚩</div>}
      {noFlagAnim && <div className="pf-noflag-pop" aria-hidden="true">✅ NO FLAG</div>}

      {/* ── Field background ── */}
      <div className="pf-field-bg" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="pf-yard-line" style={{ top: `${80 + i * 90}px` }} />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="pf-field-strip" style={{ left: `${i * 25}%`, width: '12.5%' }} />
        ))}
      </div>

      {/* ── Ref stripes ── */}
      <div className="pf-ref-stripe" />

      {/* ── Nav ── */}
      <nav className="cp-nav" style={{ background:'rgba(8,16,10,.95)', borderBottom:'3px solid #f5c518' }}>
        <div className="cp-nav-l">
          <Link href="/" className="g-back" style={{ color:'#4a6a50' }}>← Hub</Link>
        </div>
        <div className="cp-nav-c" style={{ color:'#f5c518' }}>
          <span className="pf-pip" />
          PENALTY FLAG
        </div>
        <div className="cp-nav-r">
          {userInit
            ? <Link href="/profile" className="cp-badge" style={{ borderColor:'#f5c518', color:'#f5c518', background:'rgba(245,197,24,.1)' }}>{userInit}</Link>
            : <Link href="/login"   className="cp-signin" style={{ color:'#4a6a50', borderColor:'rgba(74,106,80,.4)' }}>SIGN IN</Link>}
        </div>
      </nav>

      <div className="pf-ref-stripe" />

      {/* ── Scoreboard ── */}
      <div className="pf-scoreboard">
        <div className="pf-sb-group">
          <div className="pf-sb-item">
            <div className="pf-sv" style={{ color:'#4caf50' }}>{score}</div>
            <div className="pf-sl">Correct</div>
          </div>
          <div className="pf-sb-div" />
          <div className="pf-sb-item">
            <div className="pf-sv" style={{ color:'#e53935' }}>{wrong}</div>
            <div className="pf-sl">Wrong</div>
          </div>
        </div>
        <div className="pf-progress-wrap">
          <div className="pf-progress-bg">
            <div className="pf-progress-fill" style={{ width: `${(current / TOTAL) * 100}%` }} />
          </div>
          <div className="pf-progress-label">Play {current + 1} of {TOTAL}</div>
        </div>
        <div className="pf-sb-group">
          <div className="pf-sb-item">
            <div className="pf-streak">
              {[0,1,2,3,4].map(i => <div key={i} className={`pf-sdot${i < Math.min(streak, 5) ? ' on' : ''}`} />)}
            </div>
            <div className="pf-sl">Streak</div>
          </div>
          <div className="pf-sb-div" />
          <div className="pf-sb-item">
            <div className="pf-sv">{pct !== null ? `${pct}%` : '—'}</div>
            <div className="pf-sl">Accuracy</div>
          </div>
        </div>
      </div>

      {/* ── Play area ── */}
      <div className="pf-play-area">

        {/* Situation banner */}
        <div className="pf-sit-banner">
          <div className="pf-sit-down">{play.down}</div>
          <div className="pf-sit-matchup">{play.matchup}</div>
          <div className="pf-sit-quarter">{play.quarter}</div>
        </div>

        {/* Play card */}
        <div className="pf-play-card" key={cardKey}>
          <div className="pf-play-num">{String(current + 1).padStart(2,'0')}</div>
          <div className="pf-play-label">📋 Read the play — then make the call</div>
          <p className="pf-play-desc">{play.desc}</p>

          {/* Choices */}
          <div className="pf-choices">
            {play.opts.map((opt, i) => {
              let cls = 'pf-choice';
              if (answered) {
                if (i === play.correct) cls += ' correct';
                else if (i === selected) cls += ' wrong';
                else cls += ' locked';
              }
              return (
                <button
                  key={i}
                  className={cls}
                  onClick={() => choose(i)}
                  disabled={answered}
                >
                  <span className="pf-cl">{letters[i]}.</span>{opt}
                </button>
              );
            })}
          </div>

          {/* Verdict */}
          {answered && (
            <div className="pf-verdict" style={{ borderLeftColor: selected === play.correct ? '#4caf50' : '#e53935' }}>
              <div className="pf-verdict-top">
                <div className="pf-verdict-icon">{play.icon}</div>
                <div className={`pf-verdict-call${play.flag ? ' flag' : ' noflag'}`}>{play.call}</div>
              </div>
              <p className="pf-verdict-exp">{play.exp}</p>
              <button className="pf-next-btn" onClick={nextPlay}>
                {current < TOTAL - 1 ? 'Next Play →' : 'Final Whistle 🏁'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Final screen ── */}
      {showFinal && (
        <div className="g-overlay" onClick={() => setShowFinal(false)}>
          <div className="pf-final" onClick={e => e.stopPropagation()}>
            <div className="pf-final-badge">{finalBadge}</div>
            <div className="pf-final-title">FINAL WHISTLE</div>
            <div className="pf-final-grade">{score}/{TOTAL}</div>
            <div className="pf-final-sub">{finalPct}% accuracy as a referee</div>
            <div className="pf-results-grid">
              {results.map((r, i) => (
                <div key={i} className={`pf-rdot ${r}`} title={`Play ${i + 1}`}>
                  {r === 'c' ? '✓' : '✗'}
                </div>
              ))}
            </div>
            <p className="pf-final-msg">{finalMsg}</p>
            <div className="pf-final-btns">
              <button className="pf-final-btn" onClick={initGame}>🏈 Play Again</button>
              <button className="pf-final-btn sec" onClick={() => setShowFinal(false)}>Review</button>
            </div>
            {!userInit && (
              <button className="g-modal-skip" style={{ marginTop:'.75rem', color:'#4a6a50' }}
                onClick={() => { setShowFinal(false); setShowAuth(true); }}>
                Save your scores →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── How to play ── */}
      {showHowTo && (
        <div className="g-overlay" onClick={() => setShowHowTo(false)}>
          <div className="pf-howto" onClick={e => e.stopPropagation()}>
            <div className="pf-howto-title">🚩 How To Play</div>
            {[
              'You\'ll be given a short play description from an NFL game — read it carefully.',
              'Choose the correct call: what penalty occurred, or confirm the play was legal.',
              'After each play, the official ruling is revealed with a real NFL rule citation.',
              '10 plays per game. The order is shuffled every game so no two rounds are the same.',
            ].map((rule, i) => (
              <div key={i} className="pf-hrule">
                <div className="pf-rnum">{i + 1}</div>
                <div>{rule}</div>
              </div>
            ))}
            <div className="pf-hnote">Based on official NFL rulebook. Covers holding, pass interference, roughing, grounding, false starts, and more.</div>
            <button className="pf-final-btn" style={{ marginTop:'1.2rem' }} onClick={() => setShowHowTo(false)}>🏈 I'm Ready</button>
          </div>
        </div>
      )}

      {/* ── Sign-in prompt ── */}
      {showAuth && (
        <div className="g-overlay" onClick={() => setShowAuth(false)}>
          <div className="g-modal" onClick={e => e.stopPropagation()}
            style={{ background:'#081208', border:'1px solid rgba(245,197,24,.2)' }}>
            <div className="g-modal-icon">🏆</div>
            <h3 className="g-modal-title" style={{ color:'#f0ece0' }}>Save Your Score</h3>
            <p className="g-modal-body">Create a free account to track your accuracy and compete with other fans.</p>
            <div className="g-modal-btns">
              <Link href="/signup" className="g-modal-cta" style={{ background:'#f5c518', color:'#080e08' }}>Create Free Account</Link>
              <Link href="/login" className="g-modal-sec" style={{ borderColor:'rgba(245,197,24,.2)', color:'#8a9e8e' }}>Sign In</Link>
            </div>
            <button onClick={() => setShowAuth(false)} className="g-modal-skip" style={{ color:'#4a6a50' }}>Maybe Later</button>
          </div>
        </div>
      )}

      {/* Rules button (floating) */}
      <button className="pf-rules-float" onClick={() => setShowHowTo(true)}>📋 Rules</button>
    </>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Teko:wght@400;500;600;700&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* Shared nav */
.cp-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;
  position:sticky;top:0;z-index:20;font-family:'Teko',sans-serif}
.cp-nav-l{justify-self:start}
.cp-nav-c{display:flex;align-items:center;gap:.5rem;font-family:'Anton',sans-serif;
  font-size:1.05rem;letter-spacing:.14em;justify-self:center}
.cp-nav-r{justify-self:end}
.pf-pip{width:8px;height:8px;border-radius:50%;background:#f5c518;box-shadow:0 0 8px rgba(245,197,24,.8);flex-shrink:0}
.g-back{text-decoration:none;font-size:.82rem;transition:.15s;font-family:'Teko',sans-serif;letter-spacing:.06em}
.g-back:hover{color:#f0ece0 !important}
.cp-badge{width:28px;height:28px;border-radius:50%;font-family:'Teko',sans-serif;font-weight:600;font-size:.85rem;
  display:flex;align-items:center;justify-content:center;text-decoration:none;transition:.15s}
.cp-signin{font-family:'Teko',sans-serif;font-size:.7rem;letter-spacing:.08em;
  text-decoration:none;transition:.15s;padding:.25rem .6rem;border-radius:4px}
.cp-signin:hover{color:#f5c518 !important;border-color:#f5c518 !important}

/* Shared overlay / modal */
.g-overlay{position:fixed;inset:0;background:rgba(0,0,0,.85);display:flex;align-items:center;
  justify-content:center;z-index:50;backdrop-filter:blur(6px)}
.g-modal{border-radius:20px;padding:2rem 1.75rem;max-width:320px;width:90%;text-align:center;animation:fadeUp .3s ease both}
.g-modal-icon{font-size:2.5rem;margin-bottom:.75rem}
.g-modal-title{font-family:'Anton',sans-serif;font-size:1.6rem;letter-spacing:.06em;margin-bottom:.5rem}
.g-modal-body{font-size:.82rem;line-height:1.6;margin-bottom:1.25rem;font-family:'Source Serif 4',serif}
.g-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.g-modal-cta{display:block;font-family:'Teko',sans-serif;font-weight:600;font-size:1rem;letter-spacing:.06em;
  padding:.8rem;border-radius:12px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-cta:hover{opacity:.88}
.g-modal-sec{display:block;background:transparent;font-family:'Teko',sans-serif;font-weight:600;font-size:.9rem;
  letter-spacing:.06em;padding:.7rem;border-radius:12px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-sec:hover{border-color:#f5c518 !important;color:#f5c518 !important}
.g-modal-skip{background:none;border:none;font-size:.75rem;cursor:pointer;transition:.15s;font-family:'Teko',sans-serif}
.g-modal-skip:hover{opacity:.7}
.g-pulse{font-family:'Anton',sans-serif;font-size:1.2rem;letter-spacing:.2em;animation:cpulse 1.2s ease infinite}
@keyframes cpulse{0%,100%{opacity:1}50%{opacity:.3}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* ── Field background ── */
.pf-field-bg{position:fixed;inset:0;pointer-events:none;z-index:0;background:#162e1c;overflow:hidden}
.pf-yard-line{position:absolute;left:0;right:0;height:2px;background:rgba(255,255,255,.05)}
.pf-field-strip{position:absolute;top:0;bottom:0;background:rgba(255,255,255,.015)}

/* Ref stripes */
.pf-ref-stripe{height:11px;position:relative;z-index:12;
  background:repeating-linear-gradient(90deg,#0e0e0e 0,#0e0e0e 22px,#f0ece0 22px,#f0ece0 44px)}

/* ── Scoreboard ── */
.pf-scoreboard{background:rgba(5,10,7,.92);border:2px solid #f5c518;border-radius:6px;
  margin:.75rem auto;max-width:760px;padding:0 1.2rem;display:flex;align-items:center;
  justify-content:space-between;backdrop-filter:blur(8px);position:relative;z-index:10;
  font-family:'Teko',sans-serif}
.pf-sb-group{display:flex;align-items:center;gap:1rem;padding:.7rem 0}
.pf-sb-item{text-align:center}
.pf-sv{font-family:'Anton',sans-serif;font-size:2rem;line-height:1}
.pf-sl{font-size:.58rem;color:#5a7a62;letter-spacing:.18em;text-transform:uppercase;margin-top:1px}
.pf-sb-div{width:1px;height:36px;background:rgba(255,255,255,.08)}
.pf-streak{display:flex;gap:4px;justify-content:center;margin-bottom:3px}
.pf-sdot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.15);transition:all .3s}
.pf-sdot.on{background:#f5c518;box-shadow:0 0 6px rgba(245,197,24,.8)}
.pf-progress-wrap{flex:1;padding:0 1rem}
.pf-progress-bg{background:rgba(255,255,255,.1);border-radius:10px;height:7px;overflow:hidden}
.pf-progress-fill{height:100%;background:linear-gradient(90deg,#f5c518,#ffd700);border-radius:10px;transition:width .5s ease}
.pf-progress-label{font-size:.6rem;color:#5a7a62;letter-spacing:.14em;margin-top:3px;text-align:center}

/* ── Play area ── */
.pf-play-area{max-width:760px;margin:0 auto;padding:.75rem 1rem 5rem;position:relative;z-index:10;
  font-family:'Teko',sans-serif}

/* Situation banner */
.pf-sit-banner{background:rgba(0,0,0,.6);border-left:3px solid #f5c518;padding:.45rem 1rem;
  margin-bottom:.7rem;display:flex;justify-content:space-between;align-items:center;
  border-radius:0 3px 3px 0;backdrop-filter:blur(4px)}
.pf-sit-down{font-family:'Anton',sans-serif;font-size:1.05rem;color:#f5c518;letter-spacing:.05em}
.pf-sit-matchup{font-size:.82rem;color:#5a7a62;letter-spacing:.08em}
.pf-sit-quarter{font-size:.82rem;color:#c8c0a8}

/* Play card */
.pf-play-card{background:rgba(6,12,8,.9);border:1px solid rgba(255,255,255,.1);border-radius:8px;
  padding:1.75rem;position:relative;overflow:hidden;backdrop-filter:blur(10px);
  animation:card-in .5s cubic-bezier(.34,1.2,.64,1) both}
@keyframes card-in{from{opacity:0;transform:translateY(18px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.pf-play-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;
  background:linear-gradient(90deg,transparent,#f5c518,transparent)}
.pf-play-num{position:absolute;top:1.4rem;right:1.5rem;font-family:'Anton',sans-serif;
  font-size:3.5rem;color:rgba(255,255,255,.04);line-height:1;pointer-events:none}
.pf-play-label{font-size:.6rem;letter-spacing:.22em;text-transform:uppercase;color:#5a7a62;margin-bottom:.8rem}
.pf-play-desc{font-family:'Source Serif 4',serif;font-size:1.05rem;line-height:1.75;
  color:#ddd8c4;margin-bottom:1.4rem}

/* Choices */
.pf-choices{display:grid;grid-template-columns:1fr 1fr;gap:.65rem}
@media(max-width:500px){.pf-choices{grid-template-columns:1fr}}
.pf-choice{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.1);border-radius:5px;
  padding:.9rem 1.1rem;text-align:left;cursor:pointer;font-family:'Teko',sans-serif;font-size:1.1rem;
  letter-spacing:.04em;color:#ddd8c4;transition:all .2s;position:relative}
.pf-choice:hover:not(:disabled):not(.correct):not(.wrong):not(.locked){
  background:rgba(245,197,24,.1);border-color:rgba(245,197,24,.45);color:#ffd700;transform:translateY(-1px)}
.pf-choice.correct{background:rgba(46,125,50,.25);border-color:#4caf50;color:#81c784;animation:correct-pop .4s ease}
.pf-choice.wrong{background:rgba(211,47,47,.2);border-color:#e53935;color:#ef9a9a;animation:wrong-shake .35s ease}
.pf-choice.locked{cursor:default;opacity:.5}
.pf-choice:disabled{cursor:default}
@keyframes correct-pop{0%{transform:scale(1)}35%{transform:scale(1.03)}100%{transform:scale(1)}}
@keyframes wrong-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.pf-cl{font-family:'Anton',sans-serif;font-size:.85rem;color:#5a7a62;margin-right:.4rem}
.pf-choice.correct .pf-cl{color:#4caf50}
.pf-choice.wrong .pf-cl{color:#e53935}

/* Verdict */
.pf-verdict{background:rgba(0,0,0,.88);border-left:4px solid #f5c518;border-radius:5px;
  margin-top:1rem;padding:1.1rem 1.4rem;animation:fadeUp .4s ease}
.pf-verdict-top{display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem}
.pf-verdict-icon{font-size:1.7rem;animation:icon-bounce .5s cubic-bezier(.36,1.6,.64,1)}
@keyframes icon-bounce{from{transform:scale(0) rotate(-20deg)}to{transform:scale(1) rotate(0)}}
.pf-verdict-call{font-family:'Anton',sans-serif;font-size:1.3rem;letter-spacing:.06em}
.pf-verdict-call.flag{color:#f5c518}
.pf-verdict-call.noflag{color:#81c784}
.pf-verdict-exp{font-family:'Source Serif 4',serif;font-size:.88rem;color:#8a9e8e;line-height:1.6}
.pf-next-btn{background:#f5c518;color:#080e08;border:none;border-radius:4px;
  padding:.65rem 1.8rem;font-family:'Anton',sans-serif;font-size:1rem;letter-spacing:.08em;
  cursor:pointer;margin-top:.9rem;transition:all .2s;display:inline-block}
.pf-next-btn:hover{background:#ffd700;transform:scale(1.03)}

/* Flag animation */
.pf-flag-fly{position:fixed;top:50%;right:-100px;transform:translateY(-50%);font-size:4rem;
  z-index:200;pointer-events:none;animation:flag-throw .85s ease forwards}
@keyframes flag-throw{
  0%{right:-80px;opacity:1;transform:translateY(-50%) rotate(0deg)}
  60%{right:calc(50% - 40px);opacity:1;transform:translateY(-50%) rotate(-15deg)}
  85%{right:calc(50% - 40px);opacity:1;transform:translateY(-50%) rotate(-22deg) scale(1.2)}
  100%{right:calc(50% - 40px);opacity:0;transform:translateY(-50%) rotate(-25deg) scale(.4)}}
.pf-noflag-pop{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2.5rem;
  z-index:200;pointer-events:none;font-family:'Anton',sans-serif;letter-spacing:.06em;
  color:#81c784;text-shadow:0 0 30px rgba(129,199,132,.6);animation:noflag-show .85s ease forwards}
@keyframes noflag-show{
  0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}
  35%{opacity:1;transform:translate(-50%,-50%) scale(1.1)}
  70%{opacity:1;transform:translate(-50%,-50%) scale(1)}
  100%{opacity:0;transform:translate(-50%,-50%) scale(.8)}}

/* Final screen */
.pf-final{background:rgba(6,12,8,.97);border:2px solid rgba(245,197,24,.3);border-radius:12px;
  padding:2rem;max-width:460px;width:90%;text-align:center;animation:fadeUp .4s ease both}
.pf-final-badge{font-size:2.8rem;margin-bottom:.8rem;animation:spin-in .6s cubic-bezier(.36,1.5,.64,1)}
@keyframes spin-in{from{transform:rotate(-180deg) scale(0)}to{transform:rotate(0) scale(1)}}
.pf-final-title{font-family:'Anton',sans-serif;font-size:clamp(2rem,7vw,3.5rem);color:#f5c518;
  letter-spacing:.08em;line-height:1}
.pf-final-grade{font-family:'Anton',sans-serif;font-size:5rem;line-height:1;
  background:linear-gradient(135deg,#f5c518,#ffd700);-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;background-clip:text;margin:.3rem 0}
.pf-final-sub{font-size:.72rem;color:#5a7a62;letter-spacing:.18em;text-transform:uppercase;margin-bottom:.8rem}
.pf-results-grid{display:flex;flex-wrap:wrap;gap:.4rem;justify-content:center;margin:.8rem 0}
.pf-rdot{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;
  font-size:1rem;font-family:'Anton',sans-serif;border:2px solid}
.pf-rdot.c{background:rgba(46,125,50,.3);border-color:#4caf50;color:#81c784}
.pf-rdot.w{background:rgba(211,47,47,.2);border-color:#e53935;color:#ef9a9a}
.pf-final-msg{font-family:'Source Serif 4',serif;font-size:.92rem;color:#c8c0a8;
  line-height:1.6;margin:.8rem 0 1.2rem}
.pf-final-btns{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap}
.pf-final-btn{background:#f5c518;color:#080e08;border:none;border-radius:4px;
  padding:.8rem 2rem;font-family:'Anton',sans-serif;font-size:1.1rem;letter-spacing:.08em;
  cursor:pointer;transition:all .2s}
.pf-final-btn:hover{background:#ffd700;transform:scale(1.03)}
.pf-final-btn.sec{background:transparent;color:#5a7a62;border:1px solid rgba(255,255,255,.15)}
.pf-final-btn.sec:hover{color:#c8c0a8;border-color:rgba(255,255,255,.3);transform:none}

/* How to play */
.pf-howto{background:rgba(6,12,8,.97);border:2px solid rgba(245,197,24,.3);border-radius:12px;
  padding:2rem;max-width:520px;width:90%;animation:fadeUp .3s ease both}
.pf-howto-title{font-family:'Anton',sans-serif;font-size:1.7rem;color:#f5c518;letter-spacing:.08em;margin-bottom:1.1rem}
.pf-hrule{display:flex;gap:.75rem;margin-bottom:.85rem;font-family:'Source Serif 4',serif;
  font-size:.88rem;color:#ddd8c4;line-height:1.5;align-items:flex-start}
.pf-rnum{font-family:'Anton',sans-serif;font-size:1.2rem;color:#f5c518;min-width:22px;line-height:1.15}
.pf-hnote{font-size:.74rem;color:#5a7a62;border-top:1px solid rgba(255,255,255,.07);
  padding-top:.8rem;margin-top:.5rem;font-family:'Source Serif 4',serif;font-style:italic;line-height:1.5}

/* Floating rules button */
.pf-rules-float{position:fixed;bottom:1.5rem;right:1.5rem;background:rgba(6,12,8,.92);
  border:1px solid rgba(245,197,24,.35);color:#f5c518;font-family:'Teko',sans-serif;
  font-size:.8rem;letter-spacing:.12em;padding:.45rem 1rem;border-radius:4px;cursor:pointer;
  z-index:20;transition:all .2s;backdrop-filter:blur(4px)}
.pf-rules-float:hover{background:rgba(245,197,24,.15);border-color:#f5c518}

@media(max-width:600px){
  .pf-scoreboard{flex-wrap:wrap;padding:.5rem .75rem;gap:.4rem}
  .pf-progress-wrap{order:3;width:100%;padding:.3rem 0}
  .pf-sb-group{gap:.7rem}
}
`;