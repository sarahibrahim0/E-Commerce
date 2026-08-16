export function formatPrice(amount: number): string {
  return `${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} EGP`;
}
