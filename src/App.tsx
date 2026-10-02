import { useState, useEffect } from 'react';
import {
  CampusAnnouncement,
  FloorNumber,
  LiveActivityLog,
  RewardTier,
  StampCollectionRecord,
  StampSpot,
} from './types';
import { STAMP_SPOTS, REWARD_TIERS } from './data/campusData';
import { Header } from './components/Header';
import { FloorMap } from './components/FloorMap';
import { StampCard } from './components/StampCard';
import { StampModal } from './components/StampModal';
import { RewardsModal } from './components/RewardsModal';
import { TourSchedule } from './components/TourSchedule';
import { StaffModeModal } from './components/StaffModeModal';
import { ReceptionCheckInModal } from './components/ReceptionCheckInModal';
import { ReceptionSignageModal } from './components/ReceptionSignageModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Confetti } from './components/Confetti';
import { soundManager } from './utils/audio';
import { Award, Camera, CheckCircle2, Compass, Gift, MapPin, Megaphone, Printer, QrCode, Sparkles, Users, X } from 'lucide-react';

const STORAGE_KEY_STAMPS = 'sendai_ikuei_oc_stamps_v1';
const STORAGE_KEY_REWARDS = 'sendai_ikuei_oc_rewards_v1';
const STORAGE_KEY_VISITORS = 'sendai_ikuei_oc_visitors_count_v1';
const STORAGE_KEY_CHECKED_IN = 'sendai_ikuei_oc_checked_in_v1';
const STORAGE_KEY_VISITOR_NUM = 'sendai_ikuei_oc_visitor_num_v1';
const STORAGE_KEY_AUTH = 'sendai_ikuei_oc_admin_auth_v1';
const STORAGE_KEY_SPOTS = 'sendai_ikuei_oc_spots_v1';
const STORAGE_KEY_REWARD_TIERS = 'sendai_ikuei_oc_reward_tiers_v1';
const STORAGE_KEY_ANNOUNCEMENT = 'sendai_ikuei_oc_announcement_v1';
const STORAGE_KEY_INVENTORY = 'sendai_ikuei_oc_inventory_v1';

const INITIAL_LOGS: LiveActivityLog[] = [];

