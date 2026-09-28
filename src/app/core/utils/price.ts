import { appLocale } from './locale';

export function formatPrice(
  amount: number,
  code = 'EGP',
  rate = 1,
): string {
  const base = Number(amount) || 0;
  const value = base * (Number(rate) || 1);
  const locale = appLocale() === 'ar' ? 'ar-EG-u-nu-latn' : 'en-US';
  return `${value.toLocaleString(locale, { maximumFractionDigits: 2 })} ${code}`;
}

export function formatCurrencyCode(code: string): string {
  return code ? String(code).toUpperCase() : 'EGP';
}

export interface PriceLike {
  price: number;
  salePrice?: number;
}

export function effectivePrice(p: PriceLike | null | undefined): number {
  const price = Number(p?.price) || 0;
  const sale = Number(p?.salePrice) || 0;
  return sale > 0 && sale < price ? sale : price;
}

export function onSale(p: PriceLike | null | undefined): boolean {
  const price = Number(p?.price) || 0;
  const sale = Number(p?.salePrice) || 0;
  return price > 0 && sale > 0 && sale < price;
}