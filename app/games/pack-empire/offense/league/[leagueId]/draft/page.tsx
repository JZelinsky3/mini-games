'use client';
// nfl-minigames-hub/app/games/pack-empire/offense/league/[leagueId]/draft/page.tsx

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { getLeague, getMyMembership, getMyDraft, submitDraft as dbSubmitDraft } from '@/lib/league/db';
import { leagueWeightedDraw, packsForWeek, PLAYOFF_PACK_COUNT, PACK_TIER_LABELS, PACK_TIER_COLORS } from '@/lib/league/packs';
import type { PackTier } from '@/lib/league/packs';
import { calculateChemistry, finalScore, chemistryLabel } from '@/lib/league';

import { ALL_PLAYERS }    from '@/lib/packs/current-offense-qb';
import { ALL_PLAYERS_V2 } from '@/lib/packs/current-offense-rb';
import { ALL_PLAYERS_V3 } from '@/lib/packs/current-offense-wr';
import { ALL_PLAYERS_V4 } from '@/lib/packs/current-offense-te';
import { ALL_PLAYERS_V5 } from '@/lib/packs/current-offense-ot';
import { ALL_PLAYERS_V6 } from '@/lib/packs/current-offense-iol';
import { ALL_PLAYERS_V7 } from '@/lib/packs/legend-offense';

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
type Phase = 'loading' | 'boosted_pick' | 'packing' | 'complete';

interface Player {
  id: string; name: string; pos: string; team: string;
  score: number; rarity: Rarity; accolades: string[];
}

/* ─── Rarity config — same visual system, now themed to crimson palette ─ */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string; shimmer: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',   art: 'linear-gradient(150deg,#3d2210,#7a4820)', shimmer: '#a06030' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',   art: 'linear-gradient(150deg,#062840,#104870)', shimmer: '#2890d8' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',    art: 'linear-gradient(150deg,#3a2800,#806010)', shimmer: '#c8a020' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)',  art: 'linear-gradient(150deg,#280048,#6010b0)', shimmer: '#c020f0' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',   art: 'linear-gradient(150deg,#021a0a,#04401a)', shimmer: '#20a050' },
};

/* ─── Player pool ────────────────────────────────────────────────────── */
const POOL: Record<string, Player[]> = (() => {
  const keys = ['QB','RB','WR','TE','OT','OG','C'] as const;
  return Object.fromEntries(keys.map(k => [k, [
    ...ALL_PLAYERS[k], ...ALL_PLAYERS_V2[k], ...ALL_PLAYERS_V3[k],
    ...ALL_PLAYERS_V4[k], ...ALL_PLAYERS_V5[k], ...ALL_PLAYERS_V6[k], ...ALL_PLAYERS_V7[k],
  ]]));
})() as Record<string, Player[]>;

const RARITY_MAP: Record<string, Rarity> = {
  epic: 'dynasty', legendary: 'transcendent',
  common: 'common', rare: 'rare', dynasty: 'dynasty', transcendent: 'transcendent', immortal: 'immortal',
};
Object.values(POOL).forEach(arr => arr.forEach(p => { p.rarity = RARITY_MAP[p.rarity] as Rarity ?? p.rarity; }));

/* ─── Slots ──────────────────────────────────────────────────────────── */
const SLOTS = [
  { key: 'QB',  label: 'Quarterback',   short: 'QB',  pool: 'QB' },
  { key: 'RB',  label: 'Running Back',  short: 'RB',  pool: 'RB' },
  { key: 'WR1', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'WR2', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'WR3', label: 'Wide Receiver', short: 'WR',  pool: 'WR' },
  { key: 'TE',  label: 'Tight End',     short: 'TE',  pool: 'TE' },
  { key: 'LT',  label: 'Left Tackle',   short: 'LT',  pool: 'OT' },
  { key: 'LG',  label: 'Left Guard',    short: 'LG',  pool: 'OG' },
  { key: 'C',   label: 'Center',        short: 'C',   pool: 'C'  },
  { key: 'RG',  label: 'Right Guard',   short: 'RG',  pool: 'OG' },
  { key: 'RT',  label: 'Right Tackle',  short: 'RT',  pool: 'OT' },
] as const;

const OL_ROW   = [6, 7, 8, 9, 10];
const WR_LEFT  = [2, 3];
const WR_RIGHT = [5, 4];
const QB_ROW   = [0, 1];

const PACK_IMG: Record<string, string> = {
  QB: '/pack-covers/tombrady.png',   RB: '/pack-covers/toddgurley.png',
  WR: '/pack-covers/julio.png',      TE: '/pack-covers/gronk.png',
  OT: '/pack-covers/trentwilliams.png', OG: '/pack-covers/zackmartin.png',
  C:  '/pack-covers/jasonkelce.png',
};

/* ─── Tiers ──────────────────────────────────────────────────────────── */
const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE',      icon: '🐐', color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME',       icon: '🏛️', color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', icon: '🏆', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE',      icon: '⭐', color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER',  icon: '🔥', color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY',   icon: '📈', color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT',        icon: '📋', color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD',     icon: '🏈', color: '#e8a060' },
];
function getTier(s: number) { return TIERS.find(t => s >= t.min)!; }

