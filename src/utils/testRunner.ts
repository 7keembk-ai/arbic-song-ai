import {
  calculateWilsonScore,
  calculateCombinedRankScore,
  validate30sListen,
  detectSybilPattern,
  evaluateAutoCleanupPolicy,
  VoteLogEntry,
} from './algorithms';
import { Track } from '../types';

export interface TestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  message: string;
  details?: string;
}

export function runAllUnitTests(): TestResult[] {
  const results: TestResult[] = [];

  // Test 1: Wilson Score avoids "1 vote = 100%" flaw
  try {
    const singleVoteScore = calculateWilsonScore(1, 0); // 1 upvote, 0 downvotes
    const establishedTrackScore = calculateWilsonScore(92, 8); // 92 upvotes, 8 downvotes (92% positive)
    
    // In naive percentage, 1/1 (100%) > 92/100 (92%).
    // But in Wilson Score Lower Bound, 92/100 must be significantly higher!
    const passed = establishedTrackScore > singleVoteScore;
    results.push({
      id: 'wilson-confidence-superiority',
      name: 'تفوق خوارزمية Wilson Score على النسبة الساذجة (منع تلاعب الصوت الواحد 100%)',
      category: 'خوارزمية الترتيب',
      passed,
      message: passed
        ? `نجح الاختبار: الأغنية ذات 92 إعجاب/8 عدم إعجاب أحرزت (${establishedTrackScore}) متفوقة بعدالة على أغنية ذات صوت وحيد 1/1 أحرزت (${singleVoteScore}).`
        : `فشل: النتيجة الساذجة لم تصحح (Single: ${singleVoteScore}, Established: ${establishedTrackScore})`,
      details: `z=1.96 (95% ثقة إحصائية). Single Score = ${singleVoteScore}, Established Score = ${establishedTrackScore}`
    });
  } catch (err: unknown) {
    results.push({
      id: 'wilson-confidence-superiority',
      name: 'تفوق خوارزمية Wilson Score',
      category: 'خوارزمية الترتيب',
      passed: false,
      message: `خطأ أثناء التنفيذ: ${(err as Error).message}`
    });
  }

  // Test 2: Listen validation 30-second gating & 24h deduplication
  try {
    const under30s = validate30sListen(22);
    const validFirstListen = validate30sListen(34);
    const now = Date.now();
    const duplicateSameDay = validate30sListen(45, now - (3 * 3600 * 1000), now); // 3 hours ago
    const validNextDay = validate30sListen(40, now - (26 * 3600 * 1000), now); // 26 hours ago

    const passed = !under30s.isValid && validFirstListen.isValid && !duplicateSameDay.isValid && validNextDay.isValid;
    results.push({
      id: 'listen-validation-30s-24h',
      name: 'قاعدة احتساب الاستماع (30 ثانية استماع فعلي وتكرار واحد يومياً)',
      category: 'احتساب الاستماع',
      passed,
      message: passed
        ? 'نجح الاختبار: رُفض استماع 22 ثانية، قُبل استماع 34 ثانية، حُظر التكرار خلال 3 ساعات، وقُبل الاستماع بعد مرور 26 ساعة.'
        : 'فشل: لم يتم تطبيق شروط الوقت أو تكرار الـ 24 ساعة بدقة.',
      details: `22s: ${under30s.isValid}, 34s: ${validFirstListen.isValid}, 3h dup: ${duplicateSameDay.isValid}, 26h: ${validNextDay.isValid}`
    });
  } catch (err: unknown) {
    results.push({
      id: 'listen-validation-30s-24h',
      name: 'قاعدة احتساب الاستماع',
      category: 'احتساب الاستماع',
      passed: false,
      message: `خطأ: ${(err as Error).message}`
    });
  }

  // Test 3: Anti-Sybil rapid vote burst detection
  try {
    const now = Date.now();
    const honestVotes: VoteLogEntry[] = [
      { timestamp: now - 50000, userId: 'u1', accountAgeHours: 48, voteType: 'up' },
      { timestamp: now - 30000, userId: 'u2', accountAgeHours: 120, voteType: 'up' },
    ];
    const honestResult = detectSybilPattern(honestVotes);

    const sybilAttackBurst: VoteLogEntry[] = [
      { timestamp: now - 15000, userId: 'bot1', accountAgeHours: 0.2, voteType: 'up' },
      { timestamp: now - 12000, userId: 'bot2', accountAgeHours: 0.1, voteType: 'up' },
      { timestamp: now - 8000, userId: 'bot3', accountAgeHours: 0.3, voteType: 'up' },
      { timestamp: now - 3000, userId: 'bot4', accountAgeHours: 0.2, voteType: 'up' },
    ];
    const attackResult = detectSybilPattern(sybilAttackBurst);

    const passed = !honestResult.isSuspicious && attackResult.isSuspicious;
    results.push({
      id: 'anti-sybil-burst-detection',
      name: 'مكافحة التلاعب وتجميد الأصوات المشبوهة (Sybil Attack Detection)',
      category: 'الأمان والنزاهة',
      passed,
      message: passed
        ? 'نجح الاختبار: لم تُحظر الحسابات الطبيعية، بينما تم كشف وتجميد هجوم متزامن من 4 حسابات جديدة أُنشئت خلال دقائق.'
        : 'فشل: لم يستشعر الفاحص التزامن المشبوه للحسابات المستحدثة.',
      details: `Honest suspicious: ${honestResult.isSuspicious}, Attack suspicious: ${attackResult.isSuspicious}`
    });
  } catch (err: unknown) {
    results.push({
      id: 'anti-sybil-burst-detection',
      name: 'مكافحة التلاعب',
      category: 'الأمان والنزاهة',
      passed: false,
      message: `خطأ: ${(err as Error).message}`
    });
  }

  // Test 4: Auto-Cleanup lifecycle & Protected Invariants (Hall of fame + Active finalists)
  try {
    const mockBaseTrack: Track = {
      id: 't-test',
      title: 'أغنية الاختبار',
      artist: 'رابر تجريبي',
      artistId: 'art-1',
      category: 'rap',
      audioUrl: '',
      coverUrl: '',
      duration: 180,
      createdAt: '2026-07-01',
      listens: 8,
      uniqueListens: 6, // Below 10 listens
      upvotes: 4,
      downvotes: 1,
      wilsonScore: 0.45,
      combinedRankScore: 0.48,
      status: 'active',
      isFinalist: false,
      isWinner: false,
      keepTrackExtendedOnce: false,
      daysSinceCreation: 68, // Older than 60 days
      sizeBytes: 2500000,
      waveformPeaks: [],
      legalDeclaration: {
        platform: 'Suno',
        planType: 'Pro',
        commercialRightsConfirmed: true,
        noRealPersonSlanderConfirmed: true,
        noVoiceCloneConfirmed: true,
        timestamp: new Date().toISOString(),
        declaredBy: 'art-1'
      }
    };

    // Case A: Regular track older than 60 days with < 10 listens should get warned
    const regularResult = evaluateAutoCleanupPolicy(mockBaseTrack);

    // Case B: Hall of fame winner should NEVER be deleted
    const winnerTrack: Track = { ...mockBaseTrack, isWinner: true, daysSinceCreation: 180, uniqueListens: 2 };
    const winnerResult = evaluateAutoCleanupPolicy(winnerTrack);

    // Case C: Active monthly finalist should NEVER be deleted
    const finalistTrack: Track = { ...mockBaseTrack, isFinalist: true, daysSinceCreation: 75, uniqueListens: 4 };
    const finalistResult = evaluateAutoCleanupPolicy(finalistTrack);

    // Case D: User presses "Keep My Track" (extension grants 30 days reprieve)
    const extendedTrack: Track = { ...mockBaseTrack, keepTrackExtendedOnce: true, daysSinceCreation: 68 };
    const extendedResult = evaluateAutoCleanupPolicy(extendedTrack);

    const passed = regularResult.shouldWarn && !winnerResult.shouldWarn && !winnerResult.shouldDelete && !finalistResult.shouldWarn && !extendedResult.shouldWarn;

    results.push({
      id: 'auto-cleanup-invariants',
      name: 'سياسة الحذف لتوفير مساحة 10GB مع حماية الفائزين ونهائيي المسابقة',
      category: 'إدارة التخزين والحذف',
      passed,
      message: passed
        ? 'نجح الاختبار: حماية مطلقة للفائزين ونهائيي المسابقة، تحذير الأغاني الخاملة بعد 60 يوماً، وتمديد الأمان 30 يوماً بنقرة "أبقِ أغنيتي".'
        : 'فشل: إحدى قواعد الحذف أو الحماية لم تُحترم كما ينبغي.',
      details: `Regular warn: ${regularResult.shouldWarn}, Winner warn: ${winnerResult.shouldWarn}, Finalist warn: ${finalistResult.shouldWarn}, Extended warn: ${extendedResult.shouldWarn}`
    });
  } catch (err: unknown) {
    results.push({
      id: 'auto-cleanup-invariants',
      name: 'سياسة الحذف لتوفير التخزين',
      category: 'إدارة التخزين والحذف',
      passed: false,
      message: `خطأ: ${(err as Error).message}`
    });
  }

  // Test 5: Combined Ranking Score Weighting
  try {
    // Track A: Wilson score 0.80, 20 unique listens
    const scoreA = calculateCombinedRankScore(0.80, 20);
    // Track B: Wilson score 0.80, 800 unique listens
    const scoreB = calculateCombinedRankScore(0.80, 800);

    const passed = scoreB > scoreA;
    results.push({
      id: 'combined-rank-weighting',
      name: 'معادلة الترتيب المدمج (70% تصويت ويلسون + 30% استماعات فريدة لوغاريتمية)',
      category: 'خوارزمية الترتيب',
      passed,
      message: passed
        ? `نجح الاختبار: مع تساوي نسبة الرضا (0.80)، الأغنية ذات 800 استماع فريد أحرزت (${scoreB}) متفوقة على 20 استماع (${scoreA}).`
        : 'فشل: لم ينعكس وزن الاستماع في النتيجة النهائية.',
      details: `Track A (20 listens): ${scoreA}, Track B (800 listens): ${scoreB}`
    });
  } catch (err: unknown) {
    results.push({
      id: 'combined-rank-weighting',
      name: 'معادلة الترتيب المدمج',
      category: 'خوارزمية الترتيب',
      passed: false,
      message: `خطأ: ${(err as Error).message}`
    });
  }

  return results;
}
