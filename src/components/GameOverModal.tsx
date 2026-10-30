import React from 'react';
import { GameStats } from '../types/game';
import { Trophy, RotateCcw, Home, ArrowRight, Sparkles, Footprints, Crown } from 'lucide-react';

interface GameOverModalProps {
  isVictory: boolean;
  stats: GameStats;
  onNextWave: () => void;
  onRestart: () => void;
  onHome: () => void;
  onOpenCustomization?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stats,
  onNextWave,
  onRestart,
  onHome,
  onOpenCustomization,
}) => {
  const isBoy = stats.playerRole === 'boy';

  let badgeTitle = 'شجاعة مشرفة';
  if (isBoy) {
    if (isVictory) badgeTitle = 'فنان الهروب الأسطوري! 🏃‍♂️💨';
    else badgeTitle = 'محاولة جريئة للتفادي!';
  } else {
    if (stats.maxCombo >= 6) badgeTitle = 'أسطورة الساحة التي لا تُقهر! 👑';
    else if (isVictory) badgeTitle = 'قائدة النصر الباهرة! ⭐';
  }

  return (
    <div className="absolute inset-0 z-40 bg-slate-950/85 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
        {/* Victory/Defeat Icon Emblem */}
        <div className="mb-4">
          {isVictory ? (
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-bounce">
              <Trophy className="w-10 h-10 text-slate-950 fill-slate-950" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              <span className="text-3xl">😱</span>
            </div>
          )}
        </div>

        {/* Title */}
        <h2 className="text-3xl font-black text-white mb-1">
          {isVictory
            ? isBoy
              ? '🎉 نجاة وهروب باهر!'
              : '👑 نـصـر ساحق للبطلة!'
            : isBoy
            ? '😱 شلّك الرعب وأمسكت بك البطلة!'
            : '⏰ انتهى الوقت!'}
        </h2>
        <p className="text-sm font-bold text-slate-300 mb-6">
          {isVictory
            ? isBoy
              ? 'تجاوزت ضربات وهيبة البطلات وفتحت البوابات ونجوت بنجاح!'
              : 'فرّ جميع الأولاد من الساحة مرعوبين وأخليت المكان!'
            : isBoy
            ? 'الهالة كانت ساحقة جداً! استخدم فخاخ قشور الموز وتفادَ حلقات التحذير!'
            : 'كادوا يفلتون! حاولي مجدداً وبسرعة أكبر!'}
        </p>

        {/* Honor Badge */}
        <div className="w-full mb-6 py-2 px-4 rounded-xl bg-purple-950/60 border border-purple-500/30 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="text-xs font-black text-amber-300">{badgeTitle}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-6">
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold mb-1">الرصيد الكلي</div>
            <div className="text-lg font-mono tabular-nums font-black text-amber-400">
              {stats.coins.toLocaleString()} ⭐
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              {isBoy ? 'المفاتيح' : 'الهاربون'}
            </div>
            <div className="text-lg font-mono tabular-nums font-black text-pink-400">
              {isBoy
                ? `${stats.keysCollected} / ${stats.keysRequired}`
                : `${stats.scaredBoysCount} / ${stats.totalBoys}`}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold mb-1">
              {isBoy ? 'نسبة الهلع' : 'أعلى كومبو'}
            </div>
            <div className="text-lg font-mono tabular-nums font-black text-cyan-400">
              {isBoy ? `${stats.boyPanic}%` : `x${stats.maxCombo}`}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {isVictory && (
            <button
              onClick={onNextWave}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <span>المرحلة التالية (Wave {stats.wave + 1})</span>
              <ArrowRight className="w-4 h-4 rotate-180" />
            </button>
          )}

          {onOpenCustomization && (
            <button
              onClick={onOpenCustomization}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-black text-xs shadow-md transition-all cursor-pointer"
            >
              <span>🎨 ترقية المهارات وتخصيص المظهر ({stats.coins} ⭐)</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className={`flex items-center justify-center gap-2 py-3 px-6 rounded-2xl text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer ${
              isVictory
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-purple-600/30'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة التحدي</span>
          </button>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 py-2.5 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-xs border border-slate-800 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>القائمة الرئيسية وتغيير الدور</span>
          </button>
        </div>
      </div>
    </div>
  );
};
