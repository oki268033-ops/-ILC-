import React, { useState } from 'react';
import { StampCollectionRecord, StampSpot } from '../types';
import { soundManager } from '../utils/audio';
import {
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  KeyRound,
  MapPin,
  QrCode,
  Sparkles,
  X,
} from 'lucide-react';

interface StampModalProps {
  spot: StampSpot | null;
  record?: StampCollectionRecord;
  onClose: () => void;
  onCollect: (spotId: string, method: 'quiz' | 'code' | 'qr' | 'manual') => void;
}

export const StampModal: React.FC<StampModalProps> = ({
  spot,
  record,
  onClose,
  onCollect,
}) => {
  if (!spot) return null;

  const isCollected = Boolean(record);
  const [activeTab, setActiveTab] = useState<'quiz' | 'code' | 'qr'>('quiz');
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);

  // Quiz state
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // QR scanner simulation
  const [isScanning, setIsScanning] = useState(false);

  const handleQuizAnswer = (optionIdx: number) => {
    if (quizSubmitted) return;
    soundManager.playClickSound();
    setSelectedOption(optionIdx);
    setQuizSubmitted(true);
    const correct = optionIdx === spot.quiz.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      soundManager.playStampSound();
      onCollect(spot.id, 'quiz');
    }
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim() === spot.code) {
      setCodeError(false);
      soundManager.playStampSound();
      onCollect(spot.id, 'code');
    } else {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 2000);
    }
  };

  const handleSimulateQRScan = () => {
    setIsScanning(true);
    soundManager.playClickSound();
    setTimeout(() => {
      setIsScanning(false);
      soundManager.playStampSound();
      onCollect(spot.id, 'qr');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="p-5 text-white relative flex items-center justify-between"
          style={{ backgroundColor: spot.stampColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl font-black font-serif">
              {spot.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/80 text-xs font-semibold">
                <span className="bg-black/20 px-2 py-0.5 rounded text-[11px]">
                  {spot.floor}F
                </span>
                <span>{spot.shortName}</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">{spot.roomName}</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Facility description & event info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>本日の実施イベント・見学ポイント</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">{spot.eventTitle}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{spot.eventDescription}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {spot.timeSlot}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {spot.floor}階 校内
              </span>
            </div>
          </div>

          {/* Stamped Status or Action Mode */}
          {isCollected ? (
            /* Already Stamped View */
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-double border-red-600 flex flex-col items-center justify-center text-red-600 shadow-sm bg-white transform -rotate-3">
                <div className="text-[9px] font-bold tracking-widest text-red-600 uppercase">
                  SENDAI IKUEI
                </div>
                <div className="text-2xl font-black font-serif leading-none">{spot.symbol}</div>
                <div className="text-[8px] font-semibold text-red-700">{spot.shortName}</div>
              </div>

              <div>
                <div className="inline-flex items-center gap-1 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  スタンプ獲得済み！
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  押印完了しました。次のスポットへ向かってスタンプを集めよう！
                </p>
                {record?.collectedAt && (
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    獲得日時: {new Date(record.collectedAt).toLocaleTimeString('ja-JP')}
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-blue-950 text-white font-bold text-xs sm:text-sm hover:bg-blue-900 transition-colors"
                >
                  マップに戻る
                </button>
              </div>
            </div>
          ) : (
            /* Not Stamped Yet - 3 Interactive Choices */
            <div className="space-y-4">
              <div className="flex border-b border-slate-200 text-xs">
                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    setActiveTab('quiz');
                  }}
                  className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'quiz'
                      ? 'border-blue-900 text-blue-950'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>クイズに答えて押印</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    setActiveTab('code');
                  }}
                  className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'code'
                      ? 'border-blue-900 text-blue-950'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>3桁コード入力</span>
                </button>

                <button
                  onClick={() => {
                    soundManager.playClickSound();
                    setActiveTab('qr');
                  }}
                  className={`flex-1 py-2.5 font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === 'qr'
                      ? 'border-blue-900 text-blue-950'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR読み取り</span>
                </button>
              </div>

              {/* Tab 1: Quiz */}
              {activeTab === 'quiz' && (
                <div className="space-y-3.5">
                  <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80">
                    <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                      ★ 会場限定ミッションクイズ
                    </span>
                    <h5 className="text-sm font-bold text-slate-900 mt-1">
                      Q. {spot.quiz.question}
                    </h5>
                  </div>

                  <div className="space-y-2">
                    {spot.quiz.options.map((option, idx) => {
                      let btnStyle = 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800';
                      if (quizSubmitted) {
                        if (idx === spot.quiz.correctIndex) {
                          btnStyle = 'bg-emerald-100 border-emerald-500 text-emerald-900 font-bold';
                        } else if (idx === selectedOption) {
                          btnStyle = 'bg-red-100 border-red-500 text-red-900';
                        } else {
                          btnStyle = 'opacity-50 bg-slate-50 border-slate-200';
                        }
                      }

                      return (
                        <button
                          key={idx}
                          disabled={quizSubmitted}
                          onClick={() => handleQuizAnswer(idx)}
                          className={`w-full p-3 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                        >
                          <span>
                            {idx + 1}. {option}
                          </span>
                          {quizSubmitted && idx === spot.quiz.correctIndex && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && (
                    <div
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isCorrect
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-red-50 border border-red-200 text-red-900'
                      }`}
                    >
                      <div className="font-bold">
                        {isCorrect ? '🎉 大正解！スタンプが押印されました！' : '惜しい！もう一度トライしてみよう'}
                      </div>
                      <p className="text-[11px] leading-relaxed">{spot.quiz.explanation}</p>
                      {!isCorrect && (
                        <button
                          onClick={() => {
                            setQuizSubmitted(false);
                            setSelectedOption(null);
                          }}
                          className="mt-2 text-xs font-bold text-red-700 underline"
                        >
                          やり直す
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Code Input */}
              {activeTab === 'code' && (
                <form onSubmit={handleCodeSubmit} className="space-y-4">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-slate-600">
                      この部屋の入口や机に掲示されている「3桁の合言葉コード」を入力してください。
                    </p>
                    <div className="text-[11px] text-slate-400">
                      （ヒント: この部屋の番号は <span className="font-bold text-slate-600">{spot.code}</span> です）
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="例: 101"
                      className="w-40 text-center font-mono text-2xl font-bold tracking-widest px-4 py-2.5 rounded-xl border-2 border-slate-300 focus:border-blue-900 focus:outline-none"
                    />
                  </div>

                  {codeError && (
                    <p className="text-xs text-red-600 text-center font-bold">
                      コードが一致しません。正しい番号を入力してください。
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-950 text-white font-bold text-xs sm:text-sm hover:bg-blue-900 transition-colors shadow-sm"
                  >
                    スタンプを押印する
                  </button>
                </form>
              )}

              {/* Tab 3: QR Scanner */}
              {activeTab === 'qr' && (
                <div className="space-y-4 text-center">
                  <div className="p-6 bg-slate-900 rounded-2xl text-white flex flex-col items-center justify-center relative overflow-hidden min-h-[160px]">
                    {isScanning ? (
                      <div className="space-y-2">
                        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-xs font-semibold text-amber-300">QRコードを認識中...</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <QrCode className="w-12 h-12 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-300">
                          会場内のQRコードにカメラを向けてスキャンしてください
                        </p>
                      </div>
                    )}

                    {/* Laser scanner effect */}
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-amber-400 shadow-lg shadow-amber-400 top-1/2 animate-bounce" />
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isScanning}
                    onClick={handleSimulateQRScan}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-sm"
                  >
                    {isScanning ? '読み取り中...' : 'QRコードをスキャンして押印'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
