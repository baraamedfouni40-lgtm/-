import { CharacterCustomization, PlayerProgress, PlayerSkills } from '../types/game';

export const DEFAULT_BOY_CUSTOMIZATION: CharacterCustomization = {
  skinTone: '#fed7aa', // Light natural skin
  eyeColor: '#0284c7', // Ocean Blue Eyes
  hairStyle: 'messy',
  hairColor: '#451a03', // Classic brown
  outfitStyle: 'casual',
  shirtColor: '#0284c7', // Sky Blue hero shirt
  pantsColor: '#1e293b', // Dark slate pants
  shoesColor: '#ffffff', // White sneakers
  accessory: 'headphones',
  auraColor: '#38bdf8',
};

export const DEFAULT_HEROINE_CUSTOMIZATION: CharacterCustomization = {
  skinTone: '#fed7aa',
  eyeColor: '#ec4899', // Radiant Violet-Pink Eyes
  hairStyle: 'long',
  hairColor: '#a855f7', // Electric Violet
  outfitStyle: 'superhero_suit',
  shirtColor: '#ec4899', // Radiant Magenta
  pantsColor: '#0f172a', // Midnight athletic tights
  shoesColor: '#fbbf24', // Golden Champion Boots
  accessory: 'headband',
  auraColor: '#ec4899',
};

export interface StylePreset {
  id: string;
  nameAr: string;
  descAr: string;
  icon: string;
  forRole: 'boy' | 'heroine' | 'both';
  customization: CharacterCustomization;
}

export const PRESET_STYLES: StylePreset[] = [
  {
    id: 'ninja_shadow',
    nameAr: 'نينجا الظلال المتخفي 🥷',
    descAr: 'زي نينجا أسود كامل مع قناع متخفي وعيون حمراء متقدة.',
    icon: '🥷',
    forRole: 'both',
    customization: {
      skinTone: '#fed7aa',
      eyeColor: '#dc2626',
      hairStyle: 'spiky',
      hairColor: '#0f172a',
      outfitStyle: 'ninja',
      shirtColor: '#090d16',
      pantsColor: '#1e293b',
      shoesColor: '#0f172a',
      accessory: 'ninja_mask',
      auraColor: '#a855f7',
    },
  },
  {
    id: 'cyber_runner',
    nameAr: 'عدّاء السايبر المستقبلي ⚡',
    descAr: 'درع تكتيكي نيون، سماعات زرقاء، وشعر أزرق كهربائي وعيون فيروزية.',
    icon: '⚡',
    forRole: 'both',
    customization: {
      skinTone: '#fcd34d',
      eyeColor: '#06b6d4',
      hairStyle: 'undercut',
      hairColor: '#06b6d4',
      outfitStyle: 'cyber_armor',
      shirtColor: '#0891b2',
      pantsColor: '#0e7490',
      shoesColor: '#22d3ee',
      accessory: 'headphones',
      auraColor: '#06b6d4',
    },
  },
  {
    id: 'hoodie_street',
    nameAr: 'بطل الشارع بالهودي 🧢',
    descAr: 'هودي رياضي عصري مع نظارات شمسية كول وحذاء أبيض أنيق.',
    icon: '🧢',
    forRole: 'boy',
    customization: {
      skinTone: '#fed7aa',
      eyeColor: '#b45309',
      hairStyle: 'cap',
      hairColor: '#451a03',
      outfitStyle: 'hoodie',
      shirtColor: '#ea580c',
      pantsColor: '#1e293b',
      shoesColor: '#ffffff',
      accessory: 'glasses',
      auraColor: '#f97316',
    },
  },
  {
    id: 'golden_champion',
    nameAr: 'الملك الذهبي المتوج 👑',
    descAr: 'تاج ذهبي ملكي، سلسلة ذهبية، رداء أبطال فاخر وعيون ذهبية.',
    icon: '👑',
    forRole: 'both',
    customization: {
      skinTone: '#f59e0b',
      eyeColor: '#eab308',
      hairStyle: 'spiky',
      hairColor: '#facc15',
      outfitStyle: 'superhero_suit',
      shirtColor: '#eab308',
      pantsColor: '#78350f',
      shoesColor: '#fef08a',
      accessory: 'golden_crown',
      auraColor: '#fbbf24',
    },
  },
  {
    id: 'super_heroine_cape',
    nameAr: 'فارسة المجرة بالوشاح 🦸‍♀️',
    descAr: 'وشاح طائر، هالة زمردية، عيون زمردية ساحرة وجدائل محارب.',
    icon: '🦸‍♀️',
    forRole: 'heroine',
    customization: {
      skinTone: '#fed7aa',
      eyeColor: '#059669',
      hairStyle: 'braids',
      hairColor: '#10b981',
      outfitStyle: 'superhero_suit',
      shirtColor: '#059669',
      pantsColor: '#064e3b',
      shoesColor: '#34d399',
      accessory: 'hero_cape',
      auraColor: '#10b981',
    },
  },
];

export const DEFAULT_SKILLS: PlayerSkills = {
  speedLevel: 1,
  trapLevel: 1,
  dashCooldownLevel: 1,
  fearDefenseLevel: 1,
  magnetLevel: 1,
};

export const SKILL_UPGRADE_COSTS: Record<number, number> = {
  2: 150,
  3: 300,
  4: 550,
  5: 900,
};

