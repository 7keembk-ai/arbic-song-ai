import { Track, Battle, PastWinner, Report, UserAccount, QuotaMetrics } from '../types';
import { calculateWilsonScore, calculateCombinedRankScore } from '../utils/algorithms';
import { generateWaveformPeaks } from '../utils/audioEngine';

export const INITIAL_USER: UserAccount = {
  id: 'usr_me_001',
  artistName: 'شبح الراب العربي',
  email: '7keembk@gmail.com',
  activeTracksCount: 3,
  maxTracksLimit: 5,
  userVotesByMonthCategory: {
    '2026-10-rap': { trackId: 'trk-1', voteType: 'up', timestamp: Date.now() - 86400000 },
  },
  battleVotes: {
    'bat-001': 'challenger'
  },
  isVerifiedArtist: true,
};

export const INITIAL_TRACKS: Track[] = [
  {
    id: 'trk-1',
    title: 'سهرة تراب في المعادي',
    artist: 'شبح الراب العربي',
    artistId: 'usr_me_001',
    category: 'rap',
    audioUrl: '',
    coverUrl: '/src/assets/images/arabic_trap_cover_1791043426892.jpg',
    duration: 194, // 3:14
    createdAt: '2026-09-15',
    listens: 1420,
    uniqueListens: 840,
    upvotes: 380,
    downvotes: 18,
    wilsonScore: calculateWilsonScore(380, 18),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(380, 18), 840),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 18,
    sizeBytes: 2450000, // ~2.45 MB at 96kbps
    waveformPeaks: generateWaveformPeaks(64, 'sahra-trap'),
    lyricsExcerpt: 'الشارع هادي والبيز بيولع في المعادي / فلو ذكاء اصطناعي مش عادي / قافية بتكسر كل الحدود ولا بنهادي...',
    audioStyle: 'trap',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Pro',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-15T14:30:00Z',
      declaredBy: 'usr_me_001',
      licenseRef: 'SUNO-PRO-COMM-2026-8812'
    }
  },
  {
    id: 'trk-2',
    title: 'قضية الميدان (دس المواجهة)',
    artist: 'الصاعقة AI',
    artistId: 'art-02',
    category: 'diss',
    audioUrl: '',
    coverUrl: '/src/assets/images/diss_battle_cover_1791043427437.jpg',
    duration: 172,
    createdAt: '2026-09-28',
    listens: 2150,
    uniqueListens: 1320,
    upvotes: 540,
    downvotes: 42,
    wilsonScore: calculateWilsonScore(540, 42),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(540, 42), 1320),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 5,
    sizeBytes: 2100000,
    waveformPeaks: generateWaveformPeaks(64, 'qadiyat-meydan'),
    lyricsExcerpt: 'نازل في الحلبة أدمر أوهامك بالمنطق والفلو / أسلوبك قديم ومحتاج لك ابديت يجدد اللو...',
    audioStyle: 'drill',
    battleId: 'bat-001',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Premier',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-28T18:10:00Z',
      declaredBy: 'art-02',
      licenseRef: 'SUNO-PREMIER-COMM-2026-9931'
    }
  },
  {
    id: 'trk-3',
    title: 'رد الحساب (دس الرد على الصاعقة)',
    artist: 'صقر القوافي',
    artistId: 'art-03',
    category: 'diss',
    audioUrl: '',
    coverUrl: '/src/assets/images/rap_battle_arena_hero_1791043412154.jpg',
    duration: 185,
    createdAt: '2026-09-29',
    listens: 1980,
    uniqueListens: 1190,
    upvotes: 495,
    downvotes: 35,
    wilsonScore: calculateWilsonScore(495, 35),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(495, 35), 1190),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 4,
    sizeBytes: 2300000,
    waveformPeaks: generateWaveformPeaks(64, 'radd-hissab'),
    lyricsExcerpt: 'فكرت الصاعقة بتخوف جبال القافية؟ / راجع للرد بقوة فنية وموهبة دافية / لا تتحدى صقر في سماء التراك...',
    audioStyle: 'boombap',
    battleId: 'bat-001',
    legalDeclaration: {
      platform: 'Udio',
      planType: 'Pro',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-29T21:00:00Z',
      declaredBy: 'art-03',
      licenseRef: 'UDIO-COMM-LIC-2026-4421'
    }
  },
  {
    id: 'trk-4',
    title: 'بوم باب الإسكندرية',
    artist: 'عازف الكلمات',
    artistId: 'art-04',
    category: 'rap',
    audioUrl: '',
    coverUrl: '/src/assets/images/arabic_trap_cover_1791043426892.jpg',
    duration: 210,
    createdAt: '2026-09-10',
    listens: 980,
    uniqueListens: 610,
    upvotes: 210,
    downvotes: 12,
    wilsonScore: calculateWilsonScore(210, 12),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(210, 12), 610),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 23,
    sizeBytes: 2600000,
    waveformPeaks: generateWaveformPeaks(64, 'boombap-alex'),
    lyricsExcerpt: 'ريحة يود البحر مع إيقاع السبعينات / كلام مرصع ذهب مش مجرد أمنيات / الإسكندرية في القلب وفلو على السكة...',
    audioStyle: 'boombap',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Pro',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-10T11:00:00Z',
      declaredBy: 'art-04'
    }
  },
  {
    id: 'trk-5',
    title: 'دريل نجد والرياض',
    artist: 'نايف 01',
    artistId: 'art-05',
    category: 'rap',
    audioUrl: '',
    coverUrl: '/src/assets/images/rap_battle_arena_hero_1791043412154.jpg',
    duration: 160,
    createdAt: '2026-09-22',
    listens: 1120,
    uniqueListens: 730,
    upvotes: 280,
    downvotes: 22,
    wilsonScore: calculateWilsonScore(280, 22),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(280, 22), 730),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 11,
    sizeBytes: 1950000,
    waveformPeaks: generateWaveformPeaks(64, 'drill-najd'),
    lyricsExcerpt: 'صوت الدريل يرن في شوارع العليا / فكرة من العقل تولدت في ثواني عليا...',
    audioStyle: 'drill',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Pro',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-22T19:30:00Z',
      declaredBy: 'art-05'
    }
  },
  {
    id: 'trk-warning-1',
    title: 'تجربة بيتات الهدوء (خاملة)',
    artist: 'شبح الراب العربي',
    artistId: 'usr_me_001',
    category: 'rap',
    audioUrl: '',
    coverUrl: '/src/assets/images/arabic_trap_cover_1791043426892.jpg',
    duration: 145,
    createdAt: '2026-07-28',
    listens: 8,
    uniqueListens: 6, // Under 10 listens!
    upvotes: 2,
    downvotes: 0,
    wilsonScore: calculateWilsonScore(2, 0),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(2, 0), 6),
    status: 'warning_cleanup',
    isFinalist: false,
    isWinner: false,
    keepTrackExtendedOnce: false,
    cleanupWarningDate: '2026-10-01', // Warning started 2 days ago, 5 days left
    daysSinceCreation: 67, // Over 60 days
    sizeBytes: 1800000,
    waveformPeaks: generateWaveformPeaks(64, 'quiet-beats'),
    lyricsExcerpt: 'تراك تجريبي هادئ تم رفعه لتجربة ألوان البيتات في البدايات...',
    audioStyle: 'lofi',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Pro',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-07-28T10:00:00Z',
      declaredBy: 'usr_me_001'
    }
  },
  {
    id: 'trk-my-diss-1',
    title: 'صمت الحلبة (دس المواجهة)',
    artist: 'شبح الراب العربي',
    artistId: 'usr_me_001',
    category: 'diss',
    audioUrl: '',
    coverUrl: '/src/assets/images/diss_battle_cover_1791043427437.jpg',
    duration: 178,
    createdAt: '2026-09-30',
    listens: 620,
    uniqueListens: 410,
    upvotes: 185,
    downvotes: 8,
    wilsonScore: calculateWilsonScore(185, 8),
    combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(185, 8), 410),
    status: 'active',
    isFinalist: true,
    isWinner: false,
    keepTrackExtendedOnce: false,
    daysSinceCreation: 3,
    sizeBytes: 2200000,
    waveformPeaks: generateWaveformPeaks(64, 'samt-al-halba'),
    lyricsExcerpt: 'دخلت الحلبة بهدوء الشبح والضربة قاضية / قوافي ذكاء اصطناعي تفوق العقول الماضية...',
    audioStyle: 'drill',
    legalDeclaration: {
      platform: 'Suno',
      planType: 'Premier',
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: '2026-09-30T16:00:00Z',
      declaredBy: 'usr_me_001',
      licenseRef: 'SUNO-PREMIER-COMM-2026-7711'
    }
  }
];

