import React, { useState } from 'react';
import {
  CampusAnnouncement,
  CongestionStatus,
  FloorNumber,
  LiveActivityLog,
  RewardTier,
  StampSpot,
} from '../types';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Edit2,
  FileSpreadsheet,
  Gift,
  HelpCircle,
  LogOut,
  MapPin,
  Megaphone,
  Printer,
  QrCode,
  Radio,
  RefreshCw,
  Search,
  Sliders,
  TrendingUp,
  Trash2,
  Plus,
  Users,
} from 'lucide-react';
import { QRCodeCanvas } from './QRCodeCanvas';
import { SpotEditModal } from './SpotEditModal';
import { RewardEditModal } from './RewardEditModal';
import { soundManager } from '../utils/audio';

interface AdminDashboardProps {
  spots: StampSpot[];
  onUpdateSpot: (updatedSpot: StampSpot) => void;
  onDeleteSpot: (spotId: string) => void;
  onAddSpot: (newSpot: StampSpot) => void;
  rewardTiers: RewardTier[];
  redeemedCounts: Record<string, number>;
  onIncrementRedeemed: (tierId: string) => void;
  onUpdateStock: (tierId: string, newStock: number) => void;
  onUpdateRewardTier: (tier: RewardTier, updatedRedeemedCount: number) => void;
  onDeleteRewardTier: (tierId: string) => void;
  onAddRewardTier: (newTier: RewardTier, initialRedeemedCount: number) => void;
  announcement: CampusAnnouncement;
  onUpdateAnnouncement: (announcement: CampusAnnouncement) => void;
  activityLogs: LiveActivityLog[];
  totalVisitors: number;
  onUpdateTotalVisitors: (count: number) => void;
  onExitAdmin: () => void;
  onLogout: () => void;
  onResetAllData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  spots,
  onUpdateSpot,
  onDeleteSpot,
  onAddSpot,
  rewardTiers,
  redeemedCounts,
  onIncrementRedeemed,
  onUpdateStock,
  onUpdateRewardTier,
  onDeleteRewardTier,
  onAddRewardTier,
  announcement,
  onUpdateAnnouncement,
  activityLogs,
  totalVisitors,
  onUpdateTotalVisitors,
  onExitAdmin,
  onLogout,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'booths' | 'prizes' | 'signage' | 'logs' | 'announcement'
  >('overview');

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingSpot, setEditingSpot] = useState<StampSpot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingSpotId, setDeletingSpotId] = useState<string | null>(null);

  const [editingRewardTier, setEditingRewardTier] = useState<RewardTier | null>(null);
  const [isRewardEditModalOpen, setIsRewardEditModalOpen] = useState(false);
  const [deletingRewardTierId, setDeletingRewardTierId] = useState<string | null>(null);

  const [announcementText, setAnnouncementText] = useState(announcement.text);
  const [announcementActive, setAnnouncementActive] = useState(announcement.active);
  const [announcementPriority, setAnnouncementPriority] = useState(announcement.priority);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logFloorFilter, setLogFloorFilter] = useState<string>('all');

  // Stats calculation
  const totalStampsCollected = spots.reduce((acc, s) => acc + (s.visitorCount || 0), 0);
  const crowdedSpotsCount = spots.filter((s) => s.congestion === 'full').length;
  const currentAppUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleToggleCongestion = (spotId: string, current: CongestionStatus = 'open') => {
    soundManager.playClickSound();
    const nextStatus: Record<CongestionStatus, CongestionStatus> = {
      open: 'moderate',
      moderate: 'full',
      full: 'open',
    };
    const spot = spots.find((s) => s.id === spotId);
    if (spot) {
      onUpdateSpot({
        ...spot,
        congestion: nextStatus[current],
      });
    }
  };

  const handleSaveAnnouncement = () => {
    soundManager.playSuccessSound();
    onUpdateAnnouncement({
      id: `ann-${Date.now()}`,
      text: announcementText,
      active: announcementActive,
      priority: announcementPriority,
      updatedAt: Date.now(),
    });
  };

  const handleExportCSV = () => {
    soundManager.playClickSound();
    const rows = [
      ['タイムスタンプ', '日時', '来場者番号', 'スポット名', '階層', '押印方法', 'マイルストーン'],
      ...activityLogs.map((log) => [
        log.timestamp,
        new Date(log.timestamp).toLocaleString('ja-JP'),
        log.visitorId,
        log.spotName,
        `${log.floor}F`,
        log.method === 'quiz'
          ? 'クイズ正解'
          : log.method === 'code'
          ? 'コード入力'
          : log.method === 'qr'
          ? 'QRスキャン'
          : '手動登録',
        log.milestoneText || '-',
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `仙台育英沖縄_OCスタンプ集計_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesSearch =
      log.visitorId.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.spotName.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesFloor = logFloorFilter === 'all' || String(log.floor) === logFloorFilter;
    return matchesSearch && matchesFloor;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdmin}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>参加者画面へ戻る</span>
            </button>

            <div className="h-4 w-px bg-slate-700 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                仙台育英学園沖縄高校 · 運営管理本部
              </h1>
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold border border-blue-400/30">
                LIVE CONSOLE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                soundManager.playClickSound();
                setShowResetConfirm(true);
              }}
              title="本日の運営データをすべて初期化（来校者0名・全クリア）"
              className="px-3 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center gap-1.5 border border-red-700/60 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-400" />
              <span>全データ初期化</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV出力</span>
            </button>
            <button
              onClick={() => {
                soundManager.playSuccessSound();
                setActiveTab('signage');
              }}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>POP一括印刷</span>
            </button>
            <button
              onClick={() => {
                soundManager.playClickSound();
                onLogout();
              }}
              title="管理画面からログアウト"
              className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 text-xs font-bold flex items-center gap-1.5 border border-red-800/60 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ログアウト</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Nav Tabs */}
      <div className="bg-slate-950 border-b border-slate-800 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-2 text-xs font-medium no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>リアルタイム集計</span>
          </button>

          <button
            onClick={() => setActiveTab('booths')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'booths'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>ブース混雑・スタンプ管理</span>
            {crowdedSpotsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500 text-white text-[10px] font-bold">
                {crowdedSpotsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('prizes')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'prizes'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>景品・在庫引き換え</span>
          </button>

          <button
            onClick={() => setActiveTab('announcement')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'announcement'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>館内緊急アナウンス</span>
            {announcement.active && (
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('signage')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'signage'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>POP・QRコード出力</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'logs'
                ? 'bg-blue-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>リアルタイム打刻ログ</span>
          </button>
        </div>
      </div>

      {/* Main Admin Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">総来校者数（受付済）</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-white tabular-nums">
                    {totalVisitors}
                  </span>
                  <span className="text-xs text-slate-400">名</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      onUpdateTotalVisitors(totalVisitors + 1);
                    }}
                    className="px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-slate-200"
                  >
                    +1名 手動追加
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">総スタンプ押印数</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-amber-400 tabular-nums">
                    {totalStampsCollected}
                  </span>
                  <span className="text-xs text-slate-400">回 達成</span>
                </div>
                <p className="text-[11px] text-slate-400">全ブース合計のスタンプ獲得数</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">景品引き換え総数</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-emerald-400 tabular-nums">
                    {Object.values(redeemedCounts).reduce((a, b) => a + b, 0)}
                  </span>
                  <span className="text-xs text-slate-400">個 配布済</span>
                </div>
                <p className="text-[11px] text-slate-400">全3段階のマイルストーン景品</p>
              </div>

              <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-5 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">混雑中のブース</span>
                  <div className="w-8 h-8 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black font-mono text-red-400 tabular-nums">
                    {crowdedSpotsCount}
                  </span>
                  <span className="text-xs text-slate-400">箇所（満員・規制中）</span>
                </div>
                <p className="text-[11px] text-slate-400">参加者のマップにリアルタイム反映</p>
              </div>
            </div>

            {/* Quick Congestion Overview */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>各フロア・ブースのリアルタイム状況（クリックで混雑度切替）</span>
                </h3>
                <span className="text-xs text-slate-400">
                  クリック:「スムーズ」→「やや混雑」→「満員」
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {spots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleToggleCongestion(spot.id, spot.congestion)}
                    className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-700 hover:border-slate-500 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.2 bg-blue-500/30 text-blue-300 font-mono text-[10px] font-bold rounded">
                          {spot.floor}F
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {spot.roomName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {spot.subtitle}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          spot.congestion === 'full'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : spot.congestion === 'moderate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {spot.congestion === 'full'
                          ? '満員'
                          : spot.congestion === 'moderate'
                          ? 'やや混雑'
                          : 'スムーズ'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Booths Management */}
        {activeTab === 'booths' && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>ブース混雑・スタンプ詳細管理（全 {spots.length} 箇所）</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  各ブースの教室名・合言葉コード・クイズ内容・混雑状況を自由に編集・追加・削除できます。
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setEditingSpot(null);
                  setIsEditModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>新規ブースを追加</span>
              </button>
            </div>

            <div className="space-y-3">
              {spots.length === 0 ? (
                <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-slate-800 text-slate-400 text-xs space-y-2">
                  <p>現在登録されているブースがありません。</p>
                  <button
                    onClick={() => {
                      soundManager.playClickSound();
                      setEditingSpot(null);
                      setIsEditModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>最初のブースを追加する</span>
                  </button>
                </div>
              ) : (
                spots.map((spot) => (
                  <div
                    key={spot.id}
                    className="p-4 bg-slate-900 rounded-2xl border border-slate-700 hover:border-slate-600 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold text-xs">
                          {spot.floor}F
                        </span>
                        <h4 className="text-sm font-bold text-white">{spot.roomName}</h4>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                          コード: {spot.code}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold text-[10px]">
                          印章:「{spot.symbol}」
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{spot.description}</p>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 pt-0.5">
                        <span className="text-amber-300/90 font-medium">
                          ❓ クイズ: {spot.quiz?.question}
                        </span>
                        {spot.eventTitle && (
                          <span className="text-slate-300">
                            🎪 {spot.eventTitle} ({spot.timeSlot})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      <div className="text-xs text-slate-400 font-mono bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800">
                        訪問数: <strong className="text-white text-sm">{spot.visitorCount || 0}</strong>
                      </div>

                      {/* Congestion toggle */}
                      <button
                        onClick={() => handleToggleCongestion(spot.id, spot.congestion)}
                        title="混雑度を切り替える"
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          spot.congestion === 'full'
                            ? 'bg-red-500 hover:bg-red-400 text-white'
                            : spot.congestion === 'moderate'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {spot.congestion === 'full'
                          ? '🔴 満員'
                          : spot.congestion === 'moderate'
                          ? '🟡 やや混雑'
                          : '🟢 スムーズ'}
                      </button>

                      {/* Edit button */}
                      <button
                        onClick={() => {
                          soundManager.playClickSound();
                          setEditingSpot(spot);
                          setIsEditModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                        title="ブース情報を編集"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>編集</span>
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => {
                          soundManager.playClickSound();
                          setDeletingSpotId(spot.id);
                        }}
                        className="p-1.5 rounded-xl bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white border border-red-800/40 transition-colors"
                        title="ブースを削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Prize Inventory */}
        {activeTab === 'prizes' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <span>記念品・景品在庫管理（全 {rewardTiers.length} 種類）</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  各達成マイルストーンの景品名・必要スタンプ数・総在庫数・配布済数を自由に編集・追加・削除できます。
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setEditingRewardTier(null);
                  setIsRewardEditModalOpen(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>新規景品を追加</span>
              </button>
            </div>

            {rewardTiers.length === 0 ? (
              <div className="p-8 text-center bg-slate-800/60 rounded-3xl border border-slate-700 text-slate-400 text-xs space-y-2">
                <p>現在登録されている景品がありません。</p>
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    setEditingRewardTier(null);
                    setIsRewardEditModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>最初の景品を追加する</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {rewardTiers.map((tier) => {
                  const redeemed = redeemedCounts[tier.id] || 0;
                  const stock = tier.initialStock || 100;
                  const remaining = Math.max(0, stock - redeemed);

                  return (
                    <div
                      key={tier.id}
                      className="bg-slate-800/80 border border-slate-700 hover:border-slate-600 rounded-3xl p-6 space-y-4 flex flex-col justify-between transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold text-slate-950 shadow-xs"
                            style={{ backgroundColor: tier.badgeColor || '#f59e0b' }}
                          >
                            スタンプ {tier.requiredStamps}個 達成
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                soundManager.playClickSound();
                                setEditingRewardTier(tier);
                                setIsRewardEditModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="景品設定を編集"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                            <button
                              onClick={() => {
                                soundManager.playClickSound();
                                setDeletingRewardTierId(tier.id);
                              }}
                              className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 text-red-300 hover:text-white transition-colors"
                              title="景品を削除"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[11px] font-bold text-slate-400 block">
                            {tier.tierName || '記念品'}
                          </span>
                          <h4 className="text-base font-bold text-white leading-tight">
                            {tier.giftName}
                          </h4>
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">{tier.description}</p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-700/80">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">配布済:</span>
                          <span className="font-bold text-white font-mono">{redeemed} 個</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">残り在庫:</span>
                          <span
                            className={`font-bold font-mono ${
                              remaining < 20 ? 'text-red-400' : 'text-emerald-400'
                            }`}
                          >
                            {remaining} 個（総数 {stock}個）
                          </span>
                        </div>

                        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              backgroundColor: tier.badgeColor || '#f59e0b',
                              width: `${Math.min(100, stock > 0 ? (redeemed / stock) * 100 : 0)}%`,
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => {
                              soundManager.playSuccessSound();
                              onIncrementRedeemed(tier.id);
                            }}
                            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                          >
                            <Gift className="w-3.5 h-3.5" />
                            <span>1個引き換え (+1)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Announcement Broadcast */}
        {activeTab === 'announcement' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-5 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">館内緊急お知らせ・アナウンス放送</h3>
            </div>
            <p className="text-xs text-slate-300">
              全来校者の画面上部バナーに即座に表示されるお知らせメッセージを配信できます。
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">放送メッセージ本文</label>
                <textarea
                  rows={3}
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 rounded-xl border border-slate-700 text-white text-xs focus:border-amber-400 focus:outline-none"
                  placeholder="例: 【ご案内】13:00より体育実習室にて演舞が行われます。"
                />
              </div>

              <div className="flex items-center gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={announcementActive}
                    onChange={(e) => setAnnouncementActive(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-700"
                  />
                  <span>バナーを有効にする</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400">重要度:</span>
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('normal')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      announcementPriority === 'normal'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    通常（青）
                  </button>
                  <button
                    type="button"
                    onClick={() => setAnnouncementPriority('urgent')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                      announcementPriority === 'urgent'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    緊急・告知（黄）
                  </button>
                </div>
              </div>

              <button
                onClick={handleSaveAnnouncement}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Radio className="w-4 h-4" />
                <span>お知らせを全館配信・保存</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Signage & POP */}
        {activeTab === 'signage' && (
          <div className="space-y-6">
            <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    <span>各ブース・総合受付用 卓上POP一括印刷シート</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    各教室の卓上スタンドや壁面に設置するためのA4印刷シートです。
                  </p>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>このページを印刷</span>
                </button>
              </div>

              {/* 1F Reception POP Preview */}
              <div className="p-6 bg-white rounded-3xl text-slate-900 border-2 border-slate-300 max-w-lg mx-auto text-center space-y-3 shadow-lg">
                <span className="px-3 py-1 rounded-full bg-blue-950 text-amber-300 text-[10px] font-black uppercase tracking-wider">
                  仙台育英学園沖縄高等学校
                </span>
                <h4 className="text-xl font-black text-slate-950">1F 総合受付カウンター</h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
                  <QRCodeCanvas value={currentAppUrl} size={160} darkColor="#0b2265" />
                </div>
                <div className="text-xs font-mono font-bold text-blue-950">
                  受付番号: <strong>101</strong>
                </div>
                <p className="text-xs text-slate-600">
                  お手元のスマートフォンカメラでスキャンしてスタンプラリーに参加！
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Activity Logs */}
        {activeTab === 'logs' && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>リアルタイム打刻ログ一覧（{filteredLogs.length} 件）</span>
              </h3>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearchQuery}
                    onChange={(e) => setLogSearchQuery(e.target.value)}
                    placeholder="来校者ID・教室名で検索"
                    className="pl-8 pr-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <select
                  value={logFloorFilter}
                  onChange={(e) => setLogFloorFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-900 rounded-xl border border-slate-700 text-xs text-white focus:outline-none"
                >
                  <option value="all">全フロア</option>
                  <option value="1">1F</option>
                  <option value="2">2F</option>
                  <option value="3">3F</option>
                  <option value="4">4F</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-2.5 px-3">時刻</th>
                    <th className="py-2.5 px-3">来校者ID</th>
                    <th className="py-2.5 px-3">ブース名</th>
                    <th className="py-2.5 px-3">階</th>
                    <th className="py-2.5 px-3">押印方法</th>
                    <th className="py-2.5 px-3">特記事項</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(log.timestamp).toLocaleTimeString('ja-JP')}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">{log.visitorId}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-200">{log.spotName}</td>
                      <td className="py-2.5 px-3 text-blue-400 font-bold">{log.floor}F</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                          {log.method === 'quiz'
                            ? 'クイズ正解'
                            : log.method === 'code'
                            ? 'コード入力'
                            : log.method === 'qr'
                            ? 'QRスキャン'
                            : '手動'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-amber-300 font-semibold">
                        {log.milestoneText || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Reset All Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="bg-slate-900 border-2 border-red-500/50 w-full max-w-md rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                  SYSTEM DATA RESET
                </span>
                <h3 className="text-base font-bold text-white">管理画面の全データを初期化しますか？</h3>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
              <p className="font-semibold text-slate-200">以下のデータがすべて初期状態（リセット）されます：</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>総来校者数: <strong className="text-white">0名</strong></li>
                <li>各ブースの訪問数・スタンプ獲得数: <strong className="text-white">すべて0回</strong></li>
                <li>各教室の混雑状況: <strong className="text-white">すべて「スムーズ」</strong></li>
                <li>景品引き換え数: <strong className="text-white">すべて0個</strong>（在庫数リセット）</li>
                <li>リアルタイム打刻ログ: <strong className="text-white">全消去</strong></li>
                <li>緊急アナウンス放送: <strong className="text-white">非表示</strong></li>
                <li>参加者端末のスタンプ・受付データ: <strong className="text-white">全消去</strong></li>
              </ul>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playSuccessSound();
                  setShowResetConfirm(false);
                  onResetAllData();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>完全に初期化する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Spot Edit / Create Modal */}
      <SpotEditModal
        isOpen={isEditModalOpen}
        spot={editingSpot}
        onSave={(savedSpot) => {
          if (editingSpot) {
            onUpdateSpot(savedSpot);
          } else {
            onAddSpot(savedSpot);
          }
          setIsEditModalOpen(false);
          setEditingSpot(null);
        }}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingSpot(null);
        }}
      />

      {/* Delete Spot Confirmation Modal */}
      {deletingSpotId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="bg-slate-900 border-2 border-red-500/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                  DELETE BOOTH
                </span>
                <h3 className="text-base font-bold text-white">このブースを削除しますか？</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              ブース「<strong>{spots.find((s) => s.id === deletingSpotId)?.roomName}</strong>」をスタンプラリーおよび校内マップから削除します。
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingSpotId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playSuccessSound();
                  onDeleteSpot(deletingSpotId);
                  setDeletingSpotId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>削除する</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Edit / Create Modal */}
      <RewardEditModal
        isOpen={isRewardEditModalOpen}
        tier={editingRewardTier}
        currentRedeemed={editingRewardTier ? (redeemedCounts[editingRewardTier.id] || 0) : 0}
        onSave={(savedTier, updatedRedeemedCount) => {
          if (editingRewardTier) {
            onUpdateRewardTier(savedTier, updatedRedeemedCount);
          } else {
            onAddRewardTier(savedTier, updatedRedeemedCount);
          }
          setIsRewardEditModalOpen(false);
          setEditingRewardTier(null);
        }}
        onClose={() => {
          setIsRewardEditModalOpen(false);
          setEditingRewardTier(null);
        }}
      />

      {/* Delete Reward Tier Confirmation Modal */}
      {deletingRewardTierId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div
            className="bg-slate-900 border-2 border-red-500/50 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                  DELETE REWARD TIER
                </span>
                <h3 className="text-base font-bold text-white">この記念品を削除しますか？</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              記念品「<strong>{rewardTiers.find((t) => t.id === deletingRewardTierId)?.giftName}</strong>」を景品一覧から削除します。
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRewardTierId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => {
                  soundManager.playSuccessSound();
                  onDeleteRewardTier(deletingRewardTierId);
                  setDeletingRewardTierId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>削除する</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
