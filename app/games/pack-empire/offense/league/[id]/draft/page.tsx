'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  packsForWeek, unlockedSlots, LEAGUE_WEIGHTS, SLOTS, TOTAL_SLOTS,
  calculateTeamScore, getTier, getBoostedTier, BOOSTED_PACK_CONFIG,
} from '@/lib/league-utils';

// Import your player pools — same as main game
import { ALL_PLAYERS } from '@/lib/packs/current-offense-qb';
import { ALL_PLAYERS_V2 } from '@/lib/packs/current-offense-rb';
import { ALL_PLAYERS_V3 } from '@/lib/packs/current-offense-wr';
import { ALL_PLAYERS_V4 } from '@/lib/packs/current-offense-te';
import { ALL_PLAYERS_V5 } from '@/lib/packs/current-offense-ot';
import { ALL_PLAYERS_V6 } from '@/lib/packs/current-offense-iol';
import { ALL_PLAYERS_V7 } from '@/lib/packs/legend-offense';

/* ─── Types ──────────────────────────────────────────────────────────── */
type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';
interface Player { id: string; name: string; pos: string; team: string; score: number; rarity: Rarity; accolades: string[]; }

/* ─── Rarity config ──────────────────────────────────────────────────── */
const RC: Record<Rarity, { label: string; color: string; glow: string; art: string }> = {
  common:       { label: 'COMMON',       color: '#c87840', glow: 'rgba(200,120,60,.6)',  art: 'linear-gradient(150deg,#3d2210,#7a4820)' },
  rare:         { label: 'RARE',         color: '#42c0f8', glow: 'rgba(66,192,248,.7)',  art: 'linear-gradient(150deg,#062840,#104870)' },
  dynasty:      { label: 'DYNASTY',      color: '#ffd700', glow: 'rgba(255,215,0,.8)',   art: 'linear-gradient(150deg,#3a2800,#806010)' },
  transcendent: { label: 'TRANSCENDENT', color: '#e040ff', glow: 'rgba(224,64,255,.85)', art: 'linear-gradient(150deg,#280048,#6010b0)' },
  immortal:     { label: 'IMMORTAL',     color: '#28dc78', glow: 'rgba(40,220,120,.8)',  art: 'linear-gradient(150deg,#021a0a,#04401a)' },
};

const RARITY_MAP: Record<string, Rarity> = {
  epic: 'dynasty', legendary: 'transcendent',
  common: 'common', rare: 'rare', dynasty: 'dynasty', transcendent: 'transcendent', immortal: 'immortal',
};

/* ─── Build player pool ──────────────────────────────────────────────── */
const POOL: Record<string, Player[]> = (() => {
  const keys = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C'] as const;
  return Object.fromEntries(keys.map(k => [k, [
    ...ALL_PLAYERS[k], ...ALL_PLAYERS_V2[k], ...ALL_PLAYERS_V3[k],
    ...ALL_PLAYERS_V4[k], ...ALL_PLAYERS_V5[k], ...ALL_PLAYERS_V6[k], ...ALL_PLAYERS_V7[k],
  ]]));
})() as Record<string, Player[]>;
Object.values(POOL).forEach(arr => arr.forEach(p => { p.rarity = RARITY_MAP[p.rarity] as Rarity ?? p.rarity; }));

function parseCSVRow(row: string): string[] {
  const cols: string[] = []; let cur = ''; let inQ = false;
  for (const c of row) { if (c === '"') { inQ = !inQ; continue; } if (c === ',' && !inQ) { cols.push(cur.trim()); cur = ''; continue; } cur += c; }
  cols.push(cur.trim()); return cols;
}

/* ─── Weighted draw (no captain in league) ───────────────────────────── */
function weightedDraw(poolKey: string, count: number, weights: Record<Rarity, number>, excl: string[] = []): Player[] {
  const avail = (POOL[poolKey] ?? []).filter(p => !excl.includes(p.id));
  if (avail.length === 0) return [];
  const weighted = avail.map(p => ({ p, w: weights[p.rarity] ?? 1 }));
  const used = new Set<string>();
  const result: Player[] = [];
  for (let i = 0; i < Math.min(count, avail.length); i++) {
    const available = weighted.filter(x => !used.has(x.p.id));
    if (available.length === 0) break;
    const totalWeight = available.reduce((sum, x) => sum + x.w, 0);
    let roll = Math.random() * totalWeight;
    for (const item of available) {
      roll -= item.w;
      if (roll <= 0) { result.push(item.p); used.add(item.p.id); break; }
    }
  }
  return result.sort(() => Math.random() - 0.5);
}

