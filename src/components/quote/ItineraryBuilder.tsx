'use client';

import { useState, useMemo, KeyboardEvent, Fragment } from 'react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, Copy, ChevronDown, GripVertical,
  MapPin, Building2, Utensils, Bus, Image as ImageIcon,
  Package as PackageIcon, CalendarDays, X, Pencil,
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
  onAddDay: (seed?: Pick<ItineraryDay, 'destination_city' | 'hotel_name' | 'meal_plan'>, afterDayId?: string) => void;
  onUpdateDay: (id: string, updates: Partial<ItineraryDay>) => void;
  onRemoveDay: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onImportFromPackage: (days: ItineraryDay[]) => void;
}

export function ItineraryBuilder({
  days, onAddDay, onUpdateDay, onRemoveDay, onReorder, onImportFromPackage,
}: ItineraryBuilderProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (_e: DragStartEvent) => setSelectedId(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  const duplicate = (day: ItineraryDay) => {
    onAddDay(
      { destination_city: day.destination_city, hotel_name: day.hotel_name, meal_plan: day.meal_plan },
      day.day_id,
    );
  };

  const handleRemove = (day: ItineraryDay) => {
    const hasContent = day.day_title && day.day_title !== `Day ${day.day_number}`;
    if (hasContent && !confirm(`Remove "${day.day_title}"?`)) return;
    if (selectedId === day.day_id) setSelectedId(null);
    onRemoveDay(day.day_id);
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
          <Button size="sm" className="gap-1.5" onClick={() => {
            const last = days[days.length - 1];
            onAddDay(
              last ? { destination_city: last.destination_city, hotel_name: last.hotel_name, meal_plan: last.meal_plan } : undefined,
              last?.day_id,
            );
          }}>
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

        <Badge variant="outline" className="text-xs gap-1.5">
          <CalendarDays className="h-3 w-3" />
          {days.length} {days.length === 1 ? 'Day' : 'Days'} / {summaryNights} {summaryNights === 1 ? 'Night' : 'Nights'}
        </Badge>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-border rounded-lg">
          <CalendarDays className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-foreground">No itinerary days yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Add your first day or import from a package.</p>
          <Button size="sm" className="gap-1.5" onClick={() => onAddDay()}>
            <Plus className="h-3.5 w-3.5" /> Add Day
          </Button>
        </div>
      )}

      {/* Kanban Grid */}
      {days.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={days.map((d) => d.day_id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
              {days.map((day) => (
                <Fragment key={day.day_id}>
                  <KanbanCard
                    day={day}
                    isSelected={selectedId === day.day_id}
                    onSelect={() => setSelectedId(selectedId === day.day_id ? null : day.day_id)}
                    onDuplicate={() => duplicate(day)}
                    onRemove={() => handleRemove(day)}
                    onAddBelow={() => onAddDay(
                      { destination_city: day.destination_city, hotel_name: day.hotel_name, meal_plan: day.meal_plan },
                      day.day_id,
                    )}
                  />
                  {selectedId === day.day_id && (
                    <div className="col-span-full border border-border rounded-lg bg-muted/20 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Pencil className="h-3.5 w-3.5 text-brand-gold" />
                          Day {day.day_number}
                          {day.day_title && (
                            <span className="text-muted-foreground font-normal">— {day.day_title}</span>
                          )}
                        </span>
                        <Button
                          type="button" variant="ghost" size="icon-xs"
                          onClick={() => setSelectedId(null)}
                          title="Close editor"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <DayEditForm
                        day={day}
                        onUpdate={(updates) => onUpdateDay(day.day_id, updates)}
                      />
                    </div>
                  )}
                </Fragment>
              ))}

              {/* Add Day card */}
              <button
                type="button"
                onClick={() => {
                  const last = days[days.length - 1];
                  onAddDay(
                    last ? { destination_city: last.destination_city, hotel_name: last.hotel_name, meal_plan: last.meal_plan } : undefined,
                    last?.day_id,
                  );
                }}
                className="h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/20 transition-colors group"
              >
                <Plus className="h-6 w-6 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-medium">Add Day</span>
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

// ─── Kanban Card ──────────────────────────────────────────────────────────────

interface KanbanCardProps {
  day: ItineraryDay;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onAddBelow: () => void;
}

function KanbanCard({ day, isSelected, onSelect, onDuplicate, onRemove, onAddBelow }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: day.day_id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const activities = day.activities ?? [];
  const visibleActivities = activities.slice(0, 3);
  const hiddenCount = activities.length - 3;
  const shortDesc = day.day_description
    ? day.day_description.slice(0, 50) + (day.day_description.length > 50 ? '…' : '')
    : null;
  const hasTooltipContent = day.meal_plan && day.meal_plan !== 'NONE'
    || day.transfers
    || activities.length > 0
    || shortDesc;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group h-40 border rounded-lg bg-card cursor-pointer select-none transition-all',
        isSelected
          ? 'border-brand-gold ring-2 ring-brand-gold/30 shadow-md'
          : 'border-border hover:border-border/60 hover:shadow-sm',
        isDragging && 'shadow-xl opacity-40',
      )}
      onClick={onSelect}
    >
      {/* Card face */}
      <div className="p-3 h-full flex flex-col justify-between">
        {/* Top: badge + title */}
        <div className="space-y-1.5 pr-7">
          <div className="flex items-center gap-1.5">
            <Badge className="text-[10px] font-bold px-1.5 py-0 bg-brand-gold/10 text-brand-gold border-brand-gold/20 hover:bg-brand-gold/20 shrink-0">
              Day {day.day_number}
            </Badge>
            {isSelected && <Pencil className="h-3 w-3 text-brand-gold shrink-0" />}
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
            {day.day_title || (
              <span className="text-muted-foreground font-normal italic text-xs">Untitled day</span>
            )}
          </p>
        </div>

        {/* Bottom: destination + hotel */}
        <div className="space-y-0.5">
          {day.destination_city && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {day.destination_city}
            </p>
          )}
          {day.hotel_name && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
              <Building2 className="h-3 w-3 shrink-0" />
              {day.hotel_name}
            </p>
          )}
        </div>
      </div>

      {/* Drag handle — top-right, shown on hover */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10 p-0.5 rounded"
        onClick={(e) => e.stopPropagation()}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Action buttons — bottom-right, shown on hover */}
      <div
        className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button" variant="ghost" size="icon-xs"
          className="h-6 w-6 bg-background/90 shadow-sm hover:bg-background"
          onClick={onAddBelow}
          title="Add day below"
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon-xs"
          className="h-6 w-6 bg-background/90 shadow-sm hover:bg-background"
          onClick={onDuplicate}
          title="Duplicate day"
        >
          <Copy className="h-3 w-3" />
        </Button>
        <Button
          type="button" variant="ghost" size="icon-xs"
          className="h-6 w-6 bg-background/90 shadow-sm hover:bg-background hover:text-destructive"
          onClick={onRemove}
          title="Remove day"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Hover tooltip — floats above the card */}
      {hasTooltipContent && (
        <div className="absolute bottom-full left-0 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <div className="bg-popover border border-border rounded-md shadow-lg p-3 space-y-2 text-xs">
            {day.meal_plan && day.meal_plan !== 'NONE' && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Utensils className="h-3 w-3 shrink-0" />
                {MEAL_PLAN_OPTIONS.find((m) => m.value === day.meal_plan)?.label ?? day.meal_plan}
              </div>
            )}
            {day.transfers && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Bus className="h-3 w-3 shrink-0" />
                <span className="truncate">{day.transfers}</span>
              </div>
            )}
            {activities.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {visibleActivities.map((a, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] py-0 px-1.5">{a}</Badge>
                ))}
                {hiddenCount > 0 && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5">+{hiddenCount} more</Badge>
                )}
              </div>
            )}
            {shortDesc && (
              <p className="text-muted-foreground leading-relaxed">{shortDesc}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Day Edit Form ────────────────────────────────────────────────────────────

function DayEditForm({ day, onUpdate }: { day: ItineraryDay; onUpdate: (u: Partial<ItineraryDay>) => void }) {
  return (
    <div className="space-y-3">
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
          rows={3}
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
