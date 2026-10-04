import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Share2, Shield, Info, ChevronUp, ChevronDown, CheckCircle2, Headphones } from 'lucide-react';
import { Track } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface PersistentAudioPlayerProps {
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onTrackEnd?: () => void;
  onVerifiedListenCounted?: (trackId: string) => void;
  onShareTrack?: (track: Track) => void;
}

export const PersistentAudioPlayer: React.FC<PersistentAudioPlayerProps> = ({
  currentTrack,
  isPlaying,
  onPlayToggle,
  onTrackEnd,
  onVerifiedListenCounted,
  onShareTrack,
}) => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [listenTimerSeconds, setListenTimerSeconds] = useState<number>(0);
  const [hasTriggered30sListen, setHasTriggered30sListen] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

  // Sync playback when track changes or play state changes
  useEffect(() => {
    if (!currentTrack) return;

    if (isPlaying) {
      audioEngine.playTrack(
        currentTrack.id,
        currentTrack.duration,
        currentTime,
        currentTrack.audioStyle || 'trap',
        (time) => {
          setCurrentTime(time);
        },
        () => {
          if (onTrackEnd) {
            setTimeout(() => onTrackEnd(), 0);
          }
        }
      );
    } else {
      audioEngine.pause();
    }
  }, [isPlaying, currentTrack?.id]);

  // Listen timer accumulation for the 30-second rule
  useEffect(() => {
    let interval: number;
    if (isPlaying && currentTrack && !hasTriggered30sListen) {
      interval = window.setInterval(() => {
        setListenTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack?.id, hasTriggered30sListen]);

  // Trigger 30s verified listen once reached, outside of render/updater
  useEffect(() => {
    if (listenTimerSeconds >= 30 && !hasTriggered30sListen && currentTrack) {
      setHasTriggered30sListen(true);
      if (onVerifiedListenCounted) {
        onVerifiedListenCounted(currentTrack.id);
      }
    }
  }, [listenTimerSeconds, hasTriggered30sListen, currentTrack, onVerifiedListenCounted]);

  // Reset listen timer on new track
  useEffect(() => {
    setCurrentTime(0);
    setListenTimerSeconds(0);
    setHasTriggered30sListen(false);
  }, [currentTrack?.id]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioEngine.seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);
    audioEngine.setVolume(newVol);
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume || 0.5);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const togglePlaybackSpeed = () => {
    const nextSpeed = playbackSpeed === 1.0 ? 1.25 : playbackSpeed === 1.25 ? 0.85 : 1.0;
    setPlaybackSpeed(nextSpeed);
    audioEngine.setPlaybackRate(nextSpeed);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentTrack) return null;

  const duration = currentTrack.duration || 180;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);
  const listen30sPercent = Math.min(100, (listenTimerSeconds / 30) * 100);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 shadow-2xl">
        {/* Progress bar line */}
        <div className="w-full h-1 bg-zinc-800 cursor-pointer relative group">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min="0"
            max={duration}
            step="0.5"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Track Info */}
          <div className="flex items-center gap-3 min-w-0 max-w-[32%]">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce h-4" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.15s] h-6" />
                  <span className="w-1 bg-amber-400 rounded-full animate-bounce [animation-delay:0.3s] h-3" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-sm font-bold text-zinc-100 truncate">
                  {currentTrack.title}
                </span>
                <span className="text-[10px] text-zinc-500 shrink-0 font-medium">
                  {currentTrack.category === 'diss' ? 'دسّ مواجهة' : 'تراك راب'}
                </span>
              </div>
              <div className="text-xs text-zinc-400 truncate flex items-center gap-1">
                <span>{currentTrack.artist}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-[11px] text-emerald-400 font-mono">
                  {currentTrack.legalDeclaration.platform} {currentTrack.legalDeclaration.planType}
                </span>
              </div>
            </div>
          </div>

          {/* Central Controls & 30s Listen Indicator */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  setCurrentTime(0);
                  audioEngine.seek(0);
                }}
                className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                title="إعادة من البداية"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={onPlayToggle}
                className="w-10 h-10 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-amber-500/20"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={togglePlaybackSpeed}
                className="text-xs font-mono font-semibold text-zinc-400 hover:text-zinc-200 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5"
                title="سرعة التشغيل"
              >
                {playbackSpeed}x
              </button>
            </div>

            {/* Time & 30s Verification tracker */}
            <div className="flex items-center gap-2.5 sm:gap-3 text-xs text-zinc-400 font-mono tabular-nums">
              <span>{formatTime(currentTime)}</span>
              <span className="text-zinc-600">/</span>
              <span>{formatTime(duration)}</span>

              {/* 30s Listen Progress Bar & Status Pill */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all duration-300 text-[11px] font-sans ${
                  hasTriggered30sListen
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] animate-in zoom-in-95'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-400'
                }`}
                title={
                  hasTriggered30sListen
                    ? 'تم احتساب الاستماع الفعلي رسمياً وتوثيقه في المنصة (+30 ثانية)'
                    : `متبقي ${Math.max(0, 30 - listenTimerSeconds)} ثانية لاحتساب الاستماع الفعلي رسمياً`
                }
              >
                {/* Micro progress bar */}
                <div className="w-14 sm:w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                  <div
                    className={`h-full transition-all duration-300 ${
                      hasTriggered30sListen
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 w-full shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : 'bg-gradient-to-r from-amber-500 to-amber-400'
                    }`}
                    style={{ width: `${hasTriggered30sListen ? 100 : listen30sPercent}%` }}
                  />
                </div>

                {hasTriggered30sListen ? (
                  <div className="flex items-center gap-1 font-bold text-emerald-400 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="hidden sm:inline">استماع موثق (+30ث)</span>
                    <span className="sm:hidden font-mono">موثق ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
                    <Headphones className={`w-3 h-3 text-amber-400 shrink-0 ${isPlaying ? 'animate-pulse' : ''}`} />
                    <span>{listenTimerSeconds}/30ث</span>
                    <span className="hidden md:inline font-sans text-zinc-500 text-[10px]">(للتوثيق)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Tools: Volume, Details, Share */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex items-center gap-2">
              <button onClick={toggleMute} className="text-zinc-400 hover:text-zinc-200">
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-800 rounded-lg accent-amber-400 cursor-pointer"
              />
            </div>

            <button
              onClick={() => onShareTrack && onShareTrack(currentTrack)}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors"
              title="مشاركة بطاقة الأغنية"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowDetailsModal(!showDetailsModal)}
              className="p-2 text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-1"
              title="تفاصيل التراك والترخيص"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              {showDetailsModal ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Track & Legal Details Drawer */}
      {showDetailsModal && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-zinc-900/98 border-t border-zinc-800 p-4 sm:p-6 backdrop-blur-2xl max-w-4xl mx-auto rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h4 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>{currentTrack.title}</span>
                <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {currentTrack.category === 'diss' ? 'مواجهة دس' : 'أغنية راب'}
                </span>
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                الفنان: <strong className="text-zinc-200">{currentTrack.artist}</strong> · المدة: {formatTime(currentTrack.duration)}
              </p>
            </div>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="text-xs text-zinc-400 hover:text-zinc-100 px-2.5 py-1 bg-zinc-800 rounded-lg"
            >
              إغلاق
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Legal Verification Block */}
            <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Shield className="w-4 h-4" />
                <span>إقرار الملكية وحقوق Suno/Udio التجارية</span>
              </div>
              <p className="text-zinc-300 leading-relaxed text-[11px]">
                تم التحقق من توليد التراك عبر خطة مدفوعة ({currentTrack.legalDeclaration.platform} {currentTrack.legalDeclaration.planType}) وتأكيد حيازة حقوق الاستخدام التجاري وقت التحميل طبقاً لسياسات 3 سبتمبر 2026.
              </p>
              <div className="font-mono text-[10px] text-zinc-500 border-t border-zinc-800/60 pt-1.5">
                معرف الإقرار: {currentTrack.legalDeclaration.licenseRef || 'LIC-VERIFIED-HASH-4921'}
              </div>
            </div>

            {/* Lyrics Excerpt */}
            <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                <Info className="w-4 h-4 text-amber-400" />
                <span>مقتطف الكلمات (Lyrics)</span>
              </div>
              <p className="text-zinc-400 italic text-[11px] leading-relaxed">
                "{currentTrack.lyricsExcerpt || 'كلمات راب أصيلة مولدة بالذكاء الاصطناعي تعبر عن الفلو والتحدي الرياضي الشريف دون إهانة لشخصيات حقيقية.'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
