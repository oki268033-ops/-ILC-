import React, { useState } from 'react';
import { OPEN_CAMPUS_SCHEDULE, TOUR_ROUTES, STAMP_SPOTS } from '../data/campusData';
import { Clock, Compass, HelpCircle, MapPin, Navigation, Sparkles } from 'lucide-react';
import { FloorNumber, ScheduleItem, StampSpot, TourRoute } from '../types';

interface TourScheduleProps {
  routes?: TourRoute[];
  schedules?: ScheduleItem[];
  spots?: StampSpot[];
  onSelectFloor: (floor: FloorNumber) => void;
  onSelectSpot: (spot: StampSpot) => void;
}

export const TourSchedule: React.FC<TourScheduleProps> = ({
  routes = TOUR_ROUTES,
  schedules = OPEN_CAMPUS_SCHEDULE.map((s, idx) => ({ id: `sched-${idx}`, ...s })),
  spots = STAMP_SPOTS,
  onSelectFloor,
  onSelectSpot,
}) => {
  const activeRoutes = routes.length > 0 ? routes : TOUR_ROUTES;
  const [selectedRouteId, setSelectedRouteId] = useState<string>(activeRoutes[0]?.id || 'route-all');
  const selectedRoute = activeRoutes.find((r) => r.id === selectedRouteId) || activeRoutes[0] || TOUR_ROUTES[0];

  return (
    <div className="space-y-6">
      {/* Recommended Routes Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-blue-900" />
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              おすすめ見学ルート（モデルコース）
            </h3>
            <p className="text-xs text-slate-500">
              あなたの興味や滞在時間に合わせて最適なルートをご案内します
            </p>
          </div>
        </div>

        {/* Route Selector Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {activeRoutes.map((route) => {
            const isSelected = selectedRouteId === route.id;
            return (
              <button
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  isSelected
                    ? 'bg-blue-950 text-white border-blue-950 shadow-md ring-2 ring-blue-900/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span
                    className={`font-bold ${
                      isSelected ? 'text-amber-400' : 'text-blue-900'
                    }`}
                  >
                    ⏱ {route.estimatedTime}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {route.stepSpotIds.length}箇所
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold truncate">{route.title}</div>
                <div
                  className={`text-[11px] truncate mt-0.5 ${
                    isSelected ? 'text-slate-300' : 'text-slate-500'
                  }`}
                >
                  {route.targetAudience}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Route Steps Breakdown */}
        {selectedRoute && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{selectedRoute.title}</h4>
              <p className="text-xs text-slate-600 mt-0.5">{selectedRoute.description}</p>
            </div>

            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                巡回ステップ順:
              </span>
              <div className="flex flex-wrap items-center gap-2">
                {selectedRoute.stepSpotIds.map((spotId, idx) => {
                  const spot = spots.find((s) => s.id === spotId) || STAMP_SPOTS.find((s) => s.id === spotId);
                  if (!spot) return null;

                  return (
                    <React.Fragment key={spotId}>
                      <button
                        onClick={() => {
                          onSelectFloor(spot.floor);
                          onSelectSpot(spot);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-blue-900 text-xs font-semibold text-slate-800 hover:text-blue-950 shadow-xs flex items-center gap-1.5 transition-colors"
                      >
                        <span className="w-4 h-4 rounded-full bg-blue-950 text-white text-[10px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <span>
                          {spot.floor}F {spot.shortName || spot.roomName}
                        </span>
                      </button>
                      {idx < selectedRoute.stepSpotIds.length - 1 && (
                        <span className="text-slate-300 text-xs">→</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timetable Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-900" />
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                本日のタイムスケジュール・イベント時間割
              </h3>
              <p className="text-xs text-slate-500">
                各階で開催されるガイダンスや体験講座の時間を確認できます
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
          {schedules.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-3 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-blue-950 bg-blue-50 px-2.5 py-1 rounded-lg shrink-0">
                  {item.time}
                </span>
                <div>
                  <span className="font-bold text-slate-900">{item.title}</span>
                  {item.description && (
                    <span className="text-[11px] text-slate-500 ml-2 hidden md:inline">
                      {item.description}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-semibold">
                  {item.floor}
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">{item.place}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campus FAQ & Amenities */}
      <div className="bg-slate-100/70 rounded-3xl p-5 sm:p-6 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-950" />
          <h4 className="text-sm font-bold text-slate-900">来校者サポート・設備のご案内</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <strong className="text-slate-900 block mb-0.5">📶 校内フリーWi-Fi</strong>
            館内全域で高速Wi-Fiがご利用可能です。SSID・パスワードは受付パンフレットに記載しています。
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <strong className="text-slate-900 block mb-0.5">♿ バリアフリー＆エレベーター</strong>
            1Fには多機能トイレ、各階へ直通するエレベーター（EV）を完備しております。
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <strong className="text-slate-900 block mb-0.5">💧 給水・休憩スペース</strong>
            各フロアの自動販売機および2F図書室、3F教室2でご自由にお休みいただけます。
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/80">
            <strong className="text-slate-900 block mb-0.5">🤝 困ったときは</strong>
            校内の名札をつけた教職員または在校生スタッフにお気軽にお声がけください！
          </div>
        </div>
      </div>
    </div>
  );
};
