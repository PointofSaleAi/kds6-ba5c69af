export type OrderType = 'dine-in' | 'take-out' | 'delivery' | 'banquet';
export type OrderStatus = 'new' | 'in-progress' | 'seen' | 'served' | 'overtime' | 'cancelled' | 'recalled';
export type CourseType = 'APPETIZER' | 'SALAD' | 'ENTREE' | 'DESSERT' | 'BEVERAGE';
export type TimerUrgency = 'ok' | 'warning' | 'critical' | 'overtime';
export type AllergenType = 'peanut' | 'gluten' | 'dairy' | 'shellfish' | 'soy' | 'egg' | 'tree-nut' | 'sesame';

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
  modifiers: Modifier[];
  allergens: Allergen[];
  isCancelled?: boolean;
  isCompleted?: boolean;
}

export interface CourseGroup {
  course: CourseType;
  items: OrderItem[];
  isFired?: boolean;
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
