/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_USER,
  INITIAL_TRACKS,
  INITIAL_BATTLES,
  INITIAL_PAST_WINNERS,
  INITIAL_REPORTS,
  INITIAL_QUOTA,
} from './data/mockData';
import { Track, Battle, PastWinner, Report, UserAccount, QuotaMetrics, Category } from './types';
import { calculateWilsonScore, calculateCombinedRankScore, validate30sListen } from './utils/algorithms';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { TrackCard } from './components/TrackCard';
import { BattleModeView } from './components/BattleModeView';
import { MonthlyContestView } from './components/MonthlyContestView';
import { HallOfFameView } from './components/HallOfFameView';
import { ModerationView } from './components/ModerationView';
import { QuotaMonitorView } from './components/QuotaMonitorView';
import { TestRunnerView } from './components/TestRunnerView';
import { ArtistDashboardView } from './components/ArtistDashboardView';
import { PersistentAudioPlayer } from './components/PersistentAudioPlayer';
import { UploadModal } from './components/UploadModal';
import { ReportModal } from './components/ReportModal';
import { ShareCardModal } from './components/ShareCardModal';
import { Flame, Swords, Trophy, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USER);
  const [tracks, setTracks] = useState<Track[]>(INITIAL_TRACKS);
  const [battles, setBattles] = useState<Battle[]>(INITIAL_BATTLES);
  const [pastWinners, setPastWinners] = useState<PastWinner[]>(INITIAL_PAST_WINNERS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [quota, setQuota] = useState<QuotaMetrics>(INITIAL_QUOTA);

  // Audio Playback State
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<Track | null>(INITIAL_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [reportingTrack, setReportingTrack] = useState<Track | null>(null);
  const [sharingTrack, setSharingTrack] = useState<Track | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // My Library: Favorited tracks
  const [favoriteTrackIds, setFavoriteTrackIds] = useState<string[]>(['trk-2', 'trk-4']);

  const handleToggleFavorite = (trackId: string) => {
    setFavoriteTrackIds((prev) => {
      const isFav = prev.includes(trackId);
      const next = isFav ? prev.filter((id) => id !== trackId) : [...prev, trackId];
      const targetTrack = tracks.find((t) => t.id === trackId);
      const title = targetTrack ? `"${targetTrack.title}"` : 'الأغنية';
      showToast(isFav ? `تمت إزالة ${title} من مكتبتك المفضلة` : `تمت إضافة ${title} إلى مكتبتك المفضلة ❤️`);
      return next;
    });
  };

  // Theme state: dark (default) vs high-contrast light
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  React.useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(nextTheme === 'light' ? 'تم تفعيل الوضع الفاتح عالي التباين (High-Contrast)' : 'تم تفعيل وضع الاستوديو الداكن (Dark Studio)');
  };

  const handleSignOut = () => {
    showToast('تم تسجيل الخروج بنجاح (جلسة تجريبية). مرحباً بك كزائر في ميدان راب AI!');
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Play / Pause track
  const handlePlayToggle = (track?: Track) => {
    if (track) {
      if (currentPlayingTrack?.id === track.id) {
        setIsPlaying(!isPlaying);
      } else {
        setCurrentPlayingTrack(track);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // 30s Verified Listen Trigger
  const handleVerifiedListenCounted = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const newUnique = t.uniqueListens + 1;
          const newListens = t.listens + 1;
          const newRankScore = calculateCombinedRankScore(t.wilsonScore, newUnique);
          return {
            ...t,
            listens: newListens,
            uniqueListens: newUnique,
            combinedRankScore: newRankScore,
          };
        }
        return t;
      })
    );

    // Update quota metrics (increment D1 reads/writes and saved R2 direct streaming requests)
    setQuota((prev) => ({
      ...prev,
      d1DailyWrites: prev.d1DailyWrites + 1,
      directR2BypassRequestsSaved: prev.directR2BypassRequestsSaved + 1,
    }));

    showToast('🎉 تم احتساب استماعك الفعلي (+30 ثانية) واحتسابه في ترتيب ويلسون الشهري!');
  };

  // Upvote / Downvote on track
  const handleVote = (trackId: string, type: 'up' | 'down') => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    const monthCategoryKey = `2026-10-${track.category}`;
    const previousVote = currentUser.userVotesByMonthCategory[monthCategoryKey];

    // Single vote per month-category rule: user can change vote before month closing
    let upDelta = 0;
    let downDelta = 0;

    if (previousVote && previousVote.trackId === trackId) {
      if (previousVote.voteType === type) {
        showToast('لقد قمت بالفعل بهذا التصويت لهذا التراك.');
        return;
      }
      // Switching vote
      if (type === 'up') {
        upDelta = 1;
        downDelta = -1;
      } else {
        upDelta = -1;
        downDelta = 1;
      }
    } else {
      // First vote or voting for another track
      if (type === 'up') upDelta = 1;
      else downDelta = 1;
    }

    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          const newUp = Math.max(0, t.upvotes + upDelta);
          const newDown = Math.max(0, t.downvotes + downDelta);
          const newWilson = calculateWilsonScore(newUp, newDown);
          const newRank = calculateCombinedRankScore(newWilson, t.uniqueListens);
          return {
            ...t,
            upvotes: newUp,
            downvotes: newDown,
            wilsonScore: newWilson,
            combinedRankScore: newRank,
          };
        }
        return t;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      userVotesByMonthCategory: {
        ...prev.userVotesByMonthCategory,
        [monthCategoryKey]: { trackId, voteType: type, timestamp: Date.now() },
      },
    }));

    // Increment D1 writes
    setQuota((prev) => ({ ...prev, d1DailyWrites: prev.d1DailyWrites + 1 }));

    showToast(
      type === 'up'
        ? 'تم تسجيل صوتك الإيجابي وحساب درجة ثقة ويلسون!'
        : 'تم تسجيل تصويتك وحساب درجة ثقة ويلسون!'
    );
  };

  // "Keep My Track" 30-day reprieve
  const handleKeepTrack = (trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === trackId) {
          return {
            ...t,
            keepTrackExtendedOnce: true,
            status: 'active',
          };
        }
        return t;
      })
    );
    showToast('تم تمديد مهلة بقاء الأغنية 30 يوماً إضافية بنجاح!');
  };

  // Battle voting
  const handleVoteBattle = (battleId: string, choice: 'challenger' | 'defender') => {
    setBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          const isChallenger = choice === 'challenger';
          return {
            ...b,
            challengerVotes: isChallenger ? b.challengerVotes + 1 : b.challengerVotes,
            defenderVotes: !isChallenger ? b.defenderVotes + 1 : b.defenderVotes,
            totalVotes: b.totalVotes + 1,
          };
        }
        return b;
      })
    );

    setCurrentUser((prev) => ({
      ...prev,
      battleVotes: {
        ...prev.battleVotes,
        [battleId]: choice,
      },
    }));

    showToast('تم احتساب صوتك في النزال وتحديث مؤشر حلبة الميدان!');
  };

  // Create Battle Challenge
  const handleCreateBattleChallenge = (
    targetArtist: string,
    title: string,
    challengerTrackId: string,
    description: string
  ) => {
    const newBattle: Battle = {
      id: `bat_${Date.now()}`,
      title,
      challengerArtist: currentUser.artistName,
      challengerArtistId: currentUser.id,
      challengerTrackId,
      defenderArtist: targetArtist,
      defenderArtistId: `target_${Date.now()}`,
      defenderTrackId: undefined,
      status: 'pending_acceptance',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      challengerVotes: 1,
      defenderVotes: 0,
      totalVotes: 1,
      description,
    };

    setBattles([newBattle, ...battles]);
    showToast('تم إطلاق التحدي رسمياً! أمام الفنان 7 أيام لرفع الرد قبل بدء التصويت.');
  };

  // Accept Battle & Link Defender Track
  const handleAcceptBattle = (battleId: string, defenderTrackId: string) => {
    setBattles((prev) =>
      prev.map((b) => {
        if (b.id === battleId) {
          return {
            ...b,
            defenderTrackId,
            status: 'active_voting',
          };
        }
        return b;
      })
    );
    showToast('تم قبول المواجهة بنجاح وبدء تصويت الجمهور المباشر!');
  };

  // Decline incoming battle challenge
  const handleDeclineBattle = (battleId: string) => {
    setBattles((prev) => prev.filter((b) => b.id !== battleId));
    showToast('تم الاعتذار عن قبول التحدي وإغلاق الطلب بسلام.');
  };

  // Delete own track to free quota slot & R2 storage
  const handleDeleteUserTrack = (trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setCurrentUser((prev) => ({
      ...prev,
      activeTracksCount: Math.max(0, prev.activeTracksCount - 1),
    }));
    if (track) {
      setQuota((prev) => ({
        ...prev,
        r2StorageBytesUsed: Math.max(0, prev.r2StorageBytesUsed - track.sizeBytes),
      }));
    }
    showToast('تم حذف التراك بنجاح وتحرير مساحة التخزين في حسابك.');
  };

  // Upload Track Success
  const handleUploadSuccess = (newTrack: Track) => {
    setTracks([newTrack, ...tracks]);
    setCurrentUser((prev) => ({
      ...prev,
      activeTracksCount: prev.activeTracksCount + 1,
    }));
    setQuota((prev) => ({
      ...prev,
      r2StorageBytesUsed: prev.r2StorageBytesUsed + newTrack.sizeBytes,
      d1DailyWrites: prev.d1DailyWrites + 2,
    }));
    showToast('تم رفع وضغط الأغنية ونشرها في الميدان بنجاح!');
  };

  // Submit Report
  const handleSubmitReport = (
    trackId: string,
    reason: Report['reason'],
    details: string,
    email: string
  ) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      trackId,
      trackTitle: track.title,
      artist: track.artist,
      reason,
      details,
      reportedAt: new Date().toISOString(),
      status: 'pending',
      reporterEmail: email || undefined,
    };

    setReports([newReport, ...reports]);

    // Check Auto-Quarantine threshold (3 reports)
    const totalReportsForTrack = reports.filter((r) => r.trackId === trackId).length + 1;
    if (totalReportsForTrack >= 3) {
      setTracks((prev) =>
        prev.map((t) => (t.id === trackId ? { ...t, status: 'hidden_reported' } : t))
      );
      showToast('تجاوزت الأغنية 3 بلاغات، تم تفعيل الحجب التلقائي المؤقت لحين مراجعة الإدارة.');
    } else {
      showToast('تم إرسال البلاغ لفريق الإشراف والمراجعة. شكراً لحرصك على نظافة الميدان.');
    }
  };

  // Moderation Actions
  const handleDismissReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved_dismissed' } : r))
    );
    showToast('تم إلغاء البلاغ وتبرئة التراك.');
  };

  const handleHideTrack = (trackId: string, reportId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, status: 'hidden_reported' } : t))
    );
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved_hidden' } : r))
    );
    showToast('تم حجب التراك مؤقتاً.');
  };

  const handleDeleteTrackPermanently = (trackId: string, reportId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: 'resolved_hidden' } : r))
    );
    if (track) {
      setQuota((prev) => ({
        ...prev,
        r2StorageBytesUsed: Math.max(0, prev.r2StorageBytesUsed - track.sizeBytes),
      }));
    }
    showToast('تم حذف الأغنية نهائياً وتفريغ مساحتها من R2.');
  };

  const handleSubmitTakedownRequest = (
    trackTitle: string,
    claimantName: string,
    claimantEmail: string,
    statement: string
  ) => {
    // Find matching track and temporarily hide
    setTracks((prev) =>
      prev.map((t) =>
        t.title.includes(trackTitle) ? { ...t, status: 'hidden_reported' } : t
      )
    );
    showToast('تم استلام إشعار الـ DMCA وحجب المحتوى مؤقتاً للتحقق من الأوراق الرسمية.');
  };

  // Simulate Monthly Contest Automated Closure
  const handleSimulateMonthClose = (category: Category) => {
    const categoryTracks = tracks
      .filter((t) => t.category === category && t.status !== 'deleted')
      .sort((a, b) => b.combinedRankScore - a.combinedRankScore);

    if (categoryTracks.length === 0) return;

    const winner = categoryTracks[0];

    // Mark track as winner and grant permanent immunity
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id === winner.id) {
          return {
            ...t,
            isWinner: true,
            status: 'winner',
          };
        }
        return t;
      })
    );

    const newWinnerEntry: PastWinner = {
      id: `win_${Date.now()}`,
      month: 'أكتوبر',
      year: 2026,
      category,
      trackId: winner.id,
      trackTitle: winner.title,
      artist: winner.artist,
      coverUrl: winner.coverUrl,
      score: winner.combinedRankScore,
      listens: winner.listens,
    };

    setPastWinners([newWinnerEntry, ...pastWinners]);
    showToast(`🏆 أُغلقت المسابقة آلياً وتُوِّج "${winner.title}" للرابر "${winner.artist}" بطلاً لشهر أكتوبر وحصل على الحصانة الأبدية من الحذف!`);
  };

  const storageWarningTracks = tracks.filter((t) => t.status === 'warning_cleanup').length;
  const totalVotesCount = tracks.reduce((acc, t) => acc + t.upvotes + t.downvotes, 0);

  // Notifications: Pending battle challenges and storage cleanup warnings
  const pendingIncomingBattles = battles.filter(
    (b) =>
      (b.defenderArtistId === currentUser.id || b.defenderArtist === currentUser.artistName) &&
      b.status === 'pending_acceptance'
  );

  const userWarningTracks = tracks.filter(
    (t) => t.artistId === currentUser.id && (t.status === 'warning_cleanup' || t.status === 'hidden_reported')
  );

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'theme-light bg-slate-50 text-slate-900' : 'bg-zinc-950 text-zinc-100'} flex flex-col font-sans pb-28 selection:bg-amber-500 selection:text-black transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        storageWarningCount={storageWarningTracks}
        pendingBattles={pendingIncomingBattles}
        warningTracks={userWarningTracks}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onSignOut={handleSignOut}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl shadow-2xl text-xs sm:text-sm flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top duration-200">
          <Sparkles className="w-4 h-4 shrink-0 fill-current" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'home' && (
          <div className="space-y-8">
            <HeroSection
              onExploreContest={() => setActiveTab('contest')}
              onExploreBattles={() => setActiveTab('battles')}
              monthlyTotalVotes={totalVotesCount}
            />

            {/* Quick Filter & Popular Tracks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
                    أحدث تراكّات ومواجهات الراب في الميدان
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('contest')}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    عرض ترتيب المسابقة الكامل ←
                  </button>
                </div>
              </div>

              {/* Tracks List */}
              <div className="space-y-2.5">
                {tracks
                  .filter((t) => t.status !== 'deleted')
                  .slice(0, 5)
                  .map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={isPlaying}
                      isCurrentTrack={currentPlayingTrack?.id === track.id}
                      onPlay={handlePlayToggle}
                      onVote={handleVote}
                      userVote={
                        currentUser.userVotesByMonthCategory[`2026-10-${track.category}`]?.trackId === track.id
                          ? currentUser.userVotesByMonthCategory[`2026-10-${track.category}`]?.voteType
                          : undefined
                      }
                      onReport={(t) => setReportingTrack(t)}
                      onShare={(t) => setSharingTrack(t)}
                      onKeepTrack={handleKeepTrack}
                      isFavorite={favoriteTrackIds.includes(track.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
              </div>
            </div>

            {/* Featured Active Battle Teaser */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-950 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-right">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold uppercase">
                  <Swords className="w-4 h-4" />
                  <span>المواجهة الأكثر سخونة الآن</span>
                </div>
                <h3 className="text-base font-bold text-zinc-100">
                  {battles[0]?.title || 'مواجهة العمالقة'}
                </h3>
                <p className="text-xs text-zinc-400">
                  {battles[0]?.challengerArtist} ضد {battles[0]?.defenderArtist} · تصويت الجمهور مشتعل
                </p>
              </div>

              <button
                onClick={() => setActiveTab('battles')}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shrink-0 transition-all active:scale-95"
              >
                شاهد وصوّت في الحلبة
              </button>
            </div>
          </div>
        )}

        {activeTab === 'artist-dashboard' && (
          <ArtistDashboardView
            currentUser={currentUser}
            tracks={tracks}
            battles={battles}
            currentTrack={currentPlayingTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayToggle}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onAcceptBattle={handleAcceptBattle}
            onDeclineBattle={handleDeclineBattle}
            onKeepTrack={handleKeepTrack}
            onDeleteTrack={handleDeleteUserTrack}
            onShareTrack={(t) => setSharingTrack(t)}
            onNavigateToBattles={() => setActiveTab('battles')}
            favoriteTrackIds={favoriteTrackIds}
            onToggleFavorite={handleToggleFavorite}
            onNavigateToHome={() => setActiveTab('home')}
          />
        )}

        {activeTab === 'battles' && (
          <BattleModeView
            battles={battles}
            tracks={tracks}
            currentTrack={currentPlayingTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayToggle}
            onVoteBattle={handleVoteBattle}
            userBattleVotes={currentUser.battleVotes}
            onCreateBattleChallenge={handleCreateBattleChallenge}
            onAcceptBattle={handleAcceptBattle}
          />
        )}

        {activeTab === 'contest' && (
          <MonthlyContestView
            tracks={tracks}
            currentTrack={currentPlayingTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayToggle}
            onVote={handleVote}
            userVotesByMonthCategory={currentUser.userVotesByMonthCategory}
            onReport={(t) => setReportingTrack(t)}
            onShare={(t) => setSharingTrack(t)}
            onKeepTrack={handleKeepTrack}
            onSimulateMonthClose={handleSimulateMonthClose}
            favoriteTrackIds={favoriteTrackIds}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {activeTab === 'hall-of-fame' && (
          <HallOfFameView
            pastWinners={pastWinners}
            tracks={tracks}
            currentTrack={currentPlayingTrack}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayToggle}
          />
        )}

        {activeTab === 'moderation' && (
          <ModerationView
            reports={reports}
            tracks={tracks}
            onDismissReport={handleDismissReport}
            onHideTrack={handleHideTrack}
            onDeleteTrackPermanently={handleDeleteTrackPermanently}
            onSubmitTakedownRequest={handleSubmitTakedownRequest}
          />
        )}

        {activeTab === 'quota' && (
          <QuotaMonitorView
            quota={quota}
            totalTracksCount={tracks.length}
          />
        )}

        {activeTab === 'tests' && (
          <TestRunnerView />
        )}
      </main>

      {/* Persistent Audio Player (Global dock) */}
      <PersistentAudioPlayer
        currentTrack={currentPlayingTrack}
        isPlaying={isPlaying}
        onPlayToggle={() => handlePlayToggle()}
        onTrackEnd={() => setIsPlaying(false)}
        onVerifiedListenCounted={handleVerifiedListenCounted}
        onShareTrack={(t) => setSharingTrack(t)}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        currentUser={currentUser}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={!!reportingTrack}
        track={reportingTrack}
        onClose={() => setReportingTrack(null)}
        onSubmitReport={handleSubmitReport}
      />

      {/* Share Modal */}
      <ShareCardModal
        isOpen={!!sharingTrack}
        track={sharingTrack}
        onClose={() => setSharingTrack(null)}
      />
    </div>
  );
}
