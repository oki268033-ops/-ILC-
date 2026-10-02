import React, { useState } from 'react';
import { Camera, KeyRound, QrCode, Sparkles, UserCheck, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface ReceptionCheckInModalProps {
  isOpen: boolean;
  totalVisitors: number;
  initialNickname?: string;
  onCheckInSuccess: (nickname: string) => void;
  onClose?: () => void;
  canDismiss?: boolean;
}

export const ReceptionCheckInModal: React.FC<ReceptionCheckInModalProps> = ({
  isOpen,
  totalVisitors,
  initialNickname = '',
  onCheckInSuccess,
  onClose,
  canDismiss = false,
}) => {
  const [nickname, setNickname] = useState(initialNickname);
  const [activeMode, setActiveMode] = useState<'scan' | 'code'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);

  if (!isOpen) return null;

  const getResolvedNickname = () => {
    return nickname.trim() || `来校者 #${String(totalVisitors + 1).padStart(4, '0')}`;
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    soundManager.playClickSound();
    setTimeout(() => {
      setIsScanning(false);
      soundManager.playFanfare();
      onCheckInSuccess(getResolvedNickname());
    }, 1500);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim() === '101' || codeInput.trim() === '1001') {
      setCodeError(false);
      soundManager.playFanfare();
      onCheckInSuccess(getResolvedNickname());
    } else {
      soundManager.playClickSound();
      setCodeError(true);
      setTimeout(() => setCodeError(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-2xl font-bold shadow-md shrink-0">
              獅
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-300 tracking-wider uppercase block">
                1F 総合受付カウンター
              </span>
              <h3 className="text-lg font-black tracking-tight text-white">
                来校受付・チェックイン
              </h3>
            </div>
          </div>

          {canDismiss && onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* Welcome Message */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>仙台育英学園沖縄高校 オープンキャンパス</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-slate-900">
              受付ブースのQRコードを読み取って参加しよう！
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
              1Fエントランス総合受付の卓上POPに掲示されている「受付QRコード」をスマホのカメラでスキャンしてください。
            </p>
          </div>

          {/* Current Visitor Headcount Counter */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center space-y-1">
            <div className="text-[11px] text-slate-500 font-semibold">現在の来校参加者数</div>
            <div className="text-3xl font-extrabold font-mono text-blue-950 tabular-nums">
              {totalVisitors}
              <span className="text-sm font-normal text-slate-500 ml-1">名が来校中</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              チェックインすると来校者番号が付与され、カウントが +1 されます！
            </div>
          </div>

          {/* Nickname Input Section */}
          <div className="bg-amber-50/80 border border-amber-300 rounded-2xl p-4 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                ★
              </span>
              <span>あなたのニックネームを決めてください（後から変更可能）</span>
            </div>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: りく、さくら、仙台太郎（空欄でもOK）"
              maxLength={15}
              className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-xs"
            />
            <p className="text-[11px] text-amber-900/80">
              ※ スタンプ帳・デジタル修了証や、管理本部の参加記録に表示されます。
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                setActiveMode('scan');
              }}
              className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'scan'
                  ? 'border-blue-950 text-blue-950'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>受付QRコードを読み取る</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundManager.playClickSound();
                setActiveMode('code');
              }}
              className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'code'
                  ? 'border-blue-950 text-blue-950'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>受付番号（101）を入力</span>
            </button>
          </div>

          {/* Mode 1: QR Scan (Scanner view to read the physical booth QR) */}
          {activeMode === 'scan' && (
            <div className="space-y-4 text-center">
              <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[160px]">
                {isScanning ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-amber-300">
                      受付ブースのQRコードを認識中...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <QrCode className="w-14 h-14 text-slate-300 mx-auto" />
                    <p className="text-xs text-slate-300 font-medium">
                      総合受付ブースの卓上POPにカメラを向けてください
                    </p>
                  </div>
                )}

                {/* Laser animation */}
                {isScanning && (
                  <div className="absolute inset-x-0 h-1 bg-amber-400 shadow-lg shadow-amber-400 top-1/2 animate-bounce" />
                )}
              </div>

              <button
                type="button"
                disabled={isScanning}
                onClick={handleSimulateScan}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>{isScanning ? '読み取り中...' : '受付QRをスキャンしてチェックイン'}</span>
              </button>
            </div>
          )}

          {/* Mode 2: Code input */}
          {activeMode === 'code' && (
            <form onSubmit={handleCodeSubmit} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-600">
                  総合受付の卓上POPに記載されている「受付コード」を入力してください。
                </p>
                <div className="text-[11px] text-slate-400">
                  （受付番号: <span className="font-bold text-slate-700">101</span>）
                </div>
              </div>

              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="101"
                  className="w-40 text-center font-mono text-2xl font-black tracking-widest px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-blue-950 focus:outline-none"
                />
              </div>

              {codeError && (
                <p className="text-xs text-red-600 text-center font-bold">
                  受付コードが一致しません（受付コード: 101）
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>来校チェックインを完了する</span>
              </button>
            </form>
          )}

          <div className="text-center pt-1 text-[11px] text-slate-400">
            ※ スマートフォンをお持ちでない方や操作が難しい場合は、総合受付スタッフにお気軽にお声がけください。
          </div>
        </div>
      </div>
    </div>
  );
};
