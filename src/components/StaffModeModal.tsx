import React, { useState } from 'react';
import { STAMP_SPOTS } from '../data/campusData';
import { Check, Copy, Printer, QrCode, RefreshCw, Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StaffModeModalProps {
  onClose: () => void;
  onAutoFillAll: () => void;
  onResetAll: () => void;
  onOpenReceptionSignage?: () => void;
}

export const StaffModeModal: React.FC<StaffModeModalProps> = ({
  onClose,
  onAutoFillAll,
  onResetAll,
  onOpenReceptionSignage,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    soundManager.playClickSound();
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <QrCode className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[11px] font-mono text-slate-400">STAFF & TEACHER CONSOLE</div>
              <h3 className="text-base font-bold text-white">
                運営・教職員用 各ブース掲示コード一覧
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Reception Booth QR Poster Banner */}
          {onOpenReceptionSignage && (
            <div className="p-4 bg-gradient-to-r from-blue-950 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                  ★ 1F 総合受付カウンター用
                </span>
                <h4 className="text-sm font-bold text-white">
                  受付ブース用「アプリQRコード＆卓上POP」
                </h4>
                <p className="text-xs text-slate-300">
                  来校者がスマホでアプリを開くための特大QRコード・A4印刷用ポスターを表示します。
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onOpenReceptionSignage();
                }}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm shrink-0"
              >
                <QrCode className="w-4 h-4" />
                <span>受付QR・POPを開く</span>
              </button>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-3">
            <div>
              <strong>ブース掲示用コードの活用方法:</strong> 各教室の卓上POPや入口に下記3桁コードを掲示するか、来校者に伝えてください。
            </div>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg flex items-center gap-1 shrink-0 hover:bg-slate-800"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>印刷</span>
            </button>
          </div>

          {/* Table of Booth Codes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STAMP_SPOTS.map((spot) => (
              <div
                key={spot.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-blue-950 text-white text-[10px] font-bold">
                      {spot.floor}F
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {spot.roomName}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {spot.subtitle}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-center bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                    <div className="text-[9px] text-slate-400 font-bold">CODE</div>
                    <div className="text-sm font-mono font-extrabold text-blue-950 tracking-wider">
                      {spot.code}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(spot.code)}
                    title="コードをコピー"
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                  >
                    {copiedCode === spot.code ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Demo & Test Controls */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-700 block">動作テスト・体験用ツール</span>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  soundManager.playSuccessSound();
                  onAutoFillAll();
                  onClose();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>全スタンプを一括獲得（動作確認用）</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  onResetAll();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>スタンプ履歴をリセット</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
