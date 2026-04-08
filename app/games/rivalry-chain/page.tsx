'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

/* ─── Types ────────────────────────────────────────────────────────── */
type Entity = { d: string; t: string; r: string[] };
interface ChainEntry { key: string; entity: Entity }
interface AcItem { key: string; entity: Entity; isRival: boolean }

/* ─── Data ─────────────────────────────────────────────────────────── */
const ENTITIES: Record<string, Entity> = {
  // QBs
  mahomes:    { d: 'Patrick Mahomes',   t: 'QB',    r: ['allen','burrow','lamar','chiefs','herbert'] },
  allen:      { d: 'Josh Allen',        t: 'QB',    r: ['mahomes','lamar','tua','bills'] },
  burrow:     { d: 'Joe Burrow',        t: 'QB',    r: ['mahomes','lamar','bengals','steelers'] },
  lamar:      { d: 'Lamar Jackson',     t: 'QB',    r: ['mahomes','allen','burrow','ravens'] },
  hurts:      { d: 'Jalen Hurts',       t: 'QB',    r: ['dak','eagles','giants','commanders'] },
  dak:        { d: 'Dak Prescott',      t: 'QB',    r: ['hurts','eli','cowboys','eagles'] },
  eli:        { d: 'Eli Manning',        t: 'QB',    r: ['brady','dak','giants','eagles'] },
  brady:      { d: 'Tom Brady',          t: 'QB',    r: ['manning','rodgers','brees','belichick','patriots','buccaneers','eli'] },
  manning:    { d: 'Peyton Manning',     t: 'QB',    r: ['brady','brees','rivers','colts','broncos'] },
  rodgers:    { d: 'Aaron Rodgers',      t: 'QB',    r: ['brady','favre','stafford','packers','jets'] },
  favre:      { d: 'Brett Favre',        t: 'QB',    r: ['rodgers','packers','vikings','bears'] },
  brees:      { d: 'Drew Brees',         t: 'QB',    r: ['brady','manning','saints','falcons'] },
  rivers:     { d: 'Philip Rivers',      t: 'QB',    r: ['manning','chargers','raiders','chiefs'] },
  stafford:   { d: 'Matthew Stafford',   t: 'QB',    r: ['rodgers','rams','lions','packers'] },
  belichick:  { d: 'Bill Belichick',     t: 'Coach', r: ['brady','patriots','jets'] },
  tua:        { d: 'Tua Tagovailoa',     t: 'QB',    r: ['allen','dolphins','bills','patriots'] },
  herbert:    { d: 'Justin Herbert',     t: 'QB',    r: ['mahomes','chargers','chiefs','raiders'] },
  lawrence:   { d: 'Trevor Lawrence',    t: 'QB',    r: ['jaguars','titans','texans'] },
  stroud:     { d: 'C.J. Stroud',        t: 'QB',    r: ['young','texans','colts','jaguars'] },
  young:      { d: 'Bryce Young',        t: 'QB',    r: ['stroud','panthers','falcons','saints'] },
  // AFC West
  chiefs:     { d: 'Kansas City Chiefs',     t: 'Team', r: ['raiders','broncos','chargers','bengals','bills','mahomes','rivers'] },
  raiders:    { d: 'Las Vegas Raiders',      t: 'Team', r: ['chiefs','broncos','chargers','steelers','niners'] },
  broncos:    { d: 'Denver Broncos',         t: 'Team', r: ['chiefs','raiders','chargers','manning'] },
  chargers:   { d: 'Los Angeles Chargers',   t: 'Team', r: ['chiefs','raiders','broncos','rivers','herbert'] },
  // AFC North
  ravens:     { d: 'Baltimore Ravens',       t: 'Team', r: ['steelers','bengals','browns','lamar'] },
  steelers:   { d: 'Pittsburgh Steelers',    t: 'Team', r: ['ravens','bengals','browns','raiders'] },
  bengals:    { d: 'Cincinnati Bengals',     t: 'Team', r: ['steelers','ravens','browns','burrow','chiefs'] },
  browns:     { d: 'Cleveland Browns',       t: 'Team', r: ['steelers','ravens','bengals'] },
  // AFC East
  patriots:   { d: 'New England Patriots',   t: 'Team', r: ['bills','jets','dolphins','brady','belichick'] },
  bills:      { d: 'Buffalo Bills',           t: 'Team', r: ['patriots','jets','dolphins','chiefs','allen'] },
  jets:       { d: 'New York Jets',           t: 'Team', r: ['patriots','bills','dolphins','rodgers'] },
  dolphins:   { d: 'Miami Dolphins',          t: 'Team', r: ['patriots','bills','jets','tua'] },
  // AFC South
  texans:     { d: 'Houston Texans',          t: 'Team', r: ['colts','jaguars','titans','stroud'] },
  colts:      { d: 'Indianapolis Colts',      t: 'Team', r: ['texans','jaguars','titans','manning'] },
  jaguars:    { d: 'Jacksonville Jaguars',    t: 'Team', r: ['texans','colts','titans','lawrence'] },
  titans:     { d: 'Tennessee Titans',        t: 'Team', r: ['texans','colts','jaguars'] },
  // NFC East
  cowboys:    { d: 'Dallas Cowboys',          t: 'Team', r: ['eagles','giants','commanders','niners','dak'] },
  eagles:     { d: 'Philadelphia Eagles',     t: 'Team', r: ['cowboys','giants','commanders','hurts'] },
  giants:     { d: 'New York Giants',         t: 'Team', r: ['cowboys','eagles','commanders','eli'] },
  commanders: { d: 'Washington Commanders',   t: 'Team', r: ['cowboys','eagles','giants'] },
  // NFC North
  packers:    { d: 'Green Bay Packers',       t: 'Team', r: ['bears','vikings','lions','rodgers','favre'] },
  bears:      { d: 'Chicago Bears',           t: 'Team', r: ['packers','vikings','lions'] },
  vikings:    { d: 'Minnesota Vikings',       t: 'Team', r: ['packers','bears','lions','favre'] },
  lions:      { d: 'Detroit Lions',           t: 'Team', r: ['packers','bears','vikings','stafford'] },
  // NFC South
  saints:     { d: 'New Orleans Saints',      t: 'Team', r: ['falcons','panthers','buccaneers','brees'] },
  falcons:    { d: 'Atlanta Falcons',         t: 'Team', r: ['saints','panthers','buccaneers'] },
  panthers:   { d: 'Carolina Panthers',       t: 'Team', r: ['saints','falcons','buccaneers','young'] },
  buccaneers: { d: 'Tampa Bay Buccaneers',    t: 'Team', r: ['saints','falcons','panthers','brady'] },
  // NFC West
  niners:     { d: 'San Francisco 49ers',     t: 'Team', r: ['seahawks','rams','cardinals','cowboys','raiders'] },
  seahawks:   { d: 'Seattle Seahawks',        t: 'Team', r: ['niners','rams','cardinals'] },
  rams:       { d: 'Los Angeles Rams',        t: 'Team', r: ['niners','seahawks','cardinals','stafford'] },
  cardinals:  { d: 'Arizona Cardinals',       t: 'Team', r: ['niners','seahawks','rams'] },
};

