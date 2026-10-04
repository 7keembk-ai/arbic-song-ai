import React, { useState } from 'react';
import { Swords, Play, Pause, Flame, Shield, Clock, Plus, CheckCircle2, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { Battle, Track } from '../types';

interface BattleModeViewProps {
  battles: Battle[];
  tracks: Track[];
  currentTrack: Track | null;
  isPlaying: boolean;
  onPlayTrack: (track: Track) => void;
  onVoteBattle: (battleId: string, choice: 'challenger' | 'defender') => void;
  userBattleVotes: { [battleId: string]: 'challenger' | 'defender' };
  onCreateBattleChallenge: (targetArtist: string, title: string, challengerTrackId: string, description: string) => void;
  onAcceptBattle: (battleId: string, defenderTrackId: string) => void;
}

export const BattleModeView: React.FC<BattleModeViewProps> = ({
  battles,
  tracks,
  currentTrack,
  isPlaying,
  onPlayTrack,
  onVoteBattle,
  userBattleVotes,
  onCreateBattleChallenge,
  onAcceptBattle,
}) => {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [targetArtist, setTargetArtist] = useState<string>('');
  const [battleTitle, setBattleTitle] = useState<string>('');
  const [selectedChallengerTrackId, setSelectedChallengerTrackId] = useState<string>('');
  const [battleDescription, setBattleDescription] = useState<string>('');
  const [acceptingBattleId, setAcceptingBattleId] = useState<string | null>(null);
  const [selectedDefenderTrackId, setSelectedDefenderTrackId] = useState<string>('');

  const getTrackById = (id?: string) => tracks.find((t) => t.id === id);

  const myDissTracks = tracks.filter((t) => t.category === 'diss');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetArtist.trim() || !battleTitle.trim() || !selectedChallengerTrackId) return;

    onCreateBattleChallenge(
      targetArtist.trim(),
      battleTitle.trim(),
      selectedChallengerTrackId,
      battleDescription.trim() || 'مواجهة راب وتدفق كلماتي شريفة خالية من الإساءات الشخصية.'
    );

    setShowCreateModal(false);
    setTargetArtist('');
    setBattleTitle('');
    setSelectedChallengerTrackId('');
    setBattleDescription('');
  };

  const handleAcceptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptingBattleId || !selectedDefenderTrackId) return;
    onAcceptBattle(acceptingBattleId, selectedDefenderTrackId);
    setAcceptingBattleId(null);
    setSelectedDefenderTrackId('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
            <Swords className="w-4 h-4" />
            <span>فئة الدسّات | وضع المواجهة (Battle Mode)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
            حلبة النزال الثنائي: دسّ ضد دسّ برضا الطرفين
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            وفقاً لضوابط المنصة الصارمة: الدسّات مسموحة فقط بين فنانين مسجلين يوافقون على خوض النزال مع مهلة 7 أيام للرد. يمنع منعاً باتاً الهجوم على شخصيات حقيقية عامة أو خاصة أو خطاب الكراهية.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-all flex items-center gap-2 shadow-md shadow-amber-500/10 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>أطلق تحدي مواجهة</span>
        </button>
      </div>

      {/* Battles Grid */}
      <div className="space-y-6">
        {battles.map((battle) => {
          const challengerTrack = getTrackById(battle.challengerTrackId);
          const defenderTrack = getTrackById(battle.defenderTrackId);
          const userVote = userBattleVotes[battle.id];

          const totalVotes = (battle.challengerVotes + battle.defenderVotes) || 1;
          const challengerPercent = Math.round((battle.challengerVotes / totalVotes) * 100);
          const defenderPercent = 100 - challengerPercent;

          const isChallengerPlaying = currentTrack?.id === challengerTrack?.id && isPlaying;
          const isDefenderPlaying = currentTrack?.id === defenderTrack?.id && isPlaying;

          return (
            <div
              key={battle.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-7 overflow-hidden relative"
            >
              {/* Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className="text-zinc-100 text-base font-bold">{battle.title}</span>
                  <span className="text-zinc-500">·</span>
                  <span className="text-zinc-400 text-xs">{battle.description}</span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  {battle.status === 'active_voting' ? (
                    <span className="text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                      <Flame className="w-3.5 h-3.5 text-emerald-400" />
                      تصويت الجمهور جارٍ
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      في انتظار رد وتراك الطرف الآخر (مهلة 7 أيام)
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Arena */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Center Clash Badge (Desktop) */}
                <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-zinc-950 border border-zinc-700 items-center justify-center text-amber-400 font-extrabold text-xs shadow-lg">
                  ضد
                </div>

                {/* Side A: Challenger */}
                <div className={`p-4 rounded-xl border transition-all ${userVote === 'challenger' ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 bg-zinc-950/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      المتحدي (Challenger)
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {battle.challengerVotes} صوت ({challengerPercent}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                      <img
                        src={challengerTrack?.coverUrl || '/src/assets/images/diss_battle_cover_1791043427437.jpg'}
                        alt={challengerTrack?.title}
                        className="w-full h-full object-cover"
                      />
                      {challengerTrack && (
                        <button
                          onClick={() => onPlayTrack(challengerTrack)}
                          className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity"
                        >
                          {isChallengerPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                        </button>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-zinc-100 truncate">
                        {challengerTrack?.title || 'تراك الدس الأول'}
                      </h4>
                      <p className="text-xs text-zinc-400 font-medium">
                        الرابر: <strong className="text-zinc-200">{battle.challengerArtist}</strong>
                      </p>
                      <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                        {challengerTrack?.uniqueListens || 0} استماع فريد
                      </p>
                    </div>
                  </div>

                  {battle.status === 'active_voting' && (
                    <button
                      onClick={() => onVoteBattle(battle.id, 'challenger')}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        userVote === 'challenger'
                          ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{userVote === 'challenger' ? 'صوتت لهذا الطرف (اضغط للتغيير)' : `صوّت لـ ${battle.challengerArtist}`}</span>
                    </button>
                  )}
                </div>

                {/* Side B: Defender */}
                <div className={`p-4 rounded-xl border transition-all ${userVote === 'defender' ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800 bg-zinc-950/60'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      المدافع والمستهدف (Defender)
                    </span>
                    <span className="font-mono text-xs text-zinc-400">
                      {battle.defenderVotes} صوت ({defenderPercent}%)
                    </span>
                  </div>

                  {defenderTrack ? (
                    <>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800">
                          <img
                            src={defenderTrack.coverUrl}
                            alt={defenderTrack.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => onPlayTrack(defenderTrack)}
                            className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-opacity"
                          >
                            {isDefenderPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                          </button>
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-zinc-100 truncate">
                            {defenderTrack.title}
                          </h4>
                          <p className="text-xs text-zinc-400 font-medium">
                            الرابر: <strong className="text-zinc-200">{battle.defenderArtist}</strong>
                          </p>
                          <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                            {defenderTrack.uniqueListens} استماع فريد
                          </p>
                        </div>
                      </div>

                      {battle.status === 'active_voting' && (
                        <button
                          onClick={() => onVoteBattle(battle.id, 'defender')}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            userVote === 'defender'
                              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{userVote === 'defender' ? 'صوتت لهذا الطرف (اضغط للتغيير)' : `صوّت لـ ${battle.defenderArtist}`}</span>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="py-6 text-center space-y-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                        <Clock className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="text-xs text-zinc-300 font-bold">
                        في انتظار رفع رد {battle.defenderArtist}
                      </div>
                      <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">
                        تنص شروط المنصة على إعطاء 7 أيام لرفع الرد. لن يتم فتح التصويت إلا بعد اكتمال الطرفين.
                      </p>
                      <button
                        onClick={() => setAcceptingBattleId(battle.id)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                      >
                        أنا الفنان المستهدف: ارفع الرد الآن
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Crowd Reaction Balance Bar */}
              {battle.status === 'active_voting' && (
                <div className="mt-5 pt-4 border-t border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
                    <span>{battle.challengerArtist}: {challengerPercent}%</span>
                    <span className="text-zinc-500 font-sans">مقياس تفاعل الجمهور والميدان</span>
                    <span>{battle.defenderArtist}: {defenderPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                      className="bg-amber-400 transition-all duration-500"
                      style={{ width: `${challengerPercent}%` }}
                    />
                    <div
                      className="bg-zinc-500 transition-all duration-500"
                      style={{ width: `${defenderPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create Battle Challenge */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-lg w-full p-6 text-right shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Swords className="w-5 h-5 text-amber-400" />
                <span>إطلاق تحدي مواجهة (Battle Challenge)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-zinc-400 hover:text-zinc-200 text-sm px-2 py-1 bg-zinc-800 rounded-md"
              >
                إلغاء
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  عنوان المواجهة
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مواجهة الإيقاع السريع"
                  value={battleTitle}
                  onChange={(e) => setBattleTitle(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  الاسم الفني للرابر المستهدف
                </label>
                <input
                  type="text"
                  required
                  placeholder="الاسم الفني المسجل بالمنصة فقط (يمنع استهداف أشخاص حقيقيين)"
                  value={targetArtist}
                  onChange={(e) => setTargetArtist(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  اختر تراك الدس الخاص بك
                </label>
                <select
                  required
                  value={selectedChallengerTrackId}
                  onChange={(e) => setSelectedChallengerTrackId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- اختر من أغانيك المرفوعة --</option>
                  {myDissTracks.map((trk) => (
                    <option key={trk.id} value={trk.id}>
                      {trk.title} ({trk.artist})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  وصف التحدي
                </label>
                <textarea
                  rows={2}
                  placeholder="نقد الأسلوب والأداء والقافية..."
                  value={battleDescription}
                  onChange={(e) => setBattleDescription(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Policy Invariant Note */}
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  تذكير بالضوابط: سيتم إرسال إشعار للرابر المستهدف، ولن يبدأ النزال أو يُفتح التصويت إلا بعد قبوله ورفع تراك الرد خلال 7 أيام.
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
                >
                  إرسال التحدي رسمياً
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Defender Accepts & Uploads Response */}
      {acceptingBattleId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 text-right shadow-2xl">
            <h3 className="text-lg font-bold text-zinc-100 mb-3 flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span>قبول التحدي ورفع تراك الرد</span>
            </h3>

            <form onSubmit={handleAcceptSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  اختر تراك الرد الخاص بك
                </label>
                <select
                  required
                  value={selectedDefenderTrackId}
                  onChange={(e) => setSelectedDefenderTrackId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- اختر من أغانيك المرفوعة في فئة الدسّات --</option>
                  {myDissTracks.map((trk) => (
                    <option key={trk.id} value={trk.id}>
                      {trk.title} ({trk.artist})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                بقبولك التحدي واختيار تراك الرد، ستتحول حالة المواجهة فوراً إلى "تصويت الجمهور جارٍ" لمدة شهر.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAcceptingBattleId(null)}
                  className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded-lg text-xs transition-colors"
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
