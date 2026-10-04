import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Check, Trash2, EyeOff, AlertTriangle, FileText, Send, CheckCircle2 } from 'lucide-react';
import { Report, Track } from '../types';

interface ModerationViewProps {
  reports: Report[];
  tracks: Track[];
  onDismissReport: (reportId: string) => void;
  onHideTrack: (trackId: string, reportId: string) => void;
  onDeleteTrackPermanently: (trackId: string, reportId: string) => void;
  onSubmitTakedownRequest: (trackUrlOrTitle: string, claimantName: string, claimantEmail: string, statement: string) => void;
}

export const ModerationView: React.FC<ModerationViewProps> = ({
  reports,
  tracks,
  onDismissReport,
  onHideTrack,
  onDeleteTrackPermanently,
  onSubmitTakedownRequest,
}) => {
  const [takedownTrackTitle, setTakedownTrackTitle] = useState('');
  const [claimantName, setClaimantName] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [statement, setStatement] = useState('');
  const [takedownSubmitted, setTakedownSubmitted] = useState(false);

  const handleTakedownSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!takedownTrackTitle || !claimantName || !claimantEmail) return;
    onSubmitTakedownRequest(takedownTrackTitle, claimantName, claimantEmail, statement);
    setTakedownSubmitted(true);
    setTakedownTrackTitle('');
    setClaimantName('');
    setClaimantEmail('');
    setStatement('');
    setTimeout(() => setTakedownSubmitted(false), 4000);
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');

  const reasonLabels: { [key: string]: string } = {
    hate_speech: 'خطاب كراهية أو عنف',
    doxxing_real_person: 'استهداف شخصية حقيقية / كشف بيانات',
    unauthorized_voice_clone: 'استنساخ صوت حقيقي دون إذن',
    suno_free_tier_violation: 'مخالفة شروط ترخيص Suno التجاري',
    harassment: 'إساءة شخصية أو عائلية',
    copyright_dmca: 'انتهاك حقوق ملكية فكرية',
  };

  return (
    <div className="space-y-8">
      {/* Policy Constitution Banner */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>ميثاق الضوابط والإشراف المجتمعي (أولوية قصوى)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 mb-3">
          الخطوط الحمراء لبيئة راب نظيفة وتنافس رياضي شريف
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
            <h4 className="font-bold text-amber-400">1. قواعد الدسّات (Diss Battles):</h4>
            <p className="text-zinc-400 leading-relaxed">
              الدسّات تُستهدف فيها أسماء فنية لمستخدمين مسجلين وافقوا على المواجهة، أو شخصيات خيالية فقط. يُحظر كلياً الهجوم على شخصيات حقيقية عامة أو خاصة أو المساس بالحياة العائلية.
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/70 rounded-xl border border-zinc-800/80 space-y-1.5">
            <h4 className="font-bold text-rose-400">2. المحظورات القاطعة:</h4>
            <p className="text-zinc-400 leading-relaxed">
              ممنوع قطعياً: خطاب الكراهية المبني على العرق، الدين، الجنسية، التهديد بالعنف، كشف البيانات الشخصية (Doxxing)، استنساخ صوت فنان بشري دون إذن، أو التوليد بحسابات Suno المجانية.
            </p>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-zinc-100">
              صف انتظار الإشراف والبلاغات ({pendingReports.length} بلاغ قيد المراجعة)
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            نظام الحجب التلقائي مفعل (عند وصول 3 بلاغات)
          </span>
        </div>

        {pendingReports.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-300 font-medium">لا توجد بلاغات معلقة حالياً. المنصة نظيفة تماماً!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => {
              const track = tracks.find((t) => t.id === report.trackId);
              return (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                        {reasonLabels[report.reason] || report.reason}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-100 truncate">
                        {report.trackTitle}
                      </h4>
                      <span className="text-xs text-zinc-400">({report.artist})</span>
                    </div>

                    <p className="text-xs text-zinc-300">
                      تفاصيل البلاغ: "{report.details}"
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                      <span>تاريخ البلاغ: {new Date(report.reportedAt).toLocaleDateString('ar-EG')}</span>
                      {report.reporterEmail && <span>المرسل: {report.reporterEmail}</span>}
                      {track && <span>الحالة الحالية: {track.status}</span>}
                    </div>
                  </div>

                  {/* Moderation Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onDismissReport(report.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors flex items-center gap-1"
                      title="إلغاء البلاغ لعدم وجود مخالفة"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>تبرئة التراك</span>
                    </button>

                    <button
                      onClick={() => onHideTrack(report.trackId, report.id)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors flex items-center gap-1"
                      title="حجب التراك مؤقتاً لحين استكمال التحقيق"
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>حجب مؤقت</span>
                    </button>

                    <button
                      onClick={() => onDeleteTrackPermanently(report.trackId, report.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-600/40 text-xs font-medium transition-colors flex items-center gap-1"
                      title="حذف الأغنية نهائياً وتفريغ مساحتها من R2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>حذف دائم</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Takedown & DMCA Fast Lane Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-zinc-100">
            إجراء الحذف السريع لأصحاب الحقوق (DMCA & Rights Holder Fast Takedown)
          </h3>
        </div>
        <p className="text-xs text-zinc-400 leading-relaxed">
          إذا كنت صاحب حق ملكية فكرية أو ممثلاً قانونياً لفنان تم استنساخ صوته أو استخدام كلماته دون إذن، يمكنك ملء هذا النموذج لحجب العمل فوراً دون تأخير.
        </p>

        {takedownSubmitted && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>تم استلام طلب الحذف السريع بنجاح وحجب المحتوى مؤقتاً لمطابقة المستندات.</span>
          </div>
        )}

        <form onSubmit={handleTakedownSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              اسم الأغنية أو الرابط المخالف *
            </label>
            <input
              type="text"
              required
              placeholder="عنوان التراك بالمنصة..."
              value={takedownTrackTitle}
              onChange={(e) => setTakedownTrackTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              اسم صاحب الحق أو الجهة المدعية *
            </label>
            <input
              type="text"
              required
              placeholder="الاسم الكامل أو اسم الشركة..."
              value={claimantName}
              onChange={(e) => setClaimantName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              البريد الإلكتروني الرسمي *
            </label>
            <input
              type="email"
              required
              placeholder="legal@rights-owner.com"
              value={claimantEmail}
              onChange={(e) => setClaimantEmail(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-300 mb-1">
              بيان الحقوق وإثبات الملكية
            </label>
            <input
              type="text"
              placeholder="رابط تسجيل الأغنية أو التوثيق..."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال طلب الحذف الفوري</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
