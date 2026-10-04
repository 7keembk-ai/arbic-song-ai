import React, { useState } from 'react';
import { Upload, Shield, Music2, AlertCircle, CheckCircle2, Cpu, Zap, X } from 'lucide-react';
import { Category, Track, LegalDeclaration, UserAccount } from '../types';
import { calculateWilsonScore, calculateCombinedRankScore } from '../utils/algorithms';
import { generateWaveformPeaks, simulateClientAudioCompression } from '../utils/audioEngine';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (newTrack: Track) => void;
  currentUser: UserAccount;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [artistName, setArtistName] = useState(currentUser.artistName || '');
  const [category, setCategory] = useState<Category>('rap');
  const [audioStyle, setAudioStyle] = useState<'trap' | 'boombap' | 'drill' | 'lofi'>('trap');
  const [lyricsExcerpt, setLyricsExcerpt] = useState('');
  const [platform, setPlatform] = useState<'Suno' | 'Udio' | 'Other'>('Suno');
  const [customPlatformName, setCustomPlatformName] = useState<string>('');
  const [planType, setPlanType] = useState<'Pro' | 'Premier' | 'Enterprise' | 'Commercial'>('Pro');
  const [licenseRef, setLicenseRef] = useState('');
  
  // Mandatory legal checkboxes
  const [confirmCommercialLicense, setConfirmCommercialLicense] = useState(false);
  const [confirmNoSlander, setConfirmNoSlander] = useState(false);
  const [confirmTerms, setConfirmTerms] = useState(false);

  // File upload simulation
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [originalFileSizeBytes, setOriginalFileSizeBytes] = useState<number>(24_500_000); // 24.5 MB sample
  const [durationSeconds, setDurationSeconds] = useState<number>(184); // ~3:04
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<ReturnType<typeof simulateClientAudioCompression> | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isQuotaReached = currentUser.activeTracksCount >= currentUser.maxTracksLimit;

  const handleSimulateFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setErrorMessage('حجم الملف الأصلي يتجاوز 25MB. يرجى اختيار ملف صوتي مناسب.');
        return;
      }
      setSelectedFileName(file.name);
      setOriginalFileSizeBytes(file.size);
      setErrorMessage(null);

      // Trigger client-side compression calculation to 96kbps Opus
      setIsCompressing(true);
      setTimeout(() => {
        const result = simulateClientAudioCompression(file.size, durationSeconds, 96);
        setCompressionResult(result);
        setIsCompressing(false);
      }, 500);
    }
  };

  const handleApplyPresetSample = () => {
    setSelectedFileName('arabic_rap_master_suno_export.mp3');
    setOriginalFileSizeBytes(18_400_000); // 18.4 MB
    setDurationSeconds(190);
    setErrorMessage(null);
    setIsCompressing(true);
    setTimeout(() => {
      const result = simulateClientAudioCompression(18_400_000, 190, 96);
      setCompressionResult(result);
      setIsCompressing(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isQuotaReached) {
      setErrorMessage(`لقد بلغت الحد الأقصى للمسار المجاني (${currentUser.maxTracksLimit} أغاني نشطة). يرجى حذف أغنية خاملة أولاً.`);
      return;
    }

    if (platform === 'Other' && !customPlatformName.trim()) {
      setErrorMessage('يرجى تحديد اسم المنصة المولدة عند اختيار "أخرى".');
      return;
    }

    if (!confirmCommercialLicense || !confirmNoSlander || !confirmTerms) {
      setErrorMessage('يجب الموافقة الإلزامية على جميع بنود الإقرار القانوني وحقوق الاستخدام التجاري للذكاء الاصطناعي.');
      return;
    }

    if (!title.trim() || !artistName.trim()) {
      setErrorMessage('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    const compressedSize = compressionResult ? compressionResult.compressedSizeBytes : 2300000;
    const finalPlatformName = platform === 'Other'
      ? (customPlatformName.trim() || 'منصة أخرى')
      : platform;

    const legalDec: LegalDeclaration = {
      platform: finalPlatformName,
      planType,
      commercialRightsConfirmed: true,
      noRealPersonSlanderConfirmed: true,
      noVoiceCloneConfirmed: true,
      timestamp: new Date().toISOString(),
      declaredBy: currentUser.id,
      licenseRef: licenseRef.trim() || `${platform.toUpperCase()}-${planType.toUpperCase()}-VERIFIED-${Math.floor(1000 + Math.random() * 9000)}`,
      customPlatformName: platform === 'Other' ? customPlatformName.trim() : undefined,
    };

    const newTrack: Track = {
      id: `trk_${Date.now()}`,
      title: title.trim(),
      artist: artistName.trim(),
      artistId: currentUser.id,
      category,
      audioUrl: '',
      coverUrl: category === 'diss'
        ? '/src/assets/images/diss_battle_cover_1791043427437.jpg'
        : '/src/assets/images/arabic_trap_cover_1791043426892.jpg',
      duration: durationSeconds,
      createdAt: new Date().toISOString().split('T')[0],
      listens: 1,
      uniqueListens: 1,
      upvotes: 1,
      downvotes: 0,
      wilsonScore: calculateWilsonScore(1, 0),
      combinedRankScore: calculateCombinedRankScore(calculateWilsonScore(1, 0), 1),
      status: 'active',
      isFinalist: true,
      isWinner: false,
      keepTrackExtendedOnce: false,
      daysSinceCreation: 0,
      sizeBytes: compressedSize,
      waveformPeaks: generateWaveformPeaks(64, title),
      lyricsExcerpt: lyricsExcerpt.trim(),
      audioStyle,
      legalDeclaration: legalDec
    };

    onUploadSuccess(newTrack);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-2xl w-full p-6 text-right shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-400" />
              <span>رفع تراك جديد وضغطه في المتصفح (Client-side Opus)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              يتم ضغط الصوت محلياً في جهازك قبل الإرسال إلى Cloudflare R2 مباشرة دون المرور بالـ Worker لتوفير الحصة.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quota limit notice */}
        <div className="mb-4 p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between text-xs">
          <span className="text-zinc-300">
            حصتك من الأغاني النشطة: <strong className="text-amber-400 font-mono">{currentUser.activeTracksCount} من أصل {currentUser.maxTracksLimit}</strong>
          </span>
          {isQuotaReached && (
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              وصلت للحد الأقصى (5 أغانٍ)
            </span>
          )}
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Picker / Compressor block */}
          <div className="p-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 hover:border-amber-400/50 transition-colors">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-amber-400">
                <Music2 className="w-5 h-5" />
              </div>
              <div className="text-xs text-zinc-300 font-medium">
                {selectedFileName ? (
                  <span className="text-emerald-400 font-bold">{selectedFileName}</span>
                ) : (
                  'اختر ملف صوتي (WAV, MP3, M4A) أو استخدم عينة الاختبار'
                )}
              </div>
              <p className="text-[11px] text-zinc-500">
                الحد الأقصى للمدة: 5 دقائق · يتم الضغط تلقائياً إلى 96kbps Opus (~2.5MB للأغنية)
              </p>

              <div className="flex items-center justify-center gap-2 pt-1">
                <label className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors">
                  <span>تصفح ملفات جهازك</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleSimulateFileSelect}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleApplyPresetSample}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30 text-xs font-semibold transition-colors"
                >
                  استخدم نموذج ملف للتجربة
                </button>
              </div>
            </div>

            {/* Compression Real-time Result */}
            {isCompressing && (
              <div className="mt-3 p-2 bg-zinc-900 rounded-lg text-center text-xs text-amber-400 flex items-center justify-center gap-2">
                <Zap className="w-4 h-4 animate-spin" />
                <span>جاري معالجة الصوت وضغطه في المتصفح عبر Web Audio API...</span>
              </div>
            )}

            {compressionResult && !isCompressing && (
              <div className="mt-3 p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300 font-semibold border-b border-zinc-800 pb-1.5">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الضغط محلياً بنجاح (بجودة 96kbps Opus الاستوديو)
                  </span>
                  <span className="font-mono text-amber-400">
                    وفرت {compressionResult.reductionPercentage}% من الحجم
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center font-mono tabular-nums text-[11px] pt-1">
                  <div>
                    <span className="text-zinc-500 block">الحجم الأصلي:</span>
                    <span className="text-zinc-300">{(compressionResult.originalSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">الحجم المضغوط:</span>
                    <span className="text-emerald-400 font-bold">{(compressionResult.compressedSizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">استيعاب مساحة 10GB:</span>
                    <span className="text-amber-400 font-bold">~{compressionResult.estimatedTracksIn10Gb} تراك!</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Track Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                اسم الأغنية / التراك *
              </label>
              <input
                type="text"
                required
                placeholder="مثال: سهرة تراب في المعادي"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                اسمك الفني (الرابر) *
              </label>
              <input
                type="text"
                required
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                الفئة المخصصة *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                <option value="rap">أغاني الراب (Rap Track)</option>
                <option value="diss">دسّات ومواجهات (Diss Battle)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                النمط الإيقاعي (Audio Style)
              </label>
              <select
                value={audioStyle}
                onChange={(e) => setAudioStyle(e.target.value as 'trap' | 'boombap' | 'drill' | 'lofi')}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
              >
                <option value="trap">تراب 808 سريع (Trap)</option>
                <option value="boombap">بوم باب كلاسيكي (Boom-Bap)</option>
                <option value="drill">دريل حديث (Drill)</option>
                <option value="lofi">لو فاي هادئ (Lo-Fi)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              مقتطف من الكلمات (Lyrics Excerpt)
            </label>
            <textarea
              rows={2}
              placeholder="اكتب بعض أسطر الفلو والقافية..."
              value={lyricsExcerpt}
              onChange={(e) => setLyricsExcerpt(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Mandatory Legal Declaration Section (Section 7) */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>الإقرار القانوني الإجباري لحقوق منصات الذكاء الاصطناعي والنزاهة</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">المنصة المولدة:</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as 'Suno' | 'Udio' | 'Other')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:border-amber-400"
                >
                  <option value="Suno">Suno AI</option>
                  <option value="Udio">Udio AI</option>
                  <option value="Other">أخرى (منصة ذكاء اصطناعي أخرى)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">نوع اشتراكك وقت التحميل:</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as 'Pro' | 'Premier' | 'Enterprise' | 'Commercial')}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:border-amber-400"
                >
                  <option value="Pro">Pro (خطة مدفوعة)</option>
                  <option value="Premier">Premier (خطة احترافية)</option>
                  <option value="Enterprise">Enterprise (مؤسسية)</option>
                  <option value="Commercial">Commercial (ترخيص تجاري)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">معرف الترخيص (اختياري):</label>
                <input
                  type="text"
                  placeholder="رقم أو رابط التوليد"
                  value={licenseRef}
                  onChange={(e) => setLicenseRef(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-200 focus:border-amber-400"
                />
              </div>
            </div>

            {/* Custom Platform Name Input when 'Other' is selected */}
            {platform === 'Other' && (
              <div className="p-2.5 rounded-lg bg-zinc-900/90 border border-amber-500/40 space-y-1 animate-in fade-in duration-150">
                <label className="block text-[11px] font-semibold text-amber-300">
                  حدد اسم المنصة / النموذج المستخدم * (مثال: Stable Audio, ElevenLabs, MusicFX, AIVA, ACE Studio)
                </label>
                <input
                  type="text"
                  required
                  placeholder="اكتب اسم منصة الذكاء الاصطناعي هنا..."
                  value={customPlatformName}
                  onChange={(e) => setCustomPlatformName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-400 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500"
                />
              </div>
            )}

            {/* Checkbox 1 */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-1 text-xs text-zinc-300">
              <input
                type="checkbox"
                required
                checked={confirmCommercialLicense}
                onChange={(e) => setConfirmCommercialLicense(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
              />
              <span className="leading-relaxed">
                أقر وأؤكد بأن هذه الأغنية ولّدت وحُمّلت من حساب ذي اشتراك مدفوع ({platform === 'Other' && customPlatformName.trim() ? customPlatformName.trim() : platform} {planType}) سارٍ وقت التحميل، وأنني أملك حق النشر والاستخدام التجاري طبقاً لبنود المنصة وحقوق الملكية الفكرية.
              </span>
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                required
                checked={confirmNoSlander}
                onChange={(e) => setConfirmNoSlander(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
              />
              <span className="leading-relaxed">
                أقر بأن الأغنية لا تهاجم ولا تشوه سمعة أي شخصيات حقيقية عامة أو خاصة أو عائلاتهم، ولا تتضمن خطاب كراهية، ولا استنساخاً لصوت أي فنان بشري دون إذن صريح.
              </span>
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-zinc-300">
              <input
                type="checkbox"
                required
                checked={confirmTerms}
                onChange={(e) => setConfirmTerms(e.target.checked)}
                className="mt-0.5 rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
              />
              <span className="leading-relaxed">
                أوافق على حفظ سجل هذا الإقرار بختم زمني مشفر ({new Date().toLocaleTimeString('ar-EG')}) وأعلم أن المنصة غير ربحية وتخضع للمراجعة والحذف الفوري في حال أي انتهاك.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-zinc-500">
              * هذا الإجراء لا يعد استشارة قانونية وإنما التزام بالضوابط التنظيمية للمنصة.
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isQuotaReached || !confirmCommercialLicense || !confirmNoSlander || !confirmTerms}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-bold text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95"
              >
                تأكيد الرفع والضغط ونشر التراك
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
