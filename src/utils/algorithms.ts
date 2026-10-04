import { Track } from '../types';

/**
 * Wilson score interval lower bound calculation.
 * Gives a statistical confidence lower bound for positive ratings.
 * Avoids the "1 upvote = 100%" bias compared to tracks with 95 upvotes and 5 downvotes.
 * 
 * @param upvotes Positive votes
 * @param downvotes Negative votes
 * @param confidence Z-score, default 1.96 for 95% confidence
 */
export function calculateWilsonScore(upvotes: number, downvotes: number, confidence: number = 1.96): number {
  const n = upvotes + downvotes;
  if (n <= 0) return 0;

  const p = upvotes / n;
  const z = confidence;
  const z2 = z * z;

  const centerAdjusted = p + z2 / (2 * n);
  const spread = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  const denominator = 1 + z2 / n;

  const lowerBound = (centerAdjusted - spread) / denominator;
  return Math.max(0, Math.min(1, Math.round(lowerBound * 10000) / 10000));
}

/**
 * Combined ranking score combining Wilson score with logarithmic unique listens.
 * Weights: 70% Wilson score, 30% Unique verified listens.
 */
export function calculateCombinedRankScore(
  wilsonScore: number,
  uniqueListens: number,
  voteWeight: number = 0.70,
  listenWeight: number = 0.30
): number {
  // Logarithmic scaling for listens (reaches 1.0 at 1,000 unique listens)
  const targetScale = Math.log10(1001); // ~3.0
  const listenFactor = Math.min(1.0, Math.log10(1 + uniqueListens) / targetScale);

  const combined = (wilsonScore * voteWeight) + (listenFactor * listenWeight);
  return Math.round(combined * 1000) / 1000;
}

/**
 * Validates a listen session:
 * 1. Must play for at least 30 continuous/accumulated seconds.
 * 2. Deduplicated: Maximum 1 verified count per user/track per 24 hours.
 */
export function validate30sListen(
  listenedDurationSeconds: number,
  lastListenTimestamp?: number,
  nowTimestamp: number = Date.now()
): { isValid: boolean; reason: string } {
  if (listenedDurationSeconds < 30) {
    return {
      isValid: false,
      reason: `مدة الاستماع الفعلي (${Math.round(listenedDurationSeconds)} ثانية) لم تبلغ شرط الـ 30 ثانية.`
    };
  }

  if (lastListenTimestamp) {
    const elapsedMs = nowTimestamp - lastListenTimestamp;
    const dayInMs = 24 * 60 * 60 * 1000;
    if (elapsedMs < dayInMs) {
      const remainingHours = Math.ceil((dayInMs - elapsedMs) / (60 * 60 * 1000));
      return {
        isValid: false,
        reason: `تم احتساب استماعك لهذه الأغنية مسبقاً. يمكنك الاحتساب مجدداً بعد ${remainingHours} ساعة.`
      };
    }
  }

  return {
    isValid: true,
    reason: 'تم التحقق من الاستماع الفعلي (أكثر من 30 ثانية ولم يُسجل خلال آخر 24 ساعة).'
  };
}

export interface VoteLogEntry {
  timestamp: number;
  userId: string;
  accountAgeHours: number;
  voteType: 'up' | 'down';
}

/**
 * Anti-Sybil / Anti-Manipulation detection:
 * Detects synchronized rapid votes from very young accounts (< 2 hours old).
 */
export function detectSybilPattern(
  recentVotes: VoteLogEntry[],
  windowSeconds: number = 60,
  suspiciousAccountAgeHours: number = 2,
  thresholdCount: number = 3
): { isSuspicious: boolean; reason?: string; suspiciousVoteCount: number } {
  if (recentVotes.length < thresholdCount) {
    return { isSuspicious: false, suspiciousVoteCount: 0 };
  }

  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  // Filter votes in the immediate time window from fresh accounts
  const suspiciousVotes = recentVotes.filter(v => {
    const isWithinWindow = (now - v.timestamp) <= windowMs;
    const isNewAccount = v.accountAgeHours <= suspiciousAccountAgeHours;
    return isWithinWindow && isNewAccount;
  });

  if (suspiciousVotes.length >= thresholdCount) {
    return {
      isSuspicious: true,
      reason: `تم رصد نمط تصويت مشبوه: ${suspiciousVotes.length} حسابات جديدة متزامنة خلال ${windowSeconds} ثانية. تم تجميد احتساب الأصوات مؤقتاً للمراجعة.`,
      suspiciousVoteCount: suspiciousVotes.length
    };
  }

  return { isSuspicious: false, suspiciousVoteCount: suspiciousVotes.length };
}

