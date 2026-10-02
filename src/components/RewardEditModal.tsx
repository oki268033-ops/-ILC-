import React, { useEffect, useState } from 'react';
import { RewardTier } from '../types';
import { Gift, Save, Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface RewardEditModalProps {
  isOpen: boolean;
  tier: RewardTier | null;
  currentRedeemed: number;
  onSave: (tier: RewardTier, updatedRedeemedCount: number) => void;
  onClose: () => void;
}

export const RewardEditModal: React.FC<RewardEditModalProps> = ({
  isOpen,
  tier,
  currentRedeemed,
  onSave,
  onClose,
}) => {
  const isCreate = !tier;

  const [tierName, setTierName] = useState('');
  const [giftName, setGiftName] = useState('');
  const [requiredStamps, setRequiredStamps] = useState(3);
  const [description, setDescription] = useState('');
  const [initialStock, setInitialStock] = useState(100);
  const [redeemedInput, setRedeemedInput] = useState(0);
  const [badgeColor, setBadgeColor] = useState('#f59e0b');

  useEffect(() => {
    if (tier) {
      setTierName(tier.tierName || '特別賞');
      setGiftName(tier.giftName || '');
      setRequiredStamps(tier.requiredStamps || 3);
      setDescription(tier.description || '');
      setInitialStock(tier.initialStock || 100);
      setRedeemedInput(currentRedeemed || 0);
      setBadgeColor(tier.badgeColor || '#f59e0b');
    } else {
      setTierName('特別賞');
      setGiftName('育英特製記念品グッズ');
      setRequiredStamps(5);
      setDescription('オープンキャンパス参加の記念品です。');
      setInitialStock(100);
      setRedeemedInput(0);
      setBadgeColor('#3b82f6');
    }
  }, [tier, currentRedeemed, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccessSound();

    const updated: RewardTier = {
      id: tier?.id || `reward-custom-${Date.now()}`,
      title: `${tierName.trim() || '記念賞'} (${requiredStamps}個達成)`,
      tierName: tierName.trim() || '記念賞',
      giftName: giftName.trim() || '記念品',
      requiredStamps: Math.max(1, Number(requiredStamps) || 1),
      description: description.trim(),
      icon: tier?.icon || 'Gift',
      initialStock: Math.max(0, Number(initialStock) || 0),
      badgeColor,
    };

    onSave(updated, Math.max(0, Number(redeemedInput) || 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                {isCreate ? 'NEW REWARD TIER' : `EDIT REWARD: ${tier?.giftName}`}
              </span>
              <h3 className="text-base font-bold text-white">
                {isCreate ? '新規記念品・景品の追加' : '景品・在庫設定の編集'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">賞の名称（グレード） *</label>
              <input
                type="text"
                required
                value={tierName}
                onChange={(e) => setTierName(e.target.value)}
                placeholder="例: ブロンズ賞 / 特別記念賞"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">必要スタンプ個数 *</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={requiredStamps}
                onChange={(e) => setRequiredStamps(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-amber-400 font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">景品・グッズの名称 *</label>
            <input
              type="text"
              required
              value={giftName}
              onChange={(e) => setGiftName(e.target.value)}
              placeholder="例: オリジナル校章ステッカー"
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">景品の説明文・特長</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例: 来校の記念に持ち帰れる特製校章シールです。"
              className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">総準備在庫数 *</label>
              <input
                type="number"
                min={0}
                required
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                placeholder="200"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">用意した記念品の総数</span>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">現在の配布済数 *</label>
              <input
                type="number"
                min={0}
                required
                value={redeemedInput}
                onChange={(e) => setRedeemedInput(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-emerald-400 font-mono font-bold focus:border-amber-400 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">現在までに渡した個数</span>
            </div>
          </div>

          {/* Color theme selection */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold">バッジカラー</label>
            <div className="flex items-center gap-2">
              {[
                { label: 'ゴールド', color: '#f59e0b' },
                { label: 'シルバー', color: '#64748b' },
                { label: 'ブロンズ', color: '#d97706' },
                { label: 'ブルー', color: '#2563eb' },
                { label: 'エメラルド', color: '#059669' },
                { label: 'パープル', color: '#7c3aed' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.color}
                  onClick={() => setBadgeColor(c.color)}
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                    badgeColor === c.color ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              キャンセル
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isCreate ? '新規景品を作成' : '景品設定を保存'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
