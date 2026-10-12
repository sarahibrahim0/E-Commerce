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

const AR_NAME: Record<string, string> = {
  'Zoe Wardrobe': 'خزانة زوي',
  'Juno Planter': 'زُرّاعة جونو',
  'Terra Outdoor Set': 'طقم تيرا الخارجي',
  'Noor Side Table': 'طاولة جانبية نور',
  'Vera Wall Mirror': 'مرآة حائط فيرا',
  'Sela Pendant Light': 'ثريا معلقة سيلا',
  'Eto Floor Lamp': 'أباجورة أرضية إيتو',
  'Lima Bookshelf': 'مكتبة ليما',
  'Ergo Office Chair': 'كرسي مكتب إرجو',
  'Granville Desk': 'مكتب جرانفيل',
  'Kenzi Bar Stool': 'كرسي بار كِنزي',
  'Fane Buffet': 'بوفيه فاين',
  'Prim Dining Chair': 'كرسي طعام بريم',
  'Dio Dining Table': 'طاولة طعام ديو',
  'Maia Bedside Lamp': 'أباجورة سرير مايا',
  'Clyde Nightstand': 'منضدة جانبية كلايد',
  'Rowan Dresser': 'تسريحة روان',
  'Nellie Bed': 'سرير نيلي',
  'Aria Bed Frame': 'هيكل سرير آريا',
  'Owyn TV Stand': 'ستاند تلفزيون أوين',
  'Claude Coffee Table': 'طاولة قهوة كلود',
  'Haven Armchair': 'كرسي استرخاء هيفن',
  'Valeon Sofa': 'كنبة فالون',
  'Louisa Sofa': 'كنبة لويزا',
};

const AR_COLOR: Record<string, string> = {
  Oak: 'بلوطي',
  Terracotta: 'طيني',
  Grey: 'رمادي',
  Marble: 'رخامي',
  Gold: 'ذهبي',
  'Matte Black': 'أسود مطفي',
  Walnut: 'جوزي',
  Black: 'أسود',
  Brown: 'بني',
  Brass: 'نحاسي',
  White: 'أبيض',
  Ivory: 'عاجي',
  Beige: 'بيج',
};

const AR_BRAND: Record<string, string> = {
  'Nathalie Home': 'ناتالي هوم',
  'Outdoor Living': 'أوت دور ليفينج',
  Modular: 'موديولر',
  Rove: 'روف',
  Lume: 'لوم',
  ErgoWorks: 'إرجو ووركس',
  'Paola & Pia': 'باولا و بييا',
};

const AR_CATEGORY: Record<string, string> = {
  Storage: 'تخزين',
  Outdoor: 'خارجي',
  Decor: 'ديكور',
  Lighting: 'إضاءة',
  Office: 'مكتب',
  'Dining Room': 'غرفة طعام',
  Bedroom: 'غرفة نوم',
  'Living Room': 'غرفة معيشة',
};

const AR_ROOM: Record<string, string> = {
  Storage: 'تخزين',
  Outdoor: 'خارجية',
  Decor: 'ديكور',
  Lighting: 'إضاءة',
  Office: 'مكتب',
  'Dining Room': 'لغرفة الطعام',
  Bedroom: 'لغرفة النوم',
  'Living Room': 'لغرفة المعيشة',
};

const AR_ABOUT_TEXT: Record<string, string> = {
  // about — title & subtitle (backend stores locale-agnostic strings)
  'We craft comfort, delivered with care': 'نصنع الراحة، ونُوصِلها بعناية',
  'A thoughtfully curated collection of furniture and everyday essentials for modern Egyptian homes.':
    'مجموعة مختارة بعناية من الأثاث والأساسيات اليومية للمنازل المصرية العصرية.',
  // about — section headings
  'Our story': 'قصتنا',
  'Our values': 'قيمنا',
  'Fast and safe delivery': 'توصيل سريع وآمن',
  'Fair pricing': 'أسعار عادلة',
  'Real support': 'دعم حقيقي',
  'Selected quality': 'جودة منتقاة',
  // about — section bodies
  'We started with a simple goal: bring quality furniture within reach of every home, with honest prices and a smooth shopping experience.':
    'بدأنا بهدف بسيط: أن نوفر أثاثًا بجودة عالية وبأسعار منصفة لكل منزل، مع تجربة تسوق سلسة وصادقة.',
  'Quality first, transparent pricing, and a real care for every order. We only list products we would proudly put in our own homes.':
    'الجودة أولًا، والأسعار الواضحة، والاهتمام الحقيقي بكل طلب. نعرض فقط منتجات نفخر بأن نضعها في منازلنا.',
  'We deliver across Egypt with careful packaging and live order tracking, so you always know where your order is.':
    'نوصل لجميع محافظات مصر بتغليف آمن وتتبع مباشر للطلب، لتعرف مكان طلبك في أي وقت.',
  'No inflated price tags. Our prices reflect real value, and we always show any offers before you check out.':
    'لا أسعار مبالغ فيها. أسعارنا تعكس القيمة الحقيقية، ونعرض كل العروض قبل إتمام الشراء.',
  'Our team answers your questions before and after purchase, and helps with returns and exchanges when needed.':
    'فريقنا يرد على استفساراتك قبل وبعد الشراء، ويساعدك في الاستبدال والاسترجاع عند الحاجة.',
  'Every product is chosen for durability, comfort and design. We test what we list so you can buy with confidence.':
    'كل منتج يُختار بعناية من حيث المتانة والراحة والتصميم. نختبر ما نعرضه لتشتري بكل ثقة.',
};

