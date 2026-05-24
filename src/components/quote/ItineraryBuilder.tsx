'use client';

import { useState, useMemo, KeyboardEvent } from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Plus, Trash2, Copy, ChevronDown, ChevronUp,
  ArrowUp, ArrowDown, MapPin, Building2, Utensils, Bus, Image as ImageIcon,
  ChevronsDownUp, ChevronsUpDown, Package as PackageIcon, CalendarDays,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { mockPackages } from '@/lib/mock';
import type { ItineraryDay, ItineraryMealPlan, PackageItineraryDay } from '@/lib/types';

const MEAL_PLAN_OPTIONS: { value: ItineraryMealPlan; label: string }[] = [
  { value: 'NONE', label: 'No Meals' },
  { value: 'BB',   label: 'Breakfast (BB)' },
  { value: 'HB',   label: 'Half Board (HB)' },
  { value: 'FB',   label: 'Full Board (FB)' },
  { value: 'AI',   label: 'All Inclusive (AI)' },
  { value: 'UAI',  label: 'Ultra All Inclusive (UAI)' },
];

function mealsToPlan(meals: string[]): ItineraryMealPlan {
  const upper = meals.map((m) => m.toUpperCase());
  const hasB = upper.includes('BREAKFAST');
  const hasL = upper.includes('LUNCH');
  const hasD = upper.includes('DINNER');
  if (hasB && hasL && hasD) return 'FB';
  if (hasB && (hasL || hasD)) return 'HB';
  if (hasB) return 'BB';
  return 'NONE';
}

function convertPackageDays(days: PackageItineraryDay[], destCity?: string): ItineraryDay[] {
  return days.map((d, i) => ({
    day_id: `imported-${Date.now()}-${i}`,
    day_number: d.day,
    day_title: d.title,
    day_description: d.description,
    destination_city: destCity,
    hotel_name: d.accommodation,
    meal_plan: mealsToPlan(d.meals_included),
    activities: d.highlights,
    transfers: undefined,
    image_url: undefined,
  }));
}

interface ItineraryBuilderProps {
  days: ItineraryDay[];
  onAddDay: () => void;
  onUpdateDay: (id: string, updates: Partial<ItineraryDay>) => void;
  onRemoveDay: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onImportFromPackage: (days: ItineraryDay[]) => void;
}

