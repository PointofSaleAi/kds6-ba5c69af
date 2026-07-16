import type { TicketsRouteKey } from '@/hooks/use-kds-settings';

import boardMainPrep from '@/assets/kds-boards/board-83338f0c.webp.asset.json';
import boardExpoFocus from '@/assets/kds-boards/board-9feafe77.webp.asset.json';
import boardDistanceGrid from '@/assets/kds-boards/board-2575e424.webp.asset.json';
import boardCourseFlow from '@/assets/kds-boards/board-572ab344.webp.asset.json';
import boardSafetyQueue from '@/assets/kds-boards/board-40961bf9.webp.asset.json';
import boardTimelineLanes from '@/assets/kds-boards/board-69f8644c.webp.asset.json';
import boardRushAdaptive from '@/assets/kds-boards/board-806f4d3b.webp.asset.json';
import boardDarkOps from '@/assets/kds-boards/board-45c0fdb2.webp.asset.json';
import boardMainPrepClassic from '@/assets/kds-boards/board-8326305c.webp.asset.json';
import boardExpoFocusClassic from '@/assets/kds-boards/board-8b1fccc4.webp.asset.json';
import boardDistanceClassic from '@/assets/kds-boards/board-4122b998.webp.asset.json';
import boardCourseFlowClassic from '@/assets/kds-boards/board-128d881a.webp.asset.json';
import boardSafetyClassic from '@/assets/kds-boards/board-0aa736e9.webp.asset.json';
import boardTimelineClassic from '@/assets/kds-boards/board-3e4330d1.webp.asset.json';
import boardRushClassic from '@/assets/kds-boards/board-4088c3d3.webp.asset.json';
import boardDarkOpsClassic from '@/assets/kds-boards/board-efdc8198.webp.asset.json';

export type KdsBoardTheme = 'light' | 'dark';

export interface KdsBoardDefinition {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  theme: KdsBoardTheme;
  route: TicketsRouteKey;
}

export const KDS_BOARDS: KdsBoardDefinition[] = [
  { id: 'main-prep', name: 'Main Prep', description: 'Balanced service', imageUrl: boardMainPrep.url, theme: 'light', route: 'v3' },
  { id: 'expo-focus', name: 'Expo Focus', description: 'Selected order', imageUrl: boardExpoFocus.url, theme: 'light', route: 'v1' },
  { id: 'distance-grid', name: 'Distance Grid', description: 'Across the kitchen', imageUrl: boardDistanceGrid.url, theme: 'light', route: 'v8' },
  { id: 'course-flow', name: 'Course Flow', description: 'Coursed service', imageUrl: boardCourseFlow.url, theme: 'light', route: 'v9' },
  { id: 'safety-queue', name: 'Safety Queue', description: 'Allergen control', imageUrl: boardSafetyQueue.url, theme: 'dark', route: 'v11' },
  { id: 'timeline-lanes', name: 'Timeline Lanes', description: 'SLA workflow', imageUrl: boardTimelineLanes.url, theme: 'light', route: 'v12' },
  { id: 'rush-adaptive', name: 'Rush Adaptive', description: 'Changing volume', imageUrl: boardRushAdaptive.url, theme: 'light', route: 'v13' },
  { id: 'dark-ops', name: 'Dark Ops', description: 'Low light service', imageUrl: boardDarkOps.url, theme: 'dark', route: 'v14' },
  { id: 'main-prep-classic', name: 'Main Prep Classic', description: 'Detailed service', imageUrl: boardMainPrepClassic.url, theme: 'light', route: 'Default' },
  { id: 'expo-focus-classic', name: 'Expo Focus Classic', description: 'Priority lane', imageUrl: boardExpoFocusClassic.url, theme: 'light', route: 'v2' },
  { id: 'distance-classic', name: 'Distance Classic', description: 'Large ticket type', imageUrl: boardDistanceClassic.url, theme: 'light', route: 'v4' },
  { id: 'course-flow-classic', name: 'Course Flow Classic', description: 'Progressive detail', imageUrl: boardCourseFlowClassic.url, theme: 'light', route: 'v5' },
  { id: 'safety-classic', name: 'Safety Classic', description: 'Critical alerts', imageUrl: boardSafetyClassic.url, theme: 'dark', route: 'v6' },
  { id: 'timeline-classic', name: 'Timeline Classic', description: 'Production stages', imageUrl: boardTimelineClassic.url, theme: 'light', route: 'v7' },
  { id: 'rush-classic', name: 'Rush Classic', description: 'Mixed density', imageUrl: boardRushClassic.url, theme: 'light', route: 'v10' },
  { id: 'dark-ops-classic', name: 'Dark Ops Classic', description: 'Dark command view', imageUrl: boardDarkOpsClassic.url, theme: 'dark', route: 'v14' },
];

export function getBoardById(id: string): KdsBoardDefinition | undefined {
  return KDS_BOARDS.find((b) => b.id === id);
}
