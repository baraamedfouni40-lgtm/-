import React, { useState } from 'react';
import { GameMode, PlayerRole } from '../types/game';
import { HEROINES } from '../game/constants';
import { sounds } from '../audio/sound';
import { Volume2, VolumeX, Sparkles, Play, ShieldAlert, Crown, Footprints, Palette, Coins } from 'lucide-react';
import { progression } from '../game/progression';

interface TitleScreenProps {
  onStart: (role: PlayerRole, heroineId: 'sara' | 'nour' | 'layla', mode: GameMode) => void;
  onToggleSound: () => boolean;
  isMuted: boolean;
  onOpenCustomization: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onToggleSound,
  isMuted,
  onOpenCustomization,
}) => {
  const [selectedRole, setSelectedRole] = useState<PlayerRole>('boy'); // Default to Boy as requested!
  const [selectedHeroineId, setSelectedHeroineId] = useState<'sara' | 'nour' | 'layla'>('sara');
  const [selectedMode, setSelectedMode] = useState<GameMode>('campaign');
  const [soundMuted, setSoundMuted] = useState(isMuted);
  const coins = progression.getProgress().coins;

  const handleStart = () => {
    sounds.playShockwave();
    onStart(selectedRole, selectedHeroineId, selectedMode);
  };

  const handleSoundClick = () => {
    const muted = onToggleSound();
    setSoundMuted(muted);
  };

  React.useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedRole, selectedHeroineId, selectedMode]);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-purple-950/40 to-slate-950 select-none overflow-y-auto">
      {/* Top Bar with sound, coins and customization workshop */}
      <div className="flex items-center justify-between w-full max-w-6xl mx-auto flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-purple-500/30 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>لعبة الآركيد: بنات ضد أولاد • إصدار البطلات والأولاد</span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Coins counter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/30 text-amber-300 text-xs font-black">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono tabular-nums">{coins.toLocaleString()} ⭐</span>
          </div>

          {/* Customization Workshop CTA */}
          <button
            onClick={onOpenCustomization}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white border border-purple-400 text-xs font-black transition-all shadow-md shadow-purple-600/30 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Palette className="w-4 h-4 text-purple-200" />
            <span>تخصيص وترقية الشخصية 🎨</span>
          </button>

          <button
            onClick={handleSoundClick}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
            title="تبديل الصوت"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{soundMuted ? 'الصوت مغلق' : 'الصوت مفعل'}</span>
          </button>
        </div>
      </div>

      {/* Hero Centerpiece: Bespoke Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center max-w-4xl mx-auto w-full py-4">
        <div className="relative mb-3">
          <svg viewBox="0 0 680 120" className="w-full max-w-xl h-auto drop-shadow-[0_10px_25px_rgba(236,72,153,0.35)]">
            <defs>
              <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <text
              x="50%"
              y="65"
              textAnchor="middle"
              fill="url(#heroGradient)"
              fontSize="44"
              fontWeight="900"
              fontFamily="Cairo, sans-serif"
            >
              بطلات الساحة: صدمة الشجعان
            </text>
            <text
              x="50%"
              y="102"
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize="16"
              fontWeight="700"
              fontFamily="Cairo, sans-serif"
              letterSpacing="2"
            >
              البنات خارقات بقوة هائلة • والأولاد يهربون مذعورين!
            </text>
          </svg>
        </div>

        {/* ROLE SELECTION (Boy vs Heroine) */}
        <div className="w-full max-w-2xl mb-5">
          <p className="text-sm font-extrabold text-amber-300 mb-2">اختر شخصيتك وطور اللعب:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
            {/* Boy Role (Default / User Request) */}
            <div
              onClick={() => setSelectedRole('boy')}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 ${
                selectedRole === 'boy'
                  ? 'bg-sky-950/80 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-102 ring-2 ring-cyan-400/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black">
                  موصى به لطلبك!
                </span>
                <div className="flex items-center gap-1.5 text-cyan-400 font-black text-base">
                  <span>العب كالفتى / الرجل 🏃‍♂️</span>
                  <Footprints className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-200 mb-1.5">طور النجاة والهروب الكبير:</p>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                أنت الفتى في الساحة! اهرب من ضربات وهيبة البطلات الخارقات، اجمع المفاتيح 🔑، ارمِ فخاخ قشور الموز 🍌 لعرقلتهن، واهرب من البوابة قبل أن يمسكن بك!
              </p>
              <div className="text-[10px] text-amber-300 font-semibold pt-1 border-t border-slate-800">
                المهام: اجمع 3 مفاتيح وافتح بوابة الهروب!
              </div>
            </div>

            {/* Heroine Role */}
            <div
              onClick={() => setSelectedRole('heroine')}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 ${
                selectedRole === 'heroine'
                  ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)] scale-102 ring-2 ring-purple-400/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-[10px] font-black">
                  طور القوة
                </span>
                <div className="flex items-center gap-1.5 text-pink-400 font-black text-base">
                  <span>العب بالبطلة الخارقة 👑</span>
                  <Crown className="w-5 h-5 text-pink-400" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-200 mb-1.5">طور الهيبة والمطاردة:</p>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                العب ببطلة ذات قوى خارقة وزلازل مدمرة! أرهبي الأولاد في الساحة واجعليهم يفرون مذعورين نحو المخارج واجمعي أعلى كومبو!
              </p>
              <div className="text-[10px] text-pink-300 font-semibold pt-1 border-t border-slate-800">
                المهام: إخلاء الساحة من الأولاد قبل نهاية الوقت!
              </div>
            </div>
          </div>
        </div>

        {/* Heroine Character Selector (If Heroine mode is selected) */}
        {selectedRole === 'heroine' && (
          <div className="w-full mb-5">
            <p className="text-xs font-bold text-slate-400 mb-2">اختاري بطلتك المفضلة:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-w-3xl mx-auto">
              {HEROINES.map((heroine) => {
                const isSelected = heroine.id === selectedHeroineId;
                return (
                  <div
                    key={heroine.id}
                    onClick={() => setSelectedHeroineId(heroine.id)}
                    className={`cursor-pointer rounded-xl p-3 text-right transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-purple-500 shadow-md scale-101'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: heroine.color }}
                      />
                      <h4 className="font-bold text-sm text-white">{heroine.nameAr}</h4>
                    </div>
                    <p className="text-[10px] text-purple-300 line-clamp-1">{heroine.specialAbilityAr}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Game Mode Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <button
            onClick={() => setSelectedMode('campaign')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedMode === 'campaign'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 طور المراحل والبطولة (Waves)
          </button>
          <button
            onClick={() => setSelectedMode('endless')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedMode === 'endless'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⏱️ طور التحدي الزمني
          </button>
          <button
            onClick={() => setSelectedMode('sandbox')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
              selectedMode === 'sandbox'
                ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            🎪 حلبة التدريب الحرة
          </button>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 hover:from-pink-500 hover:to-cyan-500 text-white font-black text-lg shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white group-hover:animate-bounce" />
            <span>
              {selectedRole === 'boy' ? 'ابدأ كـالفتى واهرب الآن! (Space)' : 'ابدئي كـالبطلة واطريدهم! (Space)'}
            </span>
          </button>

          <button
            onClick={onOpenCustomization}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white font-black text-sm border-2 border-amber-500/40 hover:border-amber-400 shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-amber-400" />
            <span>تخصيص وترقية الشخصية ({coins} ⭐)</span>
          </button>
        </div>
      </div>

      {/* Control Hint Line adjusted for selected role */}
      <div className="w-full text-center py-2 border-t border-slate-900">
        {selectedRole === 'boy' ? (
          <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
            <span className="text-cyan-300 font-bold">WASD / الأسهم</span> للهروب والتفادي ·{' '}
            <span className="text-amber-300 font-bold">مسافة / J</span> رمي قشرة موزة فخ 🍌 ·{' '}
            <span className="text-purple-300 font-bold">Shift / K</span> اندفاع النجاة ⚡ ·{' '}
            <span className="text-slate-100 font-bold">E / L</span> قنبلة دخان وتشتيت 💨 ·{' '}
            <span className="text-slate-400 font-bold">Esc</span> إيقاف مؤقت
          </p>
        ) : (
          <p className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
            <span className="text-purple-300 font-bold">WASD</span> للتحرك ·{' '}
            <span className="text-pink-300 font-bold">مسافة / J</span> صدمة الهيبة 💥 ·{' '}
            <span className="text-cyan-300 font-bold">Shift / K</span> اندفاع فائق ⚡ ·{' '}
            <span className="text-amber-300 font-bold">E / L</span> الغضب الخارق 👑 ·{' '}
            <span className="text-slate-400 font-bold">Esc</span> إيقاف مؤقت
          </p>
        )}
      </div>
    </div>
  );
};
