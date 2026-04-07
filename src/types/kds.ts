export type OrderType = 'dine-in' | 'take-out' | 'delivery' | 'banquet';
export type OrderStatus = 'new' | 'in-progress' | 'seen' | 'served' | 'overtime' | 'cancelled' | 'recalled';
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
  text: string;
  type: 'extra' | 'remove' | 'neutral';
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  category?: ProductCategory;
  modifiers: Modifier[];
  allergens: Allergen[];
  isCancelled?: boolean;
  isCompleted?: boolean;
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
  timeReceived: Date;
  elapsedSeconds: number;
  targetSeconds: number;
  courses: CourseGroup[];
  itemCount: number;
}

export type ViewMode = 'grid' | 'horizontal' | 'stagger';
export type SortMode = 'time' | 'table' | 'type';

export interface KDSFilter {
  categories: string[];
  revenueCenters: string[];
  statusFilter: 'all' | 'new' | 'in-progress' | 'completed';
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
  statusBadge: 'In Progress' | 'Overtime' | 'Done';
  courses: CourseBlock[];
}
