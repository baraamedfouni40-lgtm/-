import React, { useRef, useState } from 'react';
import { PlayerRole } from '../types/game';
import { Zap, Flame, Radio, CloudRain } from 'lucide-react';

interface TouchControlsProps {
  playerRole: PlayerRole;
  onMove: (x: number, y: number, active: boolean) => void;
  onShockwave: () => void;
  onDash: () => void;
  onRage: () => void;
  rageReady: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  playerRole,
  onMove,
  onShockwave,
  onDash,
  onRage,
  rageReady,
}) => {
  const isBoy = playerRole === 'boy';
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateJoystick(e.touches[0]);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    updateJoystick(e.touches[0]);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onMove(0, 0, false);
  };

  const updateJoystick = (touch: React.Touch) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);

    let kx = dx;
    let ky = dy;

    if (dist > maxRadius) {
      kx = (dx / dist) * maxRadius;
      ky = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: kx, y: ky });
    onMove(kx / maxRadius, ky / maxRadius, true);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none flex justify-between items-end p-6 md:hidden">
      {/* Virtual Analog Joystick (Bottom Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700/80 flex items-center justify-center relative pointer-events-auto touch-none"
      >
        <div
          className={`w-12 h-12 rounded-full border shadow-lg pointer-events-none transition-transform duration-75 ${
            isBoy ? 'bg-cyan-600/90 border-cyan-400' : 'bg-purple-600/90 border-purple-400'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        />
      </div>

      {/* Action Buttons (Bottom Right) */}
      <div className="flex flex-col gap-3 items-end pointer-events-auto">
        {/* Special ability: Smoke bomb (boy) or Super Rage (heroine) */}
        {(rageReady || isBoy) && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onRage();
            }}
            onClick={onRage}
            className={`w-13 h-13 rounded-full border-2 flex items-center justify-center shadow-lg active:scale-90 transition-transform ${
              isBoy
                ? 'bg-slate-700 border-slate-400 text-white'
                : 'bg-amber-500 border-yellow-300 text-slate-950 animate-pulse'
            }`}
            title={isBoy ? 'قنبلة دخان' : 'الغضب الخارق'}
          >
            {isBoy ? <span className="text-xl">💨</span> : <Flame className="w-6 h-6 fill-slate-950" />}
          </button>
        )}

        <div className="flex gap-3">
          {/* Dash Button */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onDash();
            }}
            onClick={onDash}
            className="w-13 h-13 rounded-full bg-cyan-600/90 border-2 border-cyan-400 text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            title="اندفاع سريع"
          >
            <Zap className="w-6 h-6 fill-white" />
          </button>

          {/* Primary Action: Banana trap (Boy) or Shockwave (Heroine) */}
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              onShockwave();
            }}
            onClick={onShockwave}
            className={`w-16 h-16 rounded-full border-2 text-white flex items-center justify-center shadow-xl active:scale-90 transition-transform ${
              isBoy
                ? 'bg-amber-500 border-yellow-300'
                : 'bg-pink-600/95 border-pink-400'
            }`}
            title={isBoy ? 'رمي فخ موزة' : 'صدمة الهيبة'}
          >
            {isBoy ? <span className="text-2xl">🍌</span> : <Radio className="w-8 h-8" />}
          </button>
        </div>
      </div>
    </div>
  );
};