const ALIASES: Record<string, string> = {
  'patrick mahomes':'mahomes','pat mahomes':'mahomes','kc':'chiefs','kansas city':'chiefs',
  'kansas city chiefs':'chiefs','joe burrow':'burrow','joey b':'burrow',
  'josh allen':'allen','lamar jackson':'lamar','jalen hurts':'hurts',
  'dak prescott':'dak','eli manning':'eli','tom brady':'brady','tb12':'brady',
  'peyton manning':'manning','aaron rodgers':'rodgers','a-rod':'rodgers',
  'brett favre':'favre','drew brees':'brees','philip rivers':'rivers',
  'matthew stafford':'stafford','bill belichick':'belichick',
  'tua tagovailoa':'tua','justin herbert':'herbert','trevor lawrence':'lawrence',
  'cj stroud':'stroud','bryce young':'young',
  'las vegas raiders':'raiders','oakland raiders':'raiders','lv raiders':'raiders',
  'denver broncos':'broncos','los angeles chargers':'chargers','la chargers':'chargers',
  'baltimore ravens':'ravens','pittsburgh steelers':'steelers',
  'cincinnati bengals':'bengals','cleveland browns':'browns',
  'new england patriots':'patriots','buffalo bills':'bills',
  'new york jets':'jets','miami dolphins':'dolphins',
  'houston texans':'texans','indianapolis colts':'colts',
  'jacksonville jaguars':'jaguars','tennessee titans':'titans',
  'dallas cowboys':'cowboys','philadelphia eagles':'eagles',
  'new york giants':'giants','washington commanders':'commanders',
  'green bay packers':'packers','chicago bears':'bears',
  'minnesota vikings':'vikings','detroit lions':'lions',
  'new orleans saints':'saints','atlanta falcons':'falcons',
  'carolina panthers':'panthers','tampa bay buccaneers':'buccaneers','bucs':'buccaneers',
  'san francisco 49ers':'niners','sf 49ers':'niners','49ers':'niners',
  'seattle seahawks':'seahawks','los angeles rams':'rams','la rams':'rams',
  'arizona cardinals':'cardinals',
};

