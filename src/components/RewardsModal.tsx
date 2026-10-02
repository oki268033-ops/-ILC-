import React, { useState } from 'react';
import { REWARD_TIERS, STAMP_SPOTS } from '../data/campusData';
import { RewardTier } from '../types';
import { Award, CheckCircle2, Crown, Download, Gift, Lock, Sparkles, User, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RewardsModalProps {
  collectedCount: number;
  redeemedTiers: Set<string>;
  onRedeemTier: (tierId: string) => void;
  onClose: () => void;
  rewardTiers?: RewardTier[];
  totalSpotsCount?: number;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  collectedCount,
  redeemedTiers,
  onRedeemTier,
  onClose,
  rewardTiers = REWARD_TIERS,
  totalSpotsCount = STAMP_SPOTS.length,
}) => {
  const [studentName, setStudentName] = useState('');
  const [staffConfirmTier, setStaffConfirmTier] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'prizes' | 'certificate'>('prizes');

  const isAllCompleted = collectedCount >= totalSpotsCount;

  const handleRedeemClick = (tierId: string) => {
    soundManager.playClickSound();
    setStaffConfirmTier(tierId);
  };

  const confirmRedemption = () => {
    if (staffConfirmTier) {
      soundManager.playSuccessSound();
      onRedeemTier(staffConfirmTier);
      setStaffConfirmTier(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-xl">
              🎁
            </div>
            <div>
              <span className="text-[11px] text-amber-300 font-bold uppercase tracking-wider">
                1F 総合受付カウンター
              </span>
              <h3 className="text-base sm:text-lg font-bold">記念品引き換え ＆ 参加認定証</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('prizes');
            }}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'prizes'
                ? 'border-blue-950 text-blue-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>記念品・景品一覧</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClickSound();
              setActiveTab('certificate');
            }}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'certificate'
                ? 'border-blue-950 text-blue-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Crown className="w-4 h-4 text-amber-500" />
            <span>デジタル修了証</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {activeTab === 'prizes' ? (
            <div className="space-y-4">
              <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200/80 text-xs text-blue-950 flex items-center justify-between">
                <span>
                  現在のスタンプ数: <strong className="text-sm font-mono">{collectedCount}</strong> / {totalSpotsCount}個
                </span>
                <span className="font-semibold text-blue-800">
                  {collectedCount >= 3 ? '🎉 景品引き換え可能！' : 'あと少しで景品ゲット！'}
                </span>
              </div>

              {/* Tiers */}
              <div className="space-y-3">
                {rewardTiers.map((tier) => {
                  const isUnlocked = collectedCount >= tier.requiredStamps;
                  const isRedeemed = redeemedTiers.has(tier.id);

                  return (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRedeemed
                          ? 'bg-slate-50 border-slate-200 opacity-80'
                          : isUnlocked
                          ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                          : 'bg-slate-50/50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isUnlocked
                                  ? 'bg-amber-400 text-slate-950'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              スタンプ {tier.requiredStamps}個 達成
                            </span>
                            <h4 className="text-sm font-bold text-slate-900">{tier.giftName}</h4>
                          </div>
                          <p className="text-xs text-slate-600">{tier.description}</p>
                        </div>

                        {/* Action status */}
                        <div className="shrink-0">
                          {isRedeemed ? (
                            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              引換完了
                            </span>
                          ) : isUnlocked ? (
                            <button
                              onClick={() => handleRedeemClick(tier.id)}
                              className="px-3 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                            >
                              <span>受付で引換</span>
                            </button>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-200 text-slate-500 text-xs font-medium flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              未達成
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Staff confirmation modal */}
              {staffConfirmTier && (
                <div className="p-4 bg-amber-100 border border-amber-300 rounded-2xl text-xs space-y-3">
                  <div className="font-bold text-amber-950">
                    ⚠️ 総合受付スタッフによる景品引き換え確認
                  </div>
                  <p className="text-slate-700">
                    来校者様に景品をお渡ししたら「引換済みにする」を押してください。（この操作は取り消せません）
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={confirmRedemption}
                      className="px-4 py-2 rounded-xl bg-blue-950 text-white font-bold hover:bg-blue-900"
                    >
                      景品をお渡しして引換済みにする
                    </button>
                    <button
                      onClick={() => setStaffConfirmTier(null)}
                      className="px-3 py-2 rounded-xl bg-white text-slate-700 font-medium border border-slate-300 hover:bg-slate-50"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Digital Certificate tab */
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="お名前（例：育英 太郎 または ニックネーム）"
                  className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-blue-900"
                />
                <button
                  onClick={() => soundManager.playSuccessSound()}
                  className="px-3 py-2 bg-blue-950 text-white text-xs font-bold rounded-xl shrink-0"
                >
                  名前を反映
                </button>
              </div>

              {/* Certificate Canvas Frame */}
              <div className="relative p-6 sm:p-8 rounded-3xl border-4 border-double border-amber-600/80 bg-gradient-to-b from-amber-50/50 via-white to-amber-50/50 shadow-md text-center space-y-4 select-none">
                {/* Ornamental Corners */}
                <div className="absolute top-2 left-2 text-amber-600 text-xs font-serif">❖</div>
                <div className="absolute top-2 right-2 text-amber-600 text-xs font-serif">❖</div>
                <div className="absolute bottom-2 left-2 text-amber-600 text-xs font-serif">❖</div>
                <div className="absolute bottom-2 right-2 text-amber-600 text-xs font-serif">❖</div>

                {/* Lion Mascot Emblem */}
                <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-amber-500 shadow-sm bg-white">
                  <img
                    src="/src/assets/images/lion_mascot_badge_1790812849349.jpg"
                    alt="仙台育英マスコット"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-amber-800 tracking-widest uppercase">
                    CERTIFICATE OF EXPLORATION
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
                    オープンキャンパス 修了証書
                  </h2>
                </div>

                {/* Recipient */}
                <div className="py-2 border-b border-amber-200/80 max-w-xs mx-auto">
                  <div className="text-base sm:text-lg font-bold text-slate-800">
                    {studentName.trim() ? `${studentName} 殿` : 'ご参加の皆さま 殿'}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                  あなたは仙台育英学園沖縄高等学校オープンキャンパスにおいて、
                  校内各施設を熱心に見学し、建学の精神「至誠」と未来への学びを体験されたことをここに証します。
                </p>

                {/* Seal & Stamps count */}
                <div className="pt-2 flex items-center justify-between text-left text-[11px] text-slate-500">
                  <div>
                    <div>日付: 2026年 オープンキャンパス</div>
                    <div>獲得スタンプ: {collectedCount} / {STAMP_SPOTS.length} 個</div>
                    <div className="font-semibold text-slate-700">学校法人仙台育英学園 沖縄高等学校</div>
                  </div>

                  {/* Japanese Red Seal */}
                  <div className="w-14 h-14 rounded-full border-2 border-red-600 text-red-600 flex flex-col items-center justify-center font-serif text-[10px] font-bold rotate-6 bg-red-50/30">
                    <span>育英</span>
                    <span>之印</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => {
                    soundManager.playSuccessSound();
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>認定証を印刷 / 保存する</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
