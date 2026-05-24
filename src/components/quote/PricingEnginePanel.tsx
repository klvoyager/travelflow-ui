'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { calculatePricing } from '@/lib/hooks/useQuote';
import type { PricingBreakdown } from '@/lib/types';
import { DEFAULT_PRICING_CONFIG } from '@/lib/utils/pricing';

interface PricingEnginePanelProps {
  label: string;
  initialBuyPrice?: number;
  initialApplyTds?: boolean;
  onChange?: (breakdown: PricingBreakdown) => void;
  className?: string;
  compact?: boolean;
}

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function Row({ label, value, highlight, editable, editValue, onEdit, suffix }: {
  label: string;
  value: string;
  highlight?: boolean;
  editable?: boolean;
  editValue?: string;
  onEdit?: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between py-1.5 px-3 text-sm', highlight && 'bg-brand-gold/5 rounded')}>
      <span className={cn('text-muted-foreground', highlight && 'text-foreground font-semibold')}>{label}</span>
      <div className="flex items-center gap-2">
        {editable && onEdit ? (
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => onEdit(e.target.value)}
              className="h-6 w-14 text-xs text-right px-1"
              min={0}
              max={100}
              step={0.5}
            />
            <span className="text-xs text-muted-foreground">%</span>
          </div>
        ) : null}
        {suffix && !editable && (
          <span className="text-xs text-muted-foreground">{suffix}</span>
        )}
        <span className={cn('font-mono text-right min-w-[7rem]', highlight && 'text-brand-gold font-bold text-base')}>{value}</span>
      </div>
    </div>
  );
}

export function PricingEnginePanel({
  label,
  initialBuyPrice = 0,
  initialApplyTds = true,
  onChange,
  className,
  compact = false,
}: PricingEnginePanelProps) {
  const [buyPrice, setBuyPrice] = useState(String(initialBuyPrice));
  const [scPct, setScPct] = useState(String(DEFAULT_PRICING_CONFIG.service_charge_pct));
  const [gstPct, setGstPct] = useState(String(DEFAULT_PRICING_CONFIG.gst_pct));
  const [tdsPct, setTdsPct] = useState(String(DEFAULT_PRICING_CONFIG.tds_pct));
  const [applyTds, setApplyTds] = useState(initialApplyTds);

  const breakdown = calculatePricing(Number(buyPrice) || 0, applyTds, {
    service_charge_pct: Number(scPct) || 0,
    gst_pct: Number(gstPct) || 0,
    tds_pct: Number(tdsPct) || 0,
  });

  useEffect(() => {
    onChange?.(breakdown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buyPrice, scPct, gstPct, tdsPct, applyTds]);

  return (
    <div className={cn('border border-border rounded-lg bg-card overflow-hidden', className)}>
      <div className="px-3 py-2 bg-muted/40 border-b border-border">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>

      <div className="divide-y divide-border/50">
        {/* Buy price */}
        <div className="flex items-center justify-between px-3 py-2">
          <Label className="text-sm text-muted-foreground">Buy Price</Label>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">₹</span>
            <Input
              type="number"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="h-7 w-28 text-right text-sm font-mono"
              placeholder="0"
              min={0}
            />
          </div>
        </div>

        {/* Calculated rows */}
        <Row
          label="Service Charge"
          value={fmt(breakdown.service_charge_amount)}
          editable
          editValue={scPct}
          onEdit={setScPct}
        />
        <Row
          label="GST (on SC)"
          value={fmt(breakdown.gst_amount)}
          editable
          editValue={gstPct}
          onEdit={setGstPct}
        />
        {!compact && (
          <Row label="Subtotal" value={fmt(breakdown.subtotal)} />
        )}

        {/* TDS toggle row */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground">TDS</Label>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={tdsPct}
                onChange={(e) => setTdsPct(e.target.value)}
                className="h-6 w-14 text-xs text-right px-1"
                min={0}
                max={100}
                step={0.5}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <Switch
              checked={applyTds}
              onCheckedChange={setApplyTds}
              className="scale-75"
            />
            <span className="text-xs text-muted-foreground">{applyTds ? 'International' : 'Domestic'}</span>
          </div>
          <span className="font-mono text-sm text-right min-w-[7rem]">{fmt(breakdown.tds_amount)}</span>
        </div>

        <Separator />

        {/* Selling price */}
        <Row
          label="Selling Price"
          value={fmt(breakdown.final_selling_price)}
          highlight
        />
      </div>
    </div>
  );
}
