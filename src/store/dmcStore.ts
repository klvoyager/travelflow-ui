import { create } from 'zustand';
import type { DMCForward, DMCProposal, DMCForwardStatus } from '@/lib/types';
import { mockDMCForwards, mockDMCProposals } from '@/lib/mock';

interface DMCState {
  forwards: DMCForward[];
  proposals: DMCProposal[];
  addForward: (forward: DMCForward) => void;
  updateForwardStatus: (forwardId: string, status: DMCForwardStatus, proposalId?: string) => void;
  addProposal: (proposal: DMCProposal) => void;
  updateProposalStatus: (proposalId: string, status: DMCProposal['status']) => void;
  selectDMC: (enquiryId: string, forwardId: string) => void;
}

export const useDMCStore = create<DMCState>((set) => ({
  forwards: mockDMCForwards,
  proposals: mockDMCProposals,

  addForward: (forward) =>
    set((state) => ({ forwards: [...state.forwards, forward] })),

  updateForwardStatus: (forwardId, status, proposalId) =>
    set((state) => ({
      forwards: state.forwards.map((f) =>
        f.forward_id === forwardId
          ? { ...f, status, ...(proposalId ? { proposal_id: proposalId } : {}), responded_at: status === 'RESPONDED' ? new Date().toISOString() : f.responded_at }
          : f
      ),
    })),

  addProposal: (proposal) =>
    set((state) => ({
      proposals: [...state.proposals, proposal],
      forwards: state.forwards.map((f) =>
        f.forward_id === proposal.forward_id
          ? { ...f, status: 'RESPONDED' as DMCForwardStatus, proposal_id: proposal.proposal_id, responded_at: new Date().toISOString() }
          : f
      ),
    })),

  updateProposalStatus: (proposalId, status) =>
    set((state) => ({
      proposals: state.proposals.map((p) =>
        p.proposal_id === proposalId ? { ...p, status, reviewed_at: new Date().toISOString() } : p
      ),
    })),

  selectDMC: (enquiryId, forwardId) =>
    set((state) => ({
      forwards: state.forwards.map((f) => {
        if (f.enquiry_id !== enquiryId) return f;
        return { ...f, status: f.forward_id === forwardId ? ('SELECTED' as DMCForwardStatus) : f.status };
      }),
    })),
}));
