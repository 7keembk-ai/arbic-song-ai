import React, { useState, useRef, useEffect } from 'react';
import {
  Flame,
  Trophy,
  Swords,
  ShieldCheck,
  Gauge,
  Sparkles,
  Plus,
  Mic2,
  CheckCircle2,
  Bell,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown
} from 'lucide-react';
import { UserAccount, Battle, Track } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserAccount;
  onOpenUpload: () => void;
  storageWarningCount: number;
  pendingBattles: Battle[];
  warningTracks: Track[];
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenUpload,
  storageWarningCount,
  pendingBattles,
  warningTracks,
  theme,
  onToggleTheme,
  onSignOut,
}) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const totalNotifications = pendingBattles.length + warningTracks.length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'home', label: 'الرئيسية', icon: Flame },
    { id: 'artist-dashboard', label: 'لوحة الفنان', icon: Mic2 },
    { id: 'battles', label: 'المواجهات (الدسّات)', icon: Swords },
    { id: 'contest', label: 'المسابقة الشهرية', icon: Trophy },
    { id: 'hall-of-fame', label: 'لوحة الشرف', icon: Sparkles },
    { id: 'moderation', label: 'الضوابط والإشراف', icon: ShieldCheck },
    { id: 'quota', label: 'مراقبة الحصص', icon: Gauge },
    { id: 'tests', label: 'الاختبارات الآلية', icon: CheckCircle2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element Brand mark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-right group text-inherit focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
              <Flame className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-zinc-100 font-sans">
              ميدان راب <span className="text-amber-400">AI</span>
            </span>
          </button>
        </div>

        {/* Zone 2: Clean text navigation links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-zinc-800 text-amber-400 border border-zinc-700/60 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.id === 'quota' && storageWarningCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
                {item.id === 'artist-dashboard' && totalNotifications > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions, Notifications Bell & User Quota indicator */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-2 rounded-lg border transition-all ${
                isNotificationsOpen
                  ? 'bg-zinc-800 border-amber-400/40 text-amber-400'
                  : totalNotifications > 0
                  ? 'bg-zinc-900/80 border-amber-500/30 text-zinc-200 hover:border-amber-400/50 hover:bg-zinc-800'
                  : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
              }`}
              title="التنبيهات وطلبات المواجهة"
              aria-label="التنبيهات"
            >
              <Bell className="w-4 h-4" />
              {totalNotifications > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-400 text-zinc-950 font-black text-[10px] rounded-full flex items-center justify-center font-mono shadow-md animate-in zoom-in-50">
                  {totalNotifications}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {isNotificationsOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-80 sm:w-88 bg-zinc-950/95 border border-zinc-800 rounded-2xl shadow-2xl p-4 text-right backdrop-blur-xl z-50 animate-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-100">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>التنبيهات وطلبات الرد ({totalNotifications})</span>
                  </div>
                  {totalNotifications > 0 && (
                    <span className="text-[10px] text-amber-400 font-mono">
                      تتطلب استجابة
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-0.5">
                  {/* Pending Battle Requests */}
                  {pendingBattles.map((battle) => (
                    <div
                      key={battle.id}
                      onClick={() => {
                        setActiveTab('artist-dashboard');
                        setIsNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 hover:border-amber-400/50 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <Swords className="w-3.5 h-3.5 text-amber-400" />
                          <span>طلب مواجهة وارد</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-amber-400" />
                          <span>مهلة 7 أيام</span>
                        </span>
                      </div>
                      <p className="text-xs text-zinc-200 truncate">
                        الرابر <strong>{battle.challengerArtist}</strong> يتحداك: "{battle.title}"
                      </p>
                      <div className="text-[10px] text-amber-400 font-semibold flex items-center gap-1 pt-0.5">
                        <span>انقر لقبول التحدي واختيار تراك الرد</span>
                        <ArrowLeft className="w-3 h-3" />
                      </div>
                    </div>
                  ))}

                  {/* Cleanup Warning Alerts */}
                  {warningTracks.map((track) => (
                    <div
                      key={track.id}
                      onClick={() => {
                        setActiveTab('artist-dashboard');
                        setIsNotificationsOpen(false);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-900 border border-amber-500/30 hover:border-amber-400/50 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-zinc-200 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>تحذير توفير مساحة</span>
                        </span>
                        <span className="text-[10px] text-amber-400 font-mono">
                          أقل من 10 استماعات
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 truncate">
                        التراك: "{track.title}" مهدد بالحذف لتوفير مساحة R2.
                      </p>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 pt-0.5">
                        <span>انقر لتمديد المهلة (+30 يوماً)</span>
                        <ArrowLeft className="w-3 h-3" />
                      </div>
                    </div>
                  ))}

                  {totalNotifications === 0 && (
                    <div className="py-6 text-center text-xs text-zinc-400 space-y-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                      <p className="font-semibold text-zinc-200">لا توجد تنبيهات معلقة</p>
                      <p className="text-[11px] text-zinc-500">تم الرد على جميع التحديات ومساحتك مستقرة.</p>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setActiveTab('artist-dashboard');
                      setIsNotificationsOpen(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>فتح لوحة تحكم الفنان الكاملة</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button (Dark / High-Contrast Light) */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-amber-400 hover:border-zinc-700 transition-colors"
            title={theme === 'dark' ? 'التبديل إلى الوضع الفاتح عالي التباين (High-Contrast)' : 'التبديل إلى الوضع الداكن (Dark Studio)'}
            aria-label={theme === 'dark' ? 'التبديل إلى الوضع الفاتح عالي التباين' : 'التبديل إلى الوضع الداكن'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-zinc-600" />
            )}
          </button>

          {/* User Profile Section with Avatar, Active Tracks, and Sign Out Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className={`flex items-center gap-2 p-1 pl-2.5 rounded-lg border transition-all ${
                isProfileMenuOpen || activeTab === 'artist-dashboard'
                  ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                  : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/80'
              }`}
              title="الملف الشخصي والحصة النشطة"
              aria-label="قائمة الملف الشخصي"
            >
              {/* Small Avatar */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-zinc-950 font-black text-xs flex items-center justify-center shadow-sm shrink-0 border border-amber-300/40">
                {currentUser.artistName.charAt(0) || 'ش'}
              </div>

              {/* Active Tracks Count */}
              <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
                <Mic2 className="w-3 h-3 text-amber-400 hidden sm:inline" />
                <span className="font-bold text-zinc-100">
                  {currentUser.activeTracksCount}/{currentUser.maxTracksLimit}
                </span>
                <span className="hidden xl:inline text-[11px] text-zinc-400 font-sans">
                  نشطة
                </span>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-right shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3.5">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md border border-amber-300/40">
                    {currentUser.artistName.charAt(0) || 'ش'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-zinc-100 truncate">
                        {currentUser.artistName}
                      </h4>
                      {currentUser.isVerifiedArtist && (
                        <span title="فنان موثق">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{currentUser.email}</p>
                  </div>
                </div>

                {/* Active Tracks & Quota Progress */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Mic2 className="w-3.5 h-3.5 text-amber-400" />
                      <span>الأغاني النشطة</span>
                    </span>
                    <span className="font-mono font-bold text-amber-400 tabular-nums">
                      {currentUser.activeTracksCount} / {currentUser.maxTracksLimit}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                      style={{
                        width: `${Math.min(100, (currentUser.activeTracksCount / currentUser.maxTracksLimit) * 100)}%`
                      }}
                    />
                  </div>

                  <p className="text-[10px] text-zinc-500 pt-0.5">
                    مسموح بـ 5 أغانٍ نشطة مجاناً لحماية حصة Cloudflare R2
                  </p>
                </div>

                {/* Fast Navigation Items */}
                <div className="space-y-1 pt-1">
                  <button
                    onClick={() => {
                      setActiveTab('artist-dashboard');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors text-right"
                  >
                    <span>لوحة تحكم الفنان وإدارة المساحة</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                </div>

                {/* Sign Out Mock Action */}
                <div className="pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      if (onSignOut) {
                        onSignOut();
                      }
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <span>تسجيل الخروج (محاكاة)</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <button
            onClick={onOpenUpload}
            className="px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>ارفع أغنية</span>
          </button>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 bg-zinc-900/60 border-t border-zinc-800/40 gap-1.5 no-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap shrink-0 flex items-center gap-1 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span>{item.label}</span>
              {item.id === 'artist-dashboard' && totalNotifications > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};