const AR_CONTACT_TEXT: Record<string, string> = {
  '123 Commerce Street, New York, NY 10001': 'شارع كوميرس 123، نيويورك، الولايات المتحدة',
  'Main Street, Cairo, Egypt': 'شارع ماين، القاهرة، مصر',
  'Sat - Thu: 9:00 AM - 9:00 PM': 'السبت - الخميس: 9:00 صباحًا حتى 9:00 مساءً',
};

const DESC_EN_RE =
  /^Premium (.+) piece from our (.+) collection\. Built with quality materials for lasting comfort and style\.$/;
const RICH_EN_RE =
  /^Crafted with care, the (.+) brings modern elegance to any space\. Solid construction, easy assembly, and backed by our quality guarantee\.$/;

function arOrDefault(value: string, overrides: Record<string, string>): string {
  if (appLocale() !== 'ar') return value;
  return overrides[value] ?? value;
}

function arDescription(value: string): string {
  if (appLocale() !== 'ar') return value;
  const m = DESC_EN_RE.exec(value);
  if (!m) return value;
  const room = AR_ROOM[m[1]];
  const brand = AR_BRAND[m[2]];
  if (!room || !brand) return value;
  return `قطعة ${room} فاخرة من مجموعة ${brand}. صُنعت بخامات عالية الجودة لضمان الراحة والأناقة وطول العمر.`;
}

function arRichDescription(value: string, nameEn: string): string {
  if (appLocale() !== 'ar') return value;
  const m = RICH_EN_RE.exec(value);
  if (!m) return value;
  const nameAr = AR_NAME[m[1]] || AR_NAME[nameEn];
  if (!nameAr) return value;
  return `صُنعت بعناية، وتضيف قطعة ${nameAr} لمسة أناقة عصرية لأي مساحة في منزلك. بتصميم متين وتجميع سهل، ومدعومة بضمان جودة كامل.`;
}

export function normalizeProduct(raw: any): Product {
  const nameEn = pickText(raw.name);
  const image = raw.image;
  const imageUrl = typeof image === 'string' ? image : image?.url ?? '';
  return {
    id: raw.id ?? raw._id,
    name: arOrDefault(nameEn, AR_NAME),
    description: arDescription(pickText(raw.description)),
    richDescription: arRichDescription(pickText(raw.richDescription), nameEn),
    image: raw.image ?? { url: '', publicId: '' },
    images: raw.images && raw.images.length > 0
      ? raw.images
      : imageUrl
        ? [{ url: imageUrl, publicId: image?.publicId ?? '' }]
        : [],
    brand: arOrDefault(pickText(raw.brand), AR_BRAND),
    price: raw.price ?? 0,
    salePrice: raw.salePrice ?? 0,
    category: raw.category && typeof raw.category === 'object' ? normalizeCategory(raw.category) : (raw.category ?? ''),
    countInStock: raw.countInStock ?? 0,
    rating: raw.rating ?? 0,
    numbReviews: raw.numbReviews ?? 0,
    isFeatured: raw.isFeatured ?? false,
    dateCreated: raw.dateCreated ?? '',
    color: arOrDefault(pickText(raw.color), AR_COLOR),
  } as Product;
}

export function normalizeCategory(raw: any): Category {
  return {
    id: raw.id ?? raw._id,
    name: arOrDefault(pickText(raw.name), AR_CATEGORY),
    color: raw.color ?? '',
    icon: raw.icon ?? '',
    image: raw.image,
    // Matches the backend `activeFlag` default: a missing flag counts as active.
    isActive: raw.isActive !== false,
  } as Category;
}

function normalizeContentSection(raw: any): ContentSection {
  return {
    heading: arOrDefault(pickText(raw.heading), AR_ABOUT_TEXT),
    body: raw.body ? arOrDefault(pickText(raw.body), AR_ABOUT_TEXT) : undefined,
    links: Array.isArray(raw.links)
      ? raw.links.map((l: any) => ({ label: pickText(l.label), href: l.href || '' }))
      : undefined,
  };
}

export function normalizeContentPage(raw: any): PageContent {
  return {
    id: raw.id ?? raw._id,
    key: raw.key ?? '',
    title: arOrDefault(pickText(raw.title), AR_ABOUT_TEXT),
    subtitle: raw.subtitle ? arOrDefault(pickText(raw.subtitle), AR_ABOUT_TEXT) : undefined,
    tagline: raw.tagline ? pickText(raw.tagline) : undefined,
    image: raw.image,
    sections: Array.isArray(raw.sections)
      ? raw.sections.map(normalizeContentSection)
      : [],
    contact: raw.contact
      ? {
          ...raw.contact,
          address: raw.contact.address ? arOrDefault(pickText(raw.contact.address), AR_CONTACT_TEXT) : undefined,
          workingHours: raw.contact.workingHours ? arOrDefault(pickText(raw.contact.workingHours), AR_CONTACT_TEXT) : undefined,
        }
      : undefined,
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
