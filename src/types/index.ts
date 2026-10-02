export type FloorNumber = 1 | 2 | 3 | 4;

export type CongestionStatus = 'open' | 'moderate' | 'full';

export interface RoomDefinition {
  id: string;
  name: string;
  floor: FloorNumber;
  type: 'stamp' | 'facility' | 'restroom' | 'circulation' | 'office';
  code?: string;
  isStampSpot?: boolean;
  stampId?: string;
  description: string;
  openCampusFeature?: string;
  schedule?: string;
  congestion?: CongestionStatus;
  // Relative coordinates in floor plan (0-100% or svg units)
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StampSpot {
  id: string;
  roomName: string;
  shortName: string;
  floor: FloorNumber;
  code: string;
  symbol: string;
  title: string;
  subtitle: string;
  description: string;
  eventTitle: string;
  eventDescription: string;
  timeSlot: string;
  quiz: QuizQuestion;
  iconName: string;
  stampColor: string;
  congestion?: CongestionStatus;
  visitorCount?: number;
}

export interface StampCollectionRecord {
  spotId: string;
  collectedAt: number;
  method: 'quiz' | 'code' | 'qr' | 'manual';
}

export interface RewardTier {
  id: string;
  requiredStamps: number;
  title: string;
  giftName: string;
  description: string;
  icon: string;
  tierName?: string;
  badgeColor?: string;
  initialStock?: number;
  currentStock?: number;
}

export interface TourRoute {
  id: string;
  title: string;
  estimatedTime: string;
  targetAudience: string;
  description: string;
  stepSpotIds: string[];
}

export interface LiveActivityLog {
  id: string;
  timestamp: number;
  visitorId: string;
  spotName: string;
  floor: FloorNumber;
  method: 'quiz' | 'code' | 'qr' | 'manual';
  isMilestone?: boolean;
  milestoneText?: string;
}

export interface CampusAnnouncement {
  id: string;
  text: string;
  active: boolean;
  priority: 'normal' | 'urgent';
  updatedAt: number;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  floor: string;
  place: string;
  description?: string;
}

export interface ParticipantStampProgress {
  id: string;
  visitorId: string;
  nickname: string;
  checkedInAt: number;
  collectedSpotIds: string[];
  redeemedTierIds: string[];
  lastActive: number;
}

