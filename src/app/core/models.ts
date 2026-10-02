export interface Product {
  id: string;
  name: string;
  description: string;
  richDescription: string;
  image: { url: string; publicId: string };
  images: { url: string; publicId: string }[];
  brand: string;
  price: number;
  salePrice: number;
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
  image?: { url: string; publicId: string };
  isActive?: boolean;
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
  phoneDialCode?: string;
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
  refreshToken?: string;
  userId: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  phoneDialCode?: string;
  password: string;
}

export interface Review {
  id: string;
  user: string | { id: string; name: string; image?: string | { url?: string }; avatar?: string | { url?: string } };
  product: string;
  rating: number;
  comment: string;
  verifiedPurchase?: boolean;
  dateCreated: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minSubtotal: number;
  productIds?: string[];
  categoryIds?: string[];
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
  currency?: string;
  paymentMethod?: string;
  couponCode: string;
  discount: number;
  shippingFee?: number;
  totalPrice: number;
  user: string;
  dateOrdered: string;
}

export interface ShippingRate {
  label: string;
  city: string;
  country: string;
  rate: number;
}

export interface ShippingConfig {
  id: string;
  freeShippingThreshold: number;
  baseRate: number;
  distanceRate?: number;
  originLatitude?: number;
  originLongitude?: number;
  currency: string;
  rates: ShippingRate[];
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
    latitude?: number;
    longitude?: number;
  };
  couponCode?: string;
  customerEmail?: string;
  paymentMethod?: string;
}

export interface CheckoutResponse {
  sessionId: string | null;
  orderId: string;
  gateway?: string;
  currency?: string;
  paymentUrl?: string | null;
}

export interface ContentSectionLink {
  label: string;
  href: string;
}

export interface ContentSection {
  heading: string;
  body?: string;
  links?: ContentSectionLink[];
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
  tagline?: string;
  image?: { url: string; publicId?: string };
  sections: ContentSection[];
  contact?: ContactInfo;
  updatedAt?: string;
}

export type LocalizedText = string | { en?: string; ar?: string };

export interface SiteSettings {
  title: LocalizedText;
  description: LocalizedText;
  keywords: LocalizedText;
  about: LocalizedText;
  faq: LocalizedText;
  terms: LocalizedText;
  logoUrl: string;
  faviconUrl: string;
  socialImageUrl: string;
  canonicalUrl: string;
  footerAddress: string;
  footerPhone: string;
  footerEmail: string;
  footerWhatsapp: string;
  businessHours: string;
  footerFacebook: string;
  footerTwitter: string;
  footerInstagram: string;
  footerAboutEn: string;
  footerAboutAr: string;
  footerCategories: string[];
  defaultCurrency: string;
  enableCashOnDelivery: boolean;
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export interface ServerCountry {
  id: string;
  code: string;
  phoneCode: string;
  flag: string;
  name: { en: string; ar: string };
  currencyId?: { id: string; code: string; symbol: string } | null;
  paymentMethods?: ServerPaymentMethod[];
}

export interface ServerCurrency {
  id: string;
  code: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
  name?: { en: string; ar: string };
}

export interface ServerPaymentMethod {
  id: string;
  code: string;
  name: { en: string; ar: string };
  description?: { en: string; ar: string };
  icon: string;
  color: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪' },
  { name: 'Kuwait', code: 'KW', dialCode: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: 'QA', dialCode: '+974', flag: '🇶🇦' },
  { name: 'Bahrain', code: 'BH', dialCode: '+973', flag: '🇧🇭' },
  { name: 'Oman', code: 'OM', dialCode: '+968', flag: '🇴🇲' },
  { name: 'Jordan', code: 'JO', dialCode: '+962', flag: '🇯🇴' },
  { name: 'Lebanon', code: 'LB', dialCode: '+961', flag: '🇱🇧' },
  { name: 'Iraq', code: 'IQ', dialCode: '+964', flag: '🇮🇶' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦' },
  { name: 'Tunisia', code: 'TN', dialCode: '+216', flag: '🇹🇳' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: '🇩🇿' },
  { name: 'Libya', code: 'LY', dialCode: '+218', flag: '🇱🇾' },
  { name: 'Sudan', code: 'SD', dialCode: '+249', flag: '🇸🇩' },
  { name: 'Palestine', code: 'PS', dialCode: '+970', flag: '🇵🇸' },
  { name: 'Yemen', code: 'YE', dialCode: '+967', flag: '🇾🇪' },
  { name: 'Syria', code: 'SY', dialCode: '+963', flag: '🇸🇾' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷' },
  { name: 'Turkey', code: 'TR', dialCode: '+90', flag: '🇹🇷' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳' },
];
