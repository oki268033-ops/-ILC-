import React, { useEffect, useState } from 'react';
import { CongestionStatus, FloorNumber, StampSpot } from '../types';
import { AlertCircle, Check, HelpCircle, Save, Sparkles, Trash2, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SpotEditModalProps {
  isOpen: boolean;
  spot: StampSpot | null;
  onSave: (spot: StampSpot) => void;
  onClose: () => void;
}

export const SpotEditModal: React.FC<SpotEditModalProps> = ({
  isOpen,
  spot,
  onSave,
  onClose,
}) => {
  const isCreate = !spot;

  const [roomName, setRoomName] = useState('');
  const [shortName, setShortName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [floor, setFloor] = useState<FloorNumber>(1);
  const [code, setCode] = useState('');
  const [symbol, setSymbol] = useState('育');
  const [description, setDescription] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [timeSlot, setTimeSlot] = useState('随時受付');
  const [congestion, setCongestion] = useState<CongestionStatus>('open');
  const [visitorCount, setVisitorCount] = useState(0);

  // Quiz
  const [quizQuestion, setQuizQuestion] = useState('');
  const [option0, setOption0] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState('');

  useEffect(() => {
    if (spot) {
      setRoomName(spot.roomName);
      setShortName(spot.shortName || spot.roomName);
      setSubtitle(spot.subtitle || '');
      setFloor(spot.floor);
      setCode(spot.code);
      setSymbol(spot.symbol);
      setDescription(spot.description);
      setEventTitle(spot.eventTitle || '');
      setEventDescription(spot.eventDescription || '');
      setTimeSlot(spot.timeSlot || '随時受付');
      setCongestion(spot.congestion || 'open');
      setVisitorCount(spot.visitorCount || 0);

      setQuizQuestion(spot.quiz?.question || '');
      setOption0(spot.quiz?.options?.[0] || '');
      setOption1(spot.quiz?.options?.[1] || '');
      setOption2(spot.quiz?.options?.[2] || '');
      setCorrectIndex(spot.quiz?.correctIndex ?? 0);
      setQuizExplanation(spot.quiz?.explanation || '');
    } else {
      // Default new spot
      const randomIdNum = Math.floor(100 + Math.random() * 900);
      setRoomName('新規体験ブース');
      setShortName('体験ブース');
      setSubtitle('オープンキャンパス特設コーナー');
      setFloor(1);
      setCode(String(randomIdNum));
      setSymbol('星');
      setDescription('本校の学びと特色を体験できる特設ブースです。');
      setEventTitle('ミニ体験ワークショップ');
      setEventDescription('生徒や教員と一緒に参加できる体験イベントです。');
      setTimeSlot('随時受付');
      setCongestion('open');
      setVisitorCount(0);

      setQuizQuestion('この体験ブースで学べる本校の魅力は何でしょう？');
      setOption0('実践的な学びと探究学習');
      setOption1('何もしないこと');
      setOption2('暗記だけの授業');
      setCorrectIndex(0);
      setQuizExplanation('仙台育英学園沖縄高校では探究学習や実践的なICT教育を大切にしています！');
    }
  }, [spot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccessSound();

    const updated: StampSpot = {
      id: spot?.id || `spot-custom-${Date.now()}`,
      roomName: roomName.trim() || 'ブース',
      shortName: shortName.trim() || roomName.trim() || 'ブース',
      subtitle: subtitle.trim(),
      floor,
      code: code.trim() || '999',
      symbol: symbol.trim() || '印',
      title: roomName.trim(),
      description: description.trim(),
      eventTitle: eventTitle.trim(),
      eventDescription: eventDescription.trim(),
      timeSlot: timeSlot.trim() || '随時受付',
      congestion,
      visitorCount: Number(visitorCount) || 0,
      iconName: spot?.iconName || 'Sparkles',
      stampColor: spot?.stampColor || '#1e3a8a',
      quiz: {
        question: quizQuestion.trim() || '問題が設定されていません',
        options: [
          option0.trim() || '選択肢1',
          option1.trim() || '選択肢2',
          option2.trim() || '選択肢3',
        ],
        correctIndex,
        explanation: quizExplanation.trim(),
      },
    };

    onSave(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                {isCreate ? 'NEW SPOT' : `EDIT SPOT: ${spot?.code}`}
              </span>
              <h3 className="text-base font-bold text-white">
                {isCreate ? '新規ブース・スタンプスポットの追加' : `ブース編集: ${spot?.roomName}`}
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Basic Info */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              1. 基本情報・設置フロア
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-300 font-semibold">ブース / 教室名 *</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="例: ICT・情報教室"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">階数 *</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value) as FloorNumber)}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value={1}>1F (エントランス・ホール)</option>
                  <option value={2}>2F (ICT・普通教室)</option>
                  <option value={3}>3F (理科・図書・進路)</option>
                  <option value={4}>4F (体育・音楽・多目的)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">合言葉コード (3桁数字) *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="例: 201"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-amber-300 font-mono font-bold focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">スタンプ印章（文字数制限なし） *</label>
                <input
                  type="text"
                  required
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="例: 育、至誠、獅子、沖育、OKINAWA、★"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-amber-300 font-bold text-center focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">混雑度ステータス</label>
                <select
                  value={congestion}
                  onChange={(e) => setCongestion(e.target.value as CongestionStatus)}
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none font-bold"
                >
                  <option value="open">🟢 スムーズ (待ち時間なし)</option>
                  <option value="moderate">🟡 やや混雑 (少し待ち時間あり)</option>
                  <option value="full">🔴 満員 (入場規制・順番待ち)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">サブタイトル・キャッチコピー</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="例: 育英のICT教育とプログラミングを体感！"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">説明文</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ブースや教室についての詳しい説明文"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Event details */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              2. 体験イベント・開催時間
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">イベント名称</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="例: iPadプログラミング体験会"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">開催時間帯</label>
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  placeholder="例: 随時受付 / 11:00〜12:00"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">イベント詳細内容</label>
              <input
                type="text"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="例: 在校生が丁寧に操作をレクチャーします。"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
              <span>3. クイズ設定（来校者がスタンプ獲得時に挑戦）</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">
                正解の選択肢にチェックを入れてください
              </span>
            </h4>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">クイズ問題文 *</label>
              <input
                type="text"
                required
                value={quizQuestion}
                onChange={(e) => setQuizQuestion(e.target.value)}
                placeholder="例: 仙台育英学園の建学の精神は何でしょう？"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 font-semibold">選択肢（3択）と正解の指定 *</label>

              {/* Option 0 */}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="opt0"
                  name="correctAnswer"
                  checked={correctIndex === 0}
                  onChange={() => setCorrectIndex(0)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  value={option0}
                  onChange={(e) => setOption0(e.target.value)}
                  placeholder="選択肢 A"
                  className={`flex-1 px-3 py-1.5 bg-slate-900 rounded-xl border text-white focus:outline-none ${
                    correctIndex === 0 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700'
                  }`}
                />
                {correctIndex === 0 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    正解
                  </span>
                )}
              </div>

              {/* Option 1 */}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="opt1"
                  name="correctAnswer"
                  checked={correctIndex === 1}
                  onChange={() => setCorrectIndex(1)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  value={option1}
                  onChange={(e) => setOption1(e.target.value)}
                  placeholder="選択肢 B"
                  className={`flex-1 px-3 py-1.5 bg-slate-900 rounded-xl border text-white focus:outline-none ${
                    correctIndex === 1 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700'
                  }`}
                />
                {correctIndex === 1 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    正解
                  </span>
                )}
              </div>

              {/* Option 2 */}
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="opt2"
                  name="correctAnswer"
                  checked={correctIndex === 2}
                  onChange={() => setCorrectIndex(2)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <input
                  type="text"
                  required
                  value={option2}
                  onChange={(e) => setOption2(e.target.value)}
                  placeholder="選択肢 C"
                  className={`flex-1 px-3 py-1.5 bg-slate-900 rounded-xl border text-white focus:outline-none ${
                    correctIndex === 2 ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-slate-700'
                  }`}
                />
                {correctIndex === 2 && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    正解
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">正解時の解説メッセージ</label>
              <textarea
                rows={2}
                value={quizExplanation}
                onChange={(e) => setQuizExplanation(e.target.value)}
                placeholder="例: 正解！本校の建学の精神は「至誠（誠実を尽くすこと）」です。"
                className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
            >
              キャンセル
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{isCreate ? '新規ブースを作成' : '変更を保存する'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
