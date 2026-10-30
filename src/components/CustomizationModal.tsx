import React, { useState, useEffect, useRef } from 'react';
import {
  CharacterCustomization,
  PlayerProgress,
  PlayerRole,
  PlayerSkills,
  HairStyle,
  OutfitStyle,
  AccessoryType,
} from '../types/game';
import {
  progression,
  PRESET_STYLES,
  SKILL_DESCRIPTIONS,
  SKILL_UPGRADE_COSTS,
} from '../game/progression';
import { renderer } from '../game/renderer';
import { sounds } from '../audio/sound';
import {
  Palette,
  Zap,
  X,
  Sparkles,
  Check,
  Coins,
  Eye,
  Shirt,
  Scissors,
  Crown,
  RotateCcw,
  Wand2,
  Footprints,
} from 'lucide-react';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerRole: PlayerRole;
  onUpdate: () => void;
}

// 1. Skin Tones
const SKIN_TONES = [
  { label: 'فاتح طبيعي', value: '#fed7aa' },
  { label: 'قمحي مشرق', value: '#fcd34d' },
  { label: 'برونزي رياضي', value: '#f59e0b' },
  { label: 'أسمر جذاب', value: '#b45309' },
  { label: 'داكن عميق', value: '#78350f' },
];

// 2. Eye Colors (ألوان العيون)
const EYE_COLORS = [
  { label: 'أزرق محيطي ساطع', value: '#0284c7' },
  { label: 'عسلي عنبري دافئ', value: '#b45309' },
  { label: 'زمردي أخضر', value: '#059669' },
  { label: 'أسود ليلي عميق', value: '#0f172a' },
  { label: 'بنفسجي نجمي سحري', value: '#7c3aed' },
  { label: 'وردي خارق مشع', value: '#ec4899' },
  { label: 'ياقوتي ناري', value: '#dc2626' },
  { label: 'ذهبي أسطوري', value: '#eab308' },
  { label: 'فيروزي نيون سايبر', value: '#06b6d4' },
];

// 3. Hair Styles (تسريحات الشعر)
const HAIR_STYLES: { label: string; value: HairStyle; icon: string }[] = [
  { label: 'فوضوي كلاسيكي', value: 'messy', icon: '👦' },
  { label: 'سبايكي حاد ⚡', value: 'spiky', icon: '⚡' },
  { label: 'شعر طويل ورياح', value: 'long', icon: '💨' },
  { label: 'كاب رياضي عصري', value: 'cap', icon: '🧢' },
  { label: 'ذيل حصان محارب', value: 'ponytail', icon: '🥋' },
  { label: 'آفرو كثيف كلاسيك', value: 'afro', icon: '👑' },
  { label: 'جدائل بطولية', value: 'braids', icon: '✨' },
  { label: 'قصّة أندر كَت', value: 'undercut', icon: '💈' },
];

// 4. Hair Colors (ألوان الشعر)
const HAIR_COLORS = [
  { label: 'بني شوكولاتة', value: '#451a03' },
  { label: 'أسود فحمي', value: '#0f172a' },
  { label: 'أشقر ذهبي', value: '#eab308' },
  { label: 'أزرق نيون مشع', value: '#06b6d4' },
  { label: 'بنفسجي كهربائي', value: '#a855f7' },
  { label: 'نار برتقالي', value: '#ea580c' },
  { label: 'أحمر ياقوتي', value: '#dc2626' },
  { label: 'أبيض فضي جليدي', value: '#e2e8f0' },
];

// 5. Outfit Styles (الملابس المختلفة)
const OUTFIT_STYLES: { label: string; value: OutfitStyle; desc: string; icon: string }[] = [
  { label: 'كاجوال مريح', value: 'casual', desc: 'تيشرت وبنطال كلاسيكي يومي', icon: '👕' },
  { label: 'هودي ستريت وير', value: 'hoodie', desc: 'هودي بغطاء رأس وجيب أمامي', icon: '🧥' },
  { label: 'بدلة أبطال خارقة', value: 'superhero_suit', desc: 'زي أبطال نيون مشع وشارات', icon: '🦸' },
  { label: 'نينجا الظلال', value: 'ninja', desc: 'أردية قتالية متخفية وحزام تكتيكي', icon: '🥷' },
  { label: 'قميص رياضي #7', value: 'sports_jersey', desc: 'قميص سباق رياضي مع أرقام', icon: '🎽' },
  { label: 'درع سايبر تكتيكي', value: 'cyber_armor', desc: 'درع مستقبلي بخطوط ليزر نيون', icon: '🤖' },
];

