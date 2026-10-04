import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Flame, Award, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { Track, Category } from '../types';
import { TrackCard } from './TrackCard';

interface MonthlyContestViewProps {
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onVote: (trackId: string, type: 'up' | 'down') => void;
  userVotesByMonthCategory: { [key: string]: { trackId: string; voteType: 'up' | 'down' } };
  onReport: (track: Track) => void;
  onShare: (track: Track) => void;
  onKeepTrack: (trackId: string) => void;
  onSimulateMonthClose: (category: Category) => void;
  favoriteTrackIds?: string[];
  onToggleFavorite?: (trackId: string) => void;
}

export const MonthlyContestView: React.FC<MonthlyContestViewProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onVote,
  userVotesByMonthCategory,
  onReport,
  onShare,
  onKeepTrack,
  onSimulateMonthClose,
  favoriteTrackIds = [],
  onToggleFavorite,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('rap');
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 28,
    hours: 14,
    minutes: 42,
    seconds: 15,
  });

  // Countdown timer to end of month
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredTracks = tracks
    .filter((t) => t.category === selectedCategory && t.status !== 'deleted')
    .sort((a, b) => b.combinedRankScore - a.combinedRankScore);

  const top3 = filteredTracks.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Contest Header with Live Automated Countdown */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
              <Trophy className="w-4 h-4" />
              <span>المسابقة الشهرية الكبرى · أكتوبر 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-100">
              صراع القوافي والتصويت الجماهيري الموثوق
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
              تُغلق المسابقة آلياً مع انتهاء الشهر. الترتيب محكوم بمعادلة ويلسون الإحصائية لضمان تفوق الأعمال الأكثر تفاعلاً وعدالة، مدمجة بنسبة 30% من الاستماعات الفريدة المؤكدة (+30 ثانية).
            </p>
          </div>

          {/* Countdown Clock (Tabular numerals) */}
          <div className="flex items-center gap-3 bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl shrink-0 font-mono tabular-nums">
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-black text-amber-400">
                {timeLeft.days}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">يوم</span>
            </div>
            <span className="text-zinc-700 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-black text-zinc-200">
                {timeLeft.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">ساعة</span>
            </div>
            <span className="text-zinc-700 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-black text-zinc-200">
                {timeLeft.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">دقيقة</span>
            </div>
            <span className="text-zinc-700 text-lg">:</span>
            <div className="text-center">
              <span className="block text-xl sm:text-2xl font-black text-amber-400">
                {timeLeft.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-[10px] text-zinc-500 font-sans">ثانية</span>
            </div>
          </div>
        </div>

        {/* Simulation Action Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>يحصل الفائز بالمركز الأول شهرياً على حماية أبدية من الحذف وشارة لوحة الشرف الذهبية.</span>
          </div>

          <button
            onClick={() => onSimulateMonthClose(selectedCategory)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-zinc-700/60"
            title="اختبر مهمة Cron Trigger لإغلاق الشهر آلياً وتتويج المتصدر"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>محاكاة الإغلاق الآلي للشهر الحالي وتتويج #1</span>
          </button>
        </div>
      </div>

      {/* Category Segmented Tabs (Compliant interactive controls) */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={() => setSelectedCategory('rap')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'rap'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>فئة الراب العربي ({tracks.filter((t) => t.category === 'rap').length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('diss')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === 'diss'
                ? 'bg-amber-400 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>فئة الدسّات والمواجهات ({tracks.filter((t) => t.category === 'diss').length})</span>
          </button>
        </div>

        <div className="text-xs text-zinc-500 font-mono hidden sm:block">
          معادلة الترتيب: 70% Wilson + 30% Log(Listens)
        </div>
      </div>

      {/* Podium Top 3 Spotlight */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((track, idx) => (
            <div
              key={track.id}
              className={`p-4 rounded-xl border relative overflow-hidden ${
                idx === 0
                  ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                  : 'bg-zinc-900/40 border-zinc-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-extrabold text-sm text-amber-400">
                  {idx === 0 ? '👑 المركز الأول' : idx === 1 ? '🥈 المركز الثاني' : '🥉 المركز الثالث'}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  النقاط: {track.combinedRankScore.toFixed(3)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <img
                  src={track.coverUrl}
                  alt={track.title}
                  className="w-12 h-12 rounded-lg object-cover bg-zinc-950 border border-zinc-800"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-zinc-100 truncate">{track.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Ranked Leaderboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-300">
          جدول الترتيب الكامل لمسابقة الشهر ({selectedCategory === 'rap' ? 'الراب العربي' : 'الدسّات'})
        </h3>

        <div className="space-y-2">
          {filteredTracks.map((track, index) => {
            const userVoteObj = userVotesByMonthCategory[`2026-10-${selectedCategory}`];
            const hasVotedForThis = userVoteObj?.trackId === track.id ? userVoteObj.voteType : undefined;

            return (
              <TrackCard
                key={track.id}
                track={track}
                rankIndex={index}
                isPlaying={isPlaying}
                isCurrentTrack={currentTrack?.id === track.id}
                onPlay={onPlayTrack}
                onVote={onVote}
                userVote={hasVotedForThis}
                onReport={onReport}
                onShare={onShare}
                onKeepTrack={onKeepTrack}
                isFavorite={favoriteTrackIds.includes(track.id)}
                onToggleFavorite={onToggleFavorite}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
