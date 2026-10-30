import {
  ArenaConfig,
  BoyEntity,
  BoyType,
  GameMode,
  GameState,
  GameStats,
  HeroineProfile,
  PlayerRole,
  PowerUp,
  BananaTrap,
  KeyItem,
  HeroineHunter,
} from '../types/game';
import { ARENAS, BOY_NAMES, HEROINES, PANIC_SHOUTS_AR } from './constants';
import { ParticleSystem } from './particles';
import { renderer } from './renderer';
import { sounds } from '../audio/sound';
import { progression } from './progression';

export interface EngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onStateChange: (state: GameState) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime: number = 0;

  // Game configuration & current state
  private state: GameState = 'title';
  private mode: GameMode = 'campaign';
  private playerRole: PlayerRole = 'boy'; // Default to Boy as requested!
  private currentHeroine: HeroineProfile = HEROINES[0];
  private currentArena: ArenaConfig = ARENAS[0];
  private currentWave: number = 1;

  // Player position & movement
  private playerX: number = 700;
  private playerY: number = 450;
  private playerVx: number = 0;
  private playerVy: number = 0;
  private playerFacingAngle: number = 0;
  private walkCycle: number = 0;
  private isMoving: boolean = false;

  // Abilities
  private dashCooldown: number = 0;
  private isDashing: boolean = false;
  private dashTimer: number = 0;
  private shockwaveCooldown: number = 0;
  private rage: number = 0; // 0 to 100
  private isRageActive: boolean = false;
  private rageDuration: number = 0;

  // Boy Survival specific state
  private boyPanic: number = 0; // 0 to 100
  private keysCollected: number = 0;
  private keysRequired: number = 3;
  private bananasRemaining: number = 3;
  private gateUnlocked: boolean = false;
  private bananaTraps: BananaTrap[] = [];
  private keys: KeyItem[] = [];
  private heroineHunters: HeroineHunter[] = [];
  private heartbeatTimer: number = 0;
  private smokeBombCooldown: number = 0;

  // Power-up active boosts
  private speedBoostTimer: number = 0;
  private auraBoostTimer: number = 0;

  // Boy opponents (used when player is Heroine)
  private boys: BoyEntity[] = [];
  private powerUps: PowerUp[] = [];

  // Particles & Game Feel
  private particles = new ParticleSystem();
  private cameraShake: number = 0;
  private hitstopTimer: number = 0;

  // Scoring & Stats
  private score: number = 0;
  private combo: number = 0;
  private comboTimer: number = 0;
  private maxCombo: number = 0;
  private scaredBoysCount: number = 0;
  private totalBoysInWave: number = 0;
  private timeRemaining: number = 60;
  private tickInterval: number = 0;

  // Input management
  private keysHeld: Record<string, boolean> = {};
  private virtualJoystick: { x: number; y: number; active: boolean } = { x: 0, y: 0, active: false };

  // Callbacks
  private callbacks: EngineCallbacks;

  constructor(canvas: HTMLCanvasElement, callbacks: EngineCallbacks) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context');
    this.ctx = ctx;
    this.callbacks = callbacks;

    this.setupListeners();
    this.resizeCanvas();
  }

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleWindowBlur);
    window.addEventListener('resize', this.resizeCanvas);
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleWindowBlur);
    window.removeEventListener('resize', this.resizeCanvas);
  }

  private resizeCanvas = () => {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keysHeld[e.code] = true;

    // Esc to pause/unpause
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (this.state === 'playing') {
        this.pauseGame();
      } else if (this.state === 'paused') {
        this.resumeGame();
      }
      return;
    }

    if (this.state !== 'playing') return;

    // Action triggers (justPressed)
    if (e.code === 'Space' || e.code === 'KeyJ') {
      e.preventDefault();
      if (this.playerRole === 'heroine') {
        this.triggerShockwave();
      } else {
        this.triggerDropBanana();
      }
    } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyK') {
      e.preventDefault();
      this.triggerDash();
    } else if (e.code === 'KeyE' || e.code === 'KeyL') {
      e.preventDefault();
      if (this.playerRole === 'heroine') {
        this.triggerSuperRage();
      } else {
        this.triggerSmokeBomb();
      }
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keysHeld[e.code] = false;
  };

  private handleWindowBlur = () => {
    this.keysHeld = {};
    this.virtualJoystick.active = false;
  };

  public setVirtualJoystick(x: number, y: number, active: boolean) {
    this.virtualJoystick.x = x;
    this.virtualJoystick.y = y;
    this.virtualJoystick.active = active;
  }

  public setPlayerRole(role: PlayerRole) {
    this.playerRole = role;
  }

  public getPlayerRole(): PlayerRole {
    return this.playerRole;
  }

  public selectHeroine(heroineId: 'sara' | 'nour' | 'layla') {
    const found = HEROINES.find((h) => h.id === heroineId);
    if (found) {
      this.currentHeroine = found;
    }
  }

  public selectArena(arenaId: string) {
    const found = ARENAS.find((a) => a.id === arenaId);
    if (found) {
      this.currentArena = found;
    }
  }

  public selectMode(mode: GameMode) {
    this.mode = mode;
  }

  // Start or restart a game session
  public startSession(wave = 1) {
    this.currentWave = wave;
    const arenaIndex = (wave - 1) % ARENAS.length;
    this.currentArena = ARENAS[arenaIndex];

    this.playerX = this.currentArena.width / 2;
    this.playerY = this.currentArena.height / 2;
    this.playerVx = 0;
    this.playerVy = 0;
    this.playerFacingAngle = 0;

    this.dashCooldown = 0;
    this.isDashing = false;
    this.shockwaveCooldown = 0;
    this.rage = 25;
    this.isRageActive = false;
    this.speedBoostTimer = 0;
    this.auraBoostTimer = 0;

    // Boy Survival setup
    this.boyPanic = 0;
    this.keysCollected = 0;
    this.keysRequired = Math.min(4, 2 + wave);
    this.bananasRemaining = progression.getStartingTraps();
    this.gateUnlocked = false;
    this.bananaTraps = [];
    this.heartbeatTimer = 0;
    this.smokeBombCooldown = 0;

    this.cameraShake = 0;
    this.hitstopTimer = 0;
    this.combo = 0;
    this.comboTimer = 0;
    this.scaredBoysCount = 0;
    this.timeRemaining = this.mode === 'sandbox' ? 999 : this.currentArena.timeLimit;
    this.tickInterval = 0;

    this.particles.clear();
    this.spawnPowerUps();

    if (this.playerRole === 'heroine') {
      this.spawnBoysForWave();
      this.heroineHunters = [];
    } else {
      // Boy Survival Mode: Spawn 2 or 3 Heroine Hunter AIs
      this.boys = [];
      this.spawnHeroineHunters();
      this.spawnKeys();
    }

    this.state = 'playing';
    this.callbacks.onStateChange('playing');
    this.notifyStats();

    this.lastTime = performance.now();
    if (!this.animationFrameId) {
      this.loop(this.lastTime);
    }
  }

  // Spawn keys for Boy mode
  private spawnKeys() {
    this.keys = [];
    for (let i = 0; i < this.keysRequired; i++) {
      let kx = 0;
      let ky = 0;
      let dist = 0;
      do {
        kx = 120 + Math.random() * (this.currentArena.width - 240);
        ky = 120 + Math.random() * (this.currentArena.height - 240);
        dist = Math.hypot(kx - this.playerX, ky - this.playerY);
      } while (dist < 200);

      this.keys.push({
        id: i + 1,
        x: kx,
        y: ky,
        collected: false,
        bobTimer: Math.random() * 5,
      });
    }
  }

  // Spawn Heroine hunters chasing the boy
  private spawnHeroineHunters() {
    this.heroineHunters = [];
    const count = Math.min(3, 1 + this.currentWave);

    for (let i = 0; i < count; i++) {
      const profile = HEROINES[i % HEROINES.length];
      let hx = 0;
      let hy = 0;
      let dist = 0;

      // Spawn at corners far from player
      do {
        hx = 100 + Math.random() * (this.currentArena.width - 200);
        hy = 100 + Math.random() * (this.currentArena.height - 200);
        dist = Math.hypot(hx - this.playerX, hy - this.playerY);
      } while (dist < 350);

      this.heroineHunters.push({
        id: `hunter_${i}`,
        profile,
        x: hx,
        y: hy,
        vx: 0,
        vy: 0,
        facingAngle: Math.random() * Math.PI * 2,
        walkCycle: Math.random() * 5,
        stunTimer: 0,
        telegraphTimer: 0,
        telegraphRadius: profile.shockwavePower * 0.9,
      });
    }
  }

  private spawnBoysForWave() {
    this.boys = [];
    const count = this.mode === 'sandbox' ? 12 : this.currentArena.targetScaredCount + (this.currentWave - 1) * 3;
    this.totalBoysInWave = count;

    const boyTypes: BoyType[] = ['runner', 'pretender', 'gamer', 'giant'];
    const shirtColors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];
    const hairColors = ['#451a03', '#1e293b', '#78350f', '#0f172a'];

    for (let i = 0; i < count; i++) {
      const type = boyTypes[Math.floor(Math.random() * boyTypes.length)];
      let radius = 14;
      let baseSpeed = 160;

      if (type === 'runner') {
        baseSpeed = 220;
        radius = 13;
      } else if (type === 'giant') {
        baseSpeed = 135;
        radius = 18;
      } else if (type === 'gamer') {
        baseSpeed = 150;
      }

      let x = 0;
      let y = 0;
      let dist = 0;
      do {
        x = 80 + Math.random() * (this.currentArena.width - 160);
        y = 80 + Math.random() * (this.currentArena.height - 160);
        dist = Math.hypot(x - this.playerX, y - this.playerY);
      } while (dist < 250);

      this.boys.push({
        id: i + 1,
        type,
        x,
        y,
        vx: (Math.random() - 0.5) * baseSpeed * 0.4,
        vy: (Math.random() - 0.5) * baseSpeed * 0.4,
        radius,
        baseSpeed,
        fear: 0,
        isPanicking: false,
        isEscaped: false,
        facingAngle: Math.random() * Math.PI * 2,
        legCycle: Math.random() * 10,
        sweatTimer: 0,
        shirtColor: shirtColors[i % shirtColors.length],
        hairColor: hairColors[i % hairColors.length],
        panicCryCooldown: Math.random() * 2,
        stumbleTimer: 0,
        name: BOY_NAMES[i % BOY_NAMES.length],
      });
    }
  }

  private spawnPowerUps() {
    this.powerUps = [];
    const count = 3;
    const types: PowerUp['type'][] = ['megaphone', 'lightning', 'star'];

    for (let i = 0; i < count; i++) {
      this.powerUps.push({
        id: i + 1,
        x: 150 + Math.random() * (this.currentArena.width - 300),
        y: 150 + Math.random() * (this.currentArena.height - 300),
        type: types[i % types.length],
        duration: 20,
        collected: false,
        bobTimer: Math.random() * 5,
      });
    }
  }

  public pauseGame() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.callbacks.onStateChange('paused');
    }
  }

  public resumeGame() {
    if (this.state === 'paused') {
      this.state = 'playing';
      this.callbacks.onStateChange('playing');
      this.lastTime = performance.now();
    }
  }

  // BOY ACTION: Drop Banana Peel (Space / J)
  public triggerDropBanana() {
    if (this.state !== 'playing' || this.bananasRemaining <= 0) return;

    this.bananasRemaining--;
    this.bananaTraps.push({
      id: Date.now(),
      x: this.playerX,
      y: this.playerY,
      placedTime: performance.now(),
    });

    this.particles.emitComicText(this.playerX, this.playerY, '🍌 فخ الموز!', '#eab308');
    this.notifyStats();
  }

  // BOY ACTION: Smoke Screen (E / L)
  public triggerSmokeBomb() {
    if (this.state !== 'playing' || this.smokeBombCooldown > 0) return;

    this.smokeBombCooldown = 8.0;
    this.boyPanic = Math.max(0, this.boyPanic - 25);

    sounds.playDash();
    this.cameraShake = 8;

    // Emit dense smoke particles
    for (let i = 0; i < 20; i++) {
      this.particles.emitDust(this.playerX + (Math.random() - 0.5) * 60, this.playerY + (Math.random() - 0.5) * 60, '#94a3b8');
    }
    this.particles.emitComicText(this.playerX, this.playerY, '💨 قنبلة دخان وتشتيت!', '#cbd5e1');

    // Confuse heroines (turn them away)
    for (const h of this.heroineHunters) {
      h.facingAngle += Math.PI;
      h.vx *= -1;
      h.vy *= -1;
    }
    this.notifyStats();
  }

  // HEROINE ACTION: Trigger Shockwave
  public triggerShockwave() {
    if (this.state !== 'playing' || this.shockwaveCooldown > 0) return;

    this.shockwaveCooldown = 1.1;
    const power = this.currentHeroine.shockwavePower * (this.auraBoostTimer > 0 ? 1.4 : 1);

    sounds.playShockwave();
    this.cameraShake = 14;
    this.hitstopTimer = 0.05;

    this.particles.emitShockwave(this.playerX, this.playerY, this.currentHeroine.color, power);
    this.particles.emitComicText(this.playerX, this.playerY - 20, '💥 بووووم! هيبة!', this.currentHeroine.color);

    for (const boy of this.boys) {
      if (boy.isEscaped) continue;
      const dx = boy.x - this.playerX;
      const dy = boy.y - this.playerY;
      const dist = Math.hypot(dx, dy);

      if (dist < power) {
        boy.fear = 100;
        boy.isPanicking = true;
        const angle = Math.atan2(dy, dx);
        const impulse = (1 - dist / power) * 450;
        boy.vx += Math.cos(angle) * impulse;
        boy.vy += Math.sin(angle) * impulse;

        this.particles.emitSweat(boy.x, boy.y);
        const shout = PANIC_SHOUTS_AR[Math.floor(Math.random() * PANIC_SHOUTS_AR.length)];
        this.particles.emitComicText(boy.x, boy.y, shout);
        sounds.playBoyPanic();
      }
    }
  }

  // COMMON ACTION: Sprint Dash (Shift / K)
  public triggerDash() {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;

    this.dashCooldown = progression.getDashCooldown();
    this.isDashing = true;
    this.dashTimer = 0.28;

    sounds.playDash();
    this.cameraShake = 5;

    let dirX = Math.cos(this.playerFacingAngle);
    let dirY = Math.sin(this.playerFacingAngle);

    if (this.playerVx !== 0 || this.playerVy !== 0) {
      const mag = Math.hypot(this.playerVx, this.playerVy);
      dirX = this.playerVx / mag;
      dirY = this.playerVy / mag;
    }

    const baseDash = this.playerRole === 'heroine' ? 820 : 750;
    const dashSpeed = baseDash * progression.getDashSpeedMultiplier();
    this.playerVx = dirX * dashSpeed;
    this.playerVy = dirY * dashSpeed;

    const dashText = this.playerRole === 'heroine' ? '⚡ وريـح!' : '🏃‍♂️ هروب سريع!';
    this.particles.emitComicText(this.playerX, this.playerY, dashText, '#38bdf8');
  }

  // HEROINE ACTION: Super Rage (E / L)
  public triggerSuperRage() {
    if (this.state !== 'playing' || this.rage < 100 || this.isRageActive) return;

    this.isRageActive = true;
    this.rageDuration = 7.0;
    this.rage = 0;

    sounds.playSuperRage();
    this.cameraShake = 22;
    this.hitstopTimer = 0.08;

    this.particles.emitShockwave(this.playerX, this.playerY, '#fbbf24', 450);
    this.particles.emitComicText(this.playerX, this.playerY, '👑 الوضع الأسطوري الخارق!', '#fbbf24');

    for (const boy of this.boys) {
      if (!boy.isEscaped) {
        boy.fear = 100;
        boy.isPanicking = true;
        sounds.playBoyPanic();
      }
    }
  }

  // Main 60fps Loop
  private loop = (currentTime: number) => {
    this.animationFrameId = requestAnimationFrame(this.loop);

    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.05);

    if (this.state === 'playing') {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        if (this.playerRole === 'heroine') {
          this.updateHeroineSimulation(dt);
        } else {
          this.updateBoySimulation(dt);
        }
      }
    }

    this.render();
  };

  // Simulation when playing as the Boy (Survival Challenge)
  private updateBoySimulation(dt: number) {
    // 1. Time countdown
    if (this.mode !== 'sandbox') {
      this.timeRemaining -= dt;
      this.tickInterval += dt;
      if (this.tickInterval >= 1 && this.timeRemaining <= 10 && this.timeRemaining > 0) {
        sounds.playTick();
        this.tickInterval = 0;
      }
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        // In Boy survival, surviving till time expires unlocks the gate automatically!
        if (!this.gateUnlocked) {
          this.gateUnlocked = true;
          sounds.playGateUnlocked();
          this.particles.emitComicText(this.playerX, this.playerY, '🟢 انتهى الوقت! البوابة فتحت للهروب!', '#22c55e');
          this.timeRemaining = 15; // 15 bonus seconds to sprint to the exit!
        } else {
          this.gameOver(false);
          return;
        }
      }
    }

    // Cooldowns
    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.smokeBombCooldown > 0) this.smokeBombCooldown -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;

    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.isDashing = false;
    }

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
    }

    // 2. Boy Player Movement
    let inputX = 0;
    let inputY = 0;

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) inputY -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) inputY += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) inputX -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) inputX += 1;

    if (this.virtualJoystick.active) {
      inputX = this.virtualJoystick.x;
      inputY = this.virtualJoystick.y;
    }

    const inputMag = Math.hypot(inputX, inputY);
    this.isMoving = inputMag > 0.1;

    let boySpeed = 230 * progression.getSpeedMultiplier();
    if (this.speedBoostTimer > 0) boySpeed *= 1.45;
    if (this.boyPanic > 70) boySpeed *= 1.15; // Adrenaline rush!

    if (!this.isDashing) {
      if (this.isMoving) {
        const nx = inputX / (inputMag > 1 ? inputMag : 1);
        const ny = inputY / (inputMag > 1 ? inputMag : 1);
        this.playerVx = nx * boySpeed;
        this.playerVy = ny * boySpeed;
        this.playerFacingAngle = Math.atan2(ny, nx);
        this.walkCycle += dt * (boySpeed / 25);

        if (Math.random() < 0.2) {
          this.particles.emitDust(this.playerX, this.playerY + 8);
        }
      } else {
        this.playerVx *= 0.82;
        this.playerVy *= 0.82;
      }
    }

    this.playerX += this.playerVx * dt;
    this.playerY += this.playerVy * dt;

    const margin = 26;
    this.playerX = Math.max(margin, Math.min(this.currentArena.width - margin, this.playerX));
    this.playerY = Math.max(margin, Math.min(this.currentArena.height - margin, this.playerY));

    this.resolveObstacleCollisions(this.playerX, this.playerY, 18, (nx, ny) => {
      this.playerX = nx;
      this.playerY = ny;
    });

    // 2.5 Item Magnet Attraction (if magnet skill unlocked)
    const magnetRadius = progression.getMagnetRadius();
    if (magnetRadius > 0) {
      for (const key of this.keys) {
        if (key.collected) continue;
        const dist = Math.hypot(key.x - this.playerX, key.y - this.playerY);
        if (dist < magnetRadius && dist > 15) {
          const pull = 220 * dt;
          key.x += ((this.playerX - key.x) / dist) * pull;
          key.y += ((this.playerY - key.y) / dist) * pull;
        }
      }
      for (const pu of this.powerUps) {
        if (pu.collected) continue;
        const dist = Math.hypot(pu.x - this.playerX, pu.y - this.playerY);
        if (dist < magnetRadius && dist > 15) {
          const pull = 220 * dt;
          pu.x += ((this.playerX - pu.x) / dist) * pull;
          pu.y += ((this.playerY - pu.y) / dist) * pull;
        }
      }
    }

    // 3. Collect Keys
    for (const key of this.keys) {
      if (key.collected) continue;
      key.bobTimer += dt;
      const dist = Math.hypot(key.x - this.playerX, key.y - this.playerY);
      if (dist < 32) {
        key.collected = true;
        this.keysCollected++;
        progression.addCoins(50);
        sounds.playKeyCollect();
        this.score += 400;
        this.particles.emitStars(key.x, key.y, 16, '#facc15');
        this.particles.emitComicText(key.x, key.y, `🔑 مفتاح (${this.keysCollected}/${this.keysRequired}) +50⭐`, '#facc15');

        if (this.keysCollected >= this.keysRequired && !this.gateUnlocked) {
          this.gateUnlocked = true;
          sounds.playGateUnlocked();
          this.particles.emitComicText(this.playerX, this.playerY, '🟢 تم فتح بوابات الهروب! اهررررب!', '#22c55e');
        }
        this.notifyStats();
      }
    }

    // 4. Power-ups collection
    for (const pu of this.powerUps) {
      if (pu.collected) continue;
      pu.bobTimer += dt;
      const dist = Math.hypot(pu.x - this.playerX, pu.y - this.playerY);
      if (dist < 34) {
        pu.collected = true;
        sounds.playPowerUp();
        this.score += 250;
        progression.addCoins(25);
        this.bananasRemaining = Math.min(6, this.bananasRemaining + 1);
        this.speedBoostTimer = 6;
        this.boyPanic = Math.max(0, this.boyPanic - 20);
        this.particles.emitStars(pu.x, pu.y, 12);
        this.particles.emitComicText(pu.x, pu.y, '👟 حذاء السرعة + موزة!', '#06b6d4');
        this.notifyStats();
      }
    }

    // 5. Heroine Hunters AI logic
    let nearIntimidation = false;

    for (const hunter of this.heroineHunters) {
      hunter.walkCycle += dt * 6;

      if (hunter.stunTimer > 0) {
        hunter.stunTimer -= dt;
        hunter.vx = 0;
        hunter.vy = 0;
        continue;
      }

      // Check collision with banana peel traps
      for (let bi = this.bananaTraps.length - 1; bi >= 0; bi--) {
        const trap = this.bananaTraps[bi];
        const distToTrap = Math.hypot(hunter.x - trap.x, hunter.y - trap.y);
        if (distToTrap < 28) {
          this.bananaTraps.splice(bi, 1);
          hunter.stunTimer = progression.getStunDuration();
          progression.addCoins(100);
          sounds.playBananaSlip();
          this.cameraShake = 7;
          this.particles.emitStars(hunter.x, hunter.y, 18, '#fbbf24');
          this.particles.emitComicText(hunter.x, hunter.y, '💫 تزحلقت وسقطت! +100⭐', '#f59e0b');
          this.score += 350;
          this.notifyStats();
          break;
        }
      }

      if (hunter.stunTimer > 0) continue;

      // Distance and angle to Player Boy
      const dx = this.playerX - hunter.x;
      const dy = this.playerY - hunter.y;
      const dist = Math.hypot(dx, dy);

      // Intimidation radius proximity with fear defense
      if (dist < hunter.profile.intimidationRadius) {
        nearIntimidation = true;
        const fearRate = 30 * dt * progression.getPanicResistanceMultiplier();
        this.boyPanic = Math.min(100, this.boyPanic + fearRate);
        if (Math.random() < 0.15) {
          this.particles.emitSweat(this.playerX, this.playerY);
        }
      }

      // Heroine Shockwave telegraph attack
      if (dist < hunter.telegraphRadius && hunter.telegraphTimer <= 0 && Math.random() < 0.012) {
        hunter.telegraphTimer = 1.2; // 1.2s warning ring
      }

      if (hunter.telegraphTimer > 0) {
        hunter.telegraphTimer -= dt;
        hunter.vx *= 0.5;
        hunter.vy *= 0.5;

        if (hunter.telegraphTimer <= 0) {
          // SLAM!
          sounds.playShockwave();
          this.cameraShake = 14;
          this.particles.emitShockwave(hunter.x, hunter.y, hunter.profile.color, hunter.telegraphRadius);
          this.particles.emitComicText(hunter.x, hunter.y, '💥 صدمة ساحقة!', hunter.profile.color);

          if (dist < hunter.telegraphRadius) {
            // Player caught in shockwave slam!
            this.boyPanic = Math.min(100, this.boyPanic + 35);
            sounds.playBoyPanic();
            this.cameraShake = 20;
            this.hitstopTimer = 0.06;

            const angle = Math.atan2(dy, dx);
            this.playerVx += Math.cos(angle) * 550;
            this.playerVy += Math.sin(angle) * 550;
            this.particles.emitSweat(this.playerX, this.playerY);
            this.particles.emitComicText(this.playerX, this.playerY, '😱 النجدة!', '#ef4444');
          }
        }
      } else {
        // Normal pursuit
        const chaseAngle = Math.atan2(dy, dx);
        hunter.facingAngle = chaseAngle;
        const huntSpeed = hunter.profile.speed * 0.75;
        hunter.vx = Math.cos(chaseAngle) * huntSpeed;
        hunter.vy = Math.sin(chaseAngle) * huntSpeed;

        hunter.x += hunter.vx * dt;
        hunter.y += hunter.vy * dt;

        this.resolveObstacleCollisions(hunter.x, hunter.y, 22, (nx, ny) => {
          hunter.x = nx;
          hunter.y = ny;
        });

        // Physical catch if touching player
        if (dist < 26) {
          this.boyPanic = 100;
        }
      }
    }

    // Heartbeat audio if panic is high or near heroine
    if (nearIntimidation || this.boyPanic > 50) {
      this.heartbeatTimer += dt;
      if (this.heartbeatTimer >= 0.6) {
        sounds.playHeartbeat();
        this.heartbeatTimer = 0;
      }
    } else {
      // Slow recovery when safe
      this.boyPanic = Math.max(0, this.boyPanic - 8 * dt);
    }

    // Check Defeat: Boy fully panicked
    if (this.boyPanic >= 100) {
      sounds.playBoyPanic();
      this.gameOver(false);
      return;
    }

    // Check Victory: Did boy reach the open exit gate?
    if (this.gateUnlocked) {
      const exitMargin = 22;
      const reachedExit =
        this.playerX <= exitMargin ||
        this.playerX >= this.currentArena.width - exitMargin ||
        this.playerY <= exitMargin ||
        this.playerY >= this.currentArena.height - exitMargin;

      if (reachedExit) {
        sounds.playVictory();
        this.score += 1500;
        progression.addCoins(350);
        this.particles.emitComicText(this.playerX, this.playerY, '🏆 نجوت بنجاح! +350⭐', '#22c55e');
        this.gameVictory();
        return;
      }
    }

    this.particles.update(dt);
  }

  // Simulation when playing as the Heroine (Chaser)
  private updateHeroineSimulation(dt: number) {
    if (this.mode !== 'sandbox') {
      this.timeRemaining -= dt;
      this.tickInterval += dt;
      if (this.tickInterval >= 1 && this.timeRemaining <= 10 && this.timeRemaining > 0) {
        sounds.playTick();
        this.tickInterval = 0;
      }
      if (this.timeRemaining <= 0) {
        this.timeRemaining = 0;
        this.gameOver(false);
        return;
      }
    }

    if (this.dashCooldown > 0) this.dashCooldown -= dt;
    if (this.shockwaveCooldown > 0) this.shockwaveCooldown -= dt;

    if (this.isDashing) {
      this.dashTimer -= dt;
      if (this.dashTimer <= 0) this.isDashing = false;
    }

    if (this.isRageActive) {
      this.rageDuration -= dt;
      if (this.rageDuration <= 0) this.isRageActive = false;
    }

    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;
    if (this.auraBoostTimer > 0) this.auraBoostTimer -= dt;

    if (this.combo > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 0;
        this.notifyStats();
      }
    }

    if (this.cameraShake > 0) {
      this.cameraShake = Math.max(0, this.cameraShake - dt * 25);
    }

    let inputX = 0;
    let inputY = 0;

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) inputY -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) inputY += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) inputX -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) inputX += 1;

    if (this.virtualJoystick.active) {
      inputX = this.virtualJoystick.x;
      inputY = this.virtualJoystick.y;
    }

    const inputMag = Math.hypot(inputX, inputY);
    this.isMoving = inputMag > 0.1;

    let baseSpeed = this.currentHeroine.speed;
    if (this.speedBoostTimer > 0) baseSpeed *= 1.45;
    if (this.isRageActive) baseSpeed *= 1.35;

    if (!this.isDashing) {
      if (this.isMoving) {
        const nx = inputX / (inputMag > 1 ? inputMag : 1);
        const ny = inputY / (inputMag > 1 ? inputMag : 1);
        this.playerVx = nx * baseSpeed;
        this.playerVy = ny * baseSpeed;
        this.playerFacingAngle = Math.atan2(ny, nx);
        this.walkCycle += dt * (baseSpeed / 30);

        if (Math.random() < 0.25) {
          this.particles.emitDust(this.playerX, this.playerY + 8);
        }
      } else {
        this.playerVx *= 0.85;
        this.playerVy *= 0.85;
      }
    } else {
      this.particles.emitDust(this.playerX, this.playerY, this.currentHeroine.color);
    }

    this.playerX += this.playerVx * dt;
    this.playerY += this.playerVy * dt;

    const margin = 26;
    this.playerX = Math.max(margin, Math.min(this.currentArena.width - margin, this.playerX));
    this.playerY = Math.max(margin, Math.min(this.currentArena.height - margin, this.playerY));

    this.resolveObstacleCollisions(this.playerX, this.playerY, 20, (nx, ny) => {
      this.playerX = nx;
      this.playerY = ny;
    });

    for (const pu of this.powerUps) {
      if (pu.collected) continue;
      pu.bobTimer += dt;
      const dist = Math.hypot(pu.x - this.playerX, pu.y - this.playerY);
      if (dist < 36) {
        pu.collected = true;
        sounds.playPowerUp();
        this.score += 250;
        this.rage = Math.min(100, this.rage + 25);
        this.particles.emitStars(pu.x, pu.y, 14);

        if (pu.type === 'lightning') {
          this.speedBoostTimer = 8;
          this.particles.emitComicText(pu.x, pu.y, '⚡ سرعة قصوى!', '#06b6d4');
        } else if (pu.type === 'megaphone') {
          this.auraBoostTimer = 10;
          this.particles.emitComicText(pu.x, pu.y, '📢 هالة مضاعفة!', '#ec4899');
        } else {
          this.particles.emitComicText(pu.x, pu.y, '⭐ نقاط إضافية!', '#facc15');
        }
        this.notifyStats();
      }
    }

    const heroineAuraRadius =
      (this.currentHeroine.intimidationRadius + (this.auraBoostTimer > 0 ? 80 : 0) + (this.isRageActive ? 120 : 0));

    for (const boy of this.boys) {
      if (boy.isEscaped) continue;

      boy.legCycle += dt;
      boy.sweatTimer += dt;
      boy.panicCryCooldown -= dt;

      const dx = boy.x - this.playerX;
      const dy = boy.y - this.playerY;
      const distToHeroine = Math.hypot(dx, dy);

      if (distToHeroine < heroineAuraRadius) {
        const proximityRatio = 1 - distToHeroine / heroineAuraRadius;
        const fearIncrement = (proximityRatio * 90 + 20) * dt;
        boy.fear = Math.min(100, boy.fear + fearIncrement);

        if (this.isRageActive) boy.fear = 100;

        if (boy.sweatTimer > 0.25 && boy.fear > 50) {
          this.particles.emitSweat(boy.x, boy.y);
          boy.sweatTimer = 0;
        }

        if (boy.panicCryCooldown <= 0 && boy.fear > 60) {
          const shout = PANIC_SHOUTS_AR[Math.floor(Math.random() * PANIC_SHOUTS_AR.length)];
          this.particles.emitComicText(boy.x, boy.y, shout);
          sounds.playBoyPanic();
          boy.panicCryCooldown = 2.0 + Math.random() * 2.5;
        }
      } else {
        if (boy.fear < 100) boy.fear = Math.max(0, boy.fear - 10 * dt);
      }

      if (boy.fear >= 80) boy.isPanicking = true;

      if (boy.isPanicking) {
        const fleeAngle = Math.atan2(dy, dx);
        boy.facingAngle = fleeAngle;
        const currentSpeed = boy.baseSpeed * (boy.isPanicking ? 1.9 : 1.2);
        boy.vx = Math.cos(fleeAngle) * currentSpeed;
        boy.vy = Math.sin(fleeAngle) * currentSpeed;

        if (Math.random() < 0.08) this.particles.emitSweat(boy.x, boy.y);
      } else {
        if (boy.fear > 20) {
          const fleeAngle = Math.atan2(dy, dx);
          boy.facingAngle = fleeAngle;
          boy.vx = Math.cos(fleeAngle) * boy.baseSpeed * 0.6;
          boy.vy = Math.sin(fleeAngle) * boy.baseSpeed * 0.6;
        } else {
          if (Math.random() < 0.02) boy.facingAngle += (Math.random() - 0.5) * 1.5;
          boy.vx = Math.cos(boy.facingAngle) * (boy.baseSpeed * 0.35);
          boy.vy = Math.sin(boy.facingAngle) * (boy.baseSpeed * 0.35);
        }
      }

      boy.x += boy.vx * dt;
      boy.y += boy.vy * dt;

      this.resolveObstacleCollisions(boy.x, boy.y, boy.radius, (nx, ny) => {
        boy.x = nx;
        boy.y = ny;
        boy.facingAngle += Math.PI * 0.5;
      });

      const exitMargin = 12;
      const reachedBorder =
        boy.x <= exitMargin ||
        boy.x >= this.currentArena.width - exitMargin ||
        boy.y <= exitMargin ||
        boy.y >= this.currentArena.height - exitMargin;

      if (reachedBorder && boy.isPanicking) {
        boy.isEscaped = true;
        this.scaredBoysCount++;
        this.combo++;
        this.comboTimer = 3.5;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        this.score += 200 + this.combo * 100;
        this.rage = Math.min(100, this.rage + 14);

        sounds.playBoyEscaped(this.combo);
        this.particles.emitStars(boy.x, boy.y, 10, '#38bdf8');
        this.particles.emitComicText(
          boy.x,
          boy.y,
          `💨 هرب مذعوراً! ${this.combo > 1 ? `x${this.combo}` : ''}`,
          '#0284c7'
        );

        this.notifyStats();

        if (this.scaredBoysCount >= this.totalBoysInWave) {
          this.gameVictory();
          return;
        }
      } else {
        boy.x = Math.max(margin, Math.min(this.currentArena.width - margin, boy.x));
        boy.y = Math.max(margin, Math.min(this.currentArena.height - margin, boy.y));
      }
    }

    this.particles.update(dt);
  }

  private resolveObstacleCollisions(
    x: number,
    y: number,
    radius: number,
    onAdjust: (newX: number, newY: number) => void
  ) {
    for (const ob of this.currentArena.obstacles) {
      const nearestX = Math.max(ob.x, Math.min(x, ob.x + ob.width));
      const nearestY = Math.max(ob.y, Math.min(y, ob.y + ob.height));
      const distX = x - nearestX;
      const distY = y - nearestY;
      const dist = Math.hypot(distX, distY);

      if (dist < radius && dist > 0.001) {
        const overlap = radius - dist;
        const nx = x + (distX / dist) * overlap;
        const ny = y + (distY / dist) * overlap;
        onAdjust(nx, ny);
      }
    }
  }

  private gameOver(isVictory: boolean) {
    this.state = isVictory ? 'victory' : 'gameover';
    this.callbacks.onStateChange(this.state);
    if (isVictory) sounds.playVictory();
    this.notifyStats();
  }

  public gameVictory() {
    this.gameOver(true);
  }

  private notifyStats() {
    this.callbacks.onStatsUpdate({
      score: this.score,
      coins: progression.getProgress().coins,
      scaredBoysCount: this.scaredBoysCount,
      totalBoys: this.totalBoysInWave,
      combo: this.combo,
      maxCombo: this.maxCombo,
      timeRemaining: Math.ceil(this.timeRemaining),
      rage: this.rage,
      isRageActive: this.isRageActive,
      wave: this.currentWave,
      playerRole: this.playerRole,
      boyPanic: Math.floor(this.boyPanic),
      keysCollected: this.keysCollected,
      keysRequired: this.keysRequired,
      bananasRemaining: this.bananasRemaining,
      gateUnlocked: this.gateUnlocked,
    });
  }

  // Camera & Render loop
  private render() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);

    this.ctx.save();

    if (this.cameraShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.cameraShake;
      const shakeY = (Math.random() - 0.5) * this.cameraShake;
      this.ctx.translate(shakeX, shakeY);
    }

    const cameraX = Math.max(0, Math.min(this.currentArena.width - width, this.playerX - width / 2));
    const cameraY = Math.max(0, Math.min(this.currentArena.height - height, this.playerY - height / 2));

    this.ctx.translate(-cameraX, -cameraY);

    // 1. Draw Arena Ground (with green glowing exit if gates unlocked!)
    renderer.drawArena(this.ctx, this.currentArena, this.gateUnlocked);

    // 2. Draw Obstacles
    renderer.drawObstacles(this.ctx, this.currentArena.obstacles);

    // 3. Draw Power-ups
    renderer.drawPowerUps(this.ctx, this.powerUps);

    if (this.playerRole === 'heroine') {
      // Draw fleeing boy NPCs
      for (const boy of this.boys) {
        renderer.drawBoy(this.ctx, boy);
      }

      // Draw Heroine Player
      renderer.drawHeroine(
        this.ctx,
        this.currentHeroine,
        this.playerX,
        this.playerY,
        this.playerFacingAngle,
        this.isMoving || this.isDashing,
        this.walkCycle,
        this.isRageActive,
        this.currentHeroine.intimidationRadius + (this.auraBoostTimer > 0 ? 80 : 0),
        progression.getProgress().heroineCustomization
      );
    } else {
      // BOY SURVIVAL MODE:
      // Draw Banana Traps
      renderer.drawBananaTraps(this.ctx, this.bananaTraps);

      // Draw Keys
      renderer.drawKeys(this.ctx, this.keys);

      // Draw Chasing Heroine Hunters
      for (const hunter of this.heroineHunters) {
        renderer.drawHeroineHunter(this.ctx, hunter);
      }

      // Draw Player Boy with "أنت" marker, custom outfit, and magnet field
      renderer.drawPlayerBoy(
        this.ctx,
        this.playerX,
        this.playerY,
        this.playerFacingAngle,
        this.walkCycle,
        this.isMoving || this.isDashing,
        this.boyPanic,
        progression.getProgress().boyCustomization,
        progression.getMagnetRadius()
      );
    }

    // Draw Particles & Comic Text
    this.particles.render(this.ctx);

    this.ctx.restore();
  }
}
