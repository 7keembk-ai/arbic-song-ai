export type Category = 'rap' | 'diss';

export interface LegalDeclaration {
  platform: 'Suno' | 'Udio' | 'Other' | 'Other_Paid_AI' | string;
  planType: 'Pro' | 'Premier' | 'Enterprise' | 'Commercial' | string;
  commercialRightsConfirmed: boolean;
  noRealPersonSlanderConfirmed: boolean;
  noVoiceCloneConfirmed: boolean;
  timestamp: string;
  declaredBy: string;
  licenseRef?: string;
  customPlatformName?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  category: Category;
  audioUrl: string;
  coverUrl: string;
  duration: number; // in seconds
  createdAt: string;
  listens: number;
  uniqueListens: number;
  upvotes: number;
  downvotes: number;
  wilsonScore: number;
  combinedRankScore: number;
  status: 'active' | 'warning_cleanup' | 'hidden_reported' | 'deleted' | 'winner';
  isFinalist: boolean;
  isWinner: boolean;
  keepTrackExtendedOnce: boolean;
  cleanupWarningDate?: string;
  daysSinceCreation: number;
  sizeBytes: number;
  waveformPeaks: number[];
  legalDeclaration: LegalDeclaration;
  lyricsExcerpt?: string;
  battleId?: string;
  audioStyle?: 'trap' | 'boombap' | 'drill' | 'lofi';
}

export interface Battle {
  id: string;
  title: string;
  challengerArtist: string;
  challengerArtistId: string;
  challengerTrackId: string;
  defenderArtist: string;
  defenderArtistId: string;
  defenderTrackId?: string;
  status: 'pending_acceptance' | 'active_voting' | 'expired' | 'finished';
  createdAt: string;
  expiresAt: string; // 7 days from creation
  challengerVotes: number;
  defenderVotes: number;
  totalVotes: number;
  winnerArtist?: string;
  description: string;
}

export interface Contest {
  id: string;
  monthName: string;
  category: Category;
  status: 'active' | 'closed';
  endsAt: string;
  topTrackIds: string[];
  totalVotes: number;
}

export interface PastWinner {
  id: string;
  month: string;
  year: number;
  category: Category;
  trackId: string;
  trackTitle: string;
  artist: string;
  coverUrl: string;
  score: number;
  listens: number;
}

export interface Report {
  id: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  reason: 'hate_speech' | 'doxxing_real_person' | 'unauthorized_voice_clone' | 'suno_free_tier_violation' | 'harassment' | 'copyright_dmca';
  details: string;
  reportedAt: string;
  status: 'pending' | 'resolved_hidden' | 'resolved_dismissed';
  reporterEmail?: string;
}

export interface UserAccount {
  id: string;
  artistName: string;
  email: string;
  activeTracksCount: number;
  maxTracksLimit: number; // default 5
  userVotesByMonthCategory: { [monthCategoryKey: string]: { trackId: string; voteType: 'up' | 'down'; timestamp: number } };
  battleVotes: { [battleId: string]: 'challenger' | 'defender' };
  isVerifiedArtist: boolean;
  favoriteTrackIds?: string[];
}

export interface QuotaMetrics {
  r2StorageBytesUsed: number;
  r2StorageMaxBytes: number; // 10 GB = 10 * 1024 * 1024 * 1024
  d1DailyReads: number;
  d1DailyReadsMax: number; // 5,000,000
  d1DailyWrites: number;
  d1DailyWritesMax: number; // 100,000
  workersDailyRequests: number;
  workersDailyRequestsMax: number; // 100,000
  directR2BypassRequestsSaved: number;
}

export interface AudioCompressResult {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  reductionPercentage: number;
  format: 'audio/webm;codecs=opus' | 'audio/aac';
  bitrateKbps: number;
}
