
import React from 'react';

export const REALM_SIZE = 1000;
export const CAMERA_SPEED = 0.1;
export const PLAYER_SPEED = 5;
export const ENTITY_RADIUS = 20;
export const STAMINA_REGEN_RATE = 0.1; // per frame
export const STAMINA_CONSUMPTION_TRAVEL = 20;
export const STAMINA_CONSUMPTION_HEAL = 10;
export const STAMINA_CONSUMPTION_DEATH = 50;

export const REALM_TYPES = [
  { type: 'Forest', color: '#14532d', bg: '#064e3b' },
  { type: 'Desert', color: '#78350f', bg: '#451a03' },
  { type: 'Volcanic', color: '#7f1d1d', bg: '#450a0a' },
  { type: 'Mystic', color: '#4c1d95', bg: '#2e1065' },
  { type: 'Ruins', color: '#3f3f46', bg: '#18181b' }
] as const;

export const ICONS = {
  Sword: <i className="fa-solid fa-sword"></i>,
  Shield: <i className="fa-solid fa-shield"></i>,
  Heart: <i className="fa-solid fa-heart"></i>,
  Bolt: <i className="fa-solid fa-bolt"></i>,
  Map: <i className="fa-solid fa-map-location-dot"></i>,
  Compass: <i className="fa-solid fa-compass"></i>,
  Sack: <i className="fa-solid fa-sack-dollar"></i>,
};
