import { create } from 'zustand';
import type { Quotation, BudgetOption, ItineraryDay } from '@/lib/types';
import { mockQuotes } from '@/lib/mock';

function renumber(days: ItineraryDay[]): ItineraryDay[] {
  return days.map((d, i) => ({ ...d, day_number: i + 1 }));
}

function genId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `day-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

interface QuoteState {
  quotes: Quotation[];
  getQuote: (enquiryId: string) => Quotation | undefined;
  saveDraft: (quote: Quotation) => void;
  updateBudgetOption: (quoteId: string, option: BudgetOption) => void;
  removeBudgetOption: (quoteId: string, optionId: string) => void;
  incrementVersion: (quoteId: string) => void;
  // Itinerary actions
  addItineraryDay: (quoteId: string, seed?: Pick<ItineraryDay, 'destination_city' | 'hotel_name' | 'meal_plan'>, afterDayId?: string) => void;
  updateItineraryDay: (quoteId: string, dayId: string, updates: Partial<ItineraryDay>) => void;
  removeItineraryDay: (quoteId: string, dayId: string) => void;
  reorderItineraryDays: (quoteId: string, activeId: string, overId: string) => void;
  importFromPackage: (quoteId: string, days: ItineraryDay[]) => void;
}

export const useQuoteStore = create<QuoteState>((set, get) => ({
  quotes: mockQuotes,

  getQuote: (enquiryId) =>
    get().quotes.find((q) => q.enquiry_id === enquiryId),

  saveDraft: (quote) =>
    set((state) => {
      const exists = state.quotes.some((q) => q.quotation_id === quote.quotation_id);
      const updated = { ...quote, updated_at: new Date().toISOString() };
      return {
        quotes: exists
          ? state.quotes.map((q) => (q.quotation_id === quote.quotation_id ? updated : q))
          : [...state.quotes, updated],
      };
    }),

  updateBudgetOption: (quoteId, option) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const exists = q.budget_options.some((o) => o.option_id === option.option_id);
        return {
          ...q,
          budget_options: exists
            ? q.budget_options.map((o) => (o.option_id === option.option_id ? option : o))
            : [...q.budget_options, option],
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  removeBudgetOption: (quoteId, optionId) =>
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.quotation_id === quoteId
          ? { ...q, budget_options: q.budget_options.filter((o) => o.option_id !== optionId), updated_at: new Date().toISOString() }
          : q
      ),
    })),

  incrementVersion: (quoteId) =>
    set((state) => ({
      quotes: state.quotes.map((q) =>
        q.quotation_id === quoteId ? { ...q, version: q.version + 1, updated_at: new Date().toISOString() } : q
      ),
    })),

  addItineraryDay: (quoteId, seed, afterDayId) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const days = q.itinerary_days ?? [];
        const stub: ItineraryDay = {
          day_id: genId(),
          day_number: 0,
          day_title: '',
          activities: [],
          destination_city: seed?.destination_city,
          hotel_name: seed?.hotel_name,
          meal_plan: seed?.meal_plan,
        };
        const insertIdx = afterDayId ? days.findIndex((d) => d.day_id === afterDayId) : -1;
        const spliced = insertIdx !== -1
          ? [...days.slice(0, insertIdx + 1), stub, ...days.slice(insertIdx + 1)]
          : [...days, stub];
        const renumbered = renumber(spliced).map((d) =>
          d.day_id === stub.day_id ? { ...d, day_title: `Day ${d.day_number}` } : d
        );
        return { ...q, itinerary_days: renumbered, updated_at: new Date().toISOString() };
      }),
    })),

  updateItineraryDay: (quoteId, dayId, updates) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const days = q.itinerary_days ?? [];
        return {
          ...q,
          itinerary_days: days.map((d) => (d.day_id === dayId ? { ...d, ...updates } : d)),
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  removeItineraryDay: (quoteId, dayId) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const days = q.itinerary_days ?? [];
        return {
          ...q,
          itinerary_days: renumber(days.filter((d) => d.day_id !== dayId)),
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  reorderItineraryDays: (quoteId, activeId, overId) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const days = q.itinerary_days ?? [];
        const fromIdx = days.findIndex((d) => d.day_id === activeId);
        const toIdx = days.findIndex((d) => d.day_id === overId);
        if (fromIdx === -1 || toIdx === -1) return q;
        const reordered = [...days];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(toIdx, 0, moved);
        return {
          ...q,
          itinerary_days: renumber(reordered),
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  importFromPackage: (quoteId, days) =>
    set((state) => ({
      quotes: state.quotes.map((q) => {
        if (q.quotation_id !== quoteId) return q;
        const fresh = days.map((d, i) => ({ ...d, day_id: genId(), day_number: i + 1 }));
        return { ...q, itinerary_days: fresh, updated_at: new Date().toISOString() };
      }),
    })),
}));