export const INITIAL_BATTLES: Battle[] = [
  {
    id: 'bat-incoming-01',
    title: 'تحدي عرش الفلو: الأسد AI ضد شبح الراب العربي',
    challengerArtist: 'الأسد AI',
    challengerArtistId: 'art-07',
    challengerTrackId: 'trk-2',
    defenderArtist: 'شبح الراب العربي',
    defenderArtistId: 'usr_me_001',
    defenderTrackId: undefined, // Pending response from currentUser
    status: 'pending_acceptance',
    createdAt: '2026-10-01T14:00:00Z',
    expiresAt: '2026-10-08T14:00:00Z', // 5 days left of 7
    challengerVotes: 42,
    defenderVotes: 0,
    totalVotes: 42,
    description: 'تحدٍ مباشر لمهارة الفلو وسرعة القافية في ميدان الراب. في انتظار موافقة شبح الراب العربي ورفع تراك الرد.'
  },
  {
    id: 'bat-001',
    title: 'مواجهة العمالقة: الصاعقة ضد صقر القوافي',
    challengerArtist: 'الصاعقة AI',
    challengerArtistId: 'art-02',
    challengerTrackId: 'trk-2',
    defenderArtist: 'صقر القوافي',
    defenderArtistId: 'art-03',
    defenderTrackId: 'trk-3',
    status: 'active_voting',
    createdAt: '2026-09-28T18:00:00Z',
    expiresAt: '2026-10-05T18:00:00Z', // 7 days window
    challengerVotes: 540,
    defenderVotes: 495,
    totalVotes: 1035,
    description: 'تحدٍ معلن ومتبادل بين اثنين من رواد راب الذكاء الاصطناعي على لقب أقوى فلو وكلمات في الميدان.'
  },
  {
    id: 'bat-002',
    title: 'تحدي التدفق السريع: ميرو فلو يتحدى عازف الكلمات',
    challengerArtist: 'ميرو فلو',
    challengerArtistId: 'art-06',
    challengerTrackId: 'trk-4',
    defenderArtist: 'عازف الكلمات',
    defenderArtistId: 'art-04',
    defenderTrackId: undefined, // Still in 7-day waiting period for defender track
    status: 'pending_acceptance',
    createdAt: '2026-10-02T12:00:00Z',
    expiresAt: '2026-10-09T12:00:00Z',
    challengerVotes: 64,
    defenderVotes: 0,
    totalVotes: 64,
    description: 'تم توجيه التحدي، وأمام الفنان المستهدف 7 أيام لرفع الرد والموافقة على بدء التصويت.'
  }
];

