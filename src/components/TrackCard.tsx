import React from 'react';
import { Play, Pause, ThumbsUp, ThumbsDown, Share2, AlertTriangle, ShieldAlert, Sparkles, Clock, Music2, Heart } from 'lucide-react';
import { Track } from '../types';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  onPlay: (track: Track) => void;
  onVote: (trackId: string, type: 'up' | 'down') => void;
  userVote?: 'up' | 'down';
  onReport: (track: Track) => void;
  onShare: (track: Track) => void;
  onKeepTrack?: (trackId: string) => void;
  rankIndex?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (trackId: string) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  onPlay,
  onVote,
  userVote,
  onReport,
  onShare,
  onKeepTrack,
  rankIndex,
  isFavorite,
  onToggleFavorite,
}) => {
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isPlayingThis = isCurrentTrack && isPlaying;
  const wilsonPercent = Math.round(track.wilsonScore * 100);

  return (
    <div
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isPlayingThis
          ? 'bg-zinc-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
          : 'bg-zinc-900/40 border-zinc-800/80 hover:bg-zinc-900/70 hover:border-zinc-700'
      }`}
    >
      {/* Cleanup Warning Banner if flagged for auto-deletion */}
      {track.status === 'warning_cleanup' && (
        <div className="mb-3 p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>
              تحذير توفير التخزين: مهددة بالحذف خلال 5 أيام (أقل من 10 استماعات فريدة).
            </span>
          </div>
          {onKeepTrack && !track.keepTrackExtendedOnce && (
            <button
              onClick={() => onKeepTrack(track.id)}
              className="px-2.5 py-1 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap"
            >
              أبقِ أغنيتي (+30 يوماً)
            </button>
          )}
          {track.keepTrackExtendedOnce && (
            <span className="text-[11px] text-zinc-400 font-mono">تم التمديد لمرة واحدة</span>
          )}
        </div>
      )}

      {/* Main Row */}
      <div className="flex items-center gap-3.5">
        {/* Rank Number (if ranking view) */}
        {typeof rankIndex === 'number' && (
          <div className="w-7 text-center font-mono font-bold text-base text-zinc-500 tabular-nums shrink-0">
            {rankIndex === 0 ? (
              <span className="text-amber-400">#1</span>
            ) : rankIndex === 1 ? (
              <span className="text-zinc-300">#2</span>
            ) : rankIndex === 2 ? (
              <span className="text-amber-600">#3</span>
            ) : (
              `#${rankIndex + 1}`
            )}
          </div>
        )}

        {/* Cover Art with Play Button Overlay */}
        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
          />
          <button
            onClick={() => onPlay(track)}
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              isPlayingThis
                ? 'bg-amber-500/80 text-zinc-950 opacity-100'
                : 'bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60'
            }`}
            aria-label={isPlayingThis ? 'إيقاف' : 'تشغيل'}
          >
            {isPlayingThis ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Track Info & Unboxed Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-zinc-100 truncate group-hover:text-amber-400 transition-colors">
              {track.title}
            </h3>
            {track.isWinner && (
              <span className="text-amber-400 text-xs flex items-center gap-0.5" title="فائزة في لوحة الشرف">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="text-xs text-zinc-300 font-medium truncate mt-0.5">
            {track.artist}
          </div>

          {/* Clean unboxed metadata with bullet separators (Zero-pill compliance) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 mt-1 font-sans">
            <span>{track.category === 'diss' ? 'دسّ مواجهة' : 'تراك راب'}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono tabular-nums">{formatDuration(track.duration)}</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="font-mono tabular-nums">{track.uniqueListens.toLocaleString()} استماع فريد</span>
            <span aria-hidden="true" className="text-zinc-600">·</span>
            <span className="text-emerald-400/90 text-[11px] font-mono">
              {track.legalDeclaration.platform} {track.legalDeclaration.planType}
            </span>
          </div>
        </div>

        {/* Waveform Micro-Visualizer */}
        <div className="hidden md:flex items-center gap-0.5 h-8 w-24 shrink-0 px-2 bg-zinc-950/60 rounded-md border border-zinc-800/40">
          {track.waveformPeaks.slice(0, 16).map((peak, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlayingThis
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-zinc-700'
              }`}
              style={{
                height: `${Math.max(15, peak * 100)}%`,
                animationDelay: `${(idx % 4) * 0.15}s`
              }}
            />
          ))}
        </div>

        {/* Wilson Score & Combined Rank */}
        <div className="hidden sm:flex flex-col items-end text-left shrink-0 pl-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-zinc-500 uppercase font-mono">Wilson</span>
            <span className="text-xs font-bold text-amber-400 font-mono tabular-nums">
              {wilsonPercent}%
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 font-mono tabular-nums">
            النقاط: {track.combinedRankScore.toFixed(3)}
          </div>
        </div>

        {/* Voting & Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onVote(track.id, 'up')}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
              userVote === 'up'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="تصويت إيجابي"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="tabular-nums">{track.upvotes}</span>
          </button>

          <button
            onClick={() => onVote(track.id, 'down')}
            className={`p-1.5 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors ${
              userVote === 'down'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
            title="تصويت سلبي"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="tabular-nums">{track.downvotes}</span>
          </button>

          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(track.id)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                isFavorite
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'text-zinc-400 hover:text-rose-400 hover:bg-zinc-800'
              }`}
              title={isFavorite ? 'إزالة من مكتبتي المفضلة' : 'إضافة إلى مكتبتي المفضلة'}
              aria-label={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          <button
            onClick={() => onShare(track)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            title="مشاركة"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onReport(track)}
            className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
            title="إبلاغ عن محتوى مخالف"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