/**
 * Auto-cleanup policy evaluation to conserve free 10GB R2 storage:
 * - Rule: Tracks older than 60 days with < 10 unique listens are flagged.
 * - Invariant: Active Contest Finalists and Hall of Fame Winners are NEVER deleted.
 * - Notice: 7-day warning period before actual deletion.
 * - Grace: "Keep My Track" button allows a one-time 30-day reprieve.
 */
export function evaluateAutoCleanupPolicy(
  track: Track,
  minDaysThreshold: number = 60,
  minUniqueListensThreshold: number = 10,
  warningNoticeDays: number = 7
): {
  shouldWarn: boolean;
  shouldDelete: boolean;
  daysRemainingBeforeDelete?: number;
  statusReason: string;
} {
  // Protected invariants
  if (track.isWinner) {
    return {
      shouldWarn: false,
      shouldDelete: false,
      statusReason: 'أغنية محمية بشكل دائم: فائزة في لوحة الشرف.'
    };
  }

  if (track.isFinalist) {
    return {
      shouldWarn: false,
      shouldDelete: false,
      statusReason: 'أغنية محمية حالياً: مشاركة في مسابقة الشهر الجارية.'
    };
  }

  if (track.status === 'hidden_reported') {
    return {
      shouldWarn: true,
      shouldDelete: false,
      statusReason: 'الأغنية محجوبة مؤقتاً لوجود بلاغات إشرافية تحت المراجعة.'
    };
  }

  // Active track evaluation
  const effectiveAge = track.keepTrackExtendedOnce
    ? Math.max(0, track.daysSinceCreation - 30) // 30 days bonus if extended once
    : track.daysSinceCreation;

  if (effectiveAge >= minDaysThreshold && track.uniqueListens < minUniqueListensThreshold) {
    // If it has already been in warning state for 7 or more days, delete
    if (track.cleanupWarningDate) {
      const warningDateMs = new Date(track.cleanupWarningDate).getTime();
      const daysInWarning = (Date.now() - warningDateMs) / (1000 * 60 * 60 * 24);

      if (daysInWarning >= warningNoticeDays) {
        return {
          shouldWarn: false,
          shouldDelete: true,
          daysRemainingBeforeDelete: 0,
          statusReason: `تجاوزت مهلة التحذير (${warningNoticeDays} أيام) دون تحقيق 10 استماعات. مؤهلة للحذف لتوفير التخزين.`
        };
      } else {
        const remaining = Math.max(1, Math.ceil(warningNoticeDays - daysInWarning));
        return {
          shouldWarn: true,
          shouldDelete: false,
          daysRemainingBeforeDelete: remaining,
          statusReason: `تحذير توفير مساحة: لم تحقق 10 استماعات بعد ${track.daysSinceCreation} يوماً. ستحذف بعد ${remaining} أيام إذا لم يتم التمديد.`
        };
      }
    }

    // First time crossing threshold: issue warning
    return {
      shouldWarn: true,
      shouldDelete: false,
      daysRemainingBeforeDelete: warningNoticeDays,
      statusReason: `تحذير توفير مساحة: تجاوزت 60 يوماً مع ${track.uniqueListens} استماعات فقط. أمامك ${warningNoticeDays} أيام قبل الحذف.`
    };
  }

  return {
    shouldWarn: false,
    shouldDelete: false,
    statusReason: 'الأغنية نشطة ومستوفية لشروط الاحتفاظ بالتخزين.'
  };
}