export const INITIAL_PAST_WINNERS: PastWinner[] = [
  {
    id: 'win-001',
    month: 'سبتمبر',
    year: 2026,
    category: 'rap',
    trackId: 'trk-w-sep-rap',
    trackTitle: 'نبض الرمال',
    artist: 'سلطان الفلو',
    coverUrl: '/src/assets/images/arabic_trap_cover_1791043426892.jpg',
    score: 0.912,
    listens: 4890
  },
  {
    id: 'win-002',
    month: 'سبتمبر',
    year: 2026,
    category: 'diss',
    trackId: 'trk-w-sep-diss',
    trackTitle: 'نهاية الجولة الأولى',
    artist: 'الأسد AI',
    coverUrl: '/src/assets/images/diss_battle_cover_1791043427437.jpg',
    score: 0.894,
    listens: 5420
  },
  {
    id: 'win-003',
    month: 'أغسطس',
    year: 2026,
    category: 'rap',
    trackId: 'trk-w-aug-rap',
    trackTitle: 'مدينة النيون',
    artist: 'فارس المايك',
    coverUrl: '/src/assets/images/rap_battle_arena_hero_1791043412154.jpg',
    score: 0.875,
    listens: 3950
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-001',
    trackId: 'trk-warning-1',
    trackTitle: 'تجربة بيتات الهدوء (خاملة)',
    artist: 'شبح الراب العربي',
    reason: 'suno_free_tier_violation',
    details: 'استفسار حول صحة ترخيص الحساب والتحميل قبل تاريخ 3 سبتمبر.',
    reportedAt: '2026-10-02T10:15:00Z',
    status: 'pending',
    reporterEmail: 'checker@rap-community.org'
  }
];

export const INITIAL_QUOTA: QuotaMetrics = {
  r2StorageBytesUsed: 1_280_000_000, // ~1.28 GB used of 10 GB (12.8%)
  r2StorageMaxBytes: 10 * 1024 * 1024 * 1024, // 10 GB free tier
  d1DailyReads: 38_400, // of 5,000,000 max daily reads
  d1DailyReadsMax: 5_000_000,
  d1DailyWrites: 1_250, // of 100,000 max daily writes
  d1DailyWritesMax: 100_000,
  workersDailyRequests: 8_900, // of 100,000 max daily requests
  workersDailyRequestsMax: 100_000,
  directR2BypassRequestsSaved: 42_800 // Audio streaming requests served directly from R2 CDN without hitting Worker!
};
