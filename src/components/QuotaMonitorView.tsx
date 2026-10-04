import React from 'react';
import { Gauge, AlertTriangle, Database, HardDrive, Cpu, Radio, ShieldCheck, CheckCircle2, ArrowUpRight, Terminal } from 'lucide-react';
import { QuotaMetrics } from '../types';

interface QuotaMonitorViewProps {
  quota: QuotaMetrics;
  totalTracksCount: number;
}

export const QuotaMonitorView: React.FC<QuotaMonitorViewProps> = ({
  quota,
  totalTracksCount,
}) => {
  const r2UsedGb = quota.r2StorageBytesUsed / (1024 * 1024 * 1024);
  const r2MaxGb = quota.r2StorageMaxBytes / (1024 * 1024 * 1024);
  const r2Percent = Math.round((quota.r2StorageBytesUsed / quota.r2StorageMaxBytes) * 100);

  const d1ReadsPercent = Math.round((quota.d1DailyReads / quota.d1DailyReadsMax) * 100);
  const d1WritesPercent = Math.round((quota.d1DailyWrites / quota.d1DailyWritesMax) * 100);
  const workersPercent = Math.round((quota.workersDailyRequests / quota.workersDailyRequestsMax) * 100);

  const isAnyLimitNear80 = r2Percent >= 80 || d1ReadsPercent >= 80 || d1WritesPercent >= 80 || workersPercent >= 80;

  return (
    <div className="space-y-8">
      {/* 80% Alert Banner if approaching threshold */}
      {isAnyLimitNear80 && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>تنبيه استهلاك الخطة المجانية:</strong> وصلت إحدى الحصص إلى 80% أو أكثر. تفقد سياسة الحذف التلقائي لتفريغ مساحة R2.
            </span>
          </div>
          <button className="px-3 py-1.5 bg-amber-400 text-zinc-950 font-bold rounded-lg text-xs shrink-0">
            تشغيل مهمة الحذف الآن
          </button>
        </div>
      )}

      {/* Header */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Gauge className="w-4 h-4" />
          <span>لوحة مراقبة البنية التحتية الصفرية (Zero-Cost Architecture)</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
          مراقبة استهلاك الخطة المجانية (Cloudflare Free Tier 2026)
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
          جميع خدمات المنصة تعمل تحت الحدود المجانية الصارمة. لا توجد بطاقة دفع، وتكلفة التشغيل الشهرية هي 0.00$ تماماً.
        </p>
      </div>

      {/* Real-time Metric Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* R2 Storage */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <HardDrive className="w-4 h-4 text-amber-400" />
              تخزين R2 السحابي
            </span>
            <span className="font-mono text-[11px] text-emerald-400">0$ خروج بيانات</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-black text-zinc-100">{r2UsedGb.toFixed(2)} GB</span>
              <span className="text-xs text-zinc-500">من {r2MaxGb} GB</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  r2Percent >= 80 ? 'bg-rose-500' : r2Percent >= 50 ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(5, r2Percent)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>الاستهلاك: {r2Percent}%</span>
            <span>الأغاني المخزنة: {totalTracksCount}</span>
          </div>
        </div>

        {/* D1 Reads */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Database className="w-4 h-4 text-cyan-400" />
              قراءات D1 اليومية
            </span>
            <span className="font-mono text-[11px] text-zinc-500">حد 5 مليون</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-black text-zinc-100">
                {(quota.d1DailyReads / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-zinc-500">من 5,000k</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-400 transition-all duration-500"
                style={{ width: `${Math.max(3, d1ReadsPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>الاستهلاك: {d1ReadsPercent}%</span>
            <span>إعادة التعيين: 00:00 UTC</span>
          </div>
        </div>

        {/* D1 Writes */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Database className="w-4 h-4 text-purple-400" />
              كتابات D1 اليومية
            </span>
            <span className="font-mono text-[11px] text-zinc-500">حد 100 ألف</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-black text-zinc-100">
                {(quota.d1DailyWrites / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-zinc-500">من 100k</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-500"
                style={{ width: `${Math.max(3, d1WritesPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>الاستهلاك: {d1WritesPercent}%</span>
            <span>نظام دفعات (Batching)</span>
          </div>
        </div>

        {/* Workers Requests */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-200">
              <Cpu className="w-4 h-4 text-emerald-400" />
              طلبات Cloudflare Worker
            </span>
            <span className="font-mono text-[11px] text-zinc-500">حد 100 ألف</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline justify-between font-mono tabular-nums">
              <span className="text-2xl font-black text-zinc-100">
                {(quota.workersDailyRequests / 1000).toFixed(1)}k
              </span>
              <span className="text-xs text-zinc-500">من 100k</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(3, workersPercent)}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex justify-between">
            <span>الاستهلاك: {workersPercent}%</span>
            <span>أقل من 30ms CPU لكل طلب</span>
          </div>
        </div>
      </div>

      {/* Secret Sauce: Direct R2 CDN Bypass Counter */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-zinc-900 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wide">
            <Radio className="w-4 h-4" />
            <span>حماية حصة الـ 100 ألف طلب يومياً (Direct R2 CDN Bypass)</span>
          </div>
          <h3 className="text-lg font-bold text-zinc-100">
            تقديم ملفات الصوت مباشرة من R2 عبر الرابط العام دون المرور بالـ Worker
          </h3>
          <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
            وفقاً لتصميم المعمارية الصفرية: يتم تشغيل الصوتيات وبثها مباشرة عبر Custom Domain مربوط بـ Public R2 Bucket. هذا وفّر على المنصة حتى الآن <strong className="text-emerald-400 font-mono font-bold">{(quota.directR2BypassRequestsSaved).toLocaleString()} طلب Worker</strong> كان من شأنها إيقاف السيرفر!
          </p>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-xl border border-emerald-500/20 text-center shrink-0 font-mono">
          <span className="text-xs text-zinc-500 block font-sans">طلبات مستثناة من الـ Worker</span>
          <span className="text-2xl font-black text-emerald-400">
            +{quota.directR2BypassRequestsSaved.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Architecture & Zero-Cost Deployment Blueprint */}
      <div className="p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-zinc-200 font-bold text-sm">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>مخطط المعمارية الصفرية وكيفية النشر والترقية (Architecture & Deployment Guide)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2">
            <div className="font-bold text-amber-400">1. تخزين الصوت (R2 Storage):</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              - 10GB مساحة مجانية أبدية بلا رسوم خروج (Egress).<br />
              - ملفات 96kbps Opus تستغل المساحة لحفظ أكثر من 3,500 أغنية كاملة.<br />
              - رابط عمومي مباشر <code className="text-zinc-300">cdn.rap-ai.com/audio/*</code> لا يستهلك طلبات الـ Worker.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2">
            <div className="font-bold text-cyan-400">2. قاعدة البيانات (D1 SQLite):</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              - 5 مليون قراءة و100 ألف كتابة مجانية يومياً.<br />
              - تجميع عدادات الاستماع (Batching) كل 60 ثانية لتجنب كتابة صف لكل استماع.<br />
              - تخزين مؤقت للترتيب (Caching) في الذاكرة لتوفير القراءات.
            </p>
          </div>

          <div className="p-4 bg-zinc-950/70 rounded-xl border border-zinc-800 space-y-2">
            <div className="font-bold text-emerald-400">3. الترقية اللاحقة دون إعادة بناء:</div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              - عند نجاح المنصة بعد 6 أشهر، مجرد تفعيل Workers Paid (5$/شهر) يرفع السعة فوراً إلى 10 مليون طلب وتخزين غير محدود دون كتابة سطر كود واحد إضافي!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
