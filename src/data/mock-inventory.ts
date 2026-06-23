// Mock per-item inventory for the AI ETA / 86 demo screen.
import type { InventoryItem } from '@/types/ai';

export const mockInventory: InventoryItem[] = [
  { itemName: 'Filet Mignon', portionsRemaining: 3, startingPortions: 12, station: 'Grill' },
  { itemName: 'Grilled Salmon', portionsRemaining: 1, startingPortions: 10, station: 'Grill' },
  { itemName: 'Meatballs', portionsRemaining: 8, startingPortions: 20, station: 'Grill' },
  { itemName: 'Tres Leches', portionsRemaining: 2, startingPortions: 8, station: 'Dessert' },
  { itemName: 'Caesar Salad', portionsRemaining: 14, startingPortions: 30, station: 'Salad' },
  { itemName: 'Truffle Fries', portionsRemaining: 6, startingPortions: 25, station: 'Fry' },
  { itemName: 'Margherita Pizza', portionsRemaining: 9, startingPortions: 20, station: 'Kitchen' },
];
