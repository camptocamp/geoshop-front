export type PricingStatus = 'PENDING' | 'CALCULATED' | 'IMPORTED';

export interface IPricing {
  id: number;
  name: string;
  pricing_type: string;
  base_fee_currency?: string;
  base_fee?: number;
  min_price_currency?: string;
  min_price?: number;
  max_price_currency?: string;
  max_price?: number;
  unit_price_currency?: string;
  unit_price?: number;
}
