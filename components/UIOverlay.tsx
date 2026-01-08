
import React from 'react';
import { GameState } from '../types';
import { ICONS } from '../constants';

interface UIOverlayProps {
  gameState: GameState;
  onHeal: () => void;
  onAttack: () => void;
  onShowMap: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ gameState, onHeal, onAttack, onShowMap }) => {
  const { player, realms } = gameState;
  const currentRealm = realms[player.currentRealmId];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-50">
      {/* Top Bar: Player Stats */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl flex gap-6 items-center">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-indigo-400">LV.{player.level}</span>
              <span className="text-lg font-black tracking-tight">{player.name}</span>
            </div>
            <div className="w-48 h-3 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-red-500 transition-all duration-300" 
                style={{ width: `${(player.health / player.maxHealth) * 100}%` }}
              />
            </div>
            <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-yellow-500 transition-all duration-300" 
                style={{ width: `${(player.stamina / player.maxStamina) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="flex gap-4 border-l border-white/10 pl-6 h-12 items-center">
             <div className="flex flex-col items-center">
                <span className="text-yellow-400 text-xs font-bold uppercase">{ICONS.Sack} Resources</span>
                <span className="text-xl font-mono">{player.resources}</span>
             </div>
             <div className="flex flex-col items-center">
                <span className="text-indigo-400 text-xs font-bold uppercase">{ICONS.Compass} Realm</span>
                <span className="text-xl font-mono">L.{currentRealm.level}</span>
             </div>
          </div>
        </div>

        <button 
          onClick={onShowMap}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-xl shadow-2xl transition-all active:scale-95 pointer-events-auto"
        >
          {ICONS.Map}
        </button>
      </div>

      {/* Discovery Logs */}
      <div className="absolute top-24 left-4 max-w-xs space-y-1 pointer-events-none">
        {gameState.discoveryLog.slice(-5).map((log, i) => (
          <div key={i} className="bg-black/30 backdrop-blur-sm text-xs py-1 px-2 rounded border-l-2 border-indigo-500 animate-fade-in">
            {log}
          </div>
        ))}
      </div>

      {/* Realm Info Center */}
      <div className="self-center text-center space-y-1 opacity-80 mb-20 pointer-events-none">
        <h2 className="text-2xl font-black uppercase tracking-widest text-white/90">{currentRealm.name}</h2>
        <p className="text-sm italic text-white/50">{currentRealm.description}</p>
      </div>

      {/* Bottom Right: Action Buttons */}
      <div className="self-end flex flex-col gap-3 items-center mb-8 mr-4 pointer-events-auto">
        <button 
          onClick={onHeal}
          disabled={player.stamina < 10 || player.health >= player.maxHealth}
          className="w-16 h-16 rounded-full bg-green-600/80 hover:bg-green-500 flex items-center justify-center text-2xl shadow-2xl border-4 border-green-800/50 disabled:grayscale transition-all active:scale-90"
        >
          {ICONS.Heart}
        </button>
        <button 
          onClick={onAttack}
          className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-4xl shadow-2xl border-4 border-red-800/50 transition-all active:scale-90"
        >
          {ICONS.Sword}
        </button>
      </div>
    </div>
  );
};

export default UIOverlay;
