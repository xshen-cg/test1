
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState, Point, Realm, Connector, EntityType, RealmStats } from './types';
import { 
  REALM_SIZE, 
  PLAYER_SPEED, 
  ENTITY_RADIUS, 
  STAMINA_REGEN_RATE, 
  STAMINA_CONSUMPTION_TRAVEL, 
  STAMINA_CONSUMPTION_HEAL,
  STAMINA_CONSUMPTION_DEATH,
  REALM_TYPES
} from './constants';
import { createInitialRealm, getDistance, generateConnector, spawnMobs } from './engine/utils';
import { generateRealmDetails } from './services/geminiService';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import Joystick from './components/Joystick';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [joystickVector, setJoystickVector] = useState<Point>({ x: 0, y: 0 });
  const [showWorldMap, setShowWorldMap] = useState(false);
  
  // Initialize game
  useEffect(() => {
    const playerId = 'player-' + Math.random().toString(36).substr(2, 9);
    const homeRealm = createInitialRealm(playerId);
    setGameState({
      player: {
        id: playerId,
        name: 'The Wanderer',
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        level: 1,
        experience: 0,
        position: { x: REALM_SIZE / 2, y: REALM_SIZE / 2 },
        currentRealmId: homeRealm.id,
        inventory: [],
        resources: 100,
        homeRealmId: homeRealm.id
      },
      realms: { [homeRealm.id]: homeRealm },
      discoveryLog: ['Welcome to the Lost World, Nomad.']
    });
  }, []);

  const handleRealmTransition = useCallback(async (connector: Connector) => {
    if (!gameState) return;

    const { player, realms } = gameState;
    const currentRealm = realms[player.currentRealmId];

    if (player.stamina < STAMINA_CONSUMPTION_TRAVEL) {
      setGameState(prev => prev ? {
        ...prev,
        discoveryLog: [...prev.discoveryLog, "Too exhausted to travel. Need rest."]
      } : null);
      return;
    }

    let targetRealmId = connector.targetRealmId;
    let nextRealms = { ...realms };

    if (!connector.registered) {
      // Immediate feedback for the user
      setGameState(prev => prev ? {
        ...prev,
        discoveryLog: [...prev.discoveryLog, "Scanning the horizon for a path..."]
      } : null);

      // Generate new higher level realm
      const nextLevel = currentRealm.level + 1;
      const type = REALM_TYPES[Math.floor(Math.random() * REALM_TYPES.length)].type;
      const details = await generateRealmDetails(nextLevel, type);
      
      const newId = `realm-${Math.random().toString(36).substr(2, 9)}`;
      const newRealm: Realm = {
        id: newId,
        name: details.name,
        description: details.description,
        level: nextLevel,
        stats: {
          attackSpeedBonus: 0.1 * nextLevel,
          healthRegenBonus: 0.05 * nextLevel,
          magicFindBonus: 0.05 * nextLevel,
          resourceMultiplier: nextLevel
        },
        connectors: Array.from({ length: nextLevel }, (_, i) => generateConnector(`conn-${newId}-${i}`, i, nextLevel)),
        entities: spawnMobs(nextLevel),
        ownerId: null,
        isHome: false,
        type: type as any
      };

      // Register back-link
      newRealm.connectors[0].targetRealmId = currentRealm.id;
      newRealm.connectors[0].registered = true;
      targetRealmId = newRealm.id;

      // Update current realm connector
      const updatedConnectors = currentRealm.connectors.map(c => 
        c.id === connector.id ? { ...c, registered: true, targetRealmId: newRealm.id } : c
      );

      nextRealms[currentRealm.id] = { ...currentRealm, connectors: updatedConnectors };
      nextRealms[newRealm.id] = newRealm;
    }

    if (targetRealmId) {
      setGameState(prev => {
        if (!prev) return null;
        return {
          ...prev,
          realms: nextRealms,
          player: {
            ...prev.player,
            currentRealmId: targetRealmId!,
            position: { x: REALM_SIZE / 2, y: REALM_SIZE / 2 },
            stamina: prev.player.stamina - STAMINA_CONSUMPTION_TRAVEL
          },
          discoveryLog: [...prev.discoveryLog, `Successfully ventured into ${nextRealms[targetRealmId!].name}`]
        };
      });
    }
  }, [gameState]);

  // Main Game Loop
  useEffect(() => {
    if (!gameState) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (!prev) return null;

        const { player, realms } = prev;
        const currentRealm = realms[player.currentRealmId];
        
        // 1. Move Player
        let nextX = player.position.x + joystickVector.x * PLAYER_SPEED;
        let nextY = player.position.y + joystickVector.y * PLAYER_SPEED;
        
        // Clamp to realm bounds
        nextX = Math.max(ENTITY_RADIUS, Math.min(REALM_SIZE - ENTITY_RADIUS, nextX));
        nextY = Math.max(ENTITY_RADIUS, Math.min(REALM_SIZE - ENTITY_RADIUS, nextY));

        // 2. Check Connectors
        const touchingConnector = currentRealm.connectors.find(c => 
          getDistance({ x: nextX, y: nextY }, c.position) < 50
        );

        if (touchingConnector) {
          handleRealmTransition(touchingConnector);
          return prev; // Stop movement update during transition
        }

        // 3. Entity Logic (Basic AI)
        const nextEntities = currentRealm.entities.map(entity => {
          if (entity.isAggressive && getDistance(entity.position, player.position) < 200) {
            // Move toward player
            const dx = player.position.x - entity.position.x;
            const dy = player.position.y - entity.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 30) {
              return {
                ...entity,
                position: {
                  x: entity.position.x + (dx / dist) * 2,
                  y: entity.position.y + (dy / dist) * 2
                }
              };
            }
          }
          return entity;
        });

        // 4. Combat Checks (Auto-attack mobs near player)
        // (Simplified: mobs attack player if in range)
        let finalHealth = player.health;
        nextEntities.forEach(entity => {
          if (entity.isAggressive && getDistance(entity.position, player.position) < 40) {
             const now = Date.now();
             if (!entity.lastAttackTime || now - entity.lastAttackTime > 1000) {
                finalHealth -= (entity.damage || 5);
                entity.lastAttackTime = now;
             }
          }
        });

        // Regen Stamina
        const finalStamina = Math.min(player.maxStamina, player.stamina + STAMINA_REGEN_RATE);

        // Death Handling
        if (finalHealth <= 0) {
          return {
            ...prev,
            player: {
              ...prev.player,
              health: player.maxHealth,
              stamina: Math.max(0, player.stamina - STAMINA_CONSUMPTION_DEATH),
              position: { x: REALM_SIZE / 2, y: REALM_SIZE / 2 },
              currentRealmId: player.homeRealmId
            },
            discoveryLog: [...prev.discoveryLog, "Defeated! You awake back at your sanctuary."]
          };
        }

        return {
          ...prev,
          player: {
            ...prev.player,
            position: { x: nextX, y: nextY },
            health: finalHealth,
            stamina: finalStamina
          },
          realms: {
            ...prev.realms,
            [player.currentRealmId]: { ...currentRealm, entities: nextEntities }
          }
        };
      });
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [gameState, joystickVector, handleRealmTransition]);

  const handleAttack = useCallback(() => {
    if (!gameState) return;
    
    setGameState(prev => {
      if (!prev) return null;
      const { player, realms } = prev;
      const currentRealm = realms[player.currentRealmId];
      
      const nearEntityIdx = currentRealm.entities.findIndex(e => 
        getDistance(e.position, player.position) < 100
      );

      if (nearEntityIdx === -1) return prev;

      const entities = [...currentRealm.entities];
      const entity = { ...entities[nearEntityIdx] };
      
      entity.health -= 25; // Player damage
      
      if (entity.health <= 0) {
        // Kill entity
        entities.splice(nearEntityIdx, 1);
        return {
          ...prev,
          player: { ...player, resources: player.resources + 10 * currentRealm.level },
          realms: {
            ...realms,
            [player.currentRealmId]: { ...currentRealm, entities }
          },
          discoveryLog: [...prev.discoveryLog, `Defeated ${entity.name}. Looted resources!`]
        };
      }

      entities[nearEntityIdx] = entity;
      return {
        ...prev,
        realms: {
          ...realms,
          [player.currentRealmId]: { ...currentRealm, entities }
        }
      };
    });
  }, [gameState]);

  const handleHeal = useCallback(() => {
    setGameState(prev => {
      if (!prev || prev.player.stamina < STAMINA_CONSUMPTION_HEAL) return prev;
      return {
        ...prev,
        player: {
          ...prev.player,
          health: Math.min(prev.player.maxHealth, prev.player.health + 30),
          stamina: prev.player.stamina - STAMINA_CONSUMPTION_HEAL
        }
      };
    });
  }, []);

  if (!gameState) return <div className="flex items-center justify-center h-full text-white">Initializing World...</div>;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <GameCanvas gameState={gameState} joystickVector={joystickVector} />
      
      <UIOverlay 
        gameState={gameState} 
        onHeal={handleHeal}
        onAttack={handleAttack}
        onShowMap={() => setShowWorldMap(true)}
      />

      {/* Control Layer */}
      <div className="absolute bottom-8 left-8 pointer-events-auto">
        <Joystick onMove={setJoystickVector} />
      </div>

      {/* World Map Overlay */}
      {showWorldMap && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl z-[100] p-12 overflow-auto flex flex-col items-center">
          <button 
            onClick={() => setShowWorldMap(false)}
            className="absolute top-8 right-8 text-4xl hover:text-indigo-400 transition-colors"
          >
            <i className="fa-solid fa-circle-xmark"></i>
          </button>
          
          <h1 className="text-3xl font-black mb-8 tracking-widest text-indigo-500 uppercase">Chronicle of Discovery</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            {(Object.values(gameState.realms) as Realm[]).map((realm: Realm) => (
              <div key={realm.id} className={`p-6 rounded-2xl border-2 ${realm.id === gameState.player.currentRealmId ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-white/40">LEVEL {realm.level}</span>
                  {realm.isHome && <span className="text-[10px] font-bold bg-green-500/20 text-green-400 px-2 py-0.5 rounded uppercase">Home</span>}
                </div>
                <h3 className="text-xl font-bold mb-2">{realm.name}</h3>
                <p className="text-sm text-white/60 mb-4 line-clamp-2">{realm.description}</p>
                <div className="flex gap-4 text-xs font-mono text-indigo-300">
                  <span>ATK SPD: +{Math.round(realm.stats.attackSpeedBonus * 100)}%</span>
                  <span>MF: +{Math.round(realm.stats.magicFindBonus * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
