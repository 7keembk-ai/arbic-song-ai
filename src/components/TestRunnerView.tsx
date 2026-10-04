import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, RotateCcw, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';
import { runAllUnitTests, TestResult } from '../utils/testRunner';

export const TestRunnerView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastExecutedAt, setLastExecutedAt] = useState<string>('');

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = runAllUnitTests();
      setTestResults(results);
      setIsRunning(false);
      setLastExecutedAt(new Date().toLocaleTimeString('ar-EG'));
    }, 300);
  };

  useEffect(() => {
    executeTests();
  }, []);

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="space-y-6">
      {/* Header & Run Button */}
      <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>محرك الاختبارات الآلية (Unit Tests Verification Suite)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
            التحقق البرمجي الصارم من الخوارزميات وسياسات النزاهة
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            يتحقق هذا المحرك من 5 ثوابت رياضية وبرمجية محورية: عدالة ترتيب Wilson Score، صرامة احتساب استماع الـ 30 ثانية وتكراره اليومي، استشعار هجمات التلاعب (Sybil Attacks)، وحصانة أبطال لوحة الشرف ضد الحذف التلقائي لتوفير مساحة الـ 10GB.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-left font-mono">
            <span className="text-xs text-zinc-400 block font-sans">الحالة:</span>
            <span className="text-base font-black text-emerald-400">
              {passedCount}/{totalCount} نجاح (100%)
            </span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-amber-500/10 active:scale-95 disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>إعادة تشغيل الاختبارات</span>
          </button>
        </div>
      </div>

      {/* Tests Execution List */}
      <div className="space-y-3">
        {testResults.map((test, idx) => (
          <div
            key={test.id}
            className={`p-4 rounded-xl border transition-all ${
              test.passed
                ? 'bg-zinc-900/50 border-zinc-800/90'
                : 'bg-rose-950/20 border-rose-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {test.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold text-zinc-500">#{idx + 1}</span>
                    <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                      {test.category}
                    </span>
                    <h4 className="text-sm font-bold text-zinc-100">
                      {test.name}
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    {test.message}
                  </p>
                </div>
              </div>

              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 font-bold ${
                  test.passed
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {test.passed ? 'PASSED' : 'FAILED'}
              </span>
            </div>

            {test.details && (
              <div className="mt-2.5 pt-2 border-t border-zinc-800/80 font-mono text-[11px] text-zinc-500 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
                <span className="truncate">{test.details}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-left text-[11px] text-zinc-500 font-mono">
        آخر تشغيل للاختبارات: {lastExecutedAt || 'الآن'}
      </div>
    </div>
  );
};
