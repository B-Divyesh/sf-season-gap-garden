import { availableCheckoutUrl, CHECKOUT_URL, PAID_UNLOCK_AVAILABLE } from '../src/license';
import { describe, expect, it } from 'vitest';

describe('paid checkout availability', () => {
  it('does not expose the billing checkout until this product is registered', () => {
    expect(PAID_UNLOCK_AVAILABLE).toBe(false);
    expect(availableCheckoutUrl()).toBeNull();
    expect(CHECKOUT_URL).toContain('/products/season-gap-garden/checkout');
  });
});