// 6. Primary Clothing Colors (ألوان القميص والزي)
const SHIRT_COLORS = [
  { label: 'أزرق سماوي أبطال', value: '#0284c7' },
  { label: 'أحمر ناري جريء', value: '#dc2626' },
  { label: 'وردي خارق', value: '#ec4899' },
  { label: 'زمردي بطولي', value: '#059669' },
  { label: 'بنفسجي ملكي', value: '#7c3aed' },
  { label: 'أسود متخفي', value: '#0f172a' },
  { label: 'برتقالي شمسي', value: '#f97316' },
  { label: 'أصفر ذهبي ساطع', value: '#eab308' },
];

// 7. Pants / Bottom Colors (ألوان البنطال)
const PANTS_COLORS = [
  { label: 'كحلي رياضي', value: '#1e293b' },
  { label: 'رمادي عصري', value: '#475569' },
  { label: 'أسود داكن', value: '#090d16' },
  { label: 'جينز أزرق', value: '#1d4ed8' },
  { label: 'عنابي أبطال', value: '#991b1b' },
  { label: 'أخضر غابي عميق', value: '#064e3b' },
  { label: 'بني جلدي', value: '#78350f' },
];

// 8. Shoes Colors (ألوان الأحذية)
const SHOES_COLORS = [
  { label: 'أبيض ناصع سباق', value: '#ffffff' },
  { label: 'أسود فحمي مطاطي', value: '#0f172a' },
  { label: 'أصفر ذهبي سريع', value: '#fbbf24' },
  { label: 'أحمر حارق', value: '#ef4444' },
  { label: 'أزرق نيون', value: '#38bdf8' },
  { label: 'وردي متوهج', value: '#f472b6' },
  { label: 'زمردي متألق', value: '#34d399' },
];

// 9. Accessories (الإكسسوارات والعتاد)
const ACCESSORIES: { label: string; value: AccessoryType; icon: string }[] = [
  { label: 'بدون إكسسوار', value: 'none', icon: '✨' },
  { label: 'سماعات رأس جيمر', value: 'headphones', icon: '🎧' },
  { label: 'نظارات شمسية كول', value: 'glasses', icon: '😎' },
  { label: 'قناع نينجا متخفي', value: 'ninja_mask', icon: '🥷' },
  { label: 'وشاح أبطال طائر', value: 'hero_cape', icon: '🦸' },
  { label: 'تاج ملكي ذهبي', value: 'golden_crown', icon: '👑' },
  { label: 'آذان قطة مرحة', value: 'cat_ears', icon: '🐱' },
  { label: 'شريط رأس أبطال', value: 'headband', icon: '🥋' },
  { label: 'سلسلة ذهبية لامعة', value: 'gold_chain', icon: '⛓️' },
  { label: 'هالة نيون مشعة', value: 'energy_aura', icon: '💫' },
];