/* ─── Rarity effects (imported from offense — same components) ──────── */
// Re-use your existing RarityEffects component here in your actual codebase.
// For this file we inline a lightweight placeholder that calls the same CSS classes.
function RarityEffects({ rarity, position = 'inner' }: { rarity: Rarity; position?: 'outer' | 'inner' }) {
  if (position === 'outer') {
    return (
      <>
        {rarity === 'rare' && <div className="pe-ra-spin-wrap"><div className="pe-ra-spin-arc" /><div className="pe-ra-spin-inner" /></div>}
        {rarity === 'dynasty' && <div className="pe-ep-dual-wrap"><div className="pe-ep-dual-arc1" /><div className="pe-ep-dual-arc2" /><div className="pe-ep-dual-inner" /></div>}
        {rarity === 'transcendent' && <div className="pe-le-plasma-wrap"><div className="pe-le-plasma-arc1" /><div className="pe-le-plasma-arc2" /><div className="pe-le-plasma-inner" /></div>}
        {rarity === 'immortal' && <><div className="pe-imm-glow-1" /><div className="pe-imm-glow-2" /><div className="pe-imm-glow-3" /><div className="pe-imm-glow-4" /></>}
      </>
    );
  }
  return (
    <>
      {rarity === 'common' && <><div className="pe-cm-scan" /><div className="pe-cm-bottom-glow" /></>}
      {rarity === 'rare' && <><div className="pe-ra-depth-vig" /><div className="pe-ra-center-glow" /></>}
      {rarity === 'dynasty' && <div className="pe-ep-burst"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(100,100)"><line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /><line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /></g></svg></div>}
      {rarity === 'transcendent' && <><div className="pe-imm-holo" /></>}
      {rarity === 'immortal' && <><div className="pe-imm-aurora"><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /></div><div className="pe-imm-holo" /><div className="pe-imm-shine" /></>}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function LeagueDraftPage() {
  const { leagueId } = useParams<{ leagueId: string }>();
  const router = useRouter();

  /* ── League state ── */
  const [leagueName, setLeagueName]   = useState('');
  const [weekNumber, setWeekNumber]   = useState(1);
  const [leaguePhase, setLeaguePhase] = useState('regular');
  const [myMemberId, setMyMemberId]   = useState('');
  const [myUserId, setMyUserId]       = useState('');
  const [myPackTier, setMyPackTier]   = useState<PackTier>('standard_pack');
  const [lockedPlayers, setLockedPlayers] = useState<Player[]>([]);
  const [totalPackCount, setTotalPackCount] = useState(11);
  const [alreadyDrafted, setAlreadyDrafted] = useState(false);

  /* ── Boosted pack position picker ── */
  const [boostedPos, setBoostedPos]   = useState<string | null>(null);   // pool key e.g. 'QB'
  const [boostedPicked, setBoostedPicked] = useState(false);

  /* ── Draft state ── */
  const [phase, setPhase]             = useState<Phase>('loading');
  const [lineup, setLineup]           = useState<(Player | null)[]>(Array(11).fill(null));
  const [packSi, setPackSi]           = useState<number | null>(null);
  const [packCards, setPackCards]     = useState<Player[]>([]);
  const [revealed, setRevealed]       = useState<boolean[]>([]);
  const [pickedId, setPickedId]       = useState<string | null>(null);
  const [immFlash, setImmFlash]       = useState(false);
  const [imageMap, setImageMap]       = useState<Record<string, string>>({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitDone, setSubmitDone]   = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  /* ── Load league + player images ── */
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace('/login'); return; }
      setMyUserId(user.id);

      const [league, membership] = await Promise.all([
        getLeague(leagueId),
        getMyMembership(leagueId, user.id),
      ]);

      if (!league || !membership) { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }
      if (league.phase === 'pregame') { router.replace(`/games/pack-empire/offense/league/${leagueId}`); return; }

      setLeagueName(league.name);
      setWeekNumber(league.current_week);
      setLeaguePhase(league.phase);
      setMyMemberId(membership.id);
      setMyPackTier(membership.next_pack_tier);
      setLockedPlayers((membership.permanent_locks as Player[]) ?? []);

      const isPlayoff = league.phase === 'gauntlet' || league.phase === 'finals';
      const packCount = isPlayoff ? PLAYOFF_PACK_COUNT : packsForWeek(league.current_week);
      setTotalPackCount(packCount);

      // Check if already drafted this week
      const existing = await getMyDraft(leagueId, membership.id, league.current_week, league.phase);
      if (existing) { setAlreadyDrafted(true); setPhase('complete'); return; }

      // Pre-fill locked players into lineup for regular season
      if (!isPlayoff && (membership.permanent_locks as Player[]).length > 0) {
        const locks = membership.permanent_locks as Player[];
        const newLineup = Array(11).fill(null) as (Player | null)[];
        locks.forEach((p, idx) => { if (idx < 11) newLineup[idx] = p; });
        setLineup(newLineup);
      }

      // Skip boosted picker if tier is standard or already in playoffs
      if (membership.next_pack_tier === 'standard_pack' || isPlayoff) {
        setBoostedPicked(true);
        setPhase('packing');
      } else {
        setPhase('boosted_pick');
      }
    })();
  }, [leagueId]);

  useEffect(() => {
  fetch('/players.csv')
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        const name = cols[1];
        const url = cols[22];
        if (name && url && url.startsWith('http')) map[name] = url;
      });
      setImageMap(map);  // ← this line was missing before
    })
    .catch(() => {});
}, []);

  /* ── Pack opening ── */
  const isBusy      = packCards.length > 0;
  const filled      = lineup.filter(Boolean).length;
  const totalScore  = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const tier        = getTier(totalScore);
  const hiddenCount = revealed.filter(r => !r).length;
  const anyRevealed = revealed.some(Boolean);
  const openSlotsLeft = 11 - filled; // includes locked (already filled) and open

  function isBoostedSlot(si: number): boolean {
    return boostedPos !== null && SLOTS[si].pool === boostedPos;
  }

  function isLockedSlot(si: number): boolean {
    return lockedPlayers.some(lp => lp.id === lineup[si]?.id);
  }

  const openPack = useCallback((si: number, curLineup: (Player | null)[]) => {
    const excl = curLineup.filter(Boolean).map(p => p!.id);
    const poolKey = SLOTS[si].pool;
    const useBoostedTier = isBoostedSlot(si);
    const tier: PackTier = useBoostedTier ? myPackTier : 'standard_pack';
    const pool = POOL[poolKey] ?? [];
    const cards = leagueWeightedDraw(pool, 5, tier, excl);

    setPackSi(si); setPackCards(cards);
    setRevealed(Array(cards.length).fill(false)); setPickedId(null);

    if (cards.some(c => c.rarity === 'immortal')) {
      setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 300);
    }
    setTimeout(() => cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  }, [myPackTier, boostedPos, lineup]);

  const clickSlot = useCallback((si: number) => {
    if (isBusy || pickedId !== null) return;
    if (isLockedSlot(si)) return; // locked — can't reopen
    openPack(si, lineup);
  }, [isBusy, pickedId, lineup, openPack]);

  const revealOne = useCallback((i: number) => {
    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
    if (packCards[i]?.rarity === 'immortal')
      setTimeout(() => { setImmFlash(true); setTimeout(() => setImmFlash(false), 2400); }, 200);
  }, [packCards]);

  const revealAll = useCallback(() => {
    packCards.forEach((_, i) => {
      if (!revealed[i]) setTimeout(() => {
        setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
      }, i * 130);
    });
  }, [packCards, revealed]);

  const handleCardClick = useCallback((i: number) => {
    if (pickedId) return;
    if (!revealed[i]) { revealOne(i); return; }
    const card = packCards[i];
    setPickedId(card.id);
    setTimeout(() => {
      setLineup(prev => {
        const n = [...prev];
        n[packSi!] = card;
        // Mark boosted slot as used
        if (isBoostedSlot(packSi!)) setBoostedPicked(true);
        if (n.filter(Boolean).length === 11) setPhase('complete');
        return n;
      });
      setPackCards([]); setRevealed([]); setPickedId(null); setPackSi(null);
    }, 650);
  }, [pickedId, revealed, revealOne, packCards, packSi, boostedPos]);

  /* ── Submit draft to Supabase ── */
  const handleSubmit = useCallback(async () => {
    if (submitting || submitDone) return;
    setSubmitting(true);
    try {
      const roster = lineup.filter(Boolean) as Player[];
      const chem = calculateChemistry(roster);
      const draftScore = totalScore;
      const fs = finalScore(draftScore, chem);

      await dbSubmitDraft({
        leagueId,
        memberId: myMemberId,
        userId: myUserId,
        weekNumber,
        phase: leaguePhase,
        roster,
        lockedPlayerIds: lockedPlayers.map(p => p.id),
        draftScore,
        chemistry: chem,
        finalScore: fs,
        packTierEarned: myPackTier,
      });
      setSubmitDone(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, submitDone, lineup, totalScore, leagueId, myMemberId, myUserId, weekNumber, leaguePhase, lockedPlayers, myPackTier]);

  /* ── Chemistry for display ── */
  const chemResult = calculateChemistry(lineup.filter(Boolean) as Player[]);

  /* ── Slot rendering ── */
  const FSlot = ({ si }: { si: number }) => {
    const player   = lineup[si];
    const isAct    = packSi === si;
    const locked   = isLockedSlot(si);
    const boosted  = isBoostedSlot(si) && !boostedPicked && !player;
    const canOpen  = !player && !isAct && !isBusy && phase === 'packing';
    const rc       = player ? RC[player.rarity] : null;
    const imgSrc   = player ? imageMap[player.name] : undefined;

    return (
      <div className="ldr-slot-outer">
        {player ? (
          <div className="ldr-fsl has-p"
            style={{ '--rc': rc!.color, '--rg': rc!.glow, '--art': rc!.art } as React.CSSProperties}>
            <RarityEffects rarity={player.rarity} position="outer" />
            <div className="ldr-filled-card">
              <div className="ldr-fc-topbar">
                <div className="ldr-fc-pos-badge" style={{ background: rc!.color }}>{player.pos}</div>
                <div className="ldr-fc-rar-badge" style={{ color: rc!.color }}>{rc!.label}</div>
              </div>
              <div className="ldr-fc-art" style={{ background: rc!.art }}>
                <div className="ldr-fc-field-lines" />
                <RarityEffects rarity={player.rarity} position="inner" />
                {imgSrc && <img src={imgSrc} alt={player.name} className="ldr-fc-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                <div className="ldr-fc-initial">{player.name.charAt(0)}</div>
              </div>
              <div className="ldr-fc-info">
                <div className="ldr-fc-name" style={{ color: rc!.color }}>
                  {(() => {
                    const parts = player.name.trim().split(' ');
                    const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v']);
                    const last = parts[parts.length - 1];
                    const isS = suffixes.has(last.toLowerCase());
                    return (isS && parts.length >= 3) ? `${parts[parts.length - 2]} ${last}` : last;
                  })()}
                </div>
                <div className="ldr-fc-score">{player.score.toLocaleString()}</div>
                <div className="ldr-fc-team-tag">{player.team}</div>
              </div>
              {locked && <div className="ldr-fc-lock-badge">🔒</div>}
              <div className="ldr-fc-shine" />
            </div>
          </div>
        ) : isAct ? (
          <div className="ldr-fsl active">
            <div className="ldr-fsl-pos-small">{SLOTS[si].short}</div>
            <div className="ldr-fsl-opening">…</div>
          </div>
        ) : (
          <div
            className={`ldr-pack-wrap${boosted ? ' boosted' : ''}${canOpen ? ' clickable' : ''}`}
            onClick={() => canOpen ? clickSlot(si) : undefined}
            role={canOpen ? 'button' : undefined}
            tabIndex={canOpen ? 0 : undefined}
          >
            <img src={PACK_IMG[SLOTS[si].pool]} alt={SLOTS[si].short} className="ldr-pack-img" />
            {boosted && (
              <div className="ldr-pack-boosted-badge" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
                {PACK_TIER_LABELS[myPackTier]}
              </div>
            )}
          </div>
        )}
        <div className={`ldr-slot-label${locked ? ' locked' : ''}${boosted ? ' boosted-label' : ''}`}>
          {locked ? '🔒 ' : ''}{SLOTS[si].short}
        </div>
      </div>
    );
  };

  const FormRow = ({ indices }: { indices: readonly number[] }) => (
    <div className="ldr-form-row">
      {indices.map(si => <FSlot key={SLOTS[si].key} si={si} />)}
    </div>
  );

  const FieldLayout = () => (
    <div className="ldr-field">
      <FormRow indices={OL_ROW} />
      <div className="ldr-skill-spread">
        <div className="ldr-skill-side">{WR_LEFT.map(si => <FSlot key={SLOTS[si].key} si={si} />)}</div>
        <div className="ldr-skill-side">{WR_RIGHT.map(si => <FSlot key={SLOTS[si].key} si={si} />)}</div>
      </div>
      <FormRow indices={QB_ROW} />
    </div>
  );

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LEAGUE_DRAFT_STYLES }} />

      {immFlash && (
        <div className="ldr-imm-flash" aria-hidden="true">
          <div className="ldr-imm-text">💎 IMMORTAL PULL!</div>
        </div>
      )}

      {/* Nav */}
      <nav className="ldr-nav">
        <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-back">
          ← {leagueName || 'League'}
        </Link>
        <div className="ldr-nav-c">
          <span className="ldr-nav-dot" />
          {leaguePhase === 'regular' ? `WEEK ${weekNumber}` : leaguePhase.toUpperCase()}
        </div>
        <div className="ldr-pack-tier-pill" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
          {PACK_TIER_LABELS[myPackTier]}
        </div>
      </nav>

      {/* Score strip */}
      {(phase === 'packing' || phase === 'complete') && (
        <div className="ldr-strip">
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: tier.color }}>{totalScore.toLocaleString()}</div>
            <div className="ldr-sl">DRAFT SCORE</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: chemResult.totalChemPoints >= 0 ? '#ff6b35' : '#cc2200' }}>
              {chemResult.totalChemPoints >= 0 ? '+' : ''}{chemResult.totalChemPoints.toLocaleString()}
            </div>
            <div className="ldr-sl">CHEMISTRY</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv" style={{ color: '#ff6b35' }}>
              {(totalScore + chemResult.totalChemPoints).toLocaleString()}
            </div>
            <div className="ldr-sl">FINAL SCORE</div>
          </div>
          <div className="ldr-sdiv" />
          <div className="ldr-sg">
            <div className="ldr-sv">{filled}<span className="ldr-sof">/11</span></div>
            <div className="ldr-sl">FILLED</div>
          </div>
          <div className="ldr-sbar"><div className="ldr-sfill" style={{ width: `${(filled / 11) * 100}%` }} /></div>
        </div>
      )}

      <div className="ldr-root">

        {/* ════ LOADING ════ */}
        {phase === 'loading' && (
          <div className="ldr-loading">
            <div className="ldr-loading-spinner" />
            <div className="ldr-loading-text">LOADING LEAGUE DRAFT…</div>
          </div>
        )}

        {/* ════ ALREADY DRAFTED ════ */}
        {alreadyDrafted && (
          <div className="ldr-already">
            <div className="ldr-already-icon">✓</div>
            <div className="ldr-already-title">DRAFT SUBMITTED</div>
            <div className="ldr-already-sub">You've already drafted this week. Scores reveal at midnight EST.</div>
            <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-submit-btn">
              BACK TO LEAGUE
            </Link>
          </div>
        )}

        {/* ════ BOOSTED PACK POSITION PICKER ════ */}
        {phase === 'boosted_pick' && (
          <div className="ldr-boost-pick">
            <div className="ldr-boost-eyebrow">YOUR REWARD</div>
            <div className="ldr-boost-title" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
              {PACK_TIER_LABELS[myPackTier]}
            </div>
            <div className="ldr-boost-sub">
              Choose which position slot gets your boosted pack this week.
              All other slots use standard weights.
            </div>
            <div className="ldr-boost-grid">
              {(['QB','RB','WR','TE','OT','OG','C'] as const).map(pos => (
                <button
                  key={pos}
                  className={`ldr-boost-btn ${boostedPos === pos ? 'selected' : ''}`}
                  style={boostedPos === pos ? { borderColor: PACK_TIER_COLORS[myPackTier], color: PACK_TIER_COLORS[myPackTier] } : {}}
                  onClick={() => setBoostedPos(pos)}
                >
                  {pos}
                </button>
              ))}
            </div>
            <button
              className="ldr-submit-btn"
              disabled={!boostedPos}
              onClick={() => { setBoostedPicked(false); setPhase('packing'); }}
              style={{ marginTop: '1.5rem' }}
            >
              {boostedPos ? `BOOST ${boostedPos} SLOT →` : 'SELECT A POSITION'}
            </button>
            <button className="ldr-skip-boost" onClick={() => { setBoostedPos(null); setBoostedPicked(true); setPhase('packing'); }}>
              Skip — use standard packs for all slots
            </button>
          </div>
        )}

        {/* ════ PACKING ════ */}
        {phase === 'packing' && (
          <div className="ldr-packing">
            {/* Info banner */}
            <div className="ldr-week-banner">
              <div className="ldr-wb-left">
                <div className="ldr-wb-week">
                  {leaguePhase === 'regular' ? `WEEK ${weekNumber} OF 8` : leaguePhase.toUpperCase()}
                </div>
                <div className="ldr-wb-count">{openSlotsLeft} SLOTS REMAINING</div>
              </div>
              {lockedPlayers.length > 0 && (
                <div className="ldr-wb-locks">🔒 {lockedPlayers.length} LOCKED</div>
              )}
              {boostedPos && !boostedPicked && (
                <div className="ldr-wb-boost" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
                  ⚡ {PACK_TIER_LABELS[myPackTier]} on {boostedPos}
                </div>
              )}
            </div>

            <div className="ldr-formation-wrap">
              <FieldLayout />
            </div>

            {/* Pack cards */}
            {packCards.length > 0 && (
              <div className="ldr-cards-area" ref={cardsRef}>
                <div className="ldr-ca-header">
                  {packSi !== null && isBoostedSlot(packSi) && (
                    <div className="ldr-cap-tag" style={{ color: PACK_TIER_COLORS[myPackTier] }}>
                      ⚡ {PACK_TIER_LABELS[myPackTier]} — {SLOTS[packSi].label.toUpperCase()}
                    </div>
                  )}
                  <div className="ldr-ca-pos">{packSi !== null ? SLOTS[packSi].label.toUpperCase() : ''}</div>
                  <div className="ldr-ca-status">
                    {pickedId ? '✓ Player drafted!'
                      : anyRevealed ? `${revealed.filter(Boolean).length}/5 revealed · tap a card to PICK`
                        : 'Tap cards to reveal · or use REVEAL ALL'}
                  </div>
                </div>
                <div className="ldr-cards-row">
                  {packCards.map((card, i) => {
                    const rc    = RC[card.rarity];
                    const isRev = revealed[i];
                    const isPick = pickedId === card.id;
                    const isRej  = !!pickedId && pickedId !== card.id;
                    const imgSrc = imageMap[card.name];
                    return (
                      <div key={card.id + i}
                        className={`ldr-card${isRev ? ' rev' : ''}${isPick ? ' picked' : ''}${isRej ? ' rejected' : ''}${isRev && !pickedId ? ' selectable' : ''}`}
                        onClick={() => handleCardClick(i)}
                        style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art, '--sh': rc.shimmer } as React.CSSProperties}
                      >
                        <div className="ldr-ci">
                          <RarityEffects rarity={card.rarity} position="outer" />
                          <div className="ldr-card-back">
                            <div className="ldr-back-grid" />
                            <div className="ldr-back-icon">🏆</div>
                            <div className="ldr-back-label">TAP TO REVEAL</div>
                            <div className="ldr-back-league">LEAGUE DRAFT</div>
                          </div>
                          <div className="ldr-card-front">
                            <div className="ldr-cf-topbar">
                              <div className="ldr-cf-pos" style={{ background: rc.color }}>{card.pos}</div>
                              <div className="ldr-cf-rlab" style={{ color: rc.color }}>{rc.label}</div>
                            </div>
                            <div className="ldr-cf-art" style={{ background: rc.art }}>
                              <RarityEffects rarity={card.rarity} position="inner" />
                              {imgSrc && <img src={imgSrc} alt={card.name} className="ldr-cf-img" onError={e => (e.currentTarget.style.display = 'none')} />}
                              <div className="ldr-cf-initial">{card.name.charAt(0)}</div>
                            </div>
                            <div className="ldr-cf-body">
                              <div className="ldr-cf-name">{card.name}</div>
                              <div className="ldr-cf-team">{card.team}</div>
                              <div className="ldr-cf-line" style={{ background: rc.color }} />
                              <div className="ldr-cf-score-row">
                                <div className="ldr-cf-score" style={{ color: rc.color }}>{card.score.toLocaleString()}</div>
                                <div className="ldr-cf-ovr">OVR</div>
                              </div>
                              {card.accolades.slice(0, 2).map((a, j) => <div key={j} className="ldr-cf-acc">· {a}</div>)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!pickedId && hiddenCount > 0 && (
                  <div className="ldr-reveal-bar">
                    <button className="ldr-reveal-btn" onClick={revealAll}>REVEAL ALL {hiddenCount}</button>
                  </div>
                )}
              </div>
            )}

            {!isBusy && filled < 11 && (
              <div className="ldr-empty-prompt">
                <div className="ldr-ep-arrow">↑</div>
                <div className="ldr-ep-text">Tap an open slot to open that pack</div>
              </div>
            )}
          </div>
        )}

        {/* ════ COMPLETE ════ */}
        {phase === 'complete' && !alreadyDrafted && (
          <div className="ldr-complete">
            <div className="ldr-cmp-header">
              <div className="ldr-cmp-eyebrow">LEAGUE DRAFT COMPLETE</div>
              <div className="ldr-cmp-score" style={{ color: tier.color }}>
                {(totalScore + chemResult.totalChemPoints).toLocaleString()}
              </div>
              <div className="ldr-cmp-label">FINAL SCORE</div>
            </div>

            {/* Score breakdown */}
            <div className="ldr-cmp-breakdown">
              <div className="ldr-cmp-bd-row">
                <span className="ldr-cmp-bd-label">Draft score</span>
                <span className="ldr-cmp-bd-val">{totalScore.toLocaleString()}</span>
              </div>
              <div className="ldr-cmp-bd-row">
                <span className="ldr-cmp-bd-label">Chemistry</span>
                <span className="ldr-cmp-bd-val" style={{ color: chemResult.totalChemPoints >= 0 ? '#ff6b35' : '#cc3300' }}>
                  {chemResult.totalChemPoints >= 0 ? '+' : ''}{chemResult.totalChemPoints.toLocaleString()}
                </span>
              </div>
              {chemResult.bonds.length > 0 && (
                <div className="ldr-cmp-bonds">
                  {chemResult.bonds.map((bond, i) => (
                    <div key={i} className="ldr-cmp-bond-row">
                      <span className="ldr-cmp-bond-icon">{bond.type === 'synergy' ? '⚡' : '⚔️'}</span>
                      <span className="ldr-cmp-bond-reason">{bond.reason}</span>
                      <span className="ldr-cmp-bond-pts" style={{ color: bond.points >= 0 ? '#ff6b35' : '#cc3300' }}>
                        {bond.points >= 0 ? '+' : ''}{bond.points}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="ldr-cmp-bd-row total">
                <span className="ldr-cmp-bd-label">Total</span>
                <span className="ldr-cmp-bd-val" style={{ color: '#ff6b35' }}>
                  {(totalScore + chemResult.totalChemPoints).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Tier */}
            <div className="ldr-cmp-tier" style={{ color: tier.color }}>
              {tier.icon} {tier.label}
            </div>

            {/* Submit */}
            {!submitDone ? (
              <button
                className="ldr-submit-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'SUBMITTING…' : 'SUBMIT TO LEAGUE →'}
              </button>
            ) : (
              <div className="ldr-submitted">
                <div className="ldr-sub-check">✓</div>
                <div className="ldr-sub-msg">Draft submitted! Scores reveal at midnight EST.</div>
                <Link href={`/games/pack-empire/offense/league/${leagueId}`} className="ldr-submit-btn" style={{ marginTop: '.8rem', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                  BACK TO LEAGUE
                </Link>
              </div>
            )}

            {/* Roster preview */}
            <div className="ldr-cmp-field-wrap">
              <div className="ldr-cmp-field-label">YOUR LINEUP</div>
              <FieldLayout />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STYLES — crimson / burnt orange identity, Rajdhani body font
   Orbitron kept for scores. `ldr-` prefix throughout.
══════════════════════════════════════════════════════════════════════ */
const LEAGUE_DRAFT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@700;800;900&display=swap');

/* ── Root palette ────────────────────────────────────────────────────── */
/* Primary:  #ff6b35  (burnt orange)
   Accent:   #cc2200  (deep crimson)
   Dark bg:  #0e0600  →  #1a0800
   Mid bg:   #1e0c04
   Border:   #3a1008
   Text:     #f0d8c8  (warm off-white)
   Muted:    #6a3820  */

*{box-sizing:border-box}

.ldr-root{max-width:860px;margin:0 auto;padding:1rem 1.5rem 5rem;font-family:'Rajdhani',sans-serif;color:#f0d8c8}

/* ── Nav ─────────────────────────────────────────────────────────────── */
.ldr-nav{display:flex;align-items:center;justify-content:space-between;padding:.7rem 1.5rem;background:rgba(14,6,0,.95);border-bottom:1px solid #3a1008;position:sticky;top:0;z-index:40;font-family:'Rajdhani',sans-serif}
.ldr-back{color:#6a3820;font-size:.82rem;letter-spacing:.1em;font-weight:600;text-decoration:none;transition:.15s}
.ldr-back:hover{color:#ff6b35}
.ldr-nav-c{display:flex;align-items:center;gap:.4rem;font-family:'Orbitron',sans-serif;font-size:.65rem;font-weight:800;color:#6a3820;letter-spacing:.14em}
.ldr-nav-dot{width:6px;height:6px;border-radius:50%;background:#cc2200;box-shadow:0 0 6px #cc2200}
.ldr-pack-tier-pill{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.12em;border:1px solid currentColor;border-radius:4px;padding:.15rem .4rem;opacity:.9}

/* ── Score strip ─────────────────────────────────────────────────────── */
.ldr-strip{display:flex;align-items:center;gap:.3rem;padding:.55rem 1.5rem;background:rgba(14,6,0,.98);border-bottom:1px solid #3a1008;overflow-x:auto;scrollbar-width:none;position:sticky;top:41px;z-index:39}
.ldr-strip::-webkit-scrollbar{display:none}
.ldr-sg{display:flex;flex-direction:column;align-items:center;flex-shrink:0;padding:0 .5rem}
.ldr-sv{font-family:'Orbitron',sans-serif;font-size:1rem;font-weight:800;white-space:nowrap}
.ldr-sof{font-size:.6rem;color:#6a3820}
.ldr-sl{font-size:.52rem;letter-spacing:.14em;color:#6a3820;white-space:nowrap;margin-top:.1rem}
.ldr-sdiv{width:1px;height:28px;background:#3a1008;flex-shrink:0}
.ldr-stier{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.82rem;letter-spacing:.1em;white-space:nowrap}
.ldr-sbar{position:absolute;bottom:0;left:0;right:0;height:2px;background:#3a1008}
.ldr-sfill{height:100%;background:linear-gradient(90deg,#cc2200,#ff6b35);transition:width .4s ease}

/* ── Loading ─────────────────────────────────────────────────────────── */
.ldr-loading{display:flex;flex-direction:column;align-items:center;gap:1rem;padding:4rem 0}
.ldr-loading-spinner{width:32px;height:32px;border:2px solid #3a1008;border-top-color:#ff6b35;border-radius:50%;animation:ldr-spin .8s linear infinite}
@keyframes ldr-spin{to{transform:rotate(360deg)}}
.ldr-loading-text{font-family:'Orbitron',sans-serif;font-size:.7rem;letter-spacing:.2em;color:#6a3820}

/* ── Already drafted ─────────────────────────────────────────────────── */
.ldr-already{text-align:center;padding:3rem 1rem}
.ldr-already-icon{font-size:2.5rem;color:#ff6b35;margin-bottom:.5rem}
.ldr-already-title{font-family:'Orbitron',sans-serif;font-size:1.2rem;color:#ff6b35;margin-bottom:.5rem}
.ldr-already-sub{color:#6a3820;font-size:.9rem;margin-bottom:1.5rem}

/* ── Boosted pick ────────────────────────────────────────────────────── */
.ldr-boost-pick{max-width:440px;margin:0 auto;padding:2rem 0}
.ldr-boost-eyebrow{font-size:.65rem;letter-spacing:.22em;color:#6a3820;margin-bottom:.2rem}
.ldr-boost-title{font-family:'Orbitron',sans-serif;font-size:1.5rem;font-weight:800;margin-bottom:.6rem}
.ldr-boost-sub{color:#8a5030;font-size:.9rem;line-height:1.5;margin-bottom:1.4rem}
.ldr-boost-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.4rem}
.ldr-boost-btn{background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:7px;padding:.7rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.95rem;letter-spacing:.1em;color:#8a5030;cursor:pointer;transition:.15s}
.ldr-boost-btn:hover{border-color:#ff6b35;color:#ff6b35}
.ldr-boost-btn.selected{background:rgba(40,8,0,.95)}
.ldr-skip-boost{display:block;margin:.6rem auto 0;background:none;border:none;color:#4a2010;font-family:'Rajdhani',sans-serif;font-size:.78rem;cursor:pointer;text-decoration:underline;transition:.15s}
.ldr-skip-boost:hover{color:#6a3820}

/* ── Week banner ─────────────────────────────────────────────────────── */
.ldr-week-banner{display:flex;align-items:center;justify-content:space-between;background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:8px;padding:.6rem .9rem;margin-bottom:.8rem}
.ldr-wb-week{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800;color:#cc2200;letter-spacing:.12em}
.ldr-wb-count{font-size:.72rem;color:#6a3820;margin-top:.1rem}
.ldr-wb-locks{font-size:.72rem;color:#c8a020;font-weight:600}
.ldr-wb-boost{font-size:.72rem;font-weight:700;letter-spacing:.08em}

/* ── Field / slots ───────────────────────────────────────────────────── */
/*
  Slot size uses a CSS custom property --sw (slot width) set at the
  field level. This means one variable controls everything and we can
  scale it cleanly at each breakpoint without transform hacks.
  Desktop default: 110px  (fits 5 OL slots comfortably at 680px)
*/
.ldr-field{--sw:110px;--sh:173px;--sg:16px;display:flex;flex-direction:column;align-items:center;gap:18px;width:fit-content;margin:0 auto}
.ldr-form-row{display:flex;gap:var(--sg)}
.ldr-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 260px);margin:0 -30px}
.ldr-skill-side{display:flex;gap:var(--sg)}
.ldr-slot-outer{display:flex;flex-direction:column;align-items:center;gap:.2rem}
.ldr-slot-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.65rem;letter-spacing:.12em;color:#6a3820}
.ldr-slot-label.locked{color:#c8a020}
.ldr-slot-label.boosted-label{color:#ff6b35}

/* Pack (empty slot) */
.ldr-pack-wrap{width:var(--sw);height:var(--sh);border-radius:9px;overflow:hidden;position:relative;cursor:default;border:1px solid #2a0c04;transition:.2s}
.ldr-pack-wrap.clickable{cursor:pointer;border-color:#3a1008}
.ldr-pack-wrap.clickable:hover{border-color:#cc2200;box-shadow:0 0 12px rgba(204,34,0,.3)}
.ldr-pack-wrap.boosted{border:2px solid #ff6b35;box-shadow:0 0 14px rgba(255,107,53,.3);animation:ldr-boost-pulse 2s ease-in-out infinite}
@keyframes ldr-boost-pulse{0%,100%{box-shadow:0 0 10px rgba(255,107,53,.3)}50%{box-shadow:0 0 22px rgba(255,107,53,.5)}}
.ldr-pack-img{width:100%;height:100%;object-fit:cover;opacity:.85}
.ldr-pack-boosted-badge{position:absolute;bottom:0;left:0;right:0;background:rgba(14,6,0,.9);font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.52rem;letter-spacing:.1em;text-align:center;padding:.2rem}

/* Active slot */
.ldr-fsl.active{width:var(--sw);height:var(--sh);background:rgba(30,12,4,.9);border:1px solid #cc2200;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem}
.ldr-fsl-pos-small{font-family:'Rajdhani',sans-serif;font-size:.65rem;color:#6a3820;letter-spacing:.1em}
.ldr-fsl-opening{font-family:'Orbitron',sans-serif;font-size:.8rem;color:#ff6b35;animation:ldr-spin .8s linear infinite}

/* Filled card */
.ldr-fsl.has-p{width:var(--sw);height:var(--sh);border-radius:9px;position:relative;overflow:visible;border:none}
.ldr-filled-card{width:100%;height:100%;border-radius:9px;overflow:hidden;position:relative;display:flex;flex-direction:column}
.ldr-fc-topbar{display:flex;align-items:center;justify-content:space-between;padding:.18rem .3rem;background:rgba(4,2,0,.95);flex-shrink:0}
.ldr-fc-pos-badge{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.52rem;color:#0e0600;padding:.08rem .25rem;border-radius:2px}
.ldr-fc-rar-badge{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.45rem;letter-spacing:.08em}
.ldr-fc-art{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ldr-fc-field-lines{position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 10px,rgba(255,107,53,.04) 10px,rgba(255,107,53,.04) 11px)}
.ldr-fc-img{position:absolute;bottom:0;max-height:85%;max-width:90%;object-fit:contain;z-index:5}
.ldr-fc-initial{position:absolute;font-family:'Orbitron',sans-serif;font-size:2.2rem;font-weight:900;color:rgba(255,255,255,.06);z-index:1}
.ldr-fc-info{padding:.2rem .3rem .25rem;background:rgba(4,2,0,.95);flex-shrink:0}
.ldr-fc-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.6rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.1}
.ldr-fc-score{font-family:'Orbitron',sans-serif;font-size:.6rem;font-weight:800;line-height:1.2}
.ldr-fc-team-tag{font-family:'Rajdhani',sans-serif;font-size:.48rem;color:#6a3820;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-fc-lock-badge{position:absolute;top:.2rem;right:.2rem;font-size:.65rem;z-index:10}
.ldr-fc-shine{position:absolute;inset:0;border-radius:9px;background:linear-gradient(135deg,rgba(255,255,255,.06) 0%,transparent 60%);pointer-events:none;z-index:8}

/* ── Cards area ──────────────────────────────────────────────────────── */
.ldr-cards-area{margin-top:1.2rem;padding:0 .25rem}
.ldr-ca-header{margin-bottom:.7rem;text-align:center}
.ldr-cap-tag{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.14em;margin-bottom:.2rem}
.ldr-ca-pos{font-family:'Orbitron',sans-serif;font-size:.78rem;font-weight:800;color:#cc2200;letter-spacing:.14em;margin-bottom:.2rem}
.ldr-ca-status{font-size:.78rem;color:#6a3820;font-weight:600}

.ldr-cards-row{display:flex;gap:.4rem;justify-content:center;flex-wrap:nowrap;overflow-x:auto;padding:.25rem .25rem 1rem}
.ldr-cards-row::-webkit-scrollbar{display:none}

/* Card flip */
.ldr-card{width:calc(19vw - 4px);min-width:110px;max-width:140px;aspect-ratio:125/183;border-radius:11px;perspective:700px;cursor:pointer;flex-shrink:0;position:relative}
.ldr-ci{width:100%;height:100%;transform-style:preserve-3d;transition:transform .55s cubic-bezier(.4,0,.2,1);position:relative;border-radius:11px}
.ldr-card.rev .ldr-ci{transform:rotateY(180deg)}
.ldr-card-back,.ldr-card-front{position:absolute;inset:0;border-radius:11px;backface-visibility:hidden;overflow:hidden}
.ldr-card-back{background:linear-gradient(150deg,#1a0800,#2e0e04);border:1px solid #3a1008;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem}
.ldr-back-grid{position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(204,34,0,.06),rgba(204,34,0,.06) 1px,transparent 1px,transparent 10px),repeating-linear-gradient(-45deg,rgba(204,34,0,.06),rgba(204,34,0,.06) 1px,transparent 1px,transparent 10px)}
.ldr-back-icon{font-size:1.5rem;z-index:1}
.ldr-back-label{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.65rem;letter-spacing:.14em;color:#6a3820;z-index:1}
.ldr-back-league{font-family:'Orbitron',sans-serif;font-size:.48rem;letter-spacing:.18em;color:#3a1008;z-index:1}
.ldr-card-front{transform:rotateY(180deg);display:flex;flex-direction:column;border:1.5px solid var(--rc)}

.ldr-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.22rem .4rem;background:rgba(4,2,0,.95);flex-shrink:0}
.ldr-cf-pos{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.6rem;color:#0e0600;padding:.08rem .28rem;border-radius:2px}
.ldr-cf-rlab{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.5rem;letter-spacing:.1em}
.ldr-cf-art{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;min-height:60px}
.ldr-cf-img{position:absolute;bottom:0;max-height:88%;max-width:90%;object-fit:contain;z-index:5}
.ldr-cf-initial{position:absolute;font-family:'Orbitron',sans-serif;font-size:3rem;font-weight:900;color:rgba(255,255,255,.06);z-index:1}
.ldr-cf-body{padding:.35rem .4rem .4rem;background:rgba(4,2,0,.96);flex-shrink:0}
.ldr-cf-name{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.78rem;color:#f0d8c8;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-cf-team{font-family:'Rajdhani',sans-serif;font-size:.6rem;color:#6a3820;margin-bottom:.25rem}
.ldr-cf-line{height:1px;margin:.2rem 0}
.ldr-cf-score-row{display:flex;align-items:baseline;gap:.25rem}
.ldr-cf-score{font-family:'Orbitron',sans-serif;font-size:.88rem;font-weight:800}
.ldr-cf-ovr{font-family:'Rajdhani',sans-serif;font-size:.55rem;color:#6a3820;letter-spacing:.1em}
.ldr-cf-acc{font-family:'Rajdhani',sans-serif;font-size:.58rem;color:#6a3820;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

/* Card states */
.ldr-card.selectable:hover .ldr-ci{transform:rotateY(180deg) scale(1.04)}
.ldr-card.picked{z-index:10}
.ldr-card.picked .ldr-ci{transform:rotateY(180deg) scale(1.08);box-shadow:0 0 30px var(--rg)}
.ldr-card.rejected{pointer-events:none}
.ldr-card.rejected .ldr-ci{transform:rotateY(180deg) scale(.94);opacity:.35}

/* ── Reveal bar ──────────────────────────────────────────────────────── */
.ldr-reveal-bar{text-align:center;margin:.5rem 0}
.ldr-reveal-btn{background:transparent;border:1.5px solid #cc2200;color:#ff6b35;border-radius:7px;padding:.55rem 1.4rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:.9rem;letter-spacing:.1em;cursor:pointer;transition:.2s}
.ldr-reveal-btn:hover{background:rgba(204,34,0,.12)}

/* ── Empty prompt ────────────────────────────────────────────────────── */
.ldr-empty-prompt{text-align:center;color:#4a2010;padding:1rem 0;font-family:'Rajdhani',sans-serif;font-weight:600;font-size:.85rem;letter-spacing:.1em}
.ldr-ep-arrow{font-size:1.2rem;margin-bottom:.2rem;animation:ldr-bob .9s ease-in-out infinite}
@keyframes ldr-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

/* ── Complete ────────────────────────────────────────────────────────── */
.ldr-complete{padding:.5rem 0}
.ldr-cmp-header{text-align:center;margin-bottom:1.2rem}
.ldr-cmp-eyebrow{font-size:.65rem;letter-spacing:.22em;color:#6a3820;margin-bottom:.3rem}
.ldr-cmp-score{font-family:'Orbitron',sans-serif;font-size:2.6rem;font-weight:900;line-height:1}
.ldr-cmp-label{font-size:.68rem;letter-spacing:.18em;color:#6a3820;margin-top:.2rem}
.ldr-cmp-tier{font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.12em;text-align:center;margin-bottom:1rem}

.ldr-cmp-breakdown{background:rgba(30,12,4,.9);border:1px solid #3a1008;border-radius:10px;padding:.9rem 1rem;margin-bottom:1rem}
.ldr-cmp-bd-row{display:flex;justify-content:space-between;align-items:center;padding:.3rem 0;border-bottom:1px solid #2a0c04;font-family:'Rajdhani',sans-serif;font-weight:600}
.ldr-cmp-bd-row:last-child{border-bottom:none}
.ldr-cmp-bd-row.total{margin-top:.3rem;padding-top:.5rem;border-top:1px solid #3a1008;font-weight:700;font-size:1.05rem}
.ldr-cmp-bd-label{color:#8a5030}
.ldr-cmp-bd-val{font-family:'Orbitron',sans-serif;font-size:.85rem;font-weight:800;color:#f0d8c8}
.ldr-cmp-bonds{padding:.4rem 0 .2rem;display:flex;flex-direction:column;gap:.2rem}
.ldr-cmp-bond-row{display:flex;align-items:center;gap:.4rem;font-size:.78rem;padding:.15rem 0}
.ldr-cmp-bond-icon{flex-shrink:0;font-size:.8rem}
.ldr-cmp-bond-reason{flex:1;color:#8a5030;font-family:'Rajdhani',sans-serif;font-weight:600}
.ldr-cmp-bond-pts{font-family:'Orbitron',sans-serif;font-size:.72rem;font-weight:800;flex-shrink:0}

.ldr-submit-btn{display:block;width:100%;background:linear-gradient(135deg,#8a2000,#cc2200,#ff6b35);color:#fff5ee;border:none;border-radius:9px;padding:.9rem;font-family:'Rajdhani',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.14em;cursor:pointer;transition:.2s;text-decoration:none;text-align:center;box-sizing:border-box}
.ldr-submit-btn:hover:not(:disabled){filter:brightness(1.1);transform:scale(1.01)}
.ldr-submit-btn:disabled{opacity:.5;cursor:default}

.ldr-submitted{text-align:center;padding:.5rem 0}
.ldr-sub-check{font-size:2rem;color:#ff6b35;margin-bottom:.3rem}
.ldr-sub-msg{color:#8a5030;font-size:.9rem;margin-bottom:.8rem;font-family:'Rajdhani',sans-serif;font-weight:600}

.ldr-cmp-field-wrap{margin-top:1.4rem}
.ldr-cmp-field-label{font-size:.62rem;letter-spacing:.18em;color:#6a3820;margin-bottom:.5rem}

/* ── Immortal flash ──────────────────────────────────────────────────── */
.ldr-imm-flash{position:fixed;inset:0;z-index:999;display:flex;align-items:center;justify-content:center;background:rgba(40,220,120,.08);animation:ldr-imm-fade 2.4s ease-out forwards;pointer-events:none}
@keyframes ldr-imm-fade{0%{opacity:1}80%{opacity:1}100%{opacity:0}}
.ldr-imm-text{font-family:'Orbitron',sans-serif;font-size:1.6rem;font-weight:900;color:#28dc78;text-shadow:0 0 30px rgba(40,220,120,.8),0 0 60px rgba(40,220,120,.4);animation:ldr-imm-scale .4s ease-out}
@keyframes ldr-imm-scale{0%{transform:scale(.6)}100%{transform:scale(1)}}

/* ── Responsive ──────────────────────────────────────────────────────── */
/* 
  No scale transforms. Just shrink --sw so slots stay in-flow.
  OL row has 5 slots + 4 gaps. At --sw=110px, --sg=.5rem:
    5*110 + 4*8 = 582px — fine at 640px container.
  At 560px viewport the container is ~520px:
    5*96 + 4*6 = 504px — fine.
  At 400px:
    5*72 + 4*4 = 376px — fine.
*/

@media(max-width:640px){
  .ldr-field{--sw:96px;--sh:152px;--sg:10px}
  .ldr-card{min-width:96px}
  .ldr-skill-spread{width:calc(100% + 160px);margin:0 -20px}
}
@media(max-width:480px){
  .ldr-field{--sw:76px;--sh:120px;--sg:8px}
  .ldr-card{min-width:84px}
  .ldr-skill-spread{width:calc(100% + 120px);margin:0 -16px}
}
@media(max-width:380px){
  .ldr-field{--sw:60px;--sh:94px;--sg:6px}
  .ldr-card{min-width:72px}
  .ldr-skill-spread{width:calc(100% + 80px);margin:0 -10px}
}
`;