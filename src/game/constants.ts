import { HeroineProfile, ArenaConfig } from '../types/game';

export const HEROINES: HeroineProfile[] = [
  {
    id: 'sara',
    nameAr: 'سارة الجبارة',
    nameEn: 'Sara the Titan',
    titleAr: 'سيدة الزلازل والرعب',
    titleEn: 'Earthquake Queen',
    descriptionAr: 'قوة بدنية خارقة وهالة مهيبة تجعل الأرض تهتز تحت أقدامها. لا يجرؤ أحد على الوقوف أمامها!',
    color: '#ec4899', // Pink-500
    secondaryColor: '#a855f7', // Purple-500
    glowColor: 'rgba(236, 72, 153, 0.45)',
    speed: 310,
    intimidationRadius: 180,
    shockwavePower: 380,
    specialAbilityAr: 'زلزال الهيبة المدمر (صدمة أرضية واسعة)',
    specialAbilityEn: 'Titan Shockwave Slam',
  },
  {
    id: 'nour',
    nameAr: 'نور البرق',
    nameEn: 'Nour the Thunder',
    titleAr: 'سفيرة الصواعق والسرعة',
    titleEn: 'Lightning Sprinter',
    descriptionAr: 'أسرع بطلة في الساحة! تتحرك كالبرق وتترك خلفها أثراً كهربائياً يصيب الأولاد بالهلع الفوري.',
    color: '#06b6d4', // Cyan-500
    secondaryColor: '#eab308', // Yellow-500
    glowColor: 'rgba(6, 182, 212, 0.45)',
    speed: 390,
    intimidationRadius: 140,
    shockwavePower: 320,
    specialAbilityAr: 'وميض الصاعقة (اندفاع فائق وتشتيت)',
    specialAbilityEn: 'Thunderbolt Flash Dash',
  },
  {
    id: 'layla',
    nameAr: 'ليلى الإعصار',
    nameEn: 'Layla the Cyclone',
    titleAr: 'فارسة الرياح المدوية',
    titleEn: 'Gale Empress',
    descriptionAr: 'تتحكم بدوامات الهواء العاتية وصيحتها الجبارة تجعل كل من في الأرجاء يتدافعون نحو المخارج!',
    color: '#10b981', // Emerald-500
    secondaryColor: '#f97316', // Orange-500
    glowColor: 'rgba(16, 185, 129, 0.45)',
    speed: 340,
    intimidationRadius: 160,
    shockwavePower: 350,
    specialAbilityAr: 'إعصار الهلع (دوامة تدفع الأولاد بقوة)',
    specialAbilityEn: 'Cyclone Panic Vortex',
  },
];

export const PANIC_SHOUTS_AR = [
  'يا مامـااا!',
  'اهربـوااا!',
  'إنها خارقة!',
  'يا ويلي!',
  'طارت هيبتنا!',
  'النجدة!',
  'لن أعود أبداً!',
  'أسرع من الريح!',
  'إنها غاضبة!',
  'سامحونااا!',
];

export const HEROINE_SHOUTS_AR = [
  'هاااااه!',
  'استسلموا!',
  'الساحة لنا!',
  'قوة لا تقهر!',
  'إلى أين تهربون؟!',
  'أنا البطلة هنا!',
];

export const BOY_NAMES = [
  'سامي', 'فادي', 'كريم', 'طارق', 'يوسف', 'عمر', 'مازن', 'رامي',
  'أحمد', 'زياد', 'باسل', 'حمزة', 'خالد', 'أدهم', 'وسام', 'فارس'
];

export const ARENAS: ArenaConfig[] = [
  {
    id: 'school',
    nameAr: 'ساحة المدرسة الكبرى',
    nameEn: 'Grand Schoolyard',
    width: 1400,
    height: 900,
    bgColor: '#0f172a',
    gridColor: '#1e293b',
    borderColor: '#38bdf8',
    targetScaredCount: 15,
    timeLimit: 60,
    obstacles: [
      { x: 300, y: 220, width: 140, height: 40, type: 'bench', color: '#64748b' },
      { x: 300, y: 640, width: 140, height: 40, type: 'bench', color: '#64748b' },
      { x: 960, y: 220, width: 140, height: 40, type: 'bench', color: '#64748b' },
      { x: 960, y: 640, width: 140, height: 40, type: 'bench', color: '#64748b' },
      { x: 670, y: 420, width: 60, height: 60, type: 'cone', color: '#f97316' },
      { x: 450, y: 450, width: 20, height: 120, type: 'fence', color: '#475569' },
      { x: 930, y: 450, width: 20, height: 120, type: 'fence', color: '#475569' },
    ],
  },
  {
    id: 'stadium',
    nameAr: 'ملعب التحدي الرياضي',
    nameEn: 'Champions Stadium',
    width: 1600,
    height: 1000,
    bgColor: '#064e3b',
    gridColor: '#065f46',
    borderColor: '#34d399',
    targetScaredCount: 22,
    timeLimit: 55,
    obstacles: [
      { x: 400, y: 300, width: 80, height: 80, type: 'tree', color: '#047857' },
      { x: 1120, y: 300, width: 80, height: 80, type: 'tree', color: '#047857' },
      { x: 400, y: 700, width: 80, height: 80, type: 'tree', color: '#047857' },
      { x: 1120, y: 700, width: 80, height: 80, type: 'tree', color: '#047857' },
      { x: 760, y: 460, width: 80, height: 80, type: 'cone', color: '#f59e0b' },
    ],
  },
  {
    id: 'cyber',
    nameAr: 'حلبة النيون المستقبلية',
    nameEn: 'Cyber Neon Colosseum',
    width: 1700,
    height: 1100,
    bgColor: '#18032e',
    gridColor: '#2b0952',
    borderColor: '#e879f9',
    targetScaredCount: 30,
    timeLimit: 50,
    obstacles: [
      { x: 500, y: 350, width: 160, height: 40, type: 'bench', color: '#a855f7' },
      { x: 1040, y: 350, width: 160, height: 40, type: 'bench', color: '#a855f7' },
      { x: 500, y: 750, width: 160, height: 40, type: 'bench', color: '#a855f7' },
      { x: 1040, y: 750, width: 160, height: 40, type: 'bench', color: '#a855f7' },
      { x: 800, y: 500, width: 100, height: 100, type: 'cone', color: '#06b6d4' },
    ],
  },
];
