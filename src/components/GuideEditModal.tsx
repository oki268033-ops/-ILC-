import React, { useEffect, useState } from 'react';
import { ScheduleItem, StampSpot, TourRoute } from '../types';
import { Clock, Compass, Plus, Save, Trash2, X } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface GuideEditModalProps {
  isOpen: boolean;
  type: 'route' | 'schedule';
  route: TourRoute | null;
  schedule: ScheduleItem | null;
  availableSpots: StampSpot[];
  onSaveRoute: (route: TourRoute) => void;
  onSaveSchedule: (schedule: ScheduleItem) => void;
  onClose: () => void;
}

export const GuideEditModal: React.FC<GuideEditModalProps> = ({
  isOpen,
  type,
  route,
  schedule,
  availableSpots,
  onSaveRoute,
  onSaveSchedule,
  onClose,
}) => {
  // Route fields
  const [routeTitle, setRouteTitle] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('約30分');
  const [targetAudience, setTargetAudience] = useState('');
  const [routeDescription, setRouteDescription] = useState('');
  const [selectedSpotIds, setSelectedSpotIds] = useState<string[]>([]);

  // Schedule fields
  const [schedTime, setSchedTime] = useState('11:00');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedFloor, setSchedFloor] = useState('1F');
  const [schedPlace, setSchedPlace] = useState('エントランス');
  const [schedDescription, setSchedDescription] = useState('');

  useEffect(() => {
    if (type === 'route') {
      if (route) {
        setRouteTitle(route.title);
        setEstimatedTime(route.estimatedTime);
        setTargetAudience(route.targetAudience);
        setRouteDescription(route.description);
        setSelectedSpotIds(route.stepSpotIds || []);
      } else {
        setRouteTitle('新規おすすめ見学ルート');
        setEstimatedTime('約30分');
        setTargetAudience('部活や体験重視の方');
        setRouteDescription('校内の人気スポットを短時間でめぐる特別コースです。');
        setSelectedSpotIds(availableSpots.slice(0, 4).map((s) => s.id));
      }
    } else {
      if (schedule) {
        setSchedTime(schedule.time);
        setSchedTitle(schedule.title);
        setSchedFloor(schedule.floor);
        setSchedPlace(schedule.place);
        setSchedDescription(schedule.description || '');
      } else {
        setSchedTime('12:00');
        setSchedTitle('体験講座・ガイダンス');
        setSchedFloor('2F');
        setSchedPlace('ICT・情報教室');
        setSchedDescription('在校生・教員による特別プログラム');
      }
    }
  }, [isOpen, type, route, schedule, availableSpots]);

  if (!isOpen) return null;

  const handleToggleSpot = (spotId: string) => {
    soundManager.playClickSound();
    if (selectedSpotIds.includes(spotId)) {
      setSelectedSpotIds(selectedSpotIds.filter((id) => id !== spotId));
    } else {
      setSelectedSpotIds([...selectedSpotIds, spotId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSuccessSound();

    if (type === 'route') {
      const updatedRoute: TourRoute = {
        id: route?.id || `route-custom-${Date.now()}`,
        title: routeTitle.trim() || '見学コース',
        estimatedTime: estimatedTime.trim() || '約30分',
        targetAudience: targetAudience.trim() || '全来校者',
        description: routeDescription.trim(),
        stepSpotIds: selectedSpotIds.length > 0 ? selectedSpotIds : availableSpots.slice(0, 3).map((s) => s.id),
      };
      onSaveRoute(updatedRoute);
    } else {
      const updatedSchedule: ScheduleItem = {
        id: schedule?.id || `sched-${Date.now()}`,
        time: schedTime.trim() || '12:00',
        title: schedTitle.trim() || 'イベント',
        floor: schedFloor.trim() || '1F',
        place: schedPlace.trim() || '教室',
        description: schedDescription.trim(),
      };
      onSaveSchedule(updatedSchedule);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div
        className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold">
              {type === 'route' ? <Compass className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                {type === 'route' ? 'TOUR ROUTE CONFIG' : 'TIMETABLE CONFIG'}
              </span>
              <h3 className="text-base font-bold text-white">
                {type === 'route'
                  ? route
                    ? 'おすすめ見学コースの編集'
                    : '新規見学コースの追加'
                  : schedule
                  ? 'タイムスケジュールの編集'
                  : '新規スケジュールの追加'}
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
          {type === 'route' ? (
            /* Route Form */
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">コース名 *</label>
                <input
                  type="text"
                  required
                  value={routeTitle}
                  onChange={(e) => setRouteTitle(e.target.value)}
                  placeholder="例: 全館まるわかり制覇コース（推奨）"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">所要時間の目安 *</label>
                  <input
                    type="text"
                    required
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="例: 約30分 / 約50分"
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-amber-400 font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">おすすめ対象者 *</label>
                  <input
                    type="text"
                    required
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="例: 初めて来校された方・部活体験重視"
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">コースの詳細・案内文</label>
                <textarea
                  rows={2}
                  value={routeDescription}
                  onChange={(e) => setRouteDescription(e.target.value)}
                  placeholder="ルートの特長や見どころを記入"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-2 bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">
                    巡回するスタンプブース（クリックして選択 / 順序）
                  </label>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {selectedSpotIds.length} 箇所選択中
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {availableSpots.map((spot) => {
                    const isSelected = selectedSpotIds.includes(spot.id);
                    const orderIdx = selectedSpotIds.indexOf(spot.id);

                    return (
                      <button
                        type="button"
                        key={spot.id}
                        onClick={() => handleToggleSpot(spot.id)}
                        className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-blue-900/60 border-blue-500 text-white shadow-xs'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span className="text-[10px] text-blue-300 font-mono font-bold mr-1">
                            {spot.floor}F
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {spot.roomName}
                          </span>
                        </div>
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {orderIdx + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Schedule Form */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">時間 *</label>
                  <input
                    type="text"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    placeholder="例: 10:30〜11:00"
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-amber-400 font-mono font-bold focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">開催階 *</label>
                  <input
                    type="text"
                    required
                    value={schedFloor}
                    onChange={(e) => setSchedFloor(e.target.value)}
                    placeholder="例: 1F / 3F / 全館"
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">会場・教室 *</label>
                  <input
                    type="text"
                    required
                    value={schedPlace}
                    onChange={(e) => setSchedPlace(e.target.value)}
                    placeholder="例: 多目的ホール / 教室 1"
                    className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">プログラム・イベント名称 *</label>
                <input
                  type="text"
                  required
                  value={schedTitle}
                  onChange={(e) => setSchedTitle(e.target.value)}
                  placeholder="例: 第1回 学校紹介・コースガイダンス"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">詳細説明・備考（任意）</label>
                <textarea
                  rows={2}
                  value={schedDescription}
                  onChange={(e) => setSchedDescription(e.target.value)}
                  placeholder="例: 予約不要・入退場自由です。"
                  className="w-full px-3 py-2 bg-slate-900 rounded-xl border border-slate-700 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </>
          )}

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
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>保存する</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
