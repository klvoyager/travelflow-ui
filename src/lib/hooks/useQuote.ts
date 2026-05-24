'use client';

import { useCallback } from 'react';
import { useQuoteStore } from '@/store/quoteStore';
import { calculateSellingPrice, DEFAULT_PRICING_CONFIG } from '@/lib/utils/pricing';
import type { Quotation, PricingBreakdown } from '@/lib/types';

export function useQuote(enquiryId: string) {
  const { getQuote, saveDraft, incrementVersion } = useQuoteStore();
  const quote = getQuote(enquiryId);

  const saveQuote = useCallback(
    (data: Quotation) => {
      saveDraft(data);
    },
    [saveDraft]
  );

  const saveAndVersion = useCallback(
    (data: Quotation) => {
      saveDraft({ ...data, version: data.version + 1 });
    },
    [saveDraft]
  );

  return { quote, saveQuote, saveAndVersion, incrementVersion };
}

export function calculatePricing(
  buyPrice: number,
  applyTds: boolean,
  overrides?: { service_charge_pct?: number; gst_pct?: number; tds_pct?: number }
): PricingBreakdown {
  const scPct = overrides?.service_charge_pct ?? DEFAULT_PRICING_CONFIG.service_charge_pct;
  const gstPct = overrides?.gst_pct ?? DEFAULT_PRICING_CONFIG.gst_pct;
  const tdsPct = overrides?.tds_pct ?? DEFAULT_PRICING_CONFIG.tds_pct;

  const result = calculateSellingPrice({
    buy_price: buyPrice,
    service_charge_pct: scPct,
    gst_pct: gstPct,
    tds_pct: tdsPct,
    apply_tds: applyTds,
  });

  return {
    buy_price: result.buy_price,
    service_charge_pct: scPct,
    service_charge_amount: result.service_charge_amount,
    gst_pct: gstPct,
    gst_amount: result.gst_amount,
    subtotal: result.subtotal,
    tds_pct: tdsPct,
    tds_amount: result.tds_amount,
    final_selling_price: result.final_selling_price,
    apply_tds: applyTds,
  };
}