const REASONS: Record<string, string> = {
  mahomes_allen:   'Multiple AFC Championship duels', allen_mahomes: 'Multiple AFC Championship duels',
  mahomes_burrow:  '4 straight AFC Championships 2021–24', burrow_mahomes: '4 straight AFC Championships 2021–24',
  mahomes_lamar:   'Dueling MVP QBs', lamar_mahomes: 'Dueling MVP QBs',
  brady_manning:   'Greatest QB rivalry ever', manning_brady: 'Greatest QB rivalry ever',
  brady_rodgers:   'Legendary cross-conference clashes', rodgers_brady: 'Legendary cross-conference clashes',
  brady_belichick: 'Dynasty partnership then split', belichick_brady: 'Dynasty partnership then split',
  rodgers_favre:   'Legendary handoff at Green Bay', favre_rodgers: 'Legendary handoff at Green Bay',
  ravens_steelers: 'Hardest-hitting division war', steelers_ravens: 'Hardest-hitting division war',
  packers_bears:   'NFL\'s oldest rivalry (1921)', bears_packers: 'NFL\'s oldest rivalry (1921)',
  cowboys_eagles:  'Fiercest NFC East blood feud', eagles_cowboys: 'Fiercest NFC East blood feud',
  chiefs_raiders:  'AFC West throne battle', raiders_chiefs: 'AFC West throne battle',
  patriots_bills:  '20+ years of dominance & revenge', bills_patriots: '20+ years of dominance & revenge',
};

const STARTS = ['mahomes','allen','brady','rodgers','ravens','cowboys','chiefs','packers','niners','bills'];

/* ─── Helpers ──────────────────────────────────────────────────────── */
function normalize(s: string): string {
  const lower = s.trim().toLowerCase();
  return ALIASES[lower] || lower;
}
function getReason(a: string, b: string): string {
  return REASONS[`${a}_${b}`] || REASONS[`${b}_${a}`] || 'Rival connection';
}

