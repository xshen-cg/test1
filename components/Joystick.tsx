
import React, { useState, useEffect, useRef } from 'react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
}

const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const size = 120;
  const knobSize = 40;

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + size / 2;
      const centerY = rect.top + size / 2;

      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      let dx = clientX - centerX;
      let dy = clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = size / 2 - knobSize / 2;

      if (distance > maxDistance) {
        dx = (dx / distance) * maxDistance;
        dy = (dy / distance) * maxDistance;
      }

      setPosition({ x: dx, y: dy });
      onMove({ x: dx / maxDistance, y: dy / maxDistance });
    };

    const handleEnd = () => {
      setIsDragging(false);
      setPosition({ x: 0, y: 0 });
      onMove({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onMove]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      className="relative rounded-full bg-white/10 backdrop-blur-md border border-white/20 touch-none select-none shadow-xl"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute rounded-full bg-indigo-500/80 shadow-lg border border-white/40 pointer-events-none"
        style={{
          width: knobSize,
          height: knobSize,
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.15s ease-out'
        }}
      />
    </div>
  );
};

export default Joystick;
