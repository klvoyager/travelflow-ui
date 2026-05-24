import { create } from 'zustand';
import type { Quotation, BudgetOption } from '@/lib/types';
import { mockQuotes } from '@/lib/mock';

interface QuoteState {
  quotes: Quotation[];
  getQuote: (enquiryId: string) => Quotation | undefined;
  saveDraft: (quote: Quotation) => void;
  updateBudgetOption: (quoteId: string, option: BudgetOption) => void;
  removeBudgetOption: (quoteId: string, optionId: string) => void;
  incrementVersion: (quoteId: string) => void;
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
}));
