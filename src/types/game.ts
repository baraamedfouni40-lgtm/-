export type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'victory';

export type GameMode = 'campaign' | 'endless' | 'sandbox';

export type PlayerRole = 'boy' | 'heroine';

export interface HeroineProfile {
  id: 'sara' | 'nour' | 'layla';
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  color: string;
  secondaryColor: string;
  glowColor: string;
  speed: number;
  intimidationRadius: number;
  shockwavePower: number;
  specialAbilityAr: string;
  specialAbilityEn: string;
}

export type BoyType = 'runner' | 'pretender' | 'gamer' | 'giant';

export interface BoyEntity {
  id: number;
  type: BoyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseSpeed: number;
  fear: number; // 0 to 100
  isPanicking: boolean;
  isEscaped: boolean;
  facingAngle: number;
  legCycle: number;
  sweatTimer: number;
  shirtColor: string;
  hairColor: string;
  panicCryCooldown: number;
  stumbleTimer: number;
  name: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  type: 'dust' | 'spark' | 'sweat' | 'star' | 'shockwave' | 'comic_text' | 'ring';
  text?: string;
  scale?: number;
}

export interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'bench' | 'tree' | 'cone' | 'fence';
  color: string;
}

export interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'megaphone' | 'lightning' | 'shield' | 'star';
  duration: number;
  collected: boolean;
  bobTimer: number;
}

export interface ArenaConfig {
  id: string;
  nameAr: string;
  nameEn: string;
  width: number;
  height: number;
  bgColor: string;
  gridColor: string;
  borderColor: string;
  obstacles: Obstacle[];
  targetScaredCount: number;
  timeLimit: number;
}

export interface BananaTrap {
  id: number;
  x: number;
  y: number;
  placedTime: number;
}

export interface KeyItem {
  id: number;
  x: number;
  y: number;
  collected: boolean;
  bobTimer: number;
}

export interface HeroineHunter {
  id: string;
  profile: HeroineProfile;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number;
  walkCycle: number;
  stunTimer: number;
  telegraphTimer: number;
  telegraphRadius: number;
}

export type HairStyle = 'messy' | 'spiky' | 'long' | 'cap' | 'ponytail' | 'afro' | 'braids' | 'undercut';

export type OutfitStyle = 'casual' | 'hoodie' | 'superhero_suit' | 'ninja' | 'sports_jersey' | 'cyber_armor';

export type AccessoryType = 'none' | 'glasses' | 'headphones' | 'headband' | 'cap' | 'gold_chain' | 'energy_aura' | 'ninja_mask' | 'hero_cape' | 'golden_crown' | 'cat_ears';

export interface CharacterCustomization {
  skinTone: string;
  eyeColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  outfitStyle: OutfitStyle;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  accessory: AccessoryType;
  auraColor: string;
}

export interface PlayerSkills {
  speedLevel: number; // 1 to 5
  trapLevel: number; // 1 to 5
  dashCooldownLevel: number; // 1 to 5
  fearDefenseLevel: number; // 1 to 5
  magnetLevel: number; // 1 to 5
}

export interface PlayerProgress {
  coins: number;
  boyCustomization: CharacterCustomization;
  heroineCustomization: CharacterCustomization;
  skills: PlayerSkills;
}

export interface GameStats {
  score: number;
  coins: number;
  scaredBoysCount: number;
  totalBoys: number;
  combo: number;
  maxCombo: number;
  timeRemaining: number;
  rage: number; // 0 to 100
  isRageActive: boolean;
  wave: number;
  playerRole: PlayerRole;
  boyPanic: number; // 0 to 100
  keysCollected: number;
  keysRequired: number;
  bananasRemaining: number;
  gateUnlocked: boolean;
}
