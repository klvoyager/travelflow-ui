export interface PricingInput {
  buy_price: number;
  service_charge_pct: number;
  gst_pct: number;
  tds_pct: number;
  apply_tds: boolean;
}

export interface PricingBreakdown {
  buy_price: number;
  service_charge_amount: number;
  gst_amount: number;
  subtotal: number;
  tds_amount: number;
  final_selling_price: number;
}

export function calculateSellingPrice(input: PricingInput): PricingBreakdown {
  const service_charge_amount = input.buy_price * (input.service_charge_pct / 100);
  const gst_amount = service_charge_amount * (input.gst_pct / 100);
  const subtotal = input.buy_price + service_charge_amount + gst_amount;
  const tds_amount = input.apply_tds ? subtotal * (input.tds_pct / 100) : 0;
  const final_selling_price = subtotal + tds_amount;

  return {
    buy_price: input.buy_price,
    service_charge_amount,
    gst_amount,
    subtotal,
    tds_amount,
    final_selling_price,
  };
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const DEFAULT_PRICING_CONFIG = {
  service_charge_pct: 15,
  gst_pct: 18,
  tds_pct: 2,
};
