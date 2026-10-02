import React from 'react';
import { STAMP_SPOTS, REWARD_TIERS } from '../data/campusData';
import { StampCollectionRecord, StampSpot } from '../types';
import { Award, CheckCircle2, ChevronRight, Gift, Sparkles, Trophy } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StampCardProps {
  collectedRecords: Record<string, StampCollectionRecord>;
  onSelectSpot: (spot: StampSpot) => void;
  onOpenRewards: () => void;
  spots?: StampSpot[];
  rewardTiers?: any[];
}

export const StampCard: React.FC<StampCardProps> = ({
  collectedRecords,
  onSelectSpot,
  onOpenRewards,
  spots = STAMP_SPOTS,
  rewardTiers = REWARD_TIERS,
}) => {
  const collectedCount = Object.keys(collectedRecords).length;
  const totalCount = spots.length;
  const progressPercent = Math.round((collectedCount / (totalCount || 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Progress & Milestone Overview */}
      <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-amber-400 text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              仙台育英学園沖縄高等学校 オープンキャンパス
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              デジタルスタンプラリー台紙
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              校内の1F〜4F各施設を巡ってスタンプを集めよう！3個集めるごとに豪華景品がアンロック！
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-[11px] text-slate-300 font-medium">現在の獲得数</div>
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono tabular-nums">
                {collectedCount}
                <span className="text-sm text-white/70 font-normal"> / {totalCount}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl font-bold">
              {collectedCount === totalCount ? '🏆' : '★'}
            </div>
          </div>
        </div>

        {/* Progress Bar with Milestone Markers */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold">達成度: {progressPercent}%</span>
            <span>
              {collectedCount === totalCount
                ? '完全制覇！景品交換所へGO 🎉'
                : `あと ${totalCount - collectedCount} 個で完全制覇`}
            </span>
          </div>

          <div className="w-full h-3.5 bg-black/40 rounded-full p-0.5 relative overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Milestone Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {REWARD_TIERS.map((tier) => {
              const unlocked = collectedCount >= tier.requiredStamps;
              return (
                <div
                  key={tier.id}
                  onClick={onOpenRewards}
                  className={`p-2 rounded-xl text-center cursor-pointer transition-all border ${
                    unlocked
                      ? 'bg-amber-400/20 border-amber-400/40 text-amber-200'
                      : 'bg-white/5 border-white/10 text-slate-400'
                  }`}
                >
                  <div className="text-[10px] sm:text-xs font-bold flex items-center justify-center gap-1">
                    {unlocked ? <CheckCircle2 className="w-3 h-3 text-amber-300" /> : '🔒'}
                    <span>{tier.requiredStamps}個達成</span>
                  </div>
                  <div className="text-[11px] font-semibold truncate text-white mt-0.5">
                    {tier.giftName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stamp Grid (8 Stamps) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-900" />
            <h3 className="text-base font-bold text-slate-900">スタンプ一覧（全{totalCount}箇所）</h3>
          </div>
          <span className="text-xs text-slate-500">枠をタップしてクイズやコード入力で押印</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 sm:gap-4">
          {spots.map((spot, index) => {
            const record = collectedRecords[spot.id];
            const isStamped = Boolean(record);

            return (
              <div
                key={spot.id}
                onClick={() => {
                  soundManager.playClickSound();
                  onSelectSpot(spot);
                }}
                className={`relative rounded-2xl p-4 transition-all duration-200 cursor-pointer flex flex-col items-center justify-between min-h-[200px] border text-center select-none group ${
                  isStamped
                    ? 'bg-white border-blue-200 shadow-md hover:shadow-lg'
                    : 'bg-white/80 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50/20 hover:shadow-sm'
                }`}
              >
                {/* Spot Number & Floor Tag */}
                <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span className="font-mono text-slate-400">#{index + 1}</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                    {spot.floor}F
                  </span>
                </div>

                {/* Circular Stamp Canvas / Placeholder */}
                <div className="my-2 relative flex items-center justify-center">
                  {isStamped ? (
                    /* Japanese Authentic Inked Stamp Seal */
                    <div className="relative w-24 h-24 rounded-full border-4 border-double border-red-600 flex flex-col items-center justify-center text-red-600 shadow-inner transform -rotate-3 transition-transform group-hover:scale-105 bg-red-50/40 p-1">
                      <div className="absolute inset-1 rounded-full border border-red-500/50" />
                      <div className="text-[9px] font-bold tracking-widest text-red-600/90 uppercase">
                        SENDAI IKUEI
                      </div>
                      <div
                        className={`font-black my-0.5 leading-none font-serif text-center px-0.5 max-w-[80px] break-words ${
                          spot.symbol.length <= 1
                            ? 'text-3xl'
                            : spot.symbol.length === 2
                            ? 'text-xl tracking-tight'
                            : spot.symbol.length <= 4
                            ? 'text-sm'
                            : 'text-[11px]'
                        }`}
                      >
                        {spot.symbol}
                      </div>
                      <div className="text-[9px] font-semibold text-red-700/80 truncate max-w-[75px]">
                        {spot.shortName || spot.roomName}
                      </div>
                      <div className="absolute -bottom-1 text-[8px] bg-white px-1 font-mono text-red-500 border border-red-300 rounded">
                        済 2026
                      </div>
                    </div>
                  ) : (
                    /* Empty Stamp Target */
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 group-hover:border-amber-400 group-hover:text-amber-600 transition-colors bg-slate-50/50">
                      <span className="text-2xl mb-0.5">⭕</span>
                      <span className="text-[11px] font-bold">未獲得</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">タップで押印</span>
                    </div>
                  )}
                </div>

                {/* Room Info */}
                <div className="w-full mt-1">
                  <div className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                    {spot.roomName}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {spot.subtitle}
                  </p>
                </div>

                {/* Status chip */}
                <div className="mt-2 w-full">
                  {isStamped ? (
                    <div className="w-full py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>獲得完了</span>
                    </div>
                  ) : (
                    <div className="w-full py-1 rounded-lg bg-slate-100 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-600 text-[11px] font-medium flex items-center justify-center gap-0.5 transition-colors">
                      <span>押印に挑戦</span>
                      <ChevronRight className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rewards Teaser Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
            🎁
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              景品引き換えカウンター（1F 総合受付）
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              スタンプを集めたら総合受付のスタッフにこの画面を見せてオリジナルグッズを受け取ろう！
            </p>
          </div>
        </div>

        <button
          onClick={onOpenRewards}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-950 text-white hover:bg-blue-900 transition-colors font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shrink-0"
        >
          <Gift className="w-4 h-4 text-amber-300" />
          <span>景品一覧・修了証を見る</span>
        </button>
      </div>
    </div>
  );
};
