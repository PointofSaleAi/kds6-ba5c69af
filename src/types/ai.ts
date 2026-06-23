// AI-First feature types. Scoped to the /kds/ai route tree.
import type { AllergenType, StationName } from '@/types/kds';

export type AllergenSeverity = 'preference' | 'medium' | 'high';

export interface AllergenAi {
  type: AllergenType | string;
  label: string;
  severity: AllergenSeverity;
}

export interface IngredientProfile {
  ingredients: string[];
  hiddenAllergens: AllergenType[];
}

export interface ModifierConflict {
  itemName: string;
  modifier: string;
  ingredient: string;
  reason: string;
}

export interface PrepPrediction {
  itemId: string;
  itemName: string;
  station: StationName | 'Kitchen';
  predictedSeconds: number;
  confidence: number;
}

export interface FireRecommendation {
  orderId: string;
  orderNumber: number;
  tableName: string;
  itemId: string;
  itemName: string;
  station: StationName | 'Kitchen';
  fireInSeconds: number;
  reason: string;
}

export interface NudgeEvent {
  orderId: string;
  orderNumber: number;
  tableName: string;
  secondsToRed: number;
  reason: string;
}

export interface StationLoad {
  station: string;
  queuedSeconds: number;
  capacitySeconds: number;
  loadRatio: number;
}

export interface EtaQuote {
  orderId: string;
  orderNumber: number;
  tableName: string;
  quotedSeconds: number;
  aiEtaSeconds: number;
  deltaSeconds: number;
}

export interface InventoryItem {
  itemName: string;
  portionsRemaining: number;
  startingPortions: number;
  station: StationName | 'Kitchen';
}

export interface VoiceIntent {
  action: 'bump' | 'recall' | 'filter' | 'eta' | 'unknown';
  params: Record<string, string | number>;
  rawText: string;
  needsConfirmation?: boolean;
}

export interface RemakeEvent {
  id: string;
  itemName: string;
  reason: string;
  timestamp: Date;
  station: string;
}

export interface ServiceMetrics {
  avgTicketSeconds: number;
  baselineTicketSeconds: number;
  stationDeltas: { station: string; deltaSeconds: number }[];
  remakeCount: number;
  peakWindow: string;
  totalOrders: number;
}

export interface ServiceDigest {
  headline: string;
  bullets: string[];
  generatedAt: Date;
}
