// nfl-minigames-hub/lib/components/RarityEffects.tsx
// Shared rarity visual effects — used by offense, versus, and league draft pages.
// Import: import RarityEffects from '@/lib/components/RarityEffects';

import React from 'react';

type Rarity = 'common' | 'rare' | 'dynasty' | 'transcendent' | 'immortal';

export default function RarityEffects({ rarity, position = 'inner' }: { rarity: Rarity; position?: 'outer' | 'inner' }) {
  if (position === 'outer') {
    return (
      <>
        {rarity === 'rare' && (<div className="pe-ra-spin-wrap"><div className="pe-ra-spin-arc" /><div className="pe-ra-spin-inner" /></div>)}
        {rarity === 'dynasty' && (<div className="pe-ep-dual-wrap"><div className="pe-ep-dual-arc1" /><div className="pe-ep-dual-arc2" /><div className="pe-ep-dual-inner" /></div>)}
        {rarity === 'transcendent' && (<div className="pe-le-plasma-wrap"><div className="pe-le-plasma-arc1" /><div className="pe-le-plasma-arc2" /><div className="pe-le-plasma-inner" /></div>)}
        {rarity === 'immortal' && (
          <>
            <div className="pe-imm-glow-1" /><div className="pe-imm-glow-2" /><div className="pe-imm-glow-3" /><div className="pe-imm-glow-4" />
            <div className="pe-imm-corner-arcs">
              <svg viewBox="0 0 125 183" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute',inset:0,width:'100%',height:'100%',overflow:'visible' } as React.CSSProperties}>
                <path className="pe-imm-arc-glow a1" d="M -6,34 Q -6,-6 34,-6" /><path className="pe-imm-arc-line a1" d="M -6,34 Q -6,-6 34,-6" />
                <path className="pe-imm-arc-glow a2" d="M 91,-6 Q 131,-6 131,34" /><path className="pe-imm-arc-line a2" d="M 91,-6 Q 131,-6 131,34" />
                <path className="pe-imm-arc-glow a3" d="M 131,149 Q 131,189 91,189" /><path className="pe-imm-arc-line a3" d="M 131,149 Q 131,189 91,189" />
                <path className="pe-imm-arc-glow a4" d="M 34,189 Q -6,189 -6,149" /><path className="pe-imm-arc-line a4" d="M 34,189 Q -6,189 -6,149" />
              </svg>
            </div>
            <div className="pe-imm-plasma-wrap"><div className="pe-imm-plasma-arc1" /><div className="pe-imm-plasma-arc2" /><div className="pe-imm-plasma-arc3" /><div className="pe-imm-plasma-inner" /></div>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {rarity === 'common' && (
        <><div className="pe-cm-scan" /><div className="pe-cm-corner tl" /><div className="pe-cm-corner tr" /><div className="pe-cm-corner bl" /><div className="pe-cm-corner br" />
        <div className="pe-cm-heat"><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /><div className="pe-cm-heat-wave" /></div>
        <div className="pe-cm-geo"><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /><div className="pe-cm-geo-line" /></div>
        <div className="pe-cm-scratch-layer"><div className="pe-cm-scratch" /><div className="pe-cm-scratch" /><div className="pe-cm-scratch" /></div>
        <div className="pe-cm-ember-layer"><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /><div className="pe-cm-ember" /></div>
        <div className="pe-cm-bottom-glow" /></>
      )}
      {rarity === 'rare' && (
        <><div className="pe-ra-depth-vig" /><div className="pe-ra-center-glow" />
        <div className="pe-ra-pulse-layer"><div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" /><div className="pe-ra-pulse-ring" /></div>
        <div className="pe-ra-crackle-layer">
          <div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="0,18 12,20 8,28 22,24 16,34" /><polyline className="pe-ra-crackle-path" points="113,88 121,84 117,94 125,90" /></svg></div>
          <div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="0,62 12,58 8,68 20,64 14,76" /><polyline className="pe-ra-crackle-path" points="109,14 119,18 115,28 123,22" /></svg></div>
          <div className="pe-ra-crackle"><svg width="100%" height="100%" viewBox="0 0 125 183"><polyline className="pe-ra-crackle-path" points="2,108 14,104 10,114 24,108" /><polyline className="pe-ra-crackle-path" points="105,50 115,46 111,58 121,52 117,64" /></svg></div>
        </div></>
      )}
      {rarity === 'dynasty' && (
        <><div className="pe-ep-burst"><svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><g transform="translate(100,100)"><line x1="0" y1="-95" x2="0" y2="95" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /><line x1="-95" y1="0" x2="95" y2="0" stroke="rgba(255,215,0,.35)" strokeWidth=".8" /><line x1="-67" y1="-67" x2="67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" /><line x1="67" y1="-67" x2="-67" y2="67" stroke="rgba(255,215,0,.25)" strokeWidth=".8" /></g></svg></div>
        <div className="pe-ep-sparkle-layer"><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /><div className="pe-ep-sparkle" /></div>
        <div className="pe-ep-foil" /><div className="pe-ep-shine" /></>
      )}
      {rarity === 'transcendent' && (
        <><div className="pe-le-aurora"><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /><div className="pe-le-aurora-band" /></div>
        <div className="pe-le-orb-layer"><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /><div className="pe-le-orb" /></div>
        <div className="pe-le-holo" />
        <div className="pe-le-depth-rings"><div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" /><div className="pe-le-depth-ring" /></div>
        <div className="pe-le-bolt-layer">
          <svg className="pe-le-bolt b1" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-mid" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-core" points="8,2 20,28 10,27 26,58 14,56 32,98" /><polyline className="pe-le-bolt-branch" points="26,58 40,68 34,82" /></svg>
          <svg className="pe-le-bolt b2" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-mid" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-core" points="36,0 50,30 38,28 56,62 42,60 62,110" /><polyline className="pe-le-bolt-branch" points="56,62 70,74 62,90" /></svg>
          <svg className="pe-le-bolt b3" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-mid" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-core" points="62,0 76,28 63,26 84,60 68,58 92,108 74,106 88,150" /><polyline className="pe-le-bolt-branch" points="84,60 100,74 90,90" /></svg>
          <svg className="pe-le-bolt b4" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-mid" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-core" points="88,2 100,30 88,28 106,62 92,60 112,104" /><polyline className="pe-le-bolt-branch" points="106,62 118,76 110,92" /></svg>
          <svg className="pe-le-bolt b5" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="116,10 108,36 118,34 104,68 116,66 96,118" /><polyline className="pe-le-bolt-mid" points="116,10 108,36 118,34 104,68 116,66 96,118" /><polyline className="pe-le-bolt-core" points="116,10 108,36 118,34 104,68 116,66 96,118" /></svg>
          <svg className="pe-le-bolt b6" viewBox="0 0 125 183"><polyline className="pe-le-bolt-glow" points="22,15 10,44 22,42 6,78 20,76 2,130" /><polyline className="pe-le-bolt-mid" points="22,15 10,44 22,42 6,78 20,76 2,130" /><polyline className="pe-le-bolt-core" points="22,15 10,44 22,42 6,78 20,76 2,130" /></svg>
        </div>
        <div className="pe-le-tear-layer"><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div><div className="pe-le-tear"><div className="pe-le-tear-inner" /></div></div>
        <div className="pe-le-whiteout w1" /><div className="pe-le-whiteout w2" /><div className="pe-le-whiteout w3" /></>
      )}
      {rarity === 'immortal' && (
        <><div className="pe-imm-slab-layer"><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /><div className="pe-imm-slab" /></div>
        <div className="pe-imm-aurora"><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /><div className="pe-imm-aurora-band" /></div>
        <div className="pe-imm-rings"><div className="pe-imm-ring" /><div className="pe-imm-ring" /><div className="pe-imm-ring" /></div>
        <div className="pe-imm-orb-layer"><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /><div className="pe-imm-orb" /></div>
        <div className="pe-imm-holo" /><div className="pe-imm-foil" />
        <div className="pe-imm-shock"><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-ring" /><div className="pe-imm-shock-core" /></div>
        <div className="pe-imm-spark-layer"><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /><div className="pe-imm-spark" /></div>
        <div className="pe-imm-tear-layer"><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div><div className="pe-imm-tear"><div className="pe-imm-tear-inner" /></div></div>
        <div className="pe-imm-shine" /><div className="pe-imm-shock-flash" /><div className="pe-imm-inner-border" /></>
      )}
    </>
  );
}