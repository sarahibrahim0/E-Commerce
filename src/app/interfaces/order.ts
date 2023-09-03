import { Product } from './product';
import { User } from './user';
export class Order {
  id?: string;
  orderItems?: OrderItem[];
  shippingAddress1?: string;
  shippingAddress2?: string;
  city?: string;
  zip?: string;
  country?: string;
  phone?: string;
  status?: string;
  totalPrice?: string;
  user?:any;
  dateOrdered?: string;
}

export class OrderItem {
    product?: any;
    quantity?: number;
  }
