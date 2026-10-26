import { computePricing, discountRateFor } from './ttc.pricing';

describe('ttc pricing', () => {
  it('computes the example from the lab (100 HT, 10 pieces, 18%)', () => {
    const p = computePricing(100, 10, 18);
    expect(p.unitTtc).toBeCloseTo(118);
    expect(p.total).toBeCloseTo(1180);
    expect(p.discount).toBe(0);
  });

  it.each([
    [1, 0],
    [10, 0],
    [11, 0.2],
    [15, 0.2],
    [16, 0.3],
    [100, 0.3],
  ])('applies the right discount rate for %i pieces', (quantity, rate) => {
    expect(discountRateFor(quantity)).toBe(rate);
  });

  it('subtracts the discount from the total', () => {
    const p = computePricing(100, 20, 0);
    expect(p.discount).toBeCloseTo(600);
    expect(p.total).toBeCloseTo(1400);
  });

  it('treats invalid input as 0', () => {
    expect(computePricing(NaN, 1, 18).total).toBe(0);
    expect(computePricing(-5, 1, 18).total).toBe(0);
  });
});
