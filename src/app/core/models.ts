export interface Product {
  id: string;
  name: string;
  description: string;
  richDescription: string;
  image: { url: string; publicId: string };
  images: { url: string; publicId: string }[];
  brand: string;
  price: number;
  category: string | Category;
  countInStock: number;
  rating: number;
  numbReviews: number;
  isFeatured: boolean;
  dateCreated: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  street: string;
  apartment: string;
  city: string;
  zip: string;
  country: string;
  isAdmin: boolean;
}

export interface LoginResponse {
  user: string;
  token: string;
  id: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface Review {
  id: string;
  user: string | { id: string; name: string };
  product: string;
  rating: number;
  comment: string;
  dateCreated: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  validFrom?: string;
  validUntil?: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  apartment: string;
  city: string;
  zip: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export type AddressInput = Omit<Address, 'id'>;

export interface OrderItem {
  id: string;
  quantity: number;
  product: Product;
}

export interface Order {
  id: string;
  orderItems: OrderItem[];
  shippingAddress1: string;
  shippingAddress2: string;
  city: string;
  country: string;
  phone: string;
  status: string;
  paymentStatus: 'unpaid' | 'paid' | 'failed' | 'refunded';
  paymentId: string;
  couponCode: string;
  discount: number;
  totalPrice: number;
  user: string;
  dateOrdered: string;
}

export interface CheckoutRequest {
  orderItems: { product: string; quantity: number }[];
  shippingAddress: {
    street: string;
    apartment: string;
    city: string;
    zip: string;
    country: string;
    phone: string;
  };
  couponCode?: string;
  customerEmail?: string;
}

export interface CheckoutResponse {
  sessionId: string;
  orderId: string;
}

export interface ContentSection {
  heading: string;
  body: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  social: { facebook?: string; instagram?: string; twitter?: string; whatsapp?: string };
}

export interface PageContent {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  image?: { url: string; publicId?: string };
  sections: ContentSection[];
  contact?: ContactInfo;
  updatedAt?: string;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