export default function App() {
  // Navigation & Admin mode state
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY_AUTH) === 'true';
    } catch {
      return false;
    }
  });
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);

  const [activeTab, setActiveTab] = useState<'map' | 'stamps' | 'rewards' | 'guide'>('map');
  const [currentFloor, setCurrentFloor] = useState<FloorNumber>(1);
  const [selectedSpot, setSelectedSpot] = useState<StampSpot | null>(null);
  const [isReceptionSignageOpen, setIsReceptionSignageOpen] = useState(false);

  // Dynamic spots managed by admin (default all 0 visitors and 'open' congestion)
  const [spots, setSpots] = useState<StampSpot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SPOTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return STAMP_SPOTS.map((s) => ({
      ...s,
      congestion: 'open',
      visitorCount: 0,
    }));
  });

  // Reward tiers & initial stock
  const [rewardTiers, setRewardTiers] = useState<RewardTier[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REWARD_TIERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return REWARD_TIERS.map((tier) => ({
      ...tier,
      initialStock: tier.id === 'reward-bronze' ? 200 : tier.id === 'reward-silver' ? 150 : 100,
    }));
  });

  // Redemption counts (default 0)
  const [redeemedCounts, setRedeemedCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_INVENTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      'reward-bronze': 0,
      'reward-silver': 0,
      'reward-gold': 0,
    };
  });

  // Campus announcement broadcast by admin (default inactive)
  const [announcement, setAnnouncement] = useState<CampusAnnouncement>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENT);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: 'ann-init',
      text: '',
      active: false,
      priority: 'normal',
      updatedAt: Date.now(),
    };
  });

  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);
  const [activityLogs, setActivityLogs] = useState<LiveActivityLog[]>(INITIAL_LOGS);

  // Visitor check-in and headcount state (default 0)
  const [totalVisitors, setTotalVisitors] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISITORS);
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CHECKED_IN) === 'true';
    } catch {
      return false;
    }
  });

  const [visitorNumber, setVisitorNumber] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISITOR_NUM);
      return saved ? Number(saved) : null;
    } catch {
      return null;
    }
  });

  // Automatically show Reception Check-In Modal if not yet checked in
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_CHECKED_IN) !== 'true';
    } catch {
      return true;
    }
  });

  // Participant stamps state
  const [collectedRecords, setCollectedRecords] = useState<Record<string, StampCollectionRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAMPS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [redeemedTiers, setRedeemedTiers] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REWARDS);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // UI state
  const [isRewardsOpen, setIsRewardsOpen] = useState(false);
  const [isStaffModeOpen, setIsStaffModeOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STAMPS, JSON.stringify(collectedRecords));
    } catch {
      // ignore
    }
  }, [collectedRecords]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REWARDS, JSON.stringify(Array.from(redeemedTiers)));
    } catch {
      // ignore
    }
  }, [redeemedTiers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VISITORS, String(totalVisitors));
    } catch {
      // ignore
    }
  }, [totalVisitors]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CHECKED_IN, String(isCheckedIn));
    } catch {
      // ignore
    }
  }, [isCheckedIn]);

  useEffect(() => {
    if (visitorNumber !== null) {
      try {
        localStorage.setItem(STORAGE_KEY_VISITOR_NUM, String(visitorNumber));
      } catch {
        // ignore
      }
    }
  }, [visitorNumber]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SPOTS, JSON.stringify(spots));
    } catch {
      // ignore
    }
  }, [spots]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REWARD_TIERS, JSON.stringify(rewardTiers));
    } catch {
      // ignore
    }
  }, [rewardTiers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ANNOUNCEMENT, JSON.stringify(announcement));
    } catch {
      // ignore
    }
  }, [announcement]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_INVENTORY, JSON.stringify(redeemedCounts));
    } catch {
      // ignore
    }
  }, [redeemedCounts]);

  const collectedSpotIds = new Set(Object.keys(collectedRecords));
  const collectedCount = collectedSpotIds.size;
  const totalCount = spots.length;

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Admin Request & Authentication handlers
  const handleRequestAdmin = () => {
    soundManager.playClickSound();
    if (isAdminAuthenticated) {
      setIsAdminMode(true);
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuthenticated(true);
    setShowAdminLoginModal(false);
    setIsAdminMode(true);
    try {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'true');
    } catch {
      // ignore
    }
    triggerToast('🔐 運営管理本部にログインしました');
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY_AUTH);
    } catch {
      // ignore
    }
    triggerToast('管理画面からログアウトしました');
  };

  const handleUpdateSpot = (updatedSpot: StampSpot) => {
    setSpots((prev) => prev.map((s) => (s.id === updatedSpot.id ? updatedSpot : s)));
    triggerToast(`「${updatedSpot.roomName}」の設定を更新しました`);
  };

  const handleDeleteSpot = (spotId: string) => {
    const target = spots.find((s) => s.id === spotId);
    setSpots((prev) => prev.filter((s) => s.id !== spotId));
    setCollectedRecords((prev) => {
      const copy = { ...prev };
      delete copy[spotId];
      return copy;
    });
    triggerToast(`🗑️ ブース「${target?.roomName || spotId}」を削除しました`);
  };

  const handleAddSpot = (newSpot: StampSpot) => {
    setSpots((prev) => [...prev, newSpot]);
    triggerToast(`✨ 新規ブース「${newSpot.roomName}」を追加しました`);
  };

  const handleIncrementAdminRedeemed = (tierId: string) => {
    setRedeemedCounts((prev) => ({
      ...prev,
      [tierId]: (prev[tierId] || 0) + 1,
    }));
  };

  const handleUpdateStock = (tierId: string, newStock: number) => {
    setRewardTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, initialStock: newStock } : t))
    );
  };

  const handleUpdateRewardTier = (updatedTier: RewardTier, updatedRedeemedCount: number) => {
    setRewardTiers((prev) => prev.map((t) => (t.id === updatedTier.id ? updatedTier : t)));
    setRedeemedCounts((prev) => ({
      ...prev,
      [updatedTier.id]: updatedRedeemedCount,
    }));
    triggerToast(`🎁 景品「${updatedTier.giftName}」の設定を更新しました`);
  };

  const handleDeleteRewardTier = (tierId: string) => {
    const target = rewardTiers.find((t) => t.id === tierId);
    setRewardTiers((prev) => prev.filter((t) => t.id !== tierId));
    setRedeemedCounts((prev) => {
      const copy = { ...prev };
      delete copy[tierId];
      return copy;
    });
    triggerToast(`🗑️ 景品「${target?.giftName || tierId}」を削除しました`);
  };

  const handleAddRewardTier = (newTier: RewardTier, initialRedeemedCount: number) => {
    setRewardTiers((prev) => [...prev, newTier]);
    setRedeemedCounts((prev) => ({
      ...prev,
      [newTier.id]: initialRedeemedCount,
    }));
    triggerToast(`✨ 新規景品「${newTier.giftName}」を追加しました`);
  };

  // When participant checks in at 1F reception
  const handleReceptionCheckInSuccess = () => {
    const newTotal = totalVisitors + 1;
    setTotalVisitors(newTotal);
    setVisitorNumber(newTotal);
    setIsCheckedIn(true);
    setShowCheckInModal(false);

    // Automatically award 1st stamp (1F エントランス・総合受付 獅)
    const entranceSpotId = 'spot-entrance';
    const newRecords = {
      ...collectedRecords,
      [entranceSpotId]: {
        spotId: entranceSpotId,
        collectedAt: Date.now(),
        method: 'qr' as const,
      },
    };
    setCollectedRecords(newRecords);

    // Add log
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        visitorId: `#${String(newTotal).padStart(4, '0')}`,
        spotName: 'エントランス・総合受付',
        floor: 1,
        method: 'qr',
      },
      ...prev.slice(0, 49),
    ]);

    soundManager.playFanfare();
    setShowConfetti(true);
    triggerToast(`🎉 来校受付完了！ あなたは本日の【第${newTotal}人目】の来校者です！ スタンプ1個目を獲得しました！`);
  };

  const handleCollectStamp = (spotId: string, method: 'quiz' | 'code' | 'qr' | 'manual') => {
    const record: StampCollectionRecord = {
      spotId,
      collectedAt: Date.now(),
      method,
    };

    const newRecords = { ...collectedRecords, [spotId]: record };
    setCollectedRecords(newRecords);

    const newCount = Object.keys(newRecords).length;
    setShowConfetti(true);

    const targetSpot = spots.find((s) => s.id === spotId);
    const spotName = targetSpot?.roomName || 'スタンプ';

    // Update spot visitor count
    if (targetSpot) {
      setSpots((prev) =>
        prev.map((s) => (s.id === spotId ? { ...s, visitorCount: (s.visitorCount || 0) + 1 } : s))
      );
    }

    // Add to activity logs
    setActivityLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: Date.now(),
        visitorId: visitorNumber ? `#${String(visitorNumber).padStart(4, '0')}` : '#GUEST',
        spotName,
        floor: targetSpot?.floor || 1,
        method,
        isMilestone: newCount === 3 || newCount === 6 || newCount === totalCount,
        milestoneText:
          newCount === totalCount
            ? '全スタンプ完全制覇！'
            : newCount === 6
            ? '6個達成（文房具セット獲得）'
            : newCount === 3
            ? '3個達成（ステッカー獲得）'
            : undefined,
      },
      ...prev.slice(0, 49),
    ]);

    if (newCount === totalCount) {
      soundManager.playFanfare();
      triggerToast(`🎉 おめでとうございます！全${totalCount}箇所のスタンプを完全制覇しました！`);
    } else if (newCount === 3 || newCount === 6) {
      soundManager.playSuccessSound();
      triggerToast(`✨ ${spotName}のスタンプを獲得！景品引き換えがアンロックされました！`);
    } else {
      triggerToast(`✨ ${spotName}のスタンプを獲得しました！（${newCount}/${totalCount}）`);
    }
  };

  const handleRedeemTier = (tierId: string) => {
    setRedeemedTiers((prev) => new Set([...prev, tierId]));
    handleIncrementAdminRedeemed(tierId);
    triggerToast('🎁 景品の引き換えが完了しました！');
  };

  const handleAutoFillAll = () => {
    const records: Record<string, StampCollectionRecord> = {};
    spots.forEach((spot) => {
      records[spot.id] = {
        spotId: spot.id,
        collectedAt: Date.now(),
        method: 'manual',
      };
    });
    setCollectedRecords(records);
    setShowConfetti(true);
    triggerToast('🎉 全スタンプを一括登録しました（デモモード）');
  };

  const handleResetAll = () => {
    setCollectedRecords({});
    setRedeemedTiers(new Set());
    setIsCheckedIn(false);
    setVisitorNumber(null);
    try {
      localStorage.removeItem(STORAGE_KEY_CHECKED_IN);
      localStorage.removeItem(STORAGE_KEY_VISITOR_NUM);
    } catch {
      // ignore
    }
    triggerToast('スタンプ履歴と受付状態をリセットしました');
  };

  const handleResetAllData = () => {
    soundManager.playSuccessSound();
    setTotalVisitors(0);
    setIsCheckedIn(false);
    setVisitorNumber(null);
    setCollectedRecords({});
    setRedeemedTiers(new Set());
    setSpots(
      STAMP_SPOTS.map((s) => ({
        ...s,
        congestion: 'open',
        visitorCount: 0,
      }))
    );
    setRedeemedCounts({
      'reward-bronze': 0,
      'reward-silver': 0,
      'reward-gold': 0,
    });
    setRewardTiers(
      REWARD_TIERS.map((tier) => ({
        ...tier,
        initialStock: tier.id === 'reward-bronze' ? 200 : tier.id === 'reward-silver' ? 150 : 100,
      }))
    );
    setAnnouncement({
      id: `ann-${Date.now()}`,
      text: '',
      active: false,
      priority: 'normal',
      updatedAt: Date.now(),
    });
    setActivityLogs([]);
    try {
      localStorage.removeItem(STORAGE_KEY_STAMPS);
      localStorage.removeItem(STORAGE_KEY_REWARDS);
      localStorage.removeItem(STORAGE_KEY_VISITORS);
      localStorage.removeItem(STORAGE_KEY_CHECKED_IN);
      localStorage.removeItem(STORAGE_KEY_VISITOR_NUM);
      localStorage.removeItem(STORAGE_KEY_SPOTS);
      localStorage.removeItem(STORAGE_KEY_REWARD_TIERS);
      localStorage.removeItem(STORAGE_KEY_ANNOUNCEMENT);
      localStorage.removeItem(STORAGE_KEY_INVENTORY);
    } catch {
      // ignore
    }
    triggerToast('✨ 管理画面の全データを初期化（0名・全クリア）しました');
  };

  // Run full data reset on first load of this release
  useEffect(() => {
    try {
      const initialized = localStorage.getItem('sendai_ikuei_oc_initialized_v5');
      if (!initialized) {
        handleResetAllData();
        localStorage.setItem('sendai_ikuei_oc_initialized_v5', 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // If Admin mode is active, render full Admin Dashboard!
  if (isAdminMode) {
    return (
      <AdminDashboard
        spots={spots}
        onUpdateSpot={handleUpdateSpot}
        onDeleteSpot={handleDeleteSpot}
        onAddSpot={handleAddSpot}
        rewardTiers={rewardTiers}
        redeemedCounts={redeemedCounts}
        onIncrementRedeemed={handleIncrementAdminRedeemed}
        onUpdateStock={handleUpdateStock}
        onUpdateRewardTier={handleUpdateRewardTier}
        onDeleteRewardTier={handleDeleteRewardTier}
        onAddRewardTier={handleAddRewardTier}
        announcement={announcement}
        onUpdateAnnouncement={(newAnn) => {
          setAnnouncement(newAnn);
          setDismissedAnnouncement(false);
          triggerToast('館内お知らせを更新しました');
        }}
        activityLogs={activityLogs}
        totalVisitors={totalVisitors}
        onUpdateTotalVisitors={(cnt) => {
          setTotalVisitors(cnt);
          triggerToast(`総来校者数を ${cnt}名 に更新しました`);
        }}
        onExitAdmin={() => setIsAdminMode(false)}
        onLogout={handleAdminLogout}
        onResetAllData={handleResetAllData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans pb-20 md:pb-10 selection:bg-amber-100 selection:text-amber-900">
      <Confetti active={showConfetti} onFinish={() => setShowConfetti(false)} />

      {/* Broadcast Announcement Banner if active */}
      {announcement.active && !dismissedAnnouncement && (
        <div
          className={`py-2 px-4 text-xs font-bold transition-all flex items-center justify-between gap-3 shadow-xs ${
            announcement.priority === 'urgent'
              ? 'bg-amber-400 text-slate-950 border-b border-amber-500'
              : 'bg-blue-950 text-white border-b border-blue-900'
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-hidden">
            <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
            <span className="truncate">{announcement.text}</span>
          </div>
          <button
            onClick={() => setDismissedAnnouncement(true)}
            className="text-current hover:opacity-75 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs sm:text-sm font-bold shadow-xl border border-white/20 backdrop-blur-md animate-fade-in flex items-center gap-2 max-w-[90vw]">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* Admin Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          onLoginSuccess={handleAdminLoginSuccess}
          onClose={() => setShowAdminLoginModal(false)}
        />
      )}

      {/* Reception Check-In Modal Gate */}
      <ReceptionCheckInModal
        isOpen={showCheckInModal}
        totalVisitors={totalVisitors}
        onCheckInSuccess={handleReceptionCheckInSuccess}
        onClose={() => setShowCheckInModal(false)}
        canDismiss={isCheckedIn}
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          soundManager.playClickSound();
          setActiveTab(tab);
        }}
        collectedCount={collectedCount}
        totalCount={totalCount}
        totalVisitors={totalVisitors}
        isCheckedIn={isCheckedIn}
        onOpenCheckIn={() => setShowCheckInModal(true)}
        onOpenStaffMode={() => {
          soundManager.playClickSound();
          setIsStaffModeOpen(true);
        }}
        onOpenAdmin={handleRequestAdmin}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6">
        {/* Reception Status Callout Banner */}
        {!isCheckedIn ? (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-2xl p-4 text-slate-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in border border-amber-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center text-lg font-black shrink-0">
                1F
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold tracking-tight">
                  まずは1F総合受付でチェックインしよう！
                </h3>
                <p className="text-xs text-slate-900/80">
                  受付ブースのQRコードをカメラで読み取ると参加登録され、来校者数にカウントされます。最初のスタンプもプレゼント！
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundManager.playClickSound();
                setShowCheckInModal(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-300 font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm shrink-0 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>受付QRをスキャンして参加</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-950">来校受付完了</span>
                <span className="text-xs text-emerald-800 ml-2">
                  あなたの来校番号: <strong className="font-mono text-emerald-950 text-sm">No. {visitorNumber}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <span className="text-xs text-slate-500 hidden sm:inline">
                現在 {totalVisitors}名 がオープンキャンパスに参加中
              </span>
              <button
                onClick={() => setShowCheckInModal(true)}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                受付証
              </button>
            </div>
          </div>
        )}

        {/* Hero Banner Area */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white min-h-[170px] sm:min-h-[220px] flex items-center">
          {/* Hero background image */}
          <div className="absolute inset-0">
            <img
              src="/src/assets/images/hero_open_campus_1790812838156.jpg"
              alt="仙台育英学園沖縄高等学校 オープンキャンパス"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-950/80 to-transparent" />
          </div>

          <div className="relative z-10 p-5 sm:p-8 max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                オープンキャンパス公式
              </span>
              <span className="text-[11px] sm:text-xs text-amber-200 font-medium">
                建学の精神「至誠」
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              仙台育英学園沖縄高等学校
              <br />
              <span className="text-amber-400">校内探究スタンプラリー</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xl">
              1Fから4Fまで校内マップを頼りに各施設をめぐろう！
              各ブースの体験やクイズに答えてスタンプを集めると、限定オリジナルグッズがもらえるよ！
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTab('map');
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>マップで施設を探す</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTab('stamps');
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold backdrop-blur-sm transition-colors border border-white/20 flex items-center gap-1.5"
              >
                <span className="text-amber-300 font-bold">★</span>
                <span>スタンプ帳（{collectedCount}/{totalCount}）</span>
              </button>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 ml-2">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                <span>現在 {totalVisitors}名 が来校中</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Floor Map */}
        {activeTab === 'map' && (
          <FloorMap
            currentFloor={currentFloor}
            setCurrentFloor={setCurrentFloor}
            collectedSpotIds={collectedSpotIds}
            spots={spots}
            onSelectStampSpot={(spot) => {
              setSelectedSpot(spot);
            }}
          />
        )}

        {/* Tab 2: Stamp Card */}
        {activeTab === 'stamps' && (
          <StampCard
            collectedRecords={collectedRecords}
            onSelectSpot={(spot) => setSelectedSpot(spot)}
            onOpenRewards={() => {
              soundManager.playClickSound();
              setIsRewardsOpen(true);
            }}
          />
        )}

        {/* Tab 3: Rewards & Certificate */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-blue-900" />
                <h2 className="text-lg font-bold text-slate-900">景品引き換え ＆ 参加認定証</h2>
              </div>
              <button
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTab('map');
                }}
                className="text-xs text-blue-900 font-bold hover:underline"
              >
                マップに戻る
              </button>
            </div>

            <RewardsModal
              collectedCount={collectedCount}
              redeemedTiers={redeemedTiers}
              onRedeemTier={handleRedeemTier}
              onClose={() => setActiveTab('map')}
              rewardTiers={rewardTiers}
              totalSpotsCount={spots.length}
            />
          </div>
        )}

        {/* Tab 4: Guide & Timetable */}
        {activeTab === 'guide' && (
          <TourSchedule
            onSelectFloor={(floor) => {
              setCurrentFloor(floor);
              setActiveTab('map');
            }}
            onSelectSpot={(spot) => {
              setCurrentFloor(spot.floor);
              setActiveTab('map');
              setSelectedSpot(spot);
            }}
          />
        )}
      </main>

      {/* Mobile Sticky Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => {
            soundManager.playClickSound();
            setActiveTab('map');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'map' ? 'text-blue-950 font-bold' : 'text-slate-500'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">校内マップ</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClickSound();
            setActiveTab('stamps');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl relative transition-all ${
            activeTab === 'stamps' ? 'text-blue-950 font-bold' : 'text-slate-500'
          }`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">スタンプ帳</span>
          {collectedCount > 0 && (
            <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-mono text-[9px] font-extrabold flex items-center justify-center shadow-xs">
              {collectedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundManager.playClickSound();
            setActiveTab('rewards');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'rewards' ? 'text-blue-950 font-bold' : 'text-slate-500'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">記念品・賞状</span>
        </button>

        <button
          onClick={() => {
            soundManager.playClickSound();
            setActiveTab('guide');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === 'guide' ? 'text-blue-950 font-bold' : 'text-slate-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">見学ガイド</span>
        </button>
      </nav>

      {/* Stamp Detail / Stamping Modal */}
      {selectedSpot && (
        <StampModal
          spot={selectedSpot}
          record={collectedRecords[selectedSpot.id]}
          onClose={() => setSelectedSpot(null)}
          onCollect={(spotId, method) => {
            handleCollectStamp(spotId, method);
          }}
        />
      )}

      {/* Rewards Modal Overlay */}
      {isRewardsOpen && (
        <RewardsModal
          collectedCount={collectedCount}
          redeemedTiers={redeemedTiers}
          onRedeemTier={handleRedeemTier}
          onClose={() => setIsRewardsOpen(false)}
          rewardTiers={rewardTiers}
          totalSpotsCount={spots.length}
        />
      )}

      {/* Staff Mode Modal */}
      {isStaffModeOpen && (
        <StaffModeModal
          onClose={() => setIsStaffModeOpen(false)}
          onAutoFillAll={handleAutoFillAll}
          onResetAll={handleResetAll}
          onOpenReceptionSignage={() => {
            setIsStaffModeOpen(false);
            setIsReceptionSignageOpen(true);
          }}
        />
      )}

      {/* Reception Booth Signage & QR Poster Modal (for staff) */}
      <ReceptionSignageModal
        isOpen={isReceptionSignageOpen}
        onClose={() => setIsReceptionSignageOpen(false)}
        totalVisitors={totalVisitors}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-700">
            学校法人仙台育英学園 仙台育英学園沖縄高等学校 オープンキャンパス実行委員会
          </p>
          <p className="text-[11px] text-slate-400">
            〒901-2224 沖縄県 · 本校舎 1F〜4F · 総合案内窓口: 1F エントランス受付
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowCheckInModal(true)}
              className="text-xs text-slate-600 hover:text-blue-900 font-semibold underline decoration-slate-300"
            >
              {isCheckedIn ? `受付チェックイン完了（No. ${visitorNumber}）` : '1F総合受付チェックイン画面を表示'}
            </button>
            <span className="text-slate-300">·</span>
            <button
              onClick={handleRequestAdmin}
              className="text-xs text-slate-600 hover:text-blue-900 font-semibold underline decoration-slate-300"
            >
              教職員・運営管理者専用ダッシュボード（要ログイン）
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
