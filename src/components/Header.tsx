import React from 'react';
import { Award, Compass, MapPin, Printer, QrCode, Users } from 'lucide-react';

interface HeaderProps {
  activeTab: 'map' | 'stamps' | 'rewards' | 'guide';
  setActiveTab: (tab: 'map' | 'stamps' | 'rewards' | 'guide') => void;
  collectedCount: number;
  totalCount: number;
  totalVisitors: number;
  isCheckedIn: boolean;
  onOpenCheckIn: () => void;
  onOpenStaffMode: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  collectedCount,
  totalCount,
  totalVisitors,
  isCheckedIn,
  onOpenCheckIn,
  onOpenStaffMode,
  onOpenAdmin,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Zone 1: Wordmark & Brand Title */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-amber-400 font-extrabold flex items-center justify-center shrink-0 shadow-sm text-sm">
            育
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('map');
            }}
            className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate hover:text-blue-900 transition-colors"
          >
            仙台育英学園沖縄高校
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'map'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">校内マップ</span>
          </button>

          <button
            onClick={() => setActiveTab('stamps')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'stamps'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="text-amber-500 font-bold">★</span>
            <span className="whitespace-nowrap">スタンプ帳</span>
            <span className="text-[11px] font-mono tabular-nums px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-semibold group-hover:bg-slate-200">
              {collectedCount}/{totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">記念品・賞状</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`hidden md:flex px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-blue-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">見学ガイド</span>
          </button>
        </nav>

        {/* Zone 3: Live Visitor Counter & Reception POP */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Visitor Headcount badge */}
          <button
            onClick={onOpenCheckIn}
            title={isCheckedIn ? '受付完了済（タップで受付詳細確認）' : '受付QRを読み取ってチェックイン'}
            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border shadow-2xs ${
              isCheckedIn
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : 'bg-amber-400 text-slate-950 border-amber-500 hover:bg-amber-300 animate-pulse'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">来校者数:</span>
            <span className="font-mono tabular-nums">{totalVisitors}名</span>
            {!isCheckedIn && <span className="text-[10px] ml-0.5">（未受付）</span>}
          </button>

          <button
            onClick={onOpenStaffMode}
            title="各ブース合言葉コード"
            className="px-2 sm:px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden lg:inline">コード一覧</span>
          </button>

          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              title="運営管理本部ダッシュボード（要ログイン）"
              className="px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span>管理画面</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
