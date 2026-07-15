export type NotificationType =
  | 'table-transfer'
  | 'item-moved'
  | 'new-item-added'
  | 'course-fired'
  | 'general-alert'
  | 'overtime'
  | 'new-order'
  | 'recalled'
  | 'low-stock'
  | 'pos-86d'
  | 'system';

export type StationTag =
  | 'Grill'
  | 'Fry'
  | 'Salad'
  | 'Dessert'
  | 'Bar'
  | 'Kitchen'
  | 'Expo'
  | 'All';

export interface KDSNotification {
  id: string;
  type: NotificationType;
  message: string;
  station: StationTag;
  timestamp: Date;
  acknowledged: boolean;
  acknowledged_at?: Date;
  acknowledged_by?: string;
}
