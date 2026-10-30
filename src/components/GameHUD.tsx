import React from 'react';
import { GameStats, HeroineProfile } from '../types/game';
import { Volume2, VolumeX, Pause, Sparkles, Key, AlertTriangle, ShieldAlert } from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  heroine: HeroineProfile;
  isMuted: boolean;
  onToggleSound: () => void;
  onPause: () => void;
  onShockwave: () => void;
  onDash: () => void;
  onRage: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  heroine,
  isMuted,
  onToggleSound,
  onPause,
}) => {
  const isBoy = stats.playerRole === 'boy';
  const isTimeCritical = stats.timeRemaining <= 10;
  const isPanicCritical = isBoy && stats.boyPanic >= 75;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6 select-none font-['Cairo',sans-serif]">
      {/* Top Status Perimeter */}
      <div className="flex items-start justify-between w-full">
        {/* Left cluster: Time & Wave */}
        <div className="flex flex-col gap-1 pointer-events-auto">
          <div
            className={`px-4 py-2 rounded-2xl border text-center font-black ${
              isTimeCritical
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                : 'bg-slate-900/90 border-slate-800 text-slate-100'
            }`}
          >
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">الوقت المتبقي</div>
            <div className="text-2xl font-mono tabular-nums tracking-wider">
              {Math.floor(stats.timeRemaining / 60)}:
              {(stats.timeRemaining % 60).toString().padStart(2, '0')}
            </div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-bold text-cyan-300 text-center">
            {isBoy ? `مرحلة الهروب ${stats.wave}` : `المرحلة ${stats.wave}`}
          </div>
        </div>

        {/* Center cluster: Objective Progress */}
        <div className="flex flex-col items-center gap-1.5 w-72 max-w-[48vw] pointer-events-auto">
          {isBoy ? (
            <>
              {/* BOY MODE: Keys & Gate status */}
              <div className="flex items-center justify-between w-full px-1 text-xs font-bold">
                <span className="text-amber-300 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5" />
                  مفاتيح بوابة الهروب
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.keysCollected} / {stats.keysRequired}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${Math.min(100, (stats.keysCollected / stats.keysRequired) * 100)}%` }}
                />
              </div>

              {stats.gateUnlocked ? (
                <div className="animate-bounce px-3 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/50">
                  🟢 البوابات مفتوحة! اهرب الآن عبر أي مخرج!
                </div>
              ) : (
                <div className="text-[11px] text-slate-400 font-semibold">
                  اجمع المفاتيح واهرب من ضربات البطلات!
                </div>
              )}
            </>
          ) : (
            <>
              {/* HEROINE MODE: Boys chased count */}
              <div className="flex items-center justify-between w-full px-1 text-xs font-bold">
                <span className="text-pink-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  تم طردهم مذعورين
                </span>
                <span className="font-mono tabular-nums text-white">
                  {stats.scaredBoysCount} / {stats.totalBoys}
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                  style={{ width: `${Math.min(100, (stats.scaredBoysCount / stats.totalBoys) * 100)}%` }}
                />
              </div>

              {stats.combo > 1 && (
                <div className="animate-bounce px-2.5 py-0.5 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/40">
                  🔥 كومبو مضاعف x{stats.combo}!
                </div>
              )}
            </>
          )}
        </div>

        {/* Right cluster: Score, Bananas & Controls */}
        <div className="flex items-start gap-2 pointer-events-auto">
          <div className="flex flex-col gap-1 items-end">
            <div className="px-4 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">النقاط</div>
              <div className="text-lg font-mono tabular-nums font-extrabold text-amber-300">
                {stats.score.toLocaleString()}
              </div>
            </div>

            {isBoy && (
              <div className="px-3 py-1 rounded-xl bg-amber-950/80 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1">
                <span>🍌 الفخاخ المتبقية:</span>
                <span className="font-mono font-black">{stats.bananasRemaining}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={onToggleSound}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="كتم/تشغيل الصوت"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onPause}
              className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="إيقاف مؤقت"
            >
              <Pause className="w-4 h-4 text-purple-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Status Perimeter */}
      <div className="flex items-end justify-between w-full">
        {/* Left: Panic Meter (for Boy) OR Rage Meter (for Heroine) */}
        {isBoy ? (
          <div className="flex flex-col gap-1.5 pointer-events-auto w-64">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className={`flex items-center gap-1 ${isPanicCritical ? 'text-red-400 animate-pulse' : 'text-cyan-300'}`}>
                <ShieldAlert className="w-3.5 h-3.5" />
                مستوى الرعب والهلع
              </span>
              <span className="font-mono tabular-nums text-slate-200">{stats.boyPanic}%</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-150 ${
                  isPanicCritical
                    ? 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse shadow-[0_0_14px_rgba(239,68,68,0.9)]'
                    : stats.boyPanic > 40
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                }`}
                style={{ width: `${stats.boyPanic}%` }}
              />
            </div>
            {isPanicCritical && (
              <span className="text-[11px] font-black text-red-400 animate-bounce flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                ابتعد عن البطلات بسرعة! اقتربت من الإغماء من الخوف!
              </span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 pointer-events-auto w-56">
            <div className="flex items-center justify-between text-xs font-bold px-1">
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                طاقة الغضب الخارق (E)
              </span>
              <span className="font-mono tabular-nums text-slate-300">{Math.floor(stats.rage)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-900/90 border border-slate-800 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  stats.rage >= 100
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 animate-pulse shadow-[0_0_12px_rgba(251,191,36,0.8)]'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500'
                }`}
                style={{ width: `${stats.rage}%` }}
              />
            </div>
            {stats.rage >= 100 && (
              <span className="text-[11px] font-extrabold text-amber-300 animate-bounce">
                ⚡ اضغطي E لإطلاق الهلع الشامل!
              </span>
            )}
          </div>
        )}

        {/* Right: Quick Ability Reminder */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/85 border border-slate-800 pointer-events-auto text-xs">
          {isBoy ? (
            <div className="flex items-center gap-3 text-slate-300">
              <span>🍌 مسافة: <strong className="text-amber-300">فخ موزة</strong></span>
              <span>⚡ Shift: <strong className="text-cyan-300">اندفاع</strong></span>
              <span>💨 E: <strong className="text-slate-100">دخان</strong></span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: heroine.color }} />
              <span className="font-bold text-white">{heroine.nameAr}</span>
              <span className="text-purple-300">💥 مسافة: صدمة الهيبة</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
