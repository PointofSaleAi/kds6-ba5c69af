// TODO: Replace with API endpoint - all data should come from backend

export interface KitchenMessage {
  message_id: string;
  message_text: string;
  employee_name: string;
  employee_role?: string;
  terminal_name?: string;
  linked_order_id?: string;
  linked_order_number?: number;
  table_number?: string;
  timestamp: Date;
  status: 'pending' | 'acknowledged';
  acknowledged_at?: Date;
}

export interface KitchenReply {
  reply_id: string;
  message_id: string;
  reply_text: string;
  employee_name?: string;
  timestamp: Date;
  source: 'kds';
}
