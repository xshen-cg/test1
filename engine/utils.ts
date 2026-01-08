
import { Point, Connector, ConnectorType, Realm, EntityType, GameEntity } from '../types';
import { REALM_SIZE, REALM_TYPES } from '../constants';

export const getDistance = (p1: Point, p2: Point) => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const generateConnector = (id: string, index: number, total: number): Connector => {
  const angle = (index / total) * Math.PI * 2;
  const radius = (REALM_SIZE / 2) - 50;
  return {
    id,
    type: Object.values(ConnectorType)[Math.floor(Math.random() * 4)] as ConnectorType,
    position: {
      x: REALM_SIZE / 2 + Math.cos(angle) * radius,
      y: REALM_SIZE / 2 + Math.sin(angle) * radius
    },
    targetRealmId: null,
    registered: false
  };
};

export const createInitialRealm = (playerId: string): Realm => {
  const typeObj = REALM_TYPES[0];
  return {
    id: 'home-realm',
    name: 'Sanctuary of Shadows',
    description: 'The first flicker of light in a long, dark night. Your journey begins here.',
    level: 1,
    stats: {
      attackSpeedBonus: 0.1,
      healthRegenBonus: 0.05,
      magicFindBonus: 0.05,
      resourceMultiplier: 1
    },
    connectors: [generateConnector('conn-1', 0, 1)],
    entities: [],
    ownerId: playerId,
    isHome: true,
    type: 'Forest'
  };
};

export const spawnMobs = (realmLevel: number): GameEntity[] => {
  const count = Math.floor(Math.random() * 5) + 3;
  const entities: GameEntity[] = [];
  for (let i = 0; i < count; i++) {
    entities.push({
      id: `mob-${Math.random().toString(36).substr(2, 9)}`,
      type: EntityType.MOB,
      name: 'Corrupted Nomad',
      position: {
        x: Math.random() * (REALM_SIZE - 200) + 100,
        y: Math.random() * (REALM_SIZE - 200) + 100
      },
      health: 50 * realmLevel,
      maxHealth: 50 * realmLevel,
      damage: 5 * realmLevel,
      color: '#ef4444',
      isAggressive: true,
      lootTable: ['Ancient Scrap', 'Dim Soul Gem']
    });
  }
  return entities;
};
