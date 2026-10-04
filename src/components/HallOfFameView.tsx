import React from 'react';
import { Sparkles, Trophy, ShieldCheck, Play, Pause, Flame } from 'lucide-react';
import { PastWinner, Track } from '../types';

interface HallOfFameViewProps {
  pastWinners: PastWinner[];
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
}

export const HallOfFameView: React.FC<HallOfFameViewProps> = ({
  pastWinners,
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-zinc-950 border border-amber-500/30 text-right">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span>لوحة الشرف الخالدة (Hall of Fame)</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
          أبطال مسابقات ميدان راب AI السابقين
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl leading-relaxed">
          جميع التراكات المتوجة بالمركز الأول في المسابقات الشهرية السابقة تحظى بـ "الحصانة الأبدية من الحذف" بغض النظر عن خمولها، وتبقى موثقة في الأرشيف تكريماً لإبداعهم وريادتهم في راب الذكاء الاصطناعي.
        </p>
      </div>

      {/* Grid of Champions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pastWinners.map((winner) => {
          const trackMatch = tracks.find((t) => t.id === winner.trackId);
          const isThisPlaying = currentTrack?.id === winner.trackId && isPlaying;

          return (
            <div
              key={winner.id}
              className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-amber-500/40 transition-all space-y-4 group relative overflow-hidden"
            >
              {/* Gold Crown Accent */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>بطل {winner.month} {winner.year}</span>
                </span>
                <span className="text-[11px] text-zinc-400 font-sans">
                  {winner.category === 'diss' ? 'مواجهات الدسّات' : 'الراب العربي'}
                </span>
              </div>

              {/* Cover Art with Golden Ring */}
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800">
                <img
                  src={winner.coverUrl}
                  alt={winner.trackTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                {trackMatch && (
                  <button
                    onClick={() => onPlayTrack(trackMatch)}
                    className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity"
                    aria-label="تشغيل"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-8 h-8 fill-current text-amber-400" />
                    ) : (
                      <Play className="w-8 h-8 fill-current text-white ml-0.5" />
                    )}
                  </button>
                )}
              </div>

              {/* Winner Details */}
              <div className="space-y-1">
                <h4 className="text-base font-bold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                  {winner.trackTitle}
                </h4>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-medium text-zinc-300">الرابر: {winner.artist}</span>
                  <span className="font-mono tabular-nums">{winner.listens.toLocaleString()} استماع</span>
                </div>
              </div>

              {/* Immunity Badge (Permanent Protection Guarantee) */}
              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>محمية أبدياً من الحذف التلقائي</span>
                </span>
                <span className="font-mono text-zinc-500">
                  النقاط: {winner.score.toFixed(3)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