/* ─── Slot layout (same as main game) ────────────────────────────────── */
const OL_ROW   = [6, 7, 8, 9, 10];
const WR_LEFT  = [2, 3];
const WR_RIGHT = [5, 4];
const QB_ROW   = [0, 1];

const TIERS = [
  { min: 20001, label: 'GOAT OFFENSE', icon: '🐐', color: '#e040ff' },
  { min: 17001, label: 'HALL OF FAME', icon: '🏛️', color: '#ffd700' },
  { min: 14001, label: 'SUPER BOWL DYNASTY', icon: '🏆', color: '#f0c030' },
  { min: 11001, label: 'ALL-PRO ELITE', icon: '⭐', color: '#42c0f8' },
  { min: 8001,  label: 'PRO BOWL CALIBER', icon: '🔥', color: '#50d870' },
  { min: 5001,  label: 'STARTER QUALITY', icon: '📈', color: '#a0b8d0' },
  { min: 2001,  label: 'BACKUP UNIT', icon: '📋', color: '#808080' },
  { min: 0,     label: 'PRACTICE SQUAD', icon: '🏈', color: '#e8a060' },
];

function getDisplayName(fullName: string): string {
  const parts = fullName.trim().split(' ');
  const suffixes = new Set(['jr.','jr','sr.','sr','ii','iii','iv','v','vi']);
  const last = parts[parts.length - 1];
  if (suffixes.has(last.toLowerCase()) && parts.length >= 3) return `${parts[parts.length - 2]} ${last}`;
  return parts.length > 1 ? `${parts[0][0]}. ${last}` : last;
}

