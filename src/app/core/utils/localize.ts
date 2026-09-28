import { Category, ContentSection, Order, PageContent, Product, User } from '../models';
import { appLocale } from './locale';

type LocalizedText = string | { en?: string; ar?: string };

export function pickText(value: LocalizedText | null | undefined): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  return appLocale() === 'ar' ? value.ar || value.en || '' : value.en || value.ar || '';
}

export function normalizeUser(raw: any): User {
  return {
    id: raw.id ?? raw._id,
    name: pickText(raw.name),
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    phoneDialCode: raw.phoneDialCode,
    street: raw.street ?? '',
    apartment: raw.apartment ?? '',
    city: typeof raw.city === 'object' ? pickText(raw.city) : (raw.city ?? ''),
    zip: raw.zip ?? '',
    country: typeof raw.country === 'object' ? pickText(raw.country) : (raw.country ?? ''),
    isAdmin: raw.isAdmin ?? false,
  } as User;
}

export function normalizeProduct(raw: any): Product {
  return {
    id: raw.id ?? raw._id,
    name: pickText(raw.name),
    description: pickText(raw.description),
    richDescription: pickText(raw.richDescription),
    image: raw.image ?? { url: '', publicId: '' },
    images: raw.images ?? [],
    brand: pickText(raw.brand),
    price: raw.price ?? 0,
    salePrice: raw.salePrice ?? 0,
    category: raw.category && typeof raw.category === 'object' ? normalizeCategory(raw.category) : (raw.category ?? ''),
    countInStock: raw.countInStock ?? 0,
    rating: raw.rating ?? 0,
    numbReviews: raw.numbReviews ?? 0,
    isFeatured: raw.isFeatured ?? false,
    dateCreated: raw.dateCreated ?? '',
    color: raw.color,
  } as Product;
}

export function normalizeCategory(raw: any): Category {
  return {
    id: raw.id ?? raw._id,
    name: pickText(raw.name),
    color: raw.color ?? '',
    icon: raw.icon ?? '',
    image: raw.image,
  } as Category;
}

function normalizeContentSection(raw: any): ContentSection {
  return {
    heading: pickText(raw.heading),
    body: raw.body ? pickText(raw.body) : undefined,
    links: Array.isArray(raw.links)
      ? raw.links.map((l: any) => ({ label: pickText(l.label), href: l.href || '' }))
      : undefined,
  };
}

export function normalizeContentPage(raw: any): PageContent {
  return {
    id: raw.id ?? raw._id,
    key: raw.key ?? '',
    title: pickText(raw.title),
    subtitle: raw.subtitle ? pickText(raw.subtitle) : undefined,
    tagline: raw.tagline ? pickText(raw.tagline) : undefined,
    image: raw.image,
    sections: Array.isArray(raw.sections)
      ? raw.sections.map(normalizeContentSection)
      : [],
    contact: raw.contact,
    updatedAt: raw.updatedAt,
  } as PageContent;
}

export function normalizeOrder(raw: any): Order {
  if (!raw || typeof raw !== 'object') {
    return { id: raw, orderItems: [] } as unknown as Order;
  }
  const order = { ...raw, id: raw.id ?? raw._id };
  if (Array.isArray(raw.orderItems)) {
    order.orderItems = raw.orderItems
      .filter((item: any) => item && typeof item === 'object')
      .map((item: any) => ({
        ...item,
        id: item.id ?? item._id,
        product:
          item.product && typeof item.product === 'object'
            ? normalizeProduct(item.product)
            : item.product,
      }));
  }
  if (order.user && typeof order.user === 'object') {
    order.user = order.user.id ?? order.user;
  }
  order.shippingFee = raw.shippingFee ?? 0;
  order.discount = raw.discount ?? 0;
  return order;
}
