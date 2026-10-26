export interface DiscountTier {
  above: number;
  rate: number;
}

export const DISCOUNT_TIERS: readonly DiscountTier[] = [
  { above: 15, rate: 0.3 },
  { above: 10, rate: 0.2 },
];

export interface Pricing {
  unitTtc: number;
  discountRate: number;
  discount: number;
  total: number;
}

const sanitize = (value: number): number => (Number.isFinite(value) && value > 0 ? value : 0);

export function discountRateFor(quantity: number): number {
  return DISCOUNT_TIERS.find((tier) => quantity > tier.above)?.rate ?? 0;
}

export function computePricing(priceHt: number, quantity: number, vat: number): Pricing {
  const price = sanitize(priceHt);
  const qty = sanitize(quantity);
  const unitTtc = price * (1 + sanitize(vat) / 100);
  const gross = unitTtc * qty;
  const discountRate = discountRateFor(qty);
  const discount = gross * discountRate;
  return { unitTtc, discountRate, discount, total: gross - discount };
}
