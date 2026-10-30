import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onOpenCustomization?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleSound,
  onOpenCustomization,
}) => {
  return (
    <div className="absolute inset-0 z-40 bg-slate-950/80 flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center">
        <h2 className="text-2xl font-black text-white mb-2">اللعبة متوقفة مؤقتاً</h2>
        <p className="text-xs text-slate-400 mb-6 font-semibold">خذ نفساً عميقاً ثم واصل التحدي!</p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/30 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>استئناف اللعب</span>
          </button>

          {onOpenCustomization && (
            <button
              onClick={onOpenCustomization}
              className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-sm border border-amber-500/40 shadow-md transition-all cursor-pointer"
            >
              <span>تخصيص وترقية الشخصية 🎨</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المرحلة</span>
          </button>

          <button
            onClick={onToggleSound}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}</span>
          </button>

          <button
            onClick={onHome}
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-bold text-sm border border-slate-800 transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للشاشة الرئيسية</span>
          </button>
        </div>
      </div>
    </div>
  );
};