/* ─── Component ────────────────────────────────────────────────────── */
export default function RivalryChain() {
  const [chain, setChain]               = useState<ChainEntry[]>([]);
  const [currentKey, setCurrentKey]     = useState('');
  const [strikes, setStrikes]           = useState(0);
  const [hintsLeft, setHintsLeft]       = useState(2);
  const [best, setBest]                 = useState(0);
  const [gameOver, setGameOver]         = useState(false);
  const [input, setInput]               = useState('');
  const [feedback, setFeedback]         = useState('');
  const [feedbackGood, setFeedbackGood] = useState(false);
  const [showHowTo, setShowHowTo]       = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [inputShake, setInputShake]     = useState(false);
  const [showAuth, setShowAuth]         = useState(false);
  const [userInit, setUserInit]         = useState<string | null>(null);
  const [acOpen, setAcOpen]             = useState(false);

  const scrollRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);
  const sparksRef  = useRef<HTMLDivElement>(null);
  const fbTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Auth */
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) {
        const n = user.user_metadata?.full_name || user.email || 'U';
        setUserInit(n[0].toUpperCase());
      }
    });
  }, []);

  /* Spark background */
  useEffect(() => {
    const el = sparksRef.current;
    if (!el) return;
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('div');
      s.className = 'rc-sp';
      const x = Math.random() * 100;
      const dur = 3 + Math.random() * 5;
      const delay = Math.random() * 7;
      const dx = (Math.random() - 0.5) * 140;
      s.style.cssText = `left:${x}%;--d:${dur}s;--dl:${delay}s;--dx:${dx}px`;
      el.appendChild(s);
    }
    return () => { if (el) el.innerHTML = ''; };
  }, []);

  /* Init */
  const initGame = useCallback(() => {
    const startKey = STARTS[Math.floor(Math.random() * STARTS.length)];
    const e = ENTITIES[startKey];
    setChain([{ key: startKey, entity: e }]);
    setCurrentKey(startKey);
    setStrikes(0);
    setHintsLeft(2);
    setGameOver(false);
    setShowGameOver(false);
    setInput('');
    setFeedback('');
    setAcOpen(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => { initGame(); }, [initGame]);

  /* Scroll chain to bottom when it grows */
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 80);
  }, [chain.length]);

  /* Feedback helper */
  const flash = useCallback((msg: string, good: boolean) => {
    setFeedback(msg);
    setFeedbackGood(good);
    if (fbTimer.current) clearTimeout(fbTimer.current);
    if (good) fbTimer.current = setTimeout(() => setFeedback(''), 2500);
  }, []);

  /* Autocomplete */
  const acItems = useMemo((): AcItem[] => {
    const val = input.trim().toLowerCase();
    if (val.length < 2) return [];
    const cur = ENTITIES[currentKey];
    if (!cur) return [];
    const seen = new Set<string>();
    const results: AcItem[] = [];
    for (const [key, e] of Object.entries(ENTITIES)) {
      if (chain.some(c => c.key === key)) continue;
      if (e.d.toLowerCase().includes(val) || key.includes(val)) {
        if (!seen.has(key)) { seen.add(key); results.push({ key, entity: e, isRival: cur.r.includes(key) }); }
      }
    }
    for (const [alias, key] of Object.entries(ALIASES)) {
      if (alias.includes(val) && !seen.has(key)) {
        const e = ENTITIES[key];
        if (e && !chain.some(c => c.key === key)) {
          seen.add(key); results.push({ key, entity: e, isRival: cur.r.includes(key) });
        }
      }
    }
    return results.sort((a, b) => Number(b.isRival) - Number(a.isRival)).slice(0, 7);
  }, [input, currentKey, chain]);

  /* Strike */
  const doStrike = useCallback((msg: string) => {
    setInputShake(true);
    setTimeout(() => setInputShake(false), 420);
    flash(`❌ ${msg}`, false);
    setStrikes(prev => {
      const next = prev + 1;
      if (next >= 3) setTimeout(() => { setGameOver(true); setShowGameOver(true); }, 500);
      return next;
    });
  }, [flash]);

  /* Submit */
  const submit = useCallback(() => {
    if (gameOver || !input.trim()) return;
    setAcOpen(false);
    const key = normalize(input);
    const cur = ENTITIES[currentKey];
    if (chain.some(c => c.key === key)) { doStrike('Already used in this chain!'); return; }
    const e = ENTITIES[key];
    if (!e) { doStrike(`"${input.trim()}" isn't in the rivalry database.`); return; }
    if (!cur.r.includes(key)) { doStrike(`${e.d} isn't a direct rival of ${cur.d}.`); return; }

    const newChain = [...chain, { key, entity: e }];
    setChain(newChain);
    setCurrentKey(key);
    setInput('');
    setBest(prev => Math.max(prev, newChain.length));
    flash(`🔥 ${getReason(currentKey, key)}`, true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [gameOver, input, currentKey, chain, doStrike, flash]);

  /* Hint */
  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || gameOver) return;
    const cur = ENTITIES[currentKey];
    const unused = cur.r.filter(k => !chain.some(c => c.key === k));
    if (!unused.length) { flash('No more valid connections from here!', false); return; }
    flash(`💡 "${ENTITIES[unused[0]].d}" is a valid rival!`, true);
    setHintsLeft(h => h - 1);
  }, [hintsLeft, gameOver, currentKey, chain, flash]);

  const curEntity = ENTITIES[currentKey];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div ref={sparksRef} className="rc-sparks" aria-hidden="true" />

      {/* ── Nav ── */}
      <nav className="cp-nav">
        <div className="cp-nav-l">
          <Link href="/" className="g-back">← Hub</Link>
        </div>
        <div className="cp-nav-c">
          <span className="rc-pip" />
          RIVALRY CHAIN
        </div>
        <div className="cp-nav-r">
          {userInit
            ? <Link href="/profile" className="cp-badge">{userInit}</Link>
            : <Link href="/login"   className="cp-signin">SIGN IN</Link>}
        </div>
      </nav>

      <div className="rc-root">

        {/* ── Stats bar ── */}
        <div className="rc-stats">
          <div className="rc-stat">
            <div className="rc-sv">{chain.length}</div>
            <div className="rc-sl">Chain Length</div>
          </div>
          <div className="rc-stat">
            <div className="rc-lives">
              {[0,1,2].map(i => <div key={i} className={`rc-life${i < strikes ? ' gone' : ''}`} />)}
            </div>
            <div className="rc-sl">Strikes Left: {3 - strikes}</div>
          </div>
          <div className="rc-stat">
            <div className="rc-sv">{best}</div>
            <div className="rc-sl">Best Chain</div>
          </div>
        </div>

        {/* ── Chain scroll ── */}
        <div className="rc-scroll" ref={scrollRef}>
          {chain.map((entry, i) => (
            <div key={entry.key}>
              {i > 0 && (
                <div className="rc-connector">
                  <div className="co v" /><div className="co" />
                  <div className="rc-rtag">{getReason(chain[i-1].key, entry.key)}</div>
                  <div className="co" /><div className="co v" />
                </div>
              )}
              <div className="rc-link-wrap">
                <div className={`rc-node${i === chain.length - 1 ? ' hot' : ''}`}>
                  <div className="rc-node-num">#{i + 1}</div>
                  <div className="rc-node-badge">{i === chain.length - 1 ? 'Current Link' : 'Chained'}</div>
                  <div className="rc-node-name">{entry.entity.d}</div>
                  <div className="rc-node-type">{entry.entity.t}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Input section ── */}
        <div className="rc-input-section">
          <div className="rc-prompt">
            <div className="rc-prompt-main">
              Who rivals <span className="rc-pname">{curEntity?.d ?? '—'}</span>?
            </div>
            <div className="rc-prompt-sub">Enter a player, team, or coach that is a <em>direct rival</em></div>
          </div>

          <div className="rc-input-row">
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                ref={inputRef}
                className={`rc-entry${inputShake ? ' g-shake' : ''}`}
                type="text"
                placeholder="TYPE A NAME…"
                value={input}
                autoComplete="off"
                spellCheck={false}
                disabled={gameOver}
                onChange={e => { setInput(e.target.value); setAcOpen(true); }}
                onKeyDown={e => {
                  if (e.key === 'Enter') submit();
                  if (e.key === 'Escape') setAcOpen(false);
                }}
                onFocus={() => setAcOpen(true)}
                onBlur={() => setTimeout(() => setAcOpen(false), 150)}
              />
              {acOpen && acItems.length > 0 && (
                <div className="rc-ac">
                  {acItems.map(item => (
                    <div
                      key={item.key}
                      className="rc-ac-item"
                      onMouseDown={() => { setInput(item.entity.d); setAcOpen(false); inputRef.current?.focus(); }}
                    >
                      {item.entity.d}
                      <span className="rc-ac-type">{item.isRival ? '🔥 Rival' : item.entity.t}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button className="rc-go" onClick={submit} disabled={gameOver || !input.trim()}>CHAIN</button>
          </div>

          {feedback && (
            <div className={`rc-feedback${feedbackGood ? ' ok' : ''}`}>{feedback}</div>
          )}

          <div className="rc-controls">
            <button className="rc-ctrl" onClick={useHint} disabled={hintsLeft <= 0 || gameOver}>
              💡 Hint <span className="rc-badge-n">{hintsLeft}</span>
            </button>
            <button className="rc-ctrl" onClick={() => setShowHowTo(true)}>📋 Rules</button>
            <button className="rc-ctrl" onClick={initGame}>↺ New Game</button>
          </div>
        </div>
      </div>

      {/* ── Game over modal ── */}
      {showGameOver && (
        <div className="g-overlay" onClick={() => setShowGameOver(false)}>
          <div className="rc-go-modal" onClick={e => e.stopPropagation()}>
            <div className="rc-go-head">CHAIN<br />BROKEN</div>
            <div className="rc-go-score">{chain.length}</div>
            <div className="rc-go-label">LINKS IN YOUR CHAIN</div>
            <div className="rc-chain-preview">
              {chain.map((entry, i) => (
                <span key={entry.key}>
                  <span className="rc-ritem">{entry.entity.d}</span>
                  {i < chain.length - 1 && <span className="rc-rarrow"> ⛓ </span>}
                </span>
              ))}
            </div>
            <div className="rc-go-btns">
              <button className="rc-go-main" onClick={initGame}>⛓️ New Chain</button>
              <button className="rc-go-sec" onClick={() => setShowGameOver(false)}>View Chain</button>
            </div>
            {!userInit && (
              <button className="g-modal-skip" onClick={() => { setShowGameOver(false); setShowAuth(true); }}>
                Save your scores →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── How to play ── */}
      {showHowTo && (
        <div className="g-overlay" onClick={() => setShowHowTo(false)}>
          <div className="rc-howto" onClick={e => e.stopPropagation()}>
            <div className="rc-howto-title">⛓️ How To Play</div>
            {[
              'A starting NFL player or team is shown. Name someone who is a direct rival — through game history, division battles, or iconic matchups.',
              'Each new entry must rival the previous entry in the chain. No loops — entries can\'t be reused.',
              'You have 3 strikes. Enter an invalid connection and lose one. Three strikes ends your chain.',
              'Use up to 2 hints per game to reveal a valid rival for the current link.',
              'Build the longest chain possible. Your personal best is tracked per session.',
            ].map((rule, i) => (
              <div key={i} className="rc-hrule">
                <div className="rc-rnum">{i + 1}</div>
                <div>{rule}</div>
              </div>
            ))}
            <div className="rc-hnote">💡 Example: Mahomes → Chiefs → Raiders → Broncos → Peyton Manning → Tom Brady …</div>
            <button className="rc-go-main" style={{ marginTop: '1.2rem' }} onClick={() => setShowHowTo(false)}>Let's Play!</button>
          </div>
        </div>
      )}

      {/* ── Sign-in prompt ── */}
      {showAuth && (
        <div className="g-overlay" onClick={() => setShowAuth(false)}>
          <div className="g-modal" onClick={e => e.stopPropagation()}>
            <div className="g-modal-icon">🏆</div>
            <h3 className="g-modal-title">Save Your Best Chain</h3>
            <p className="g-modal-body">Create a free account to track your longest chains and compete with other fans.</p>
            <div className="g-modal-btns">
              <Link href="/signup" className="g-modal-cta" style={{ background: '#ff5e1a', color: '#fff' }}>Create Free Account</Link>
              <Link href="/login" className="g-modal-sec">Sign In</Link>
            </div>
            <button onClick={() => setShowAuth(false)} className="g-modal-skip">Maybe Later</button>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Styles ────────────────────────────────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

/* Shared nav (matches cp-nav pattern) */
.cp-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:.875rem 1.5rem;
  border-bottom:1px solid #221a1a;position:sticky;top:0;background:#080606;z-index:20;
  font-family:'Barlow Condensed',sans-serif}
.cp-nav-l{justify-self:start}
.cp-nav-c{display:flex;align-items:center;gap:.5rem;font-family:'Bebas Neue',sans-serif;
  font-size:1.1rem;letter-spacing:.14em;color:#ff8c42;justify-self:center}
.cp-nav-r{justify-self:end}
.rc-pip{width:8px;height:8px;border-radius:50%;background:#ff5e1a;box-shadow:0 0 8px #ff5e1a;flex-shrink:0}
.g-back{color:#5a4a40;text-decoration:none;font-size:.82rem;transition:.15s;font-family:'Barlow Condensed',sans-serif}
.g-back:hover{color:#e8e0d8}
.cp-badge{width:28px;height:28px;border-radius:50%;background:#1e1212;border:1.5px solid #ff5e1a;color:#ff5e1a;
  font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:.85rem;display:flex;align-items:center;
  justify-content:center;text-decoration:none;transition:.15s}
.cp-badge:hover{background:#ff5e1a;color:#080606}
.cp-signin{font-family:'Barlow Condensed',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.08em;
  color:#3a2a20;text-decoration:none;transition:.15s;border:1px solid #2a1a10;padding:.25rem .6rem;border-radius:4px}
.cp-signin:hover{color:#ff5e1a;border-color:#ff5e1a}

/* Shared overlay / modal */
.g-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;
  justify-content:center;z-index:50;backdrop-filter:blur(5px)}
.g-modal{background:#111010;border:1px solid #2a1a10;border-radius:20px;padding:2rem 1.75rem;
  max-width:320px;width:90%;text-align:center;animation:fadeUp .3s ease both}
.g-modal-icon{font-size:2.5rem;margin-bottom:.75rem}
.g-modal-title{font-family:'Bebas Neue',sans-serif;font-size:1.6rem;letter-spacing:.06em;color:#e8e0d8;margin-bottom:.5rem}
.g-modal-body{font-size:.82rem;color:#7a6a60;line-height:1.6;margin-bottom:1.25rem}
.g-modal-btns{display:flex;flex-direction:column;gap:.5rem;margin-bottom:.75rem}
.g-modal-cta{display:block;font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;
  letter-spacing:.06em;padding:.8rem;border-radius:12px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-cta:hover{opacity:.88}
.g-modal-sec{display:block;background:transparent;border:1px solid #2a1a10;color:#a89080;
  font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.06em;
  padding:.7rem;border-radius:12px;text-decoration:none;transition:.15s;text-align:center}
.g-modal-sec:hover{border-color:#ff5e1a;color:#ff8c42}
.g-modal-skip{background:none;border:none;color:#3a2a20;font-size:.75rem;cursor:pointer;transition:.15s}
.g-modal-skip:hover{color:#7a6a60}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}

/* Shared shake */
.g-shake{animation:shake .38s ease}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}

/* ── Spark background ── */
.rc-sparks{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.rc-sp{position:absolute;width:2px;height:2px;border-radius:50%;background:#ff5e1a;bottom:-4px;opacity:0;
  animation:rc-rise var(--d,4s) ease-in var(--dl,0s) infinite}
@keyframes rc-rise{
  0%{transform:translate(0,0) scale(1);opacity:.9}60%{opacity:.3}
  100%{transform:translate(var(--dx,20px),-90vh) scale(0);opacity:0}}

/* ── Root ── */
.rc-root{position:relative;z-index:2;max-width:700px;margin:0 auto;padding:0 1rem 5rem;
  font-family:'Barlow Condensed',sans-serif;min-height:100vh;background:#080606}

/* ── Stats ── */
.rc-stats{display:flex;justify-content:center;gap:0;background:#111010;border-bottom:1px solid #221a1a;
  position:sticky;top:49px;z-index:15}
.rc-stat{flex:1;max-width:140px;padding:.85rem .5rem;text-align:center;position:relative}
.rc-stat+.rc-stat::before{content:'';position:absolute;left:0;top:25%;height:50%;width:1px;background:#221a1a}
.rc-sv{font-family:'Bebas Neue',sans-serif;font-size:2.2rem;color:#ff5e1a;line-height:1}
.rc-sl{font-size:.58rem;color:#7a6a60;letter-spacing:.18em;text-transform:uppercase;margin-top:2px}
.rc-lives{display:flex;gap:5px;justify-content:center;margin-bottom:3px}
.rc-life{width:9px;height:9px;border-radius:50%;background:#ff5e1a;box-shadow:0 0 6px rgba(255,94,26,.5);transition:all .3s}
.rc-life.gone{background:#2a2020;box-shadow:none}

/* ── Chain scroll ── */
.rc-scroll{max-height:calc(100vh - 360px);min-height:100px;overflow-y:auto;padding:1.5rem 0}
.rc-scroll::-webkit-scrollbar{width:3px}
.rc-scroll::-webkit-scrollbar-thumb{background:#332828;border-radius:2px}

/* ── Node ── */
.rc-link-wrap{display:flex;justify-content:center;animation:link-in .45s cubic-bezier(.34,1.56,.64,1) both}
@keyframes link-in{from{opacity:0;transform:translateY(-20px) scale(.88)}to{opacity:1;transform:translateY(0) scale(1)}}
.rc-node{background:#181414;border:2px solid #484040;border-radius:4px;padding:.7rem 2.5rem;
  text-align:center;min-width:240px;max-width:380px;position:relative;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.04);transition:border-color .3s,box-shadow .3s}
.rc-node.hot{border-color:#ff5e1a;box-shadow:0 0 28px rgba(255,94,26,.35),0 0 60px rgba(255,94,26,.08)}
.rc-node-num{position:absolute;left:.5rem;top:.5rem;font-family:'Bebas Neue',sans-serif;
  font-size:.8rem;color:#484040}
.rc-node-badge{font-size:.55rem;letter-spacing:.22em;text-transform:uppercase;color:#7a6a60;margin-bottom:3px}
.rc-node-name{font-family:'Bebas Neue',sans-serif;font-size:2rem;letter-spacing:.06em;color:#e8e0d8;line-height:1}
.rc-node-type{font-size:.6rem;letter-spacing:.16em;text-transform:uppercase;color:#ff8c42;margin-top:3px}

/* ── Connector ── */
.rc-connector{display:flex;flex-direction:column;align-items:center;gap:3px;padding:4px 0}
.co{border:2.5px solid #ff5e1a;border-radius:50%;position:relative;
  box-shadow:0 0 7px rgba(255,94,26,.6);transition:border-color .3s}
.co::after{content:'';position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  background:#ff5e1a;transition:background .3s}
.co{width:22px;height:13px}
.co::after{width:55%;height:1.5px}
.co.v{width:13px;height:22px}
.co.v::after{width:1.5px;height:55%}
.rc-rtag{font-size:.58rem;letter-spacing:.1em;text-transform:uppercase;
  color:#ff5e1a;background:rgba(255,94,26,.1);border:1px solid rgba(255,94,26,.25);
  padding:2px 8px;border-radius:2px;max-width:220px;text-align:center;line-height:1.5}

/* ── Input section ── */
.rc-input-section{margin-top:1.5rem;padding-bottom:1rem}
.rc-prompt{text-align:center;margin-bottom:.8rem}
.rc-prompt-main{font-family:'Bebas Neue',sans-serif;font-size:1.35rem;letter-spacing:.06em;color:#e8e0d8}
.rc-pname{color:#ff5e1a}
.rc-prompt-sub{font-size:.74rem;color:#7a6a60;margin-top:2px}
.rc-prompt-sub em{color:#ff8c42;font-style:normal}
.rc-input-row{display:flex;gap:.5rem}
.rc-entry{flex:1;background:#181414;border:2px solid #484040;border-radius:4px;padding:.85rem 1.2rem;
  color:#e8e0d8;font-family:'Bebas Neue',sans-serif;font-size:1.55rem;letter-spacing:.08em;
  outline:none;text-transform:uppercase;transition:border-color .2s,box-shadow .2s;width:100%}
.rc-entry::placeholder{color:#2a2020;font-size:1rem}
.rc-entry:focus{border-color:#ff5e1a;box-shadow:0 0 18px rgba(255,94,26,.18)}
.rc-entry:disabled{opacity:.4}
.rc-go{background:#ff5e1a;color:#fff;border:none;border-radius:4px;padding:0 1.4rem;
  font-family:'Bebas Neue',sans-serif;font-size:1.35rem;letter-spacing:.1em;cursor:pointer;
  transition:background .2s,transform .1s;white-space:nowrap}
.rc-go:hover:not(:disabled){background:#ff8c42;transform:scale(1.03)}
.rc-go:active:not(:disabled){transform:scale(.97)}
.rc-go:disabled{background:#2a2020;cursor:not-allowed}

/* ── Autocomplete ── */
.rc-ac{position:absolute;top:100%;left:0;right:0;background:#181414;border:1px solid #484040;
  border-top:none;border-radius:0 0 4px 4px;z-index:40;overflow:hidden;
  max-height:200px;overflow-y:auto}
.rc-ac::-webkit-scrollbar{width:3px}
.rc-ac::-webkit-scrollbar-thumb{background:#332828}
.rc-ac-item{padding:.55rem 1rem;cursor:pointer;font-size:.95rem;letter-spacing:.04em;
  transition:background .1s;border-bottom:1px solid rgba(255,255,255,.03);
  font-family:'Barlow Condensed',sans-serif;color:#e8e0d8;display:flex;justify-content:space-between;align-items:center}
.rc-ac-item:hover{background:rgba(255,94,26,.15);color:#ff8c42}
.rc-ac-type{font-size:.6rem;color:#7a6a60}

/* ── Feedback / controls ── */
.rc-feedback{text-align:center;font-size:.83rem;letter-spacing:.04em;color:#e53935;
  margin-top:.5rem;min-height:1.4rem;animation:fadeUp .2s ease}
.rc-feedback.ok{color:#4caf50}
.rc-controls{display:flex;justify-content:center;gap:.7rem;margin-top:.9rem;flex-wrap:wrap}
.rc-ctrl{background:transparent;border:1px solid #484040;color:#7a6a60;padding:.38rem .9rem;
  border-radius:3px;font-family:'Barlow Condensed',sans-serif;font-size:.75rem;letter-spacing:.12em;
  text-transform:uppercase;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:.4rem}
.rc-ctrl:hover:not(:disabled){border-color:#ff5e1a;color:#ff5e1a}
.rc-ctrl:disabled{opacity:.3;cursor:not-allowed}
.rc-badge-n{background:#ff5e1a;color:#fff;font-size:.58rem;padding:1px 5px;border-radius:8px;font-weight:700}

/* ── Game over modal ── */
.rc-go-modal{background:#111010;border:1px solid #2a1a10;border-radius:12px;padding:2rem;
  max-width:480px;width:90%;text-align:center;animation:fadeUp .35s ease both}
.rc-go-head{font-family:'Bebas Neue',sans-serif;font-size:clamp(2.5rem,8vw,4.5rem);
  color:#ff5e1a;line-height:.9;animation:flicker .6s ease}
@keyframes flicker{0%,100%{opacity:1}30%{opacity:.3}70%{opacity:.9}}
.rc-go-score{font-family:'Bebas Neue',sans-serif;font-size:5rem;line-height:1;
  background:linear-gradient(130deg,#ff5e1a,#ffd700);-webkit-background-clip:text;
  -webkit-text-fill-color:transparent;background-clip:text;margin:.3rem 0}
.rc-go-label{font-size:.72rem;color:#7a6a60;letter-spacing:.2em;text-transform:uppercase}
.rc-chain-preview{margin:1rem 0;background:#181414;border:1px solid #2a2020;border-radius:4px;
  padding:.75rem 1rem;font-size:.82rem;line-height:1.9;text-align:left;
  max-height:150px;overflow-y:auto;font-family:'Barlow',sans-serif}
.rc-chain-preview::-webkit-scrollbar{width:3px}
.rc-chain-preview::-webkit-scrollbar-thumb{background:#332828}
.rc-ritem{color:#e8e0d8}
.rc-rarrow{color:#ff5e1a;font-size:.7rem}
.rc-go-btns{display:flex;gap:.7rem;justify-content:center;margin-top:1rem;flex-wrap:wrap}
.rc-go-main{background:#ff5e1a;color:#fff;border:none;border-radius:4px;padding:.8rem 2rem;
  font-family:'Bebas Neue',sans-serif;font-size:1.3rem;letter-spacing:.1em;cursor:pointer;transition:all .2s}
.rc-go-main:hover{background:#ff8c42;transform:scale(1.03)}
.rc-go-sec{background:transparent;color:#7a6a60;border:1px solid #484040;border-radius:4px;
  padding:.8rem 1.4rem;font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.08em;cursor:pointer}
.rc-go-sec:hover{color:#e8e0d8}

/* ── How to play ── */
.rc-howto{background:#111010;border:1px solid #2a1a10;border-radius:12px;padding:2rem;
  max-width:520px;width:90%;animation:fadeUp .3s ease both}
.rc-howto-title{font-family:'Bebas Neue',sans-serif;font-size:2rem;color:#ff5e1a;letter-spacing:.08em;margin-bottom:1.1rem}
.rc-hrule{display:flex;gap:.75rem;margin-bottom:.85rem;font-family:'Barlow',sans-serif;font-size:.88rem;
  color:#e8e0d8;line-height:1.5;align-items:flex-start}
.rc-rnum{font-family:'Bebas Neue',sans-serif;font-size:1.3rem;color:#ff5e1a;min-width:22px;line-height:1.1}
.rc-hnote{font-size:.74rem;color:#7a6a60;border-top:1px solid #221a1a;padding-top:.8rem;
  margin-top:.5rem;font-family:'Barlow',sans-serif;line-height:1.5}
`;