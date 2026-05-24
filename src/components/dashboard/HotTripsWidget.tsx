'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { HotnessFlag } from '@/components/trip/HotnessFlag';
import { useTripStats } from '@/lib/hooks/useTrips';
import { formatDaysUntil } from '@/lib/utils';
import { Plane } from 'lucide-react';

export function HotTripsWidget() {
  const { hotTrips } = useTripStats();

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          🔥 Hot Trips
          {hotTrips.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {hotTrips.length} active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {hotTrips.length === 0 ? (
          <EmptyState
            title="No hot trips"
            description="Trips departing within 14 days will appear here"
            icon={Plane}
            className="py-10"
          />
        ) : (
          <div className="divide-y divide-border">
            {hotTrips.map(trip => (
              <Link
                key={trip.trip_id}
                href={`/trips/${trip.trip_id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HotnessFlag flag={trip.hotness_flag} showLabel={false} />
                  <div>
                    <p className="text-sm font-medium">{trip.trip_title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{trip.trip_ref}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-foreground">
                    {formatDaysUntil(trip.departure_date)}
                  </p>
                  <p className="text-xs text-muted-foreground">{trip.lead_guest_name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