export const SKILL_DESCRIPTIONS = {
  speedLevel: {
    titleAr: 'السرعة الفائقة ⚡',
    descAr: 'يزيد سرعة الركض الأساسية لتجاوز البطلات والمطاردات بسهولة.',
    statLabel: (lvl: number) => `سرعة +${(lvl - 1) * 12}%`,
  },
  trapLevel: {
    titleAr: 'سعة الفخاخ وزمن الصعق 🍌',
    descAr: 'تبدأ بمزيد من فخاخ قشور الموز مع إطالة زمن شلل وتزحلق الخصم.',
    statLabel: (lvl: number) => `${2 + lvl} فخاخ · صعق +${(lvl - 1) * 0.6} ثانية`,
  },
  dashCooldownLevel: {
    titleAr: 'إتقان الاندفاع السريع 💨',
    descAr: 'يقلل وقت انتظار الاندفاع ويزيد مسافة الانطلاق السريع.',
    statLabel: (lvl: number) => `تبريد -${(lvl - 1) * 0.25} ثانية · قوة +${(lvl - 1) * 15}%`,
  },
  fearDefenseLevel: {
    titleAr: 'صلابة الأعصاب ومقاومة الرعب 🛡️',
    descAr: 'يقلل سرعة تصاعد مؤشر الهلع عند الاقتراب من هيبة البطلات.',
    statLabel: (lvl: number) => `مقاومة الرعب +${(lvl - 1) * 18}%`,
  },
  magnetLevel: {
    titleAr: 'المغناطيس الخارق للجوائز 🧲',
    descAr: 'يجذب المفاتيح الذهبية، الأحذية، وعناصر القوة نحوك تلقائياً.',
    statLabel: (lvl: number) => (lvl === 1 ? 'غير مفعل' : `مدى الجذب: ${lvl * 55} بكسل`),
  },
};

const STORAGE_KEY = 'arena_game_player_progress_v2';

export class ProgressionManager {
  private progress: PlayerProgress;

  constructor() {
    this.progress = this.loadProgress();
  }

  private loadProgress(): PlayerProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          coins: typeof parsed.coins === 'number' ? parsed.coins : 300,
          boyCustomization: { ...DEFAULT_BOY_CUSTOMIZATION, ...(parsed.boyCustomization || {}) },
          heroineCustomization: { ...DEFAULT_HEROINE_CUSTOMIZATION, ...(parsed.heroineCustomization || {}) },
          skills: { ...DEFAULT_SKILLS, ...(parsed.skills || {}) },
        };
      }
    } catch {
      // ignore
    }
    return {
      coins: 300, // Starting welcome coins to try out customization/upgrades!
      boyCustomization: { ...DEFAULT_BOY_CUSTOMIZATION },
      heroineCustomization: { ...DEFAULT_HEROINE_CUSTOMIZATION },
      skills: { ...DEFAULT_SKILLS },
    };
  }

  public saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
    } catch {}
  }

  public getProgress(): PlayerProgress {
    return this.progress;
  }

  public addCoins(amount: number) {
    this.progress.coins = Math.max(0, this.progress.coins + amount);
    this.saveProgress();
  }

  public updateBoyCustomization(customization: Partial<CharacterCustomization>) {
    this.progress.boyCustomization = {
      ...this.progress.boyCustomization,
      ...customization,
    };
    this.saveProgress();
  }

  public resetBoyCustomization() {
    this.progress.boyCustomization = { ...DEFAULT_BOY_CUSTOMIZATION };
    this.saveProgress();
  }

  public updateHeroineCustomization(customization: Partial<CharacterCustomization>) {
    this.progress.heroineCustomization = {
      ...this.progress.heroineCustomization,
      ...customization,
    };
    this.saveProgress();
  }

  public resetHeroineCustomization() {
    this.progress.heroineCustomization = { ...DEFAULT_HEROINE_CUSTOMIZATION };
    this.saveProgress();
  }

  public upgradeSkill(skillKey: keyof PlayerSkills): boolean {
    const currentLevel = this.progress.skills[skillKey];
    if (currentLevel >= 5) return false;

    const nextLevel = currentLevel + 1;
    const cost = SKILL_UPGRADE_COSTS[nextLevel];

    if (this.progress.coins >= cost) {
      this.progress.coins -= cost;
      this.progress.skills[skillKey] = nextLevel;
      this.saveProgress();
      return true;
    }
    return false;
  }

  // Calculate actual gameplay values from skill levels
  public getSpeedMultiplier(): number {
    return 1 + (this.progress.skills.speedLevel - 1) * 0.12;
  }

  public getStartingTraps(): number {
    return 2 + this.progress.skills.trapLevel;
  }

  public getStunDuration(): number {
    return 2.5 + (this.progress.skills.trapLevel - 1) * 0.6;
  }

  public getDashCooldown(): number {
    return Math.max(0.7, 1.6 - (this.progress.skills.dashCooldownLevel - 1) * 0.22);
  }

  public getDashSpeedMultiplier(): number {
    return 1 + (this.progress.skills.dashCooldownLevel - 1) * 0.15;
  }

  public getPanicResistanceMultiplier(): number {
    // 1.0 (level 1) down to 0.28 (level 5)
    return Math.max(0.25, 1 - (this.progress.skills.fearDefenseLevel - 1) * 0.18);
  }

  public getMagnetRadius(): number {
    const lvl = this.progress.skills.magnetLevel;
    if (lvl <= 1) return 0;
    return lvl * 55;
  }
}

export const progression = new ProgressionManager();
