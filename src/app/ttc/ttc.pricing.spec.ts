import { computePricing, discountRateFor } from './ttc.pricing';

describe('ttc pricing', () => {
  it('computes the example from the lab (100 HT, 10 pieces, 18%)', () => {
    const pricing = computePricing(100, 10, 18);
    expect(pricing.unitTtc).toBeCloseTo(118);
    expect(pricing.total).toBeCloseTo(1180);
    expect(pricing.discount).toBe(0);
  });

  [
    { quantity: 1, rate: 0 },
    { quantity: 10, rate: 0 },
    { quantity: 11, rate: 0.2 },
    { quantity: 15, rate: 0.2 },
    { quantity: 16, rate: 0.3 },
    { quantity: 100, rate: 0.3 },
  ].forEach(({ quantity, rate }) => {
    it(`applies a ${rate} discount rate for ${quantity} pieces`, () => {
      expect(discountRateFor(quantity)).toBe(rate);
    });
  });

  it('subtracts the discount from the total', () => {
    const pricing = computePricing(100, 20, 0);
    expect(pricing.discount).toBeCloseTo(600);
    expect(pricing.total).toBeCloseTo(1400);
  });

  it('treats invalid input as 0', () => {
    expect(computePricing(NaN, 1, 18).total).toBe(0);
    expect(computePricing(-5, 1, 18).total).toBe(0);
  });
});
