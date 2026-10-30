import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameMode, GameState, GameStats, HeroineProfile, PlayerRole } from './types/game';
import { HEROINES } from './game/constants';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { TouchControls } from './components/TouchControls';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { CustomizationModal } from './components/CustomizationModal';
import { sounds } from './audio/sound';
import { progression } from './game/progression';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('title');
  const [selectedHeroine, setSelectedHeroine] = useState<HeroineProfile>(HEROINES[0]);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    coins: progression.getProgress().coins,
    scaredBoysCount: 0,
    totalBoys: 15,
    combo: 0,
    maxCombo: 0,
    timeRemaining: 60,
    rage: 0,
    isRageActive: false,
    wave: 1,
    playerRole: 'boy', // Default to Boy as requested
    boyPanic: 0,
    keysCollected: 0,
    keysRequired: 3,
    bananasRemaining: 3,
    gateUnlocked: false,
  });

  // Handle engine callbacks
  const handleStatsUpdate = useCallback((stats: GameStats) => {
    setGameStats(stats);
  }, []);

  const handleStateChange = useCallback((state: GameState) => {
    setGameState(state);
  }, []);

  // Initialize engine once on mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current, {
      onStatsUpdate: handleStatsUpdate,
      onStateChange: handleStateChange,
    });
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, [handleStatsUpdate, handleStateChange]);

  const handleStartGame = (role: PlayerRole, heroineId: 'sara' | 'nour' | 'layla', mode: GameMode) => {
    const heroine = HEROINES.find((h) => h.id === heroineId) || HEROINES[0];
    setSelectedHeroine(heroine);

    if (engineRef.current) {
      engineRef.current.setPlayerRole(role);
      engineRef.current.selectHeroine(heroineId);
      engineRef.current.selectMode(mode);
      engineRef.current.startSession(1);
    }
  };

  const handleNextWave = () => {
    if (engineRef.current) {
      engineRef.current.startSession(gameStats.wave + 1);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startSession(gameStats.wave);
    }
  };

  const handleHome = () => {
    setGameState('title');
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  const handleShockwave = () => {
    if (engineRef.current) {
      if (gameStats.playerRole === 'heroine') {
        engineRef.current.triggerShockwave();
      } else {
        engineRef.current.triggerDropBanana();
      }
    }
  };

  const handleDash = () => {
    if (engineRef.current) {
      engineRef.current.triggerDash();
    }
  };

  const handleRage = () => {
    if (engineRef.current) {
      if (gameStats.playerRole === 'heroine') {
        engineRef.current.triggerSuperRage();
      } else {
        engineRef.current.triggerSmokeBomb();
      }
    }
  };

  const handleTouchMove = (x: number, y: number, active: boolean) => {
    if (engineRef.current) {
      engineRef.current.setVirtualJoystick(x, y, active);
    }
  };

  const handleCustomizationUpdate = () => {
    setGameStats((prev) => ({
      ...prev,
      coins: progression.getProgress().coins,
    }));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Cairo',sans-serif]">
      {/* Isolated Canvas Viewport for 60fps rendering */}
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair touch-none"
      />

      {/* Title Screen Overlay */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onToggleSound={handleToggleSound}
          isMuted={isMuted}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
        />
      )}

      {/* Active Playing HUD */}
      {gameState === 'playing' && (
        <>
          <GameHUD
            stats={gameStats}
            heroine={selectedHeroine}
            isMuted={isMuted}
            onToggleSound={handleToggleSound}
            onPause={handlePause}
            onShockwave={handleShockwave}
            onDash={handleDash}
            onRage={handleRage}
          />
          <TouchControls
            playerRole={gameStats.playerRole}
            onMove={handleTouchMove}
            onShockwave={handleShockwave}
            onDash={handleDash}
            onRage={handleRage}
            rageReady={gameStats.rage >= 100}
          />
        </>
      )}

      {/* Paused Screen Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onHome={handleHome}
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
        />
      )}

      {/* Game Over / Victory Modal */}
      {(gameState === 'gameover' || gameState === 'victory') && (
        <GameOverModal
          isVictory={gameState === 'victory'}
          stats={gameStats}
          onNextWave={handleNextWave}
          onRestart={handleRestart}
          onHome={handleHome}
          onOpenCustomization={() => setIsCustomizationOpen(true)}
        />
      )}

      {/* Customization & Skill Upgrades Modal */}
      <CustomizationModal
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        playerRole={gameStats.playerRole}
        onUpdate={handleCustomizationUpdate}
      />
    </main>
  );
}
