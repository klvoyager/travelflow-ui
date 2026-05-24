'use client';

import { ClipboardList, Plane, AlertTriangle, Calendar } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { RecentEnquiries } from '@/components/dashboard/RecentEnquiries';
import { HotTripsWidget } from '@/components/dashboard/HotTripsWidget';
import { useEnquiryStats } from '@/lib/hooks/useEnquiries';
import { useTripStats } from '@/lib/hooks/useTrips';

export default function DashboardPage() {
  const { open: openEnquiries, slaBreached } = useEnquiryStats();
  const { active: activeTrips, departingThisWeek } = useTripStats();

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground font-heading">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Rahul. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard
          label="Open Enquiries"
          value={openEnquiries}
          trend="up"
          trendLabel="2 new today"
          icon={ClipboardList}
          severity="normal"
        />
        <KPICard
          label="Active Trips"
          value={activeTrips}
          trend="neutral"
          trendLabel="Across all agents"
          icon={Plane}
          severity="normal"
        />
        <KPICard
          label="SLA Breached Today"
          value={slaBreached}
          trend={slaBreached > 0 ? 'down' : 'neutral'}
          trendLabel={slaBreached > 0 ? 'Needs attention' : 'All on track'}
          icon={AlertTriangle}
          severity={slaBreached > 0 ? 'critical' : 'normal'}
        />
        <KPICard
          label="Departing This Week"
          value={departingThisWeek}
          trend={departingThisWeek > 0 ? 'up' : 'neutral'}
          trendLabel={departingThisWeek > 0 ? 'Confirm logistics' : 'No departures'}
          icon={Calendar}
          severity={departingThisWeek > 2 ? 'warning' : 'normal'}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentEnquiries />
        </div>
        <div>
          <HotTripsWidget />
        </div>
      </div>
    </div>
  );
}