// 10. Energy Aura Colors (ألوان الهالة)
const AURA_COLORS = [
  { label: 'أزرق سماوي', value: '#38bdf8' },
  { label: 'ذهب ساطع', value: '#fbbf24' },
  { label: 'وردي متوهج', value: '#ec4899' },
  { label: 'زمردي مشع', value: '#10b981' },
  { label: 'بنفسجي أسطوري', value: '#a855f7' },
  { label: 'أحمر ملتهب', value: '#ef4444' },
  { label: 'فيروزي سايبر', value: '#06b6d4' },
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  playerRole,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<'appearance' | 'presets' | 'skills'>('appearance');
  const [targetRole, setTargetRole] = useState<PlayerRole>(playerRole);
  const [progress, setProgress] = useState<PlayerProgress>(progression.getProgress());
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      setProgress(progression.getProgress());
      setTargetRole(playerRole);
    }
  }, [isOpen, playerRole]);

  const currentCustomization =
    targetRole === 'boy' ? progress.boyCustomization : progress.heroineCustomization;

  // Real-time canvas preview loop
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let cycle = 0;

    const renderPreview = () => {
      const canvas = previewCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          cycle += 0.05;

          // Background floor grid circle
          ctx.save();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Subtle Grid
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1;
          for (let x = 0; x < canvas.width; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }
          for (let y = 0; y < canvas.height; y += 30) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }

          // Center spotlight
          const grad = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            10,
            canvas.width / 2,
            canvas.height / 2,
            90
          );
          grad.addColorStop(0, targetRole === 'boy' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(236, 72, 153, 0.25)');
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(canvas.width / 2, canvas.height / 2, 90, 0, Math.PI * 2);
          ctx.fill();

          // Draw character
          const cx = canvas.width / 2;
          const cy = canvas.height / 2 + 10;
          const facingAngle = Math.PI * 0.5; // Facing viewer

          if (targetRole === 'boy') {
            renderer.drawPlayerBoy(
              ctx,
              cx,
              cy,
              facingAngle,
              cycle,
              true,
              0,
              currentCustomization,
              progression.getMagnetRadius() > 0 ? 55 : 0
            );
          } else {
            renderer.drawHeroine(
              ctx,
              {
                id: 'sara',
                nameAr: 'البطلة',
                nameEn: 'Heroine',
                titleAr: 'المحاربة',
                titleEn: 'Warrior',
                descriptionAr: '',
                color: currentCustomization.shirtColor,
                secondaryColor: currentCustomization.hairColor,
                glowColor: currentCustomization.auraColor + '66',
                speed: 320,
                intimidationRadius: 65,
                shockwavePower: 120,
                specialAbilityAr: '',
                specialAbilityEn: '',
              },
              cx,
              cy,
              facingAngle,
              true,
              cycle,
              false,
              55,
              currentCustomization
            );
          }
          ctx.restore();
        }
      }
      animId = requestAnimationFrame(renderPreview);
    };

    animId = requestAnimationFrame(renderPreview);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, targetRole, currentCustomization]);

  if (!isOpen) return null;

  const handleUpdateCustom = (field: keyof CharacterCustomization, value: any) => {
    sounds.playTick();
    if (targetRole === 'boy') {
      progression.updateBoyCustomization({ [field]: value });
    } else {
      progression.updateHeroineCustomization({ [field]: value });
    }
    setProgress({ ...progression.getProgress() });
    onUpdate();
  };

  const handleApplyPreset = (presetCustomization: CharacterCustomization) => {
    sounds.playPowerUp();
    if (targetRole === 'boy') {
      progression.updateBoyCustomization(presetCustomization);
    } else {
      progression.updateHeroineCustomization(presetCustomization);
    }
    setProgress({ ...progression.getProgress() });
    onUpdate();
  };

  const handleResetDefaults = () => {
    sounds.playTick();
    if (targetRole === 'boy') {
      progression.resetBoyCustomization();
    } else {
      progression.resetHeroineCustomization();
    }
    setProgress({ ...progression.getProgress() });
    onUpdate();
  };

  const handleUpgradeSkill = (skillKey: keyof PlayerSkills) => {
    const success = progression.upgradeSkill(skillKey);
    if (success) {
      sounds.playPowerUp();
      setProgress({ ...progression.getProgress() });
      onUpdate();
    }
  };

  const currentOutfit = OUTFIT_STYLES.find((o) => o.value === currentCustomization.outfitStyle) || OUTFIT_STYLES[0];
  const currentAccessory = ACCESSORIES.find((a) => a.value === currentCustomization.accessory) || ACCESSORIES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-none flex items-center justify-center p-2 sm:p-4 md:p-6 select-none font-['Cairo',sans-serif]">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl max-w-5xl w-full h-[92vh] max-h-[820px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
              <Palette className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <span>استوديو تخصيص الشخصيات والملابس</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold hidden sm:inline-block">
                  تحديث فوري بالساحة
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-semibold">
                خصّص ملامح الوجه، لون العينين، تسريحات الشعر، والملابس والإكسسوارات الكاملة!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Coins Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm shadow-md">
              <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="font-mono tabular-nums">{progress.coins.toLocaleString()} ⭐</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Role Switcher */}
        <div className="flex flex-wrap items-center justify-between px-5 py-2.5 border-b border-slate-800 bg-slate-900/90 gap-2 sm:gap-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab('appearance')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'appearance'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>تخصيص المظهر التفصيلي</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'presets'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-4 h-4 text-pink-300" />
              <span>أزياء وطرز جاهزة ⚡</span>
            </button>

            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'skills'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>شجرة المهارات ({progress.coins} ⭐)</span>
            </button>
          </div>

          {/* Sub Role Switcher (For Appearance & Presets) */}
          {activeTab !== 'skills' && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/80 border border-slate-800">
              <button
                onClick={() => setTargetRole('boy')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  targetRole === 'boy'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>الرجل / الفتى</span>
                <span>🏃‍♂️</span>
              </button>
              <button
                onClick={() => setTargetRole('heroine')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  targetRole === 'heroine'
                    ? 'bg-pink-600 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>البطلة الخارقة</span>
                <span>👑</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'appearance' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Live Animated Preview Canvas */}
              <div className="lg:col-span-4 flex flex-col items-center p-4 rounded-3xl bg-slate-950 border border-slate-800 text-center sticky top-0 shadow-lg">
                <span className="text-xs font-bold text-slate-400 mb-2">معاينة حية ومباشرة للشخصية</span>
                <canvas
                  ref={previewCanvasRef}
                  width={220}
                  height={220}
                  className="rounded-2xl border border-slate-800 shadow-inner mb-3 bg-slate-900"
                />
                <div className="text-sm font-extrabold text-white mb-0.5">
                  {targetRole === 'boy' ? 'الفتى الهارب (شخصيتك)' : 'البطلة الخارقة'}
                </div>
                <div className="text-xs text-purple-300 font-semibold mb-2">
                  {currentOutfit.label} · {currentAccessory.label}
                </div>

                {/* Quick Info Tags */}
                <div className="w-full grid grid-cols-2 gap-1.5 text-[11px] text-slate-300 mb-3">
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>لون العينين مخصص</span>
                  </div>
                  <div className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center gap-1">
                    <Shirt className="w-3.5 h-3.5 text-amber-400" />
                    <span className="truncate">{currentOutfit.label}</span>
                  </div>
                </div>

                <button
                  onClick={handleResetDefaults}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة ضبط المظهر الافتراضي</span>
                </button>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="lg:col-span-8 flex flex-col gap-6 overflow-y-auto pr-1">
                {/* 1. Skin Tone (لون البشرة) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      <span>لون البشرة:</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {SKIN_TONES.find((s) => s.value === currentCustomization.skinTone)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {SKIN_TONES.map((st) => (
                      <button
                        key={st.value}
                        onClick={() => handleUpdateCustom('skinTone', st.value)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.skinTone === st.value
                            ? 'border-purple-400 scale-110 shadow-lg'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: st.value }}
                        title={st.label}
                      >
                        {currentCustomization.skinTone === st.value && (
                          <Check className="w-4 h-4 text-slate-900 absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Eye Color (لون العين) - User Request Requirement */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Eye className="w-4 h-4 text-cyan-400" />
                      <span>لون العينين (Eye Color):</span>
                    </label>
                    <span className="text-[11px] text-cyan-300 font-semibold">
                      {EYE_COLORS.find((e) => e.value === currentCustomization.eyeColor)?.label || 'مخصص'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {EYE_COLORS.map((ec) => (
                      <button
                        key={ec.value}
                        onClick={() => handleUpdateCustom('eyeColor', ec.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative shadow-sm ${
                          currentCustomization.eyeColor === ec.value
                            ? 'border-white scale-110 shadow-[0_0_10px_currentColor]'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: ec.value, color: ec.value }}
                        title={ec.label}
                      >
                        {currentCustomization.eyeColor === ec.value && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto drop-shadow" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Hair Style (تسريحة الشعر) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-purple-400" />
                      <span>تسريحة الشعر:</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HAIR_STYLES.map((hs) => (
                      <button
                        key={hs.value}
                        onClick={() => handleUpdateCustom('hairStyle', hs.value)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-2 ${
                          currentCustomization.hairStyle === hs.value
                            ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span>{hs.icon}</span>
                        <span className="truncate">{hs.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Hair Color (لون الشعر) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>لون الشعر:</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {HAIR_COLORS.find((h) => h.value === currentCustomization.hairColor)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {HAIR_COLORS.map((hc) => (
                      <button
                        key={hc.value}
                        onClick={() => handleUpdateCustom('hairColor', hc.value)}
                        className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.hairColor === hc.value
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: hc.value }}
                        title={hc.label}
                      >
                        {currentCustomization.hairColor === hc.value && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 5. Outfit Style (الملابس المختلفة) - User Request Requirement */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Shirt className="w-4 h-4 text-amber-400" />
                      <span>نوع وتصميم الملابس (Outfit Style):</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {OUTFIT_STYLES.map((os) => (
                      <button
                        key={os.value}
                        onClick={() => handleUpdateCustom('outfitStyle', os.value)}
                        className={`p-3 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                          currentCustomization.outfitStyle === os.value
                            ? 'bg-purple-600/30 border-purple-400 text-white shadow-md ring-1 ring-purple-400'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg">{os.icon}</span>
                          {currentCustomization.outfitStyle === os.value && (
                            <span className="p-1 rounded-full bg-purple-500 text-white text-[10px]">
                              <Check className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <div className="font-extrabold text-xs text-white">{os.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{os.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. Primary Clothing / Shirt Color */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span>لون الزي الأساسي / القميص:</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      {SHIRT_COLORS.find((s) => s.value === currentCustomization.shirtColor)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {SHIRT_COLORS.map((sc) => (
                      <button
                        key={sc.value}
                        onClick={() => handleUpdateCustom('shirtColor', sc.value)}
                        className={`w-8 h-8 rounded-xl border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.shirtColor === sc.value
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: sc.value }}
                        title={sc.label}
                      >
                        {currentCustomization.shirtColor === sc.value && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7. Pants / Bottoms Color */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                      <span>لون السروال / البنطال:</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {PANTS_COLORS.map((pc) => (
                      <button
                        key={pc.value}
                        onClick={() => handleUpdateCustom('pantsColor', pc.value)}
                        className={`w-8 h-8 rounded-xl border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.pantsColor === pc.value
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: pc.value }}
                        title={pc.label}
                      >
                        {currentCustomization.pantsColor === pc.value && (
                          <Check className="w-3.5 h-3.5 text-white absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 8. Shoes Color (لون الأحذية الرياضية) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Footprints className="w-4 h-4 text-emerald-400" />
                      <span>لون الأحذية الرياضية (Shoes Color):</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {SHOES_COLORS.map((shc) => (
                      <button
                        key={shc.value}
                        onClick={() => handleUpdateCustom('shoesColor', shc.value)}
                        className={`w-8 h-8 rounded-xl border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.shoesColor === shc.value
                            ? 'border-white scale-110 shadow-lg'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: shc.value }}
                        title={shc.label}
                      >
                        {currentCustomization.shoesColor === shc.value && (
                          <Check className="w-3.5 h-3.5 text-slate-900 absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 9. Accessories (الإكسسوارات والعتاد) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-amber-400" />
                      <span>الإكسسوار والعتاد المجهّز:</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ACCESSORIES.map((acc) => (
                      <button
                        key={acc.value}
                        onClick={() => handleUpdateCustom('accessory', acc.value)}
                        className={`p-2.5 rounded-xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
                          currentCustomization.accessory === acc.value
                            ? 'bg-purple-600 border-purple-400 text-white shadow'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-base">{acc.icon}</span>
                        <span className="truncate">{acc.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 10. Aura Color (لون الهالة) */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-pink-400" />
                      <span>لون الهالة والطاقة المحيطة:</span>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {AURA_COLORS.map((ac) => (
                      <button
                        key={ac.value}
                        onClick={() => handleUpdateCustom('auraColor', ac.value)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer relative ${
                          currentCustomization.auraColor === ac.value
                            ? 'border-white scale-110 shadow-[0_0_10px_currentColor]'
                            : 'border-slate-700 hover:scale-105'
                        }`}
                        style={{ backgroundColor: ac.value, color: ac.value }}
                        title={ac.label}
                      >
                        {currentCustomization.auraColor === ac.value && (
                          <Check className="w-3.5 h-3.5 text-slate-950 absolute inset-0 m-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === 'presets' ? (
            /* Presets Tab (الأزياء والطرز الجاهزة) */
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wand2 className="w-6 h-6 text-pink-300" />
                  <div>
                    <h3 className="font-black text-sm text-white">أطقم وأزياء أسطورية جاهزة بنقرة واحدة</h3>
                    <p className="text-xs text-slate-300">
                      اختر زياً متكاملاً يتضمن تسريحة الشعر، الأعين، الملابس، الأحذية والإكسسوارات المتناسقة!
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_STYLES.filter((p) => p.forRole === 'both' || p.forRole === targetRole).map((preset) => (
                  <div
                    key={preset.id}
                    className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition-all shadow-md group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl p-2 rounded-2xl bg-slate-900 border border-slate-800">
                          {preset.icon}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold">
                          طقم متكامل
                        </span>
                      </div>
                      <h4 className="text-base font-black text-white mb-1">{preset.nameAr}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed mb-4">{preset.descAr}</p>

                      {/* Color Palette Preview */}
                      <div className="flex items-center gap-2 mb-4 p-2 rounded-xl bg-slate-900 border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 font-bold ml-1">الألوان:</span>
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: preset.customization.eyeColor }}
                          title="لون العين"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700"
                          style={{ backgroundColor: preset.customization.hairColor }}
                          title="لون الشعر"
                        />
                        <div
                          className="w-4 h-4 rounded-md border border-slate-700"
                          style={{ backgroundColor: preset.customization.shirtColor }}
                          title="لون الزي"
                        />
                        <div
                          className="w-4 h-4 rounded-md border border-slate-700"
                          style={{ backgroundColor: preset.customization.pantsColor }}
                          title="لون السروال"
                        />
                        <div
                          className="w-4 h-4 rounded-md border border-slate-700"
                          style={{ backgroundColor: preset.customization.shoesColor }}
                          title="لون الحذاء"
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-slate-700 shadow-sm"
                          style={{ backgroundColor: preset.customization.auraColor }}
                          title="الهالة"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyPreset(preset.customization)}
                      className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>تجهيز هذا الطقم للشخصية</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Skills Tab */
            <div className="flex flex-col gap-4 max-w-3xl mx-auto">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-300" />
                  <div>
                    <h3 className="font-black text-sm text-white">ترقية قدرات ومهارات البطل والفتى</h3>
                    <p className="text-xs text-slate-300">
                      كل ترقية تمنحك أفضلية حاسمة أثناء المطاردة أو النجاة والهروب!
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">رصيدك الحالي:</div>
                  <div className="text-lg font-mono font-black text-amber-300">
                    {progress.coins.toLocaleString()} ⭐
                  </div>
                </div>
              </div>

              {/* Skills List */}
              <div className="grid grid-cols-1 gap-3.5">
                {(Object.keys(SKILL_DESCRIPTIONS) as Array<keyof PlayerSkills>).map((skillKey) => {
                  const info = SKILL_DESCRIPTIONS[skillKey];
                  const currentLevel = progress.skills[skillKey];
                  const isMax = currentLevel >= 5;
                  const nextCost = !isMax ? SKILL_UPGRADE_COSTS[currentLevel + 1] : 0;
                  const canAfford = progress.coins >= nextCost && !isMax;

                  return (
                    <div
                      key={skillKey}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-extrabold text-sm text-white">{info.titleAr}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-black font-mono">
                            مستوى {currentLevel} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mb-2 leading-relaxed">{info.descAr}</p>

                        {/* Level Progress Bars */}
                        <div className="flex items-center gap-1.5 w-44">
                          {[1, 2, 3, 4, 5].map((lvl) => (
                            <div
                              key={lvl}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                lvl <= currentLevel
                                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_6px_rgba(245,158,11,0.5)]'
                                  : 'bg-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-[11px] font-bold text-amber-300 mt-1.5">
                          التأثير الحالي: {info.statLabel(currentLevel)}
                        </div>
                      </div>

                      {/* Upgrade CTA */}
                      <div>
                        {isMax ? (
                          <div className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-black text-center">
                            ⭐ المستوى الأقصى (MAX)
                          </div>
                        ) : (
                          <button
                            onClick={() => handleUpgradeSkill(skillKey)}
                            disabled={!canAfford}
                            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                              canAfford
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/30 active:scale-95'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60'
                            }`}
                          >
                            <span>ترقية إلى مستوى {currentLevel + 1}</span>
                            <span className="font-mono font-black">({nextCost} ⭐)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-800 bg-slate-950/90">
          <div className="text-xs text-slate-400">
            يتم حفظ جميع خيارات المظهر، الملابس، والمهارات تلقائياً على جهازك.
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
          >
            حفظ وجاهز للعب
          </button>
        </div>
      </div>
    </div>
  );
};
