import React, { useState } from 'react';
import { Share2, X, Copy, Check, MessageCircle, Instagram, Flame, Sparkles } from 'lucide-react';
import { Track } from '../types';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  track,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !track) return null;

  const shareUrl = `${window.location.origin}/track/${track.id}`;
  const shareText = `اسمع تراك "${track.title}" للرابر "${track.artist}" وصوّت له الآن في ميدان راب AI: ${shareUrl}`;
  const tweetText = `اسمع تراك "${track.title}" للرابر "${track.artist}" وصوّت له الآن في ميدان راب AI 🎙️🔥 #راب_عربي #AI_Rap #ميدان_راب\n${shareUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleTwitterShare = () => {
    const encoded = encodeURIComponent(tweetText);
    window.open(`https://x.com/intent/tweet?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-5 text-right shadow-2xl relative space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>مشاركة بطاقة الأغنية</span>
          </h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Social Card Preview (Instagram Story / WhatsApp Card Aspect) */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/40 relative overflow-hidden shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-amber-400 font-extrabold text-xs">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>ميدان راب AI</span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              {track.category === 'diss' ? 'دسّ مواجهة' : 'تراك راب'}
            </span>
          </div>

          {/* Cover Art with Waveform Overlay */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800">
            <img
              src={track.coverUrl}
              alt={track.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Waveform graphic overlay */}
            <div className="absolute bottom-2 left-2 right-2 h-8 bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center gap-0.5 px-2">
              {track.waveformPeaks.slice(0, 24).map((p, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full"
                  style={{ height: `${Math.max(20, p * 100)}%` }}
                />
              ))}
            </div>
          </div>

          <div className="text-center space-y-1">
            <h4 className="text-base font-extrabold text-zinc-100 truncate">{track.title}</h4>
            <p className="text-xs text-amber-400 font-medium">الرابر: {track.artist}</p>
            <div className="text-[11px] text-zinc-400 font-mono pt-1">
              تصويت ويلسون: {Math.round(track.wilsonScore * 100)}% · {track.uniqueListens} استماع
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-500 font-mono border-t border-zinc-800/80 pt-2">
            صوّت الآن عبر meydan-rap.ai
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handleTwitterShare}
            className="py-2.5 px-2 rounded-xl bg-zinc-950 hover:bg-black text-white border border-zinc-700/80 hover:border-zinc-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="مشاركة على منصة X (تويتر)"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 24.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>منصة X</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="مشاركة عبر واتساب"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>واتساب</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="py-2.5 px-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-sm"
            title="نسخ رابط المشاركة"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? 'تم النسخ!' : 'نسخ الرابط'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
