import React, { useState } from 'react';
import { FloorNumber, RoomDefinition, StampSpot } from '../types';
import { CAMPUS_ROOMS, STAMP_SPOTS } from '../data/campusData';
import { CheckCircle2, ChevronRight, Info, Sparkles, Navigation } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface FloorMapProps {
  currentFloor: FloorNumber;
  setCurrentFloor: (floor: FloorNumber) => void;
  collectedSpotIds: Set<string>;
  onSelectStampSpot: (spot: StampSpot) => void;
  spots?: StampSpot[];
}

export const FloorMap: React.FC<FloorMapProps> = ({
  currentFloor,
  setCurrentFloor,
  collectedSpotIds,
  onSelectStampSpot,
  spots = STAMP_SPOTS,
}) => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'stamp' | 'facility'>('all');

  const currentRooms = CAMPUS_ROOMS.filter((room) => room.floor === currentFloor);
  const selectedRoom = currentRooms.find((r) => r.id === selectedRoomId) || null;

  const floorStamps = spots.filter((s) => s.floor === currentFloor);
  const collectedOnFloor = floorStamps.filter((s) => collectedSpotIds.has(s.id)).length;

  const handleRoomClick = (room: RoomDefinition) => {
    soundManager.playClickSound();
    setSelectedRoomId(room.id);
  };

  const handleFloorChange = (floor: FloorNumber) => {
    soundManager.playClickSound();
    setCurrentFloor(floor);
    setSelectedRoomId(null);
  };

  return (
    <div className="space-y-4">
      {/* Floor Selector Bar */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Floor Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {([1, 2, 3, 4] as FloorNumber[]).map((floor) => {
            const stampsInFloor = STAMP_SPOTS.filter((s) => s.floor === floor);
            const collectedInFloor = stampsInFloor.filter((s) => collectedSpotIds.has(s.id)).length;
            const isAllCompleted = stampsInFloor.length > 0 && collectedInFloor === stampsInFloor.length;
            const isActive = currentFloor === floor;

            return (
              <button
                key={floor}
                onClick={() => handleFloorChange(floor)}
                className={`flex-1 sm:flex-none min-w-[70px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                  isActive
                    ? 'bg-blue-950 text-white shadow-md shadow-blue-950/20 ring-2 ring-blue-900/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span className="text-base sm:text-lg">{floor}F</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-amber-300' : 'text-slate-500'}`}>
                  {isAllCompleted ? '制覇済 ✓' : `${collectedInFloor}/${stampsInFloor.length}`}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Filter */}
        <div className="flex items-center gap-1 w-full sm:w-auto justify-end text-xs">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
              filterMode === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            全施設
          </button>
          <button
            onClick={() => setFilterMode('stamp')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium flex items-center gap-1 ${
              filterMode === 'stamp' ? 'bg-amber-500 text-slate-950' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            スタンプ対象
          </button>
          <button
            onClick={() => setFilterMode('facility')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
              filterMode === 'facility' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            トイレ・EV
          </button>
        </div>
      </div>

      {/* Blueprint Map Container */}
      <div className="bg-slate-100/70 border border-slate-300/80 rounded-2xl p-3 sm:p-5 relative shadow-inner overflow-hidden">
        {/* Navy Circular Floor Indicator as shown on official blueprints */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 pointer-events-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-950 text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-lg border-2 border-white">
            {currentFloor}F
          </div>
          <div className="hidden sm:block bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-semibold text-slate-800 shadow-sm border border-slate-200">
            {currentFloor === 1 && '1F エントランス・ICT室・保健室・事務室'}
            {currentFloor === 2 && '2F 図書室・理科実験室・職員室'}
            {currentFloor === 3 && '3F 普通教室（1〜3）・更衣室'}
            {currentFloor === 4 && '4F 体育実習室・家庭科室・展望バルコニー'}
          </div>
        </div>

        {/* Legend Guide */}
        <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] text-slate-600 border border-slate-200 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-600 inline-block"></span>
            スタンプ対象
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-700 inline-block"></span>
            獲得完了
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-slate-300 border border-slate-500 inline-block"></span>
            校内施設
          </span>
        </div>

        {/* SVG Blueprint */}
        <div className="w-full aspect-[700/400] max-h-[520px] mx-auto select-none">
          <svg
            viewBox="0 0 700 400"
            className="w-full h-full drop-shadow-sm"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Hatch pattern for stairs */}
              <pattern id="stairPattern" width="10" height="6" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="10" y2="0" stroke="#475569" strokeWidth="1" />
              </pattern>
              {/* Balcony diagonal pattern */}
              <pattern id="balconyPattern" width="8" height="8" patternUnits="userSpaceOnUse">
                <line x1="0" y1="8" x2="8" y2="0" stroke="#94a3b8" strokeWidth="0.8" />
              </pattern>
            </defs>

            {/* Base Campus Layout Outer Border */}
            <rect
              x="50"
              y="85"
              width="615"
              height="305"
              fill="#ffffff"
              stroke="#0f172a"
              strokeWidth="2.5"
              rx="4"
            />

            {/* Render Each Room */}
            {currentRooms.map((room) => {
              const stampSpot = spots.find((s) => s.id === room.stampId);
              const isCollected = stampSpot ? collectedSpotIds.has(stampSpot.id) : false;
              const isSelected = selectedRoomId === room.id;

              // Filter check
              let opacity = 1;
              if (filterMode === 'stamp' && !room.isStampSpot) opacity = 0.25;
              if (filterMode === 'facility' && room.type !== 'restroom' && room.name !== 'EV') opacity = 0.25;

              // Room colors
              let fillColor = '#ffffff';
              if (room.type === 'restroom') fillColor = '#f8fafc';
              if (room.type === 'circulation') fillColor = '#f1f5f9';
              if (room.name === 'バルコニー') fillColor = '#f8fafc';
              if (room.isStampSpot) {
                fillColor = isCollected ? '#ecfdf5' : '#fffbeb';
              }
              if (isSelected) {
                fillColor = '#fef3c7';
              }

              return (
                <g
                  key={room.id}
                  onClick={() => handleRoomClick(room)}
                  className="cursor-pointer transition-all duration-200"
                  style={{ opacity }}
                >
                  {/* Room Box */}
                  <rect
                    x={room.x}
                    y={room.y}
                    width={room.width}
                    height={room.height}
                    fill={fillColor}
                    stroke="#0f172a"
                    strokeWidth={isSelected ? 3 : 1.8}
                    className="hover:brightness-95 transition-all"
                  />

                  {/* Stairs Pattern Overlay */}
                  {room.name === '階段' && (
                    <rect
                      x={room.x + 2}
                      y={room.y + 2}
                      width={room.width - 4}
                      height={room.height - 4}
                      fill="url(#stairPattern)"
                      opacity="0.6"
                      pointerEvents="none"
                    />
                  )}

                  {/* Balcony Pattern */}
                  {room.name === 'バルコニー' && (
                    <rect
                      x={room.x + 2}
                      y={room.y + 2}
                      width={room.width - 4}
                      height={room.height - 4}
                      fill="url(#balconyPattern)"
                      opacity="0.4"
                      pointerEvents="none"
                    />
                  )}

                  {/* Room Label */}
                  <text
                    x={room.x + room.width / 2}
                    y={room.y + room.height / 2 + (room.isStampSpot ? -8 : 4)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#0f172a"
                    fontSize={
                      room.name.length > 7
                        ? 12
                        : room.width > 180
                        ? 22
                        : room.width > 110
                        ? 18
                        : room.width > 60
                        ? 13
                        : 10
                    }
                    fontWeight={room.isStampSpot || room.width > 120 ? 'bold' : '600'}
                    className="pointer-events-none select-none"
                  >
                    {room.name}
                  </text>

                  {/* Stamp Badge Marker */}
                  {room.isStampSpot && (
                    <g pointerEvents="none">
                      <circle
                        cx={room.x + room.width / 2}
                        cy={room.y + room.height / 2 + 16}
                        r={isCollected ? 12 : 14}
                        fill={isCollected ? '#10b981' : '#f59e0b'}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className={!isCollected ? 'animate-pulse' : ''}
                      />
                      <text
                        x={room.x + room.width / 2}
                        y={room.y + room.height / 2 + 17}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#ffffff"
                        fontSize={isCollected ? 11 : 12}
                        fontWeight="bold"
                      >
                        {isCollected ? '✓' : '★'}
                      </text>
                    </g>
                  )}

                  {/* Special indicator for Multipurpose WC / EV */}
                  {room.id === '1f-multipurpose-wc' && (
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 10}
                      textAnchor="middle"
                      fill="#3b82f6"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      ♿
                    </text>
                  )}
                  {room.name === 'EV' && (
                    <text
                      x={room.x + room.width / 2}
                      y={room.y + room.height / 2 + 8}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                    >
                      エレベーター
                    </text>
                  )}
                </g>
              );
            })}

            {/* Entrance pointer pin if on 1F */}
            {currentFloor === 1 && (
              <g pointerEvents="none">
                <line x1="375" y1="70" x2="375" y2="108" stroke="#1e3a8a" strokeWidth="2.5" strokeDasharray="3 2" />
                <rect x="340" y="48" width="70" height="22" rx="4" fill="#1e3a8a" />
                <text x="375" y="63" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  入口玄関 ▼
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Selected Room Details Bottom Card */}
        {selectedRoom && (
          <div className="mt-4 bg-white rounded-xl p-4 border border-slate-200 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-fade-in">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-950 text-white">
                  {selectedRoom.floor}F
                </span>
                <h3 className="text-base font-bold text-slate-900">{selectedRoom.name}</h3>
                {selectedRoom.isStampSpot && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      collectedSpotIds.has(selectedRoom.stampId!)
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {collectedSpotIds.has(selectedRoom.stampId!) ? 'スタンプ獲得済 ✓' : 'スタンプ対象スポット'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 max-w-2xl">{selectedRoom.description}</p>
              {selectedRoom.openCampusFeature && (
                <p className="text-xs font-medium text-blue-900">
                  <span className="font-bold">実施内容:</span> {selectedRoom.openCampusFeature}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {selectedRoom.isStampSpot && (
                <button
                  onClick={() => {
                    const spot = spots.find((s) => s.id === selectedRoom.stampId);
                    if (spot) onSelectStampSpot(spot);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                    collectedSpotIds.has(selectedRoom.stampId!)
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{collectedSpotIds.has(selectedRoom.stampId!) ? 'スタンプ詳細を見る' : 'スタンプを押す / クイズ'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floor Stamp Quick Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-900" />
            <h4 className="text-sm font-bold text-slate-900">
              {currentFloor}F のスタンプスポット（{collectedOnFloor}/{floorStamps.length} 完了）
            </h4>
          </div>
          <span className="text-xs text-slate-500">各部屋をタップして確認できます</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {floorStamps.map((spot) => {
            const isCollected = collectedSpotIds.has(spot.id);
            const congestion = spot.congestion || 'open';
            return (
              <div
                key={spot.id}
                onClick={() => {
                  setSelectedRoomId(
                    CAMPUS_ROOMS.find((r) => r.stampId === spot.id)?.id || null
                  );
                  onSelectStampSpot(spot);
                }}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  isCollected
                    ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-50 border-slate-200 hover:border-amber-300 hover:bg-amber-50/30'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: spot.stampColor }}
                    >
                      {spot.symbol}
                    </span>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {spot.roomName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                        congestion === 'full'
                          ? 'bg-red-100 text-red-700'
                          : congestion === 'moderate'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {congestion === 'full' ? '満員' : congestion === 'moderate' ? '混雑' : '空席'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {spot.eventTitle}
                  </p>
                </div>

                <div className="shrink-0">
                  {isCollected ? (
                    <span className="flex items-center gap-1 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      済
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-amber-400 text-slate-950 font-bold text-[11px] rounded-lg shadow-xs flex items-center gap-0.5">
                      押印へ
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
