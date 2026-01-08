
export type Point = { x: number; y: number };

export enum ConnectorType {
  ROAD = 'ROAD',
  BRIDGE = 'BRIDGE',
  SIGN = 'SIGN',
  DUNGEON = 'DUNGEON'
}

export interface Connector {
  id: string;
  type: ConnectorType;
  position: Point;
  targetRealmId: string | null; // null if unregistered
  registered: boolean;
}

export interface RealmStats {
  attackSpeedBonus: number;
  healthRegenBonus: number;
  magicFindBonus: number;
  resourceMultiplier: number;
}

export interface Realm {
  id: string;
  name: string;
  description: string;
  level: number;
  stats: RealmStats;
  connectors: Connector[];
  entities: GameEntity[];
  ownerId: string | null; // Player ID or null for monster-occupied
  isHome: boolean;
  type: 'Forest' | 'Desert' | 'Volcanic' | 'Mystic' | 'Ruins';
}

export enum EntityType {
  PLAYER = 'PLAYER',
  MOB = 'MOB',
  BOSS = 'BOSS',
  NPC = 'NPC',
  LOOT = 'LOOT'
}

export interface GameEntity {
  id: string;
  type: EntityType;
  position: Point;
  health: number;
  maxHealth: number;
  damage?: number;
  name: string;
  color: string;
  isAggressive?: boolean;
  lootTable?: string[];
  lastAttackTime?: number;
}

export interface GameState {
  player: {
    id: string;
    name: string;
    health: number;
    maxHealth: number;
    stamina: number;
    maxStamina: number;
    level: number;
    experience: number;
    position: Point;
    currentRealmId: string;
    inventory: string[];
    resources: number;
    homeRealmId: string;
  };
  realms: Record<string, Realm>;
  discoveryLog: string[];
}
