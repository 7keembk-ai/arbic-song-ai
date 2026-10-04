import React, { useState, useMemo } from 'react';
import {
  Mic2,
  HardDrive,
  Headphones,
  ThumbsUp,
  Sparkles,
  Swords,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Plus,
  Share2,
  Shield,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  BarChart3,
  Heart,
  Bookmark,
  Compass
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Track, Battle, UserAccount } from '../types';

interface ArtistDashboardViewProps {
  currentUser: UserAccount;
  tracks: Track[];
  battles: Battle[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onOpenUpload: () => void;
  onAcceptBattle: (battleId: string, defenderTrackId: string) => void;
  onDeclineBattle?: (battleId: string) => void;
  onKeepTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onShareTrack: (track: Track) => void;
  onNavigateToBattles: () => void;
  favoriteTrackIds?: string[];
  onToggleFavorite?: (trackId: string) => void;
  onNavigateToHome?: () => void;
}

export const ArtistDashboardView: React.FC<ArtistDashboardViewProps> = ({
  currentUser,
  tracks,
  battles,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onOpenUpload,
  onAcceptBattle,
  onDeclineBattle,
  onKeepTrack,
  onDeleteTrack,
  onShareTrack,
  onNavigateToBattles,
  favoriteTrackIds = [],
  onToggleFavorite,
  onNavigateToHome,
}) => {
  const [selectedBattleToAccept, setSelectedBattleToAccept] = useState<Battle | null>(null);
  const [selectedResponseTrackId, setSelectedResponseTrackId] = useState<string>('');

  // Filter user's tracks
  const myTracks = tracks.filter((t) => t.artistId === currentUser.id && t.status !== 'deleted');
  const myDissTracks = myTracks.filter((t) => t.category === 'diss');

  // User's favorited tracks (My Library)
  const favoriteTracks = tracks.filter((t) => favoriteTrackIds.includes(t.id) && t.status !== 'deleted');

  // Sub-tab: 'my-tracks' (uploaded) vs 'favorites' (My Library)
  const [tracksTab, setTracksTab] = useState<'my-tracks' | 'favorites'>('my-tracks');

  // Aggregated Performance Statistics
  const totalListens = myTracks.reduce((acc, t) => acc + t.listens, 0);
  const totalUniqueListens = myTracks.reduce((acc, t) => acc + t.uniqueListens, 0);
  const totalUpvotes = myTracks.reduce((acc, t) => acc + t.upvotes, 0);
  const totalDownvotes = myTracks.reduce((acc, t) => acc + t.downvotes, 0);
  const totalSizeBytes = myTracks.reduce((acc, t) => acc + t.sizeBytes, 0);
  const totalSizeMb = (totalSizeBytes / (1024 * 1024)).toFixed(2);

  const avgWilsonScore = myTracks.length > 0
    ? Math.round((myTracks.reduce((acc, t) => acc + t.wilsonScore, 0) / myTracks.length) * 100)
    : 0;

  // Chart view mode: 'daily' vs 'cumulative'
  const [chartMode, setChartMode] = useState<'daily' | 'cumulative'>('daily');

  // Generate deterministic 30-day history based on artist tracks
  const analyticsData = useMemo(() => {
    const data = [];
    const now = new Date(2026, 9, 3); // Oct 3, 2026
    let cumListens = 0;
    let cumUpvotes = 0;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);

      const dayOfMonth = d.getDate();
      const monthName = d.toLocaleDateString('ar-EG', { month: 'short' });
      const label = `${dayOfMonth} ${monthName}`;
      const isoDate = d.toISOString().split('T')[0];

      // Realistic variations with weekend boosts and track release spikes
      const dayFactor = Math.sin(i * 0.45) * 0.4 + 0.6;
      const weekendBonus = (d.getDay() === 5 || d.getDay() === 6) ? 1.35 : 1.0;
      const releaseSpike = (i === 18 || i === 4) ? 2.4 : 1.0;

      const dailyListens = Math.max(12, Math.round((totalListens / 38) * dayFactor * weekendBonus * releaseSpike));
      const dailyUpvotes = Math.max(2, Math.round((totalUpvotes / 40) * dayFactor * weekendBonus * releaseSpike));

      cumListens += dailyListens;
      cumUpvotes += dailyUpvotes;

      data.push({
        date: label,
        fullDate: isoDate,
        listens: dailyListens,
        upvotes: dailyUpvotes,
        cumListens,
        cumUpvotes,
      });
    }

    return data;
  }, [totalListens, totalUpvotes]);

  // Battles queries
  // 1. Incoming challenges where current user is defender and status is pending_acceptance
  const incomingBattles = battles.filter(
    (b) => (b.defenderArtistId === currentUser.id || b.defenderArtist === currentUser.artistName) && b.status === 'pending_acceptance'
  );

  // 2. Outgoing challenges initiated by current user
  const outgoingBattles = battles.filter(
    (b) => b.challengerArtistId === currentUser.id && b.status === 'pending_acceptance'
  );

  // 3. Active battles involving current user
  const myActiveBattles = battles.filter(
    (b) => (b.challengerArtistId === currentUser.id || b.defenderArtistId === currentUser.id || b.defenderArtist === currentUser.artistName) && b.status === 'active_voting'
  );

  const handleConfirmAccept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBattleToAccept || !selectedResponseTrackId) return;
    onAcceptBattle(selectedBattleToAccept.id, selectedResponseTrackId);
    setSelectedBattleToAccept(null);
    setSelectedResponseTrackId('');
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8">
      {/* Artist Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/5">
              <Mic2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-100 font-sans">
                  {currentUser.artistName}
                </h1>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  رابر AI موثق
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1 font-mono">
                <span>{currentUser.email}</span>
                <span className="text-zinc-600">·</span>
                <span className="text-amber-400 font-sans">اشتراك Suno Pro التجاري موثق</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onOpenUpload}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/10 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>ارفع تراك جديد</span>
            </button>
          </div>
        </div>

        {/* Quota Progress Meter */}
        <div className="relative z-10 mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">حصة التخزين المتاحة:</span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {myTracks.length} من {currentUser.maxTracksLimit} أغاني نشطة
            </span>
            <span className="text-zinc-600">·</span>
            <span className="font-mono tabular-nums text-zinc-300">{totalSizeMb} MB مستخدمة</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-36 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{ width: `${(myTracks.length / currentUser.maxTracksLimit) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-zinc-500">
              {currentUser.maxTracksLimit - myTracks.length} فتحات متبقية
            </span>
          </div>
        </div>
      </div>

      {/* 4 Performance KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listens */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Headphones className="w-4 h-4 text-cyan-400" />
              إجمالي الاستماعات
            </span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono tabular-nums">
            {totalListens.toLocaleString()}
          </div>
          <p className="text-[11px] text-zinc-500">
            {totalUniqueListens.toLocaleString()} استماع موثق (+30 ثانية)
          </p>
        </div>

        {/* Upvotes */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <ThumbsUp className="w-4 h-4 text-amber-400" />
              أصوات الجمهور
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">+{totalUpvotes}</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono tabular-nums">
            {totalUpvotes}
          </div>
          <p className="text-[11px] text-zinc-500 font-mono">
            {totalDownvotes} صوت سلبي
          </p>
        </div>

        {/* Average Wilson Score */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              مؤشر ثقة ويلسون
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Lower Bound</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums">
            {avgWilsonScore}%
          </div>
          <p className="text-[11px] text-zinc-500">
            ترتيب إحصائي مقاوم للتلاعب
          </p>
        </div>

        {/* Active Battles */}
        <div className="p-4 sm:p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium text-zinc-300">
              <Swords className="w-4 h-4 text-rose-400" />
              نزالاتك الجارية
            </span>
            <span className="text-[10px] text-amber-400 font-mono">{incomingBattles.length} معلقة</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-100 font-mono tabular-nums">
            {myActiveBattles.length}
          </div>
          <p className="text-[11px] text-zinc-500">
            في حلبة تصويت الميدان
          </p>
        </div>
      </div>

      {/* 30-Day Performance Chart Section (Recharts) */}
      <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-zinc-100">
                منحنى الاستماعات وتصويت الجمهور (آخر 30 يوماً)
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              رسم بياني تفاعلي يوضح وتيرة تفاعل الجمهور مع تراكاتك على مدار الشهر الماضي.
            </p>
          </div>

          {/* Toggle between Daily & Cumulative */}
          <div className="flex items-center gap-1 p-1 bg-zinc-950 rounded-lg border border-zinc-800 self-start sm:self-auto text-xs">
            <button
              onClick={() => setChartMode('daily')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                chartMode === 'daily'
                  ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              النشاط اليومي
            </button>
            <button
              onClick={() => setChartMode('cumulative')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                chartMode === 'cumulative'
                  ? 'bg-zinc-800 text-amber-400 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              النمو التراكمي
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-72 sm:h-80 pt-2" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="listensGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="upvotesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#3f3f46' }}
                interval={4}
              />
              <YAxis
                stroke="#71717a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-950/95 border border-zinc-800 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 font-sans min-w-[150px] text-right" dir="rtl">
                        <p className="text-zinc-400 font-bold border-b border-zinc-800 pb-1 text-[11px] font-mono">
                          {label}
                        </p>
                        {payload.map((entry, index) => (
                          <div key={`item-${index}`} className="flex items-center justify-between gap-3 font-mono tabular-nums text-xs">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-bold text-zinc-100">
                              {Number(entry.value).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                height={36}
                formatter={(val) => (
                  <span className="text-xs text-zinc-300 font-sans mx-1">
                    {val === 'الاستماعات' || val === 'الاستماعات التراكمية' ? 'الاستماعات الفعلية (+30ث)' : 'أصوات الجمهور الإيجابية'}
                  </span>
                )}
              />
              <Area
                type="monotone"
                dataKey={chartMode === 'daily' ? 'listens' : 'cumListens'}
                name={chartMode === 'daily' ? 'الاستماعات' : 'الاستماعات التراكمية'}
                stroke="#f59e0b"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#listensGrad)"
              />
              <Area
                type="monotone"
                dataKey={chartMode === 'daily' ? 'upvotes' : 'cumUpvotes'}
                name={chartMode === 'daily' ? 'أصوات الجمهور' : 'أصوات الجمهور التراكمية'}
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#upvotesGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footnote stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-500 font-mono pt-2 border-t border-zinc-800/80">
          <span>* يتم قياس الاستماعات بعد تجاوز 30 ثانية استماع فعلي وفق معايير المنصة.</span>
          <span className="text-zinc-400">ذروة التفاعل: نهايات الأسبوع ويوم إطلاق التراكات الجديدة</span>
        </div>
      </div>

      {/* Pending Battle Requests Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-zinc-100">
              إدارة طلبات ونزالات الدسّات (Battle Requests)
            </h2>
          </div>
          <button
            onClick={onNavigateToBattles}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <span>الانتقال لحلبة المواجهات العامة</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Incoming Challenges Awaiting Your Acceptance */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>طلبات التحدي الواردة إليك ({incomingBattles.length} طلب ينتظر موافقتك)</span>
          </h3>

          {incomingBattles.length === 0 ? (
            <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-xs text-zinc-400 text-center">
              لا توجد طلبات مواجهة معلقة حالياً موجهة لاسمك الفني.
            </div>
          ) : (
            incomingBattles.map((battle) => {
              const challengerTrack = tracks.find((t) => t.id === battle.challengerTrackId);
              const isChallengerPlaying = currentTrack?.id === challengerTrack?.id && isPlaying;

              return (
                <div
                  key={battle.id}
                  className="p-5 rounded-xl border border-amber-500/40 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-zinc-100 font-sans">
                        {battle.title}
                      </span>
                      <span className="text-[11px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-mono">
                        مهلة 7 أيام للرد
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed">
                      الرابر <strong className="text-amber-400">{battle.challengerArtist}</strong> يتحداك في مواجهة دس ثنائية: "{battle.description}"
                    </p>

                    {challengerTrack && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => onPlayTrack(challengerTrack)}
                          className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors"
                        >
                          {isChallengerPlaying ? <Pause className="w-3.5 h-3.5 text-amber-400 fill-current" /> : <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />}
                          <span>استمع لتراك المتحدي: {challengerTrack.title} ({formatDuration(challengerTrack.duration)})</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                    <button
                      onClick={() => setSelectedBattleToAccept(battle)}
                      className="flex-1 md:flex-initial px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>قبول التحدي واختيار تراك الرد</span>
                    </button>

                    {onDeclineBattle && (
                      <button
                        onClick={() => onDeclineBattle(battle.id)}
                        className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        title="اعتذار ورفض التحدي بسلام"
                      >
                        <XCircle className="w-4 h-4 text-zinc-400" />
                        <span>اعتذار</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Outgoing Challenges Waiting on Target */}
        {outgoingBattles.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>تحدياتك الصادرة بانتظار رد الطرف الآخر ({outgoingBattles.length})</span>
            </h3>

            {outgoingBattles.map((battle) => (
              <div
                key={battle.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-zinc-200">{battle.title}</h4>
                  <p className="text-zinc-400 mt-0.5">
                    الطرف المستهدف: <strong className="text-zinc-300">{battle.defenderArtist}</strong> · في انتظار قبوله ورفع الرد
                  </p>
                </div>
                <span className="text-[11px] text-zinc-500 font-mono">
                  تنتهي المهلة خلال 7 أيام
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Active Battles Live Vote Tracker */}
        {myActiveBattles.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-emerald-400" />
              <span>نزالاتك الجارية حالياً تحت تصويت الجمهور ({myActiveBattles.length})</span>
            </h3>

            {myActiveBattles.map((battle) => {
              const total = (battle.challengerVotes + battle.defenderVotes) || 1;
              const chPercent = Math.round((battle.challengerVotes / total) * 100);
              const defPercent = 100 - chPercent;

              return (
                <div
                  key={battle.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-100">{battle.title}</span>
                    <span className="text-emerald-400 font-mono">{battle.totalVotes} صوت مسجل</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1.5">
                      <span>{battle.challengerArtist} ({chPercent}%)</span>
                      <span>{battle.defenderArtist} ({defPercent}%)</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                      <div className="bg-amber-400" style={{ width: `${chPercent}%` }} />
                      <div className="bg-zinc-500" style={{ width: `${defPercent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Uploaded Tracks Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          {/* Subtabs: My Tracks vs My Library (Favorites) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTracksTab('my-tracks')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tracksTab === 'my-tracks'
                  ? 'bg-amber-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 border border-zinc-800'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>أغانيّ المرفوعة ({myTracks.length}/{currentUser.maxTracksLimit})</span>
            </button>

            <button
              onClick={() => setTracksTab('favorites')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tracksTab === 'favorites'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-rose-400 bg-zinc-900/60 border border-zinc-800'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>مكتبتي (المفضلة) ({favoriteTracks.length})</span>
            </button>
          </div>

          <div className="text-xs text-zinc-400 font-mono">
            {tracksTab === 'my-tracks' ? (
              <span>الحد الأقصى: 5 أغانٍ نشطة</span>
            ) : (
              <span>{favoriteTracks.length} أغنية محفوظة في مكتبتك</span>
            )}
          </div>
        </div>

        {tracksTab === 'my-tracks' ? (
          myTracks.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-2">
            <p className="text-xs text-zinc-300">لم تقم برفع أي تراك بعد.</p>
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-amber-400 text-zinc-950 font-bold text-xs rounded-lg"
            >
              ارفع أول تراك الآن
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {myTracks.map((track) => {
              const isPlayingThis = currentTrack?.id === track.id && isPlaying;
              const sizeMb = (track.sizeBytes / (1024 * 1024)).toFixed(2);
              const wilsonPercent = Math.round(track.wilsonScore * 100);

              return (
                <div
                  key={track.id}
                  className={`p-4 rounded-xl border transition-all ${
                    track.status === 'warning_cleanup'
                      ? 'border-amber-500/50 bg-amber-500/5'
                      : 'border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70'
                  }`}
                >
                  {/* Warning banner for cleanup */}
                  {track.status === 'warning_cleanup' && (
                    <div className="mb-3 p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 flex items-center justify-between text-xs text-amber-300">
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                        <span>تحذير توفير مساحة: أقل من 10 استماعات بعد 60 يوماً.</span>
                      </div>
                      {!track.keepTrackExtendedOnce ? (
                        <button
                          onClick={() => onKeepTrack(track.id)}
                          className="px-2.5 py-1 bg-amber-400 text-zinc-950 font-bold rounded text-xs transition-colors"
                        >
                          أبقِ أغنيتي (+30 يوماً)
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-mono">تم التمديد لمرة واحدة</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    {/* Track info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
                        >
                          {isPlayingThis ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-100 truncate">{track.title}</h4>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {track.category === 'diss' ? 'دس مواجهة' : 'تراك راب'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-sans mt-0.5">
                          <span className="font-mono tabular-nums">{formatDuration(track.duration)}</span>
                          <span className="text-zinc-600">·</span>
                          <span className="font-mono tabular-nums">{sizeMb} MB (96kbps Opus)</span>
                          <span className="text-zinc-600">·</span>
                          <span className="text-emerald-400 text-[11px] font-mono">
                            {track.legalDeclaration.platform} {track.legalDeclaration.planType}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-zinc-300">
                      <div>
                        <span className="text-zinc-500 text-[10px] block font-sans">الاستماعات:</span>
                        <span>{track.uniqueListens} فريد</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] block font-sans">التصويت:</span>
                        <span className="text-amber-400 font-bold">{wilsonPercent}% ويلسون</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onShareTrack(track)}
                        className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="مشاركة بطاقة التراك"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTrack(track.id)}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="حذف الأغنية لتحرير مساحة وتخزين R2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* My Library (Favorites) View */
        <div>
          {favoriteTracks.length === 0 ? (
            <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-200">مكتبتك خالية حالياً</h4>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  لم تقم بإضافة أي أغنية إلى المفضلة بعد. تصفح التراكات والدسّات في الميدان وانقر على أيقونة القلب لحفظها هنا!
                </p>
              </div>
              {onNavigateToHome && (
                <button
                  onClick={onNavigateToHome}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5 mt-2"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>استكشف ساحة التراكات</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteTracks.map((track) => {
                const isPlayingThis = currentTrack?.id === track.id && isPlaying;
                const wilsonPercent = Math.round(track.wilsonScore * 100);

                return (
                  <div
                    key={track.id}
                    className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/70 transition-all flex items-center justify-between gap-4 flex-wrap"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => onPlayTrack(track)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white"
                        >
                          {isPlayingThis ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                        </button>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-zinc-100 truncate">{track.title}</h4>
                          <span className="text-[10px] text-zinc-400">
                            {track.category === 'diss' ? 'دسّ مواجهة' : 'تراك راب'}
                          </span>
                          {track.isWinner && (
                            <span className="text-amber-400 text-xs flex items-center gap-0.5" title="فائزة في لوحة الشرف">
                              <Sparkles className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 truncate">{track.artist}</p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono mt-0.5">
                          <span>{track.uniqueListens.toLocaleString()} استماع</span>
                          <span>·</span>
                          <span className="text-emerald-400">+{track.upvotes}</span>
                          <span>·</span>
                          <span className="text-amber-400 font-bold">{wilsonPercent}% ثقة</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onToggleFavorite && (
                        <button
                          onClick={() => onToggleFavorite(track.id)}
                          className="p-2 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="إزالة من مكتبتي المفضلة"
                        >
                          <Heart className="w-3.5 h-3.5 fill-current" />
                          <span className="hidden sm:inline">في المفضلة</span>
                        </button>
                      )}
                      <button
                        onClick={() => onShareTrack(track)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 transition-colors"
                        title="مشاركة التراك"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Modal: Select Response Track to Accept Battle */}
      {selectedBattleToAccept && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-right shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>قبول التحدي واختيار تراك الرد</span>
            </h3>

            <p className="text-xs text-zinc-300 leading-relaxed">
              أنت على وشك قبول تحدي <strong className="text-amber-400">{selectedBattleToAccept.challengerArtist}</strong>. اختر تراك الرد المسجل في حسابك لبدء النزال وفتح التصويت الجماهيري فوراً.
            </p>

            <form onSubmit={handleConfirmAccept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  اختر تراك الرد (من فئة الدسّات) *
                </label>
                <select
                  required
                  value={selectedResponseTrackId}
                  onChange={(e) => setSelectedResponseTrackId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- اختر من أغانيك في فئة الدسّات --</option>
                  {myDissTracks.map((trk) => (
                    <option key={trk.id} value={trk.id}>
                      {trk.title} ({formatDuration(trk.duration)})
                    </option>
                  ))}
                  {/* Fallback to any of the user's tracks if no specific diss is uploaded */}
                  {myDissTracks.length === 0 && myTracks.map((trk) => (
                    <option key={trk.id} value={trk.id}>
                      {trk.title} ({formatDuration(trk.duration)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                ملاحظة: بمجرد القبول، ستتحول حالة المواجهة إلى "نشطة" وسيتاح للجمهور الاستماع للتراكين جنباً إلى جنب والتصويت للأفضل.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBattleToAccept(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={!selectedResponseTrackId}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-zinc-950 font-bold text-xs rounded-lg transition-colors"
                >
                  تأكيد القبول وبدء النزال
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
