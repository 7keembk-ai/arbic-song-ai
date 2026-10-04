import React, { useState } from 'react';
import { ShieldAlert, X, AlertTriangle } from 'lucide-react';
import { Track } from '../types';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
  onSubmitReport: (
    trackId: string,
    reason: 'hate_speech' | 'doxxing_real_person' | 'unauthorized_voice_clone' | 'suno_free_tier_violation' | 'harassment' | 'copyright_dmca',
    details: string,
    email: string
  ) => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  track,
  onSubmitReport,
}) => {
  const [reason, setReason] = useState<'hate_speech' | 'doxxing_real_person' | 'unauthorized_voice_clone' | 'suno_free_tier_violation' | 'harassment' | 'copyright_dmca'>('doxxing_real_person');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');

  if (!isOpen || !track) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReport(track.id, reason, details.trim(), email.trim());
    onClose();
    setDetails('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-right shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>إبلاغ عن محتوى مخالف للضوابط</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs">
          <span className="text-zinc-400 block mb-0.5">التراك المبلغ عنه:</span>
          <span className="text-zinc-100 font-bold">{track.title}</span>
          <span className="text-zinc-500"> — للفنان: </span>
          <span className="text-amber-400 font-medium">{track.artist}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              نوع المخالفة طبقاً لوثيقة الضوابط:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as unknown as typeof reason)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="doxxing_real_person">استهداف أو إهانة شخصية حقيقية عامة/خاصة أو كشف بيانات (Doxxing)</option>
              <option value="hate_speech">خطاب كراهية (عرق، دين، جنس، جنسية) أو عنف</option>
              <option value="unauthorized_voice_clone">استنساخ صوت فنان أو شخص حقيقي دون إذن</option>
              <option value="suno_free_tier_violation">توليد عبر حساب Suno/Udio مجاني غير مصرح تجارياً</option>
              <option value="harassment">إساءة عائلية أو تحرش أو ألفاظ غير لائقة</option>
              <option value="copyright_dmca">انتهاك حقوق ملكية فكرية لموسيقى أو كلمات (DMCA)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              تفاصيل وموضع المخالفة بالتحديد:
            </label>
            <textarea
              required
              rows={3}
              placeholder="وضح الدقيقة أو الكلمات المخالفة لمساعدة فريق الإشراف..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-150 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              بريدك الإلكتروني للتواصل ومتابعة البلاغ (اختياري):
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              الحجب التلقائي: في حال تلقي الأغنية 3 بلاغات متطابقة، تُحجب آلياً وبشكل مؤقت من العرض حتى مراجعتها من قبل المشرفين.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition-colors"
            >
              إرسال البلاغ الآن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
