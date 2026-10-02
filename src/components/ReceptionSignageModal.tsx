import React, { useState } from 'react';
import { QRCodeCanvas } from './QRCodeCanvas';
import { Check, Copy, Maximize2, Minimize2, Printer, QrCode, Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ReceptionSignageModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl?: string;
  totalVisitors?: number;
}

export const ReceptionSignageModal: React.FC<ReceptionSignageModalProps> = ({
  isOpen,
  onClose,
  appUrl,
  totalVisitors,
}) => {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    appUrl ||
    (typeof window !== 'undefined'
      ? window.location.href
      : 'https://ais-pre-dyp2q4qyjrs4a2fmeqmrit-375538876465.asia-northeast1.run.app');

  const handleCopyUrl = () => {
    soundManager.playClickSound();
    navigator.clipboard?.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    soundManager.playClickSound();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className={`bg-white w-full rounded-3xl shadow-2xl overflow-hidden border-2 border-slate-300 flex flex-col transition-all ${
          isFullscreen ? 'max-w-4xl min-h-[90vh]' : 'max-w-2xl max-h-[92vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <QrCode className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                RECEPTION BOOTH SIGNAGE
              </span>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                1F 総合受付ブース掲示用 POP・QRポスター
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyUrl}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'コピー完了' : 'URLコピー'}</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors hidden sm:flex"
              title={isFullscreen ? '通常表示' : '全画面表示'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4印刷</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable POP Signage Content */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1 flex flex-col items-center justify-between text-center select-none bg-gradient-to-b from-white via-amber-50/20 to-white">
          <div className="w-full max-w-lg space-y-6">
            {/* Header Badge & School Name */}
            <div className="space-y-1.5 border-b-2 border-slate-200 pb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 text-amber-300 text-xs font-extrabold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>仙台育英学園沖縄高等学校</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                オープンキャンパス 総合受付
              </h1>
              <p className="text-xs sm:text-sm font-bold text-amber-700">
                公式 校内探究デジタルスタンプラリー
              </p>
            </div>

            {/* Instruction Callout */}
            <div className="bg-amber-500 text-slate-950 rounded-2xl py-3 px-4 shadow-sm font-extrabold text-sm sm:text-base flex items-center justify-center gap-2">
              <span>📱</span>
              <span>スマホのカメラで下記QRコードをスキャン！</span>
            </div>

            {/* Big, Crisp, Real Camera-Scannable QR Code */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="p-4 bg-white rounded-3xl border-4 border-blue-950 shadow-xl relative inline-block">
                <QRCodeCanvas
                  value={currentUrl}
                  size={240}
                  darkColor="#0b2265"
                  lightColor="#ffffff"
                />
                {/* Center Lion Badge in the QR */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-xl shadow-md border-2 border-blue-950 flex items-center justify-center font-bold text-amber-500 text-xl font-serif">
                  獅
                </div>
              </div>

              <div className="text-xs font-mono font-bold text-slate-600 truncate max-w-xs px-2 py-1 bg-slate-100 rounded-lg border border-slate-200">
                {currentUrl}
              </div>
            </div>

            {/* Step by step guide for attendees */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <span>参加方法（かんたん3ステップ）</span>
              </div>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <span>スマホの標準カメラで上のQRコードを読み取ります（アプリのインストール不要）。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <span>画面が開くと自動で来校受付が完了し、最初のスタンプを獲得できます！</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-950 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <span>1F〜4Fの各施設を巡ってスタンプを集め、総合受付で限定グッズを受け取ろう！</span>
                </div>
              </div>
            </div>

            {/* Backup manual code & staff assistance */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 pt-4">
              <div>
                カメラが起動しない場合の受付番号: <strong className="font-mono text-sm text-blue-950 font-black">101</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                困ったときは受付スタッフにお声がけください
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
