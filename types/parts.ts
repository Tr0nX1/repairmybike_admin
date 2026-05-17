export interface SparePart {
  id: number;
  name: string;
  sku: string;
  sale_price: string;
  stock_qty: number;
  in_stock: boolean;
  category: number;
  brand: number;
}

export interface CartItem {
  id: number;
  spare_part: SparePart;
  quantity: number;
  unit_price: string;
}

export interface OrderItem {
  id: number;
  spare_part: SparePart;
  quantity: number;
  unit_price: string;
}

export interface Order {
  id: number;
  session_id: string;
  user?: number;
  customer_name: string;
  phone: string;
  address: string;
  amount_total: string;
  currency: string;
  payment_method: string;
  payment_status: string;
  status: 'created' | 'confirmed' | 'fulfilled' | 'cancelled';
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface StockUpdatePayload {
  part_id: number;
  quantity: number;
  action: 'add' | 'remove' | 'set';
}