/* ══════════════════════════════════════════════════════════════════════
   LEAGUE DRAFT PAGE — Weekly pack opening with locked players
══════════════════════════════════════════════════════════════════════ */
export default function LeagueDraft() {
  const params   = useParams();
  const router   = useRouter();
  const supabase = createClient();
  const leagueId = params.id as string;

  const [league, setLeague]       = useState<any>(null);
  const [userId, setUserId]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [imageMap, setImageMap]   = useState<Record<string, string>>({});

  // Draft state
  const [lineup, setLineup]             = useState<(Player | null)[]>(Array(TOTAL_SLOTS).fill(null));
  const [lockedPlayers, setLockedPlayers] = useState<{ slot: string; player: Player }[]>([]);
  const [packSi, setPackSi]             = useState<number | null>(null);
  const [packCards, setPackCards]         = useState<Player[]>([]);
  const [revealed, setRevealed]         = useState<boolean[]>([]);
  const [pickedId, setPickedId]         = useState<string | null>(null);
  const [boostedTier, setBoostedTier]   = useState<string | null>(null);
  const [boostedUsed, setBoostedUsed]   = useState(false);
  const [saving, setSaving]             = useState(false);

  const cardsRef = useRef<HTMLDivElement>(null);

  // Load images
  useEffect(() => {
    fetch('/players.csv').then(r => r.ok ? r.text() : Promise.reject()).then(text => {
      const map: Record<string, string> = {};
      text.split('\n').forEach(line => {
        if (!line.trim()) return;
        const cols = parseCSVRow(line);
        if (cols[1] && cols[22]?.startsWith('http')) map[cols[1]] = cols[22];
      });
      setImageMap(map);
    }).catch(() => {});
  }, []);

  // Load league and previous week data
  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const { data: leagueData } = await supabase
        .from('leagues').select('*').eq('id', leagueId).single();
      if (!leagueData) { setLoading(false); return; }
      setLeague(leagueData);

      // Check if already drafted this week
      const { data: existingTeam } = await supabase
        .from('league_teams')
        .select('*')
        .eq('league_id', leagueId)
        .eq('user_id', user.id)
        .eq('week', leagueData.current_week)
        .single();

      if (existingTeam?.draft_complete) {
        router.push(`/games/pack-empire/league/${leagueId}`);
        return;
      }

      // Load locked players from previous week
      if (leagueData.current_week > 1) {
        const { data: prevTeam } = await supabase
          .from('league_teams')
          .select('locked_players')
          .eq('league_id', leagueId)
          .eq('user_id', user.id)
          .eq('week', leagueData.current_week - 1)
          .single();

        if (prevTeam?.locked_players) {
          const locked = prevTeam.locked_players as { slot: string; player: Player }[];
          setLockedPlayers(locked);

          // Pre-fill lineup with locked players
          const newLineup = Array(TOTAL_SLOTS).fill(null) as (Player | null)[];
          locked.forEach(lp => {
            const si = SLOTS.findIndex(s => s.key === lp.slot);
            if (si >= 0) newLineup[si] = lp.player;
          });
          setLineup(newLineup);
        }

        // Determine boosted pack tier from previous week's ranking
        const { data: prevStandings } = await supabase
          .from('league_teams')
          .select('user_id, total_score')
          .eq('league_id', leagueId)
          .eq('week', leagueData.current_week - 1)
          .eq('draft_complete', true)
          .order('total_score', { ascending: false });

        if (prevStandings) {
          const { data: members } = await supabase
            .from('league_members')
            .select('user_id')
            .eq('league_id', leagueId);

          const myRank = prevStandings.findIndex(s => s.user_id === user.id) + 1;
          if (myRank > 0) {
            const tier = getBoostedTier(myRank, members?.length || 0);
            setBoostedTier(tier);
          }
        }
      }

      setLoading(false);
    }
    init();
  }, [leagueId]);

  const totalScore  = lineup.reduce((s, p) => s + (p?.score ?? 0), 0);
  const filled      = lineup.filter(Boolean).length;
  const tier        = TIERS.find(t => totalScore >= t.min)!;
  const isBusy      = packCards.length > 0;
  const hiddenCount = revealed.filter(r => !r).length;
  const anyRevealed = revealed.some(Boolean);
  const availableSlots = unlockedSlots(lockedPlayers);
  const totalPacks  = league ? packsForWeek(league.current_week) : 0;
  const packsOpened = filled - lockedPlayers.length;
  const packsLeft   = totalPacks - packsOpened;
  const isComplete  = filled === TOTAL_SLOTS;

  const isLockedSlot = useCallback((si: number) => {
    return lockedPlayers.some(lp => lp.slot === SLOTS[si].key);
  }, [lockedPlayers]);

  const openPack = useCallback((si: number) => {
    const excl = lineup.filter(Boolean).map(p => p!.id);

    // Check if this should be the boosted pack
    let weights = LEAGUE_WEIGHTS.normal;
    if (boostedTier && !boostedUsed && BOOSTED_PACK_CONFIG[boostedTier]) {
      weights = BOOSTED_PACK_CONFIG[boostedTier].weights;
      setBoostedUsed(true);
    }

    const cards = weightedDraw(SLOTS[si].pool, 5, weights, excl);
    setPackSi(si);
    setPackCards(cards);
    setRevealed(Array(cards.length).fill(false));
    setPickedId(null);
    setTimeout(() => { cardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
  }, [lineup, boostedTier, boostedUsed]);

  const clickSlot = useCallback((si: number) => {
    if (isBusy || pickedId !== null || isLockedSlot(si) || lineup[si]) return;
    openPack(si);
  }, [isBusy, pickedId, isLockedSlot, lineup, openPack]);

  const revealOne = useCallback((i: number) => {
    setRevealed(prev => { const n = [...prev]; n[i] = true; return n; });
  }, []);

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
        return n;
      });
      setPackCards([]); setRevealed([]); setPickedId(null); setPackSi(null);
    }, 650);
  }, [pickedId, revealed, revealOne, packCards, packSi]);

  // Save completed draft
  const saveDraft = useCallback(async () => {
    if (!isComplete || saving) return;
    setSaving(true);
    try {
      const { baseScore, chemistryScore, totalScore: finalScore, chemistry } = calculateTeamScore(lineup);

      // Build new locked players list (carry forward all existing + this week's pick will be added in lock page)
      const { error } = await supabase.from('league_teams').upsert({
        league_id: leagueId,
        user_id: userId,
        season: league.season_number || 1,
        week: league.current_week,
        lineup,
        locked_players: lockedPlayers, // carry forward existing locks
        total_score: finalScore,
        chemistry_score: chemistryScore,
        chemistry_breakdown: chemistry,
        boosted_pack_tier: boostedTier,
        draft_complete: true,
      }, { onConflict: 'league_id,user_id,season,week' });

      if (error) throw error;
      router.push(`/games/pack-empire/league/${leagueId}`);
    } catch (e: any) {
      alert('Failed to save: ' + e.message);
    } finally {
      setSaving(false);
    }
  }, [isComplete, saving, lineup, lockedPlayers, boostedTier, leagueId, userId, league, supabase, router]);

  if (loading) return (
    <div style={{ background: '#050a18', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#3a6080', fontFamily: 'Orbitron, sans-serif', letterSpacing: '.2em' }}>LOADING...</div>
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: DRAFT_STYLES }} />

      <nav className="ldr-nav">
        <Link href={`/games/pack-empire/league/${leagueId}`} className="ldr-back">← Dashboard</Link>
        <div className="ldr-title"><span className="ldr-pip" />WEEK {league?.current_week} DRAFT</div>
        <div />
      </nav>

      {/* Score Strip */}
      <div className="ldr-strip">
        <div className="ldr-sg">
          <div className="ldr-sv" style={{ color: tier.color }}>{totalScore.toLocaleString()}</div>
          <div className="ldr-sl">TOTAL SCORE</div>
        </div>
        <div className="ldr-sdiv" />
        <div className="ldr-sg">
          <div className="ldr-sv">{filled}<span className="ldr-sof">/11</span></div>
          <div className="ldr-sl">FILLED</div>
        </div>
        <div className="ldr-sdiv" />
        <div className="ldr-sg">
          <div className="ldr-sv">{packsLeft}</div>
          <div className="ldr-sl">PACKS LEFT</div>
        </div>
        <div className="ldr-sdiv" />
        <div className="ldr-sg">
          <div className="ldr-sv">{lockedPlayers.length}</div>
          <div className="ldr-sl">LOCKED</div>
        </div>
      </div>

      <div className="ldr-root">
        {/* Boosted pack notification */}
        {boostedTier && !boostedUsed && BOOSTED_PACK_CONFIG[boostedTier] && (
          <div className="ldr-boosted-banner" style={{
            borderColor: BOOSTED_PACK_CONFIG[boostedTier].color + '44',
            background: `rgba(${boostedTier === 'elite' ? '255,215,0' : boostedTier === 'premium' ? '66,192,248' : '160,184,208'},.04)`,
          }}>
            <div style={{ color: BOOSTED_PACK_CONFIG[boostedTier].color, fontWeight: 800, letterSpacing: '.12em', fontSize: '.82rem' }}>
              {BOOSTED_PACK_CONFIG[boostedTier].label}
            </div>
            <div style={{ color: '#3a6080', fontSize: '.72rem' }}>
              Your next pack will use boosted odds! Choose wisely.
            </div>
          </div>
        )}

        {/* Formation */}
        <div className="ldr-formation">
          <div className="ldr-field">
            {/* OL Row */}
            <div className="ldr-form-row">
              {OL_ROW.map(si => (
                <SlotCard key={SLOTS[si].key} si={si} player={lineup[si]} locked={isLockedSlot(si)}
                  active={packSi === si} canOpen={!lineup[si] && !isBusy && !isLockedSlot(si)}
                  onClick={() => clickSlot(si)} imageMap={imageMap}
                  isBoosted={boostedTier && !boostedUsed ? true : false} />
              ))}
            </div>
            {/* Skill spread */}
            <div className="ldr-skill-spread">
              <div className="ldr-skill-side">
                {WR_LEFT.map(si => (
                  <SlotCard key={SLOTS[si].key} si={si} player={lineup[si]} locked={isLockedSlot(si)}
                    active={packSi === si} canOpen={!lineup[si] && !isBusy && !isLockedSlot(si)}
                    onClick={() => clickSlot(si)} imageMap={imageMap}
                    isBoosted={boostedTier && !boostedUsed ? true : false} />
                ))}
              </div>
              <div className="ldr-skill-side">
                {WR_RIGHT.map(si => (
                  <SlotCard key={SLOTS[si].key} si={si} player={lineup[si]} locked={isLockedSlot(si)}
                    active={packSi === si} canOpen={!lineup[si] && !isBusy && !isLockedSlot(si)}
                    onClick={() => clickSlot(si)} imageMap={imageMap}
                    isBoosted={boostedTier && !boostedUsed ? true : false} />
                ))}
              </div>
            </div>
            {/* QB/RB */}
            <div className="ldr-form-row">
              {QB_ROW.map(si => (
                <SlotCard key={SLOTS[si].key} si={si} player={lineup[si]} locked={isLockedSlot(si)}
                  active={packSi === si} canOpen={!lineup[si] && !isBusy && !isLockedSlot(si)}
                  onClick={() => clickSlot(si)} imageMap={imageMap}
                  isBoosted={boostedTier && !boostedUsed ? true : false} />
              ))}
            </div>
          </div>
        </div>

        {/* Pack Cards */}
        {packCards.length > 0 && (
          <div className="ldr-cards-area" ref={cardsRef}>
            <div className="ldr-ca-header">
              {packSi !== null && boostedUsed && boostedTier && BOOSTED_PACK_CONFIG[boostedTier] && (
                <div className="ldr-boosted-tag" style={{ color: BOOSTED_PACK_CONFIG[boostedTier].color }}>
                  {BOOSTED_PACK_CONFIG[boostedTier].label} ACTIVATED
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
                const rc = RC[card.rarity];
                const isRev = revealed[i];
                const isPick = pickedId === card.id;
                const isRej = !!pickedId && pickedId !== card.id;
                const imgSrc = imageMap[card.name];
                return (
                  <div key={card.id + i}
                    className={`ldr-card${isRev ? ' rev' : ''}${isPick ? ' picked' : ''}${isRej ? ' rejected' : ''}${isRev && !pickedId ? ' selectable' : ''}`}
                    onClick={() => handleCardClick(i)}
                    style={{ '--rc': rc.color, '--rg': rc.glow, '--art': rc.art } as React.CSSProperties}>
                    <div className="ldr-ci">
                      <div className="ldr-card-back">
                        <div className="ldr-back-icon">🏈</div>
                        <div className="ldr-back-label">CLICK TO REVEAL</div>
                      </div>
                      <div className="ldr-card-front">
                        <div className="ldr-cf-topbar">
                          <div className="ldr-cf-pos" style={{ background: rc.color }}>{card.pos}</div>
                          <div className="ldr-cf-rlab" style={{ color: rc.color }}>{rc.label}</div>
                        </div>
                        <div className="ldr-cf-art" style={{ background: rc.art }}>
                          {imgSrc && <img src={imgSrc} alt={card.name} className="ldr-cf-img" onError={e => (e.currentTarget.style.display='none')} />}
                          <div className="ldr-cf-initial">{card.name.charAt(0)}</div>
                        </div>
                        <div className="ldr-cf-body">
                          <div className="ldr-cf-name">{card.name}</div>
                          <div className="ldr-cf-team">{card.team}</div>
                          <div className="ldr-cf-line" style={{ background: rc.color }} />
                          <div className="ldr-cf-score" style={{ color: rc.color }}>{card.score.toLocaleString()}</div>
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
                <button className="ldr-reveal-btn" onClick={revealAll}>REVEAL ALL {hiddenCount} REMAINING</button>
              </div>
            )}
          </div>
        )}

        {/* Empty prompt */}
        {!isBusy && !isComplete && (
          <div className="ldr-prompt">
            <div style={{ fontSize: '1.8rem', color: '#1a3050', marginBottom: '.3rem' }}>↑</div>
            <div>Tap any unlocked pack to draft your player</div>
            <div style={{ fontSize: '.72rem', color: '#1a3050' }}>{packsLeft} packs remaining this week</div>
          </div>
        )}

        {/* Complete */}
        {isComplete && (
          <div className="ldr-complete">
            <div className="ldr-comp-icon">{tier.icon}</div>
            <div className="ldr-comp-tier" style={{ color: tier.color }}>{tier.label}</div>
            <div className="ldr-comp-score">{totalScore.toLocaleString()}</div>
            <div className="ldr-comp-lbl">WEEK {league?.current_week} SCORE</div>
            <button className="ldr-save-btn" onClick={saveDraft} disabled={saving}>
              {saving ? 'SAVING...' : '✅ SUBMIT LINEUP'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

/* ── Slot Component ── */
function SlotCard({ si, player, locked, active, canOpen, onClick, imageMap, isBoosted }: {
  si: number; player: Player | null; locked: boolean; active: boolean;
  canOpen: boolean; onClick: () => void; imageMap: Record<string, string>;
  isBoosted: boolean;
}) {
  const slot = SLOTS[si];
  const rc = player ? RC[player.rarity] : null;
  const imgSrc = player ? imageMap[player.name] : undefined;

  return (
    <div className="ldr-slot-outer">
      {player ? (
        <div className={`ldr-fsl has-p${locked ? ' locked' : ''}`}
          style={{ '--rc': rc!.color, '--rg': rc!.glow } as React.CSSProperties}>
          {locked && <div className="ldr-lock-badge">🔒</div>}
          <div className="ldr-fc-topbar">
            <div className="ldr-fc-pos" style={{ background: rc!.color }}>{player.pos}</div>
            <div className="ldr-fc-rar" style={{ color: rc!.color }}>{rc!.label}</div>
          </div>
          <div className="ldr-fc-art" style={{ background: rc!.art }}>
            {imgSrc && <img src={imgSrc} alt={player.name} className="ldr-fc-img" onError={e => (e.currentTarget.style.display='none')} />}
          </div>
          <div className="ldr-fc-info">
            <div className="ldr-fc-name" style={{ color: rc!.color }}>{getDisplayName(player.name)}</div>
            <div className="ldr-fc-score">{player.score.toLocaleString()}</div>
          </div>
        </div>
      ) : active ? (
        <div className="ldr-fsl active">
          <div className="ldr-fsl-pos">{slot.short}</div>
          <div className="ldr-fsl-opening">…</div>
        </div>
      ) : (
        <div className={`ldr-fsl empty${canOpen ? ' clickable' : ''}`}
          onClick={canOpen ? onClick : undefined}>
          <div className="ldr-fsl-pos">{slot.short}</div>
          {canOpen && isBoosted && <div className="ldr-boosted-indicator">⚡</div>}
          <div className="ldr-fsl-label">{canOpen ? 'TAP' : locked ? '🔒' : '—'}</div>
        </div>
      )}
      <div className={`ldr-slot-label${locked ? ' locked' : ''}`}>
        {locked ? '🔒 ' : ''}{slot.short}
      </div>
    </div>
  );
}

const DRAFT_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Barlow+Condensed:wght@400;500;600;700;800&family=Barlow:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

.ldr-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:1.3rem 1.2rem;border-bottom:2px solid #0d1835;position:sticky;top:0;background:#050a18;z-index:30}
.ldr-back{color:#9a28dc;text-decoration:none;font-family:'Barlow Condensed',sans-serif;font-size:1rem;font-weight:700}
.ldr-title{display:flex;align-items:center;gap:.6rem;font-family:'Orbitron',sans-serif;font-weight:700;font-size:1rem;letter-spacing:.18em;color:#9a28dc;justify-self:center}
.ldr-pip{width:8px;height:8px;border-radius:50%;background:#9a28dc;box-shadow:0 0 10px #9a28dc;flex-shrink:0}

.ldr-strip{background:rgba(5,10,24,.96);border-bottom:2px solid #0d1835;display:flex;align-items:center;padding:.5rem 1.2rem;position:sticky;top:52px;z-index:20}
.ldr-sg{flex:1;text-align:center}
.ldr-sv{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.2rem;color:#d4e8f8}
.ldr-sof{font-size:.8rem;color:#2a4060}
.ldr-sl{font-size:.48rem;color:#2a4060;letter-spacing:.18em;text-transform:uppercase;margin-top:2px}
.ldr-sdiv{width:1px;height:36px;background:#0d1835;flex-shrink:0}

.ldr-root{min-height:calc(100vh - 100px);background:#050a18;padding:.8rem 1rem 3rem;max-width:1200px;margin:0 auto}

.ldr-boosted-banner{border:2px solid;border-radius:10px;padding:.7rem 1rem;margin-bottom:.8rem;text-align:center;font-family:'Barlow Condensed',sans-serif}

.ldr-formation{background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px;padding:.8rem .6rem;margin-bottom:.8rem;overflow:hidden}
.ldr-field{display:flex;flex-direction:column;align-items:center;gap:16px;width:fit-content;margin:0 auto}
.ldr-form-row{display:flex;gap:14px}
.ldr-skill-spread{display:flex;justify-content:space-between;align-items:flex-end;width:calc(100% + 300px);margin:0 -40px}
.ldr-skill-side{display:flex;gap:16px}

.ldr-slot-outer{display:flex;flex-direction:column;align-items:center;gap:3px;flex-shrink:0}
.ldr-slot-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.58rem;letter-spacing:.12em;color:#3a6080;text-align:center}
.ldr-slot-label.locked{color:#9a28dc}

.ldr-fsl{width:110px;height:160px;border-radius:10px;overflow:hidden;display:flex;flex-direction:column;position:relative;transition:all .2s;flex-shrink:0}
.ldr-fsl.has-p{background:#040810;border:2px solid rgba(255,255,255,.18);box-shadow:0 0 14px var(--rg,transparent)}
.ldr-fsl.has-p.locked{border-color:rgba(154,40,220,.5);box-shadow:0 0 18px rgba(154,40,220,.3),0 0 14px var(--rg,transparent)}
.ldr-fsl.active{background:rgba(154,40,220,.08);border:2px solid #9a28dc;box-shadow:0 0 18px rgba(154,40,220,.4);display:flex;align-items:center;justify-content:center}
.ldr-fsl.empty{background:rgba(4,8,16,.5);border:2px solid #0d1835;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.3rem}
.ldr-fsl.empty.clickable{cursor:pointer;border-color:#1a3050}
.ldr-fsl.empty.clickable:hover{border-color:#9a28dc;background:rgba(154,40,220,.05);transform:translateY(-4px)}

.ldr-lock-badge{position:absolute;top:3px;right:3px;font-size:.65rem;z-index:5;background:rgba(5,10,24,.8);border-radius:3px;padding:1px 3px}
.ldr-boosted-indicator{font-size:.8rem;color:#ffd700;animation:pulse-glow 1.5s ease-in-out infinite}
@keyframes pulse-glow{0%,100%{opacity:.5}50%{opacity:1}}

.ldr-fsl-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.65rem;letter-spacing:.12em;color:#2a4060}
.ldr-fsl-opening{font-size:.6rem;color:#9a28dc;animation:blink .9s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.ldr-fsl-label{font-size:.55rem;color:#1a3050;font-family:'Barlow Condensed',sans-serif}

.ldr-fc-topbar{height:22px;display:flex;align-items:center;justify-content:space-between;padding:.2rem .3rem;background:rgba(4,8,16,.95)}
.ldr-fc-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.5rem;letter-spacing:.1em;color:#fff;padding:1px 4px;border-radius:2px}
.ldr-fc-rar{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.45rem;letter-spacing:.15em}
.ldr-fc-art{flex:1;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ldr-fc-img{position:absolute;bottom:0;left:50%;transform:translateX(-50%);height:105%;width:auto;object-fit:contain;object-position:center bottom;z-index:2}
.ldr-fc-info{padding:.25rem .35rem .2rem;background:rgba(4,8,16,.95)}
.ldr-fc-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.75rem;line-height:1.1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ldr-fc-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:.8rem;color:#d4e8f8}

.ldr-cards-area{background:rgba(6,10,22,.9);border:1px solid #0d1835;border-radius:14px;padding:1rem;margin-bottom:.8rem}
.ldr-ca-header{text-align:center;margin-bottom:.8rem}
.ldr-boosted-tag{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.65rem;letter-spacing:.18em;margin-bottom:.3rem}
.ldr-ca-pos{font-family:'Orbitron',sans-serif;font-weight:700;font-size:1.1rem;letter-spacing:.08em;color:#d4e8f8}
.ldr-ca-status{font-size:.75rem;color:#3a6080;letter-spacing:.06em;font-family:'Barlow Condensed',sans-serif}

.ldr-cards-row{display:flex;gap:.5rem;justify-content:center;flex-wrap:wrap;padding:.2rem 0}
.ldr-card{width:130px;flex-shrink:0;perspective:1000px;cursor:pointer;transition:transform .2s,opacity .3s;position:relative;z-index:1}
.ldr-card:hover{z-index:10}
.ldr-card.rev.selectable:hover{transform:translateY(-12px) scale(1.06)}
.ldr-card.picked{transform:scale(1.06) translateY(-12px);z-index:20}
.ldr-card.rejected{opacity:.2;transform:scale(.9);filter:grayscale(.6)}
.ldr-ci{position:relative;width:100%;height:200px;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,0,.2,1);overflow:hidden;border-radius:10px}
.ldr-card.rev .ldr-ci{transform:rotateY(180deg)}
.ldr-card-back,.ldr-card-front{position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;overflow:hidden}
.ldr-card-back{background:linear-gradient(155deg,#080e24,#0c1840);border:2px solid #1a3060;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.4rem}
.ldr-back-icon{font-size:2rem;opacity:.18}
.ldr-back-label{font-size:.55rem;letter-spacing:.18em;color:#1a3060;font-family:'Barlow Condensed',sans-serif}
.ldr-card-front{background:linear-gradient(170deg,#080e24,#0b1438);border:2px solid var(--rc,#333);transform:rotateY(180deg);box-shadow:0 0 16px var(--rg,transparent);display:flex;flex-direction:column}
.ldr-cf-topbar{display:flex;align-items:center;justify-content:space-between;padding:.3rem .4rem .15rem}
.ldr-cf-pos{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.58rem;letter-spacing:.1em;color:#fff;padding:1px 4px;border-radius:3px}
.ldr-cf-rlab{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:.48rem;letter-spacing:.16em}
.ldr-cf-art{height:80px;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.ldr-cf-img{position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);height:115%;width:auto;object-fit:contain;z-index:2}
.ldr-cf-initial{font-family:'Orbitron',sans-serif;font-weight:900;font-size:3.5rem;color:rgba(255,255,255,.1)}
.ldr-cf-body{padding:.3rem .4rem .35rem;flex:1}
.ldr-cf-name{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:.82rem;color:#e0eef8;line-height:1.15;margin-bottom:1px}
.ldr-cf-team{font-size:.48rem;color:#3a6080;margin-bottom:.2rem}
.ldr-cf-line{height:1.5px;margin:.2rem 0;opacity:.4}
.ldr-cf-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.2rem;line-height:1;margin-bottom:.2rem}
.ldr-cf-acc{font-size:.42rem;color:#3a6080;line-height:1.5;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

.ldr-reveal-bar{text-align:center;margin-top:.8rem}
.ldr-reveal-btn{background:linear-gradient(135deg,#0d1835,#142040);border:2px solid #9a28dc;border-radius:8px;color:#9a28dc;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.78rem;letter-spacing:.14em;padding:.5rem 1.8rem;cursor:pointer;transition:.2s}
.ldr-reveal-btn:hover{background:rgba(154,40,220,.1);box-shadow:0 0 20px rgba(154,40,220,.3)}

.ldr-prompt{text-align:center;padding:1rem;color:#3a6080;font-family:'Barlow Condensed',sans-serif;font-size:.88rem;letter-spacing:.08em}

.ldr-complete{text-align:center;padding:1.5rem;background:rgba(8,14,30,.7);border:1px solid #0d1835;border-radius:14px}
.ldr-comp-icon{font-size:2.5rem;margin-bottom:.4rem}
.ldr-comp-tier{font-family:'Orbitron',sans-serif;font-weight:900;font-size:1.3rem;letter-spacing:.1em;margin-bottom:.3rem}
.ldr-comp-score{font-family:'Orbitron',sans-serif;font-weight:900;font-size:2.5rem;line-height:1;background:linear-gradient(135deg,#7a18b8,#9a28dc,#b848fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.ldr-comp-lbl{font-size:.55rem;color:#2a4060;letter-spacing:.22em;margin-top:.3rem;margin-bottom:1rem}
.ldr-save-btn{background:linear-gradient(135deg,#5d108a,#9a28dc);color:#fff;border:none;border-radius:10px;padding:14px 28px;font-family:'Orbitron',sans-serif;font-weight:700;font-size:.92rem;letter-spacing:.12em;cursor:pointer;transition:.2s}
.ldr-save-btn:hover{filter:brightness(1.15);transform:scale(1.02)}
.ldr-save-btn:disabled{opacity:.5;cursor:default}

@media(max-width:900px){.ldr-fsl{width:90px;height:132px}.ldr-skill-spread{width:calc(100% + 160px);margin:0 -30px}}
@media(max-width:600px){.ldr-fsl{width:72px;height:110px}.ldr-card{width:calc(19vw - 4px);min-width:100px}.ldr-skill-spread{width:calc(100% + 80px);margin:0 -15px}.ldr-form-row{gap:6px}.ldr-skill-side{gap:6px}}
`;
