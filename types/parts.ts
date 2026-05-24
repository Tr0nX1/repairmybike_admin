import type { OrderPaymentStatus, OrderStatus } from './enums';

export interface SparePartImage {
  id: number;
  image: string;
  image_url: string;
  is_primary: boolean;
  alt_text: string;
  sort_order: number;
}

export interface SparePart {
  id: number;
  name: string;
  sku: string;
  sale_price: string;
  stock_qty: number;
  in_stock: boolean;
  category: number;
  brand: number;
  thumbnail?: {
    thumbnail: string;
    original: string;
    alt_text: string;
  };
  thumbnail_url?: string;
  images?: SparePartImage[];
}

export interface CartItem {
  id: number;
  spare_part: SparePart;
  quantity: number;
  unit_price: string;
}

export interface OrderItem {
  id: number;
  spare_part: number | SparePart;
  part_name?: string;
  sku?: string;
  quantity: number;
  unit_price: string;
  total_price?: string;
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
  payment_status: OrderPaymentStatus;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  tracking_number?: string | null;
  courier_name?: string | null;
  estimated_delivery?: string | null;
  delivered_at?: string | null;
}

export interface StockUpdatePayload {
  part_id: number;
  quantity: number;
  action: 'add' | 'remove' | 'set';
}