export function ItineraryBuilder({
  days, onAddDay, onUpdateDay, onRemoveDay, onReorder, onImportFromPackage,
}: ItineraryBuilderProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(days.map((d) => d.day_id)));

  const isExpanded = (id: string) => expandedIds.has(id);
  const toggleExpand = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const expandAll = () => setExpandedIds(new Set(days.map((d) => d.day_id)));
  const collapseAll = () => setExpandedIds(new Set());

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    onReorder(days[idx].day_id, days[idx - 1].day_id);
  };
  const moveDown = (idx: number) => {
    if (idx === days.length - 1) return;
    onReorder(days[idx].day_id, days[idx + 1].day_id);
  };

  const duplicate = (day: ItineraryDay) => {
    // Simple approach: add a new day, then update it with the duplicate's data
    onAddDay();
    // The store appends at the end; we can't easily get the new ID synchronously without a callback.
    // Acceptable trade-off: add then user can edit. Alternatively expose an insertAt action later.
  };

  const handleImportPackage = (pkgId: string) => {
    const pkg = mockPackages.find((p) => p.package_id === pkgId);
    if (!pkg) return;
    const destCity = pkg.destinations[0]?.city;
    onImportFromPackage(convertPackageDays(pkg.itinerary, destCity));
  };

  const summaryNights = useMemo(() => Math.max(0, days.length - 1), [days.length]);

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" className="gap-1.5" onClick={onAddDay}>
            <Plus className="h-3.5 w-3.5" /> Add Day
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <PackageIcon className="h-3.5 w-3.5" /> Import from Package
                <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
              <DropdownMenuLabel className="text-xs">Choose a package</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {mockPackages.length === 0 && (
                <p className="text-xs text-muted-foreground px-3 py-2">No packages available</p>
              )}
              {mockPackages.map((pkg) => (
                <DropdownMenuItem
                  key={pkg.package_id}
                  onClick={() => handleImportPackage(pkg.package_id)}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="text-sm font-medium">{pkg.package_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {pkg.package_code} · {pkg.duration_nights}N · {pkg.itinerary.length} day(s)
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1.5">
            <CalendarDays className="h-3 w-3" />
            {days.length} {days.length === 1 ? 'Day' : 'Days'} / {summaryNights} {summaryNights === 1 ? 'Night' : 'Nights'}
          </Badge>
          {days.length > 0 && (
            <>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={expandAll}>
                <ChevronsUpDown className="h-3 w-3" /> Expand All
              </Button>
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={collapseAll}>
                <ChevronsDownUp className="h-3 w-3" /> Collapse All
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-border rounded-lg">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No itinerary days yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first day or import from a package.</p>
          <Button size="sm" className="gap-1.5" onClick={onAddDay}>
            <Plus className="h-3.5 w-3.5" /> Add Day
          </Button>
        </div>
      )}

      {/* Day list */}
      {days.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={days.map((d) => d.day_id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2.5">
              {days.map((day, idx) => (
                <SortableDayCard
                  key={day.day_id}
                  day={day}
                  isFirst={idx === 0}
                  isLast={idx === days.length - 1}
                  expanded={isExpanded(day.day_id)}
                  onToggleExpand={() => toggleExpand(day.day_id)}
                  onUpdate={(updates) => onUpdateDay(day.day_id, updates)}
                  onRemove={() => onRemoveDay(day.day_id)}
                  onMoveUp={() => moveUp(idx)}
                  onMoveDown={() => moveDown(idx)}
                  onDuplicate={() => duplicate(day)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ─── Sortable Day Card ───────────────────────────────────────────────────────

interface SortableDayCardProps {
  day: ItineraryDay;
  isFirst: boolean;
  isLast: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onUpdate: (updates: Partial<ItineraryDay>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}

function SortableDayCard({
  day, isFirst, isLast, expanded, onToggleExpand,
  onUpdate, onRemove, onMoveUp, onMoveDown, onDuplicate,
}: SortableDayCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.day_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleRemove = () => {
    const hasContent = day.day_title && day.day_title !== `Day ${day.day_number}`;
    if (hasContent) {
      if (!confirm(`Remove "${day.day_title}"?`)) return;
    }
    onRemove();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'border border-border rounded-lg bg-card transition-shadow',
        isDragging && 'shadow-xl ring-2 ring-brand-gold/30'
      )}
    >
      {/* Header (always visible) */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onToggleExpand}
          className="flex-1 min-w-0 flex items-center gap-3 text-left"
        >
          <span className="text-[10px] font-bold text-brand-gold uppercase tracking-wider shrink-0">
            Day {day.day_number}
          </span>
          <span className="text-sm font-medium text-foreground truncate">
            {day.day_title || <span className="text-muted-foreground italic">Untitled day</span>}
          </span>
          {day.destination_city && (
            <span className="text-xs text-muted-foreground hidden sm:flex items-center gap-1 shrink-0">
              <MapPin className="h-3 w-3" /> {day.destination_city}
            </span>
          )}
        </button>

        <div className="flex items-center gap-0.5">
          <Button
            type="button" variant="ghost" size="icon-xs"
            onClick={onMoveUp} disabled={isFirst}
            title="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon-xs"
            onClick={onMoveDown} disabled={isLast}
            title="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon-xs"
            onClick={onDuplicate}
            title="Duplicate (add blank day)"
          >
            <Copy className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon-xs"
            onClick={handleRemove}
            title="Remove day"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button" variant="ghost" size="icon-xs"
            onClick={onToggleExpand}
            title={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Day Title <span className="text-destructive">*</span></Label>
              <Input
                value={day.day_title}
                onChange={(e) => onUpdate({ day_title: e.target.value })}
                placeholder="e.g. Arrive in Paris — Eiffel Tower"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Destination</Label>
              <Input
                value={day.destination_city ?? ''}
                onChange={(e) => onUpdate({ destination_city: e.target.value })}
                placeholder="e.g. Paris"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5"><Building2 className="h-3 w-3" /> Hotel Name</Label>
              <Input
                value={day.hotel_name ?? ''}
                onChange={(e) => onUpdate({ hotel_name: e.target.value })}
                placeholder="e.g. Novotel Paris Tour Eiffel"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5"><Utensils className="h-3 w-3" /> Meal Plan</Label>
              <Select
                value={day.meal_plan ?? 'NONE'}
                onValueChange={(v) => onUpdate({ meal_plan: v as ItineraryMealPlan })}
              >
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEAL_PLAN_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value} className="text-sm">{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs flex items-center gap-1.5"><Bus className="h-3 w-3" /> Transfers</Label>
              <Input
                value={day.transfers ?? ''}
                onChange={(e) => onUpdate({ transfers: e.target.value })}
                placeholder="e.g. Private transfer (45 min)"
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={day.day_description ?? ''}
              onChange={(e) => onUpdate({ day_description: e.target.value })}
              rows={4}
              placeholder="Day narrative — what the guest will experience..."
              className="text-sm resize-none"
            />
          </div>

          <ActivitiesInput
            value={day.activities ?? []}
            onChange={(activities) => onUpdate({ activities })}
          />

          <div className="space-y-1">
            <Label className="text-xs flex items-center gap-1.5"><ImageIcon className="h-3 w-3" /> Image URL</Label>
            <Input
              value={day.image_url ?? ''}
              onChange={(e) => onUpdate({ image_url: e.target.value })}
              placeholder="https://… (optional hero image for this day)"
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Activities Input (chip-style) ────────────────────────────────────────────

function ActivitiesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim().replace(/,$/, '');
    if (!trimmed) return;
    if (!value.includes(trimmed)) onChange([...value, trimmed]);
    setDraft('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs">Activities</Label>
      <div className="flex flex-wrap items-center gap-1.5 border border-input rounded-md px-2 py-1.5 min-h-9 focus-within:ring-2 focus-within:ring-ring/50">
        {value.map((activity, i) => (
          <Badge key={`${activity}-${i}`} variant="secondary" className="gap-1 text-xs pr-1">
            {activity}
            <button
              type="button"
              onClick={() => onChange(value.filter((_, j) => j !== i))}
              className="hover:bg-muted-foreground/20 rounded-sm w-3.5 h-3.5 flex items-center justify-center"
              aria-label={`Remove ${activity}`}
            >
              ×
            </button>
          </Badge>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? 'Type and press Enter to add (e.g. Snorkelling)' : ''}
          className="flex-1 min-w-[140px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
