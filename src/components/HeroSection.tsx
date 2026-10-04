import React from 'react';
import { Flame, Swords, ArrowLeft } from 'lucide-react';

interface HeroSectionProps {
  onExploreContest: () => void;
  onExploreBattles: () => void;
  monthlyTotalVotes: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreContest,
  onExploreBattles,
  monthlyTotalVotes,
}) => {
  return (
    <section className="relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950 mb-10 shadow-2xl">
      {/* Background Hero Image with Scrim Gradient */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/rap_battle_arena_hero_1791043412154.jpg"
          alt="ساحة معارك الراب"
          className="w-full h-full object-cover object-center brightness-75 contrast-110"
          referrerPolicy="no-referrer"
        />
        {/* Measured scrims to satisfy WCAG AA contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/95 via-zinc-950/60 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-3xl">
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-100 tracking-tight leading-tight text-balance mb-4 font-sans">
          حلبة راب الذكاء الاصطناعي، ومواجهات الدسّات الأقوى
        </h1>

        <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6 font-normal max-w-2xl">
          أول منصة عربية للبث الموسيقي المخصص لأغاني الراب والدسّات المولّدة بالذكاء الاصطناعي. ارفع أعمالك، خض مواجهات حية ثنائية، واحتل صدارة المسابقة الشهرية بتصويت جماهيري عادل محمي بخوارزمية ويلسون وبنية تحتية صفرية التكلفة.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <button
            onClick={onExploreContest}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-500/10 active:scale-95"
          >
            <Flame className="w-4 h-4 fill-current" />
            <span>مسابقة شهر أكتوبر 2026</span>
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreBattles}
            className="px-5 py-2.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-100 border border-zinc-700/80 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Swords className="w-4 h-4 text-amber-400" />
            <span>وضع المواجهات المباشرة (Battle Mode)</span>
          </button>
        </div>

        {/* Quantitative Proof Line (Adjacent Evidence, Unboxed) */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-zinc-400 font-mono tabular-nums border-t border-zinc-800/80 pt-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>تكلفة الاستضافة: 0.00$ شهرياً</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div className="flex items-center gap-2">
            <span>بث R2 مباشر: بلا استنزاف لحصص Worker</span>
          </div>
          <span className="text-zinc-700">/</span>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">{monthlyTotalVotes.toLocaleString()}</span>
            <span className="font-sans">صوت محمي من التلاعب هذا الشهر</span>
          </div>
        </div>
      </div>
    </section>
  );
};
