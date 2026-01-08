
import React, { useRef, useEffect } from 'react';
import { GameState, Point, EntityType } from '../types';
import { REALM_SIZE, ENTITY_RADIUS, REALM_TYPES } from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  joystickVector: Point;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, joystickVector }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { player, realms } = gameState;
  const currentRealm = realms[player.currentRealmId];
  const realmStyle = REALM_TYPES.find(t => t.type === currentRealm.type) || REALM_TYPES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Setup view
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Clear background
      ctx.fillStyle = realmStyle.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Camera Offset
      ctx.save();
      ctx.translate(centerX - player.position.x, centerY - player.position.y);

      // Draw Realm Floor
      ctx.fillStyle = realmStyle.color;
      ctx.fillRect(0, 0, REALM_SIZE, REALM_SIZE);
      
      // Draw Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= REALM_SIZE; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, REALM_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= REALM_SIZE; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(REALM_SIZE, y);
        ctx.stroke();
      }

      // Draw Connectors
      currentRealm.connectors.forEach(conn => {
        ctx.beginPath();
        ctx.arc(conn.position.x, conn.position.y, 40, 0, Math.PI * 2);
        ctx.fillStyle = conn.registered ? '#6366f1' : '#f59e0b';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(conn.type, conn.position.x, conn.position.y + 5);
      });

      // Draw Entities
      currentRealm.entities.forEach(entity => {
        ctx.beginPath();
        ctx.arc(entity.position.x, entity.position.y, ENTITY_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = entity.color;
        ctx.fill();
        
        // Health Bar
        const healthPercent = entity.health / entity.maxHealth;
        ctx.fillStyle = '#333';
        ctx.fillRect(entity.position.x - 20, entity.position.y - 35, 40, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(entity.position.x - 20, entity.position.y - 35, 40 * healthPercent, 5);

        // Name
        ctx.fillStyle = '#fff';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(entity.name, entity.position.x, entity.position.y - 40);
      });

      // Draw Player
      ctx.beginPath();
      ctx.arc(player.position.x, player.position.y, ENTITY_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, realmStyle, player.position]);

  return <canvas ref={canvasRef} className="block w-full h-full cursor-crosshair" />;
};

export default GameCanvas;
