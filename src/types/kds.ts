export type OrderType = 'dine-in' | 'take-out' | 'delivery' | 'banquet' | 'drive-thru' | 'curb-side' | 'scheduled' | 'phone-in' | 'custom';
export type OrderStatus = 'new' | 'preparing' | 'seen' | 'served' | 'overtime' | 'cancelled' | 'recalled';
export type CourseType = 'APPETIZER' | 'SALAD' | 'ENTREE' | 'DESSERT' | 'BEVERAGE';
export type TimerUrgency = 'ok' | 'warning' | 'critical' | 'overtime';
export type AllergenType = 'peanut' | 'gluten' | 'dairy' | 'shellfish' | 'soy' | 'egg' | 'tree-nut' | 'sesame';

export type ProductCategory =
  | 'Seafood'
  | 'Meat'
  | 'Poultry'
  | 'Pasta'
  | 'Salads'
  | 'Sides'
  | 'Desserts'
  | 'Soups'
  | 'Pizza'
  | 'Sandwiches'
  | 'Appetizers'
  | 'Vegetarian'
  | 'Beverages';

export interface Allergen {
  type: AllergenType;
  label: string;
  icon: string;
}

export interface Modifier {
  id?: string;
  text: string;
  type: 'extra' | 'remove' | 'neutral';
  isServable?: boolean;
}

export type StationName = 'Grill' | 'Fry' | 'Salad' | 'Dessert' | 'Bar';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category?: ProductCategory;
  modifiers: Modifier[];
  allergens: Allergen[];
  notes?: string;
  isCancelled?: boolean;
  isCompleted?: boolean;
  station?: StationName;
  /** Newly added from POS to an existing ticket */
  isNew?: boolean;
  /** Recalled from history */
  isRecalled?: boolean;
  /** Item is flagged to-go within an otherwise dine-in order */
  isToGo?: boolean;
  /** Item flagged as 86'd (out of stock) — shows red circle button */
  is86Flagged?: boolean;
}

export interface CourseGroup {
  course: CourseType;
  items: OrderItem[];
  isFired?: boolean;
  /** Time since course was fired */
  firedAgoLabel?: string;
  /** Static prep timer label (legacy) */
  prepTimerLabel?: string;
  /** Static auto-fire label (legacy) */
  autoFireLabel?: string;
  /** Dynamic: seconds until this course should fire (countdown). Negative = overdue */
  fireInSeconds?: number;
  /** Dynamic: timestamp when course was fired */
  firedAt?: Date;
  /** Dynamic: target seconds for auto-fire from previous course firing */
  autoFireTargetSeconds?: number;
  /** Internal: timestamp when this course status started (for live countdown) */
  _startedAt?: Date;
}

export interface Order {
  id: string;
  orderNumber: number;
  orderType: OrderType;
  status: OrderStatus;
  tableName: string;
  serverName: string;
  guestName?: string;
  timeReceived: Date;
  elapsedSeconds: number;
  targetSeconds: number;
  courses: CourseGroup[];
  itemCount: number;
  orderNotes?: string;
  sourceHistoryOrderId?: string;
  /** Set by Expo Rush - triggers visual + audio alert on KDS */
  isRushed?: boolean;
  /** Optional customer contact info (used for Online Order / Delivery scenarios) */
  customerName?: string;
  customerPhone?: string;
}

export type ViewMode = 'grid' | 'horizontal' | 'stagger';
export type SortMode = 'newest' | 'oldest' | 'table' | 'type';

export interface KDSFilter {
  categories: string[];
  revenueCenters: string[];
  statusFilter: 'all' | 'new' | 'preparing' | 'completed';
}

/* ── Coursing types ── */

export type CourseStatus = 'fired' | 'active' | 'pending';

export interface CourseBlock {
  id: string;
  name: string;
  status: CourseStatus;
  firedAgoLabel?: string;
  prepTimerLabel?: string;
  autoFireLabel?: string;
  items: OrderItem[];
}

export interface KDSOrder {
  id: string;
  orderNumber: number;
  orderType: 'Dine In' | 'Banquet' | 'Take Out';
  tableOrLocation: string;
  elapsedTimer: string;
  waiterName: string;
  statusBadge: 'Preparing' | 'Overtime' | 'Done';
  courses: CourseBlock[];
}
