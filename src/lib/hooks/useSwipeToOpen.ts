'use client';

import { useEffect, useRef } from 'react';
import { useUIStore } from '@/store/uiStore';

const EDGE_ZONE_PX = 40;   // must start within this many px from left edge
const MIN_SWIPE_PX = 60;   // minimum horizontal travel to count as a swipe

export function useSwipeToOpen() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const startX = useRef(0);
  const startY = useRef(0);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      startX.current = e.touches[0].clientX;
      startY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (mobileSidebarOpen) return; // already open — do nothing

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX.current;
      const deltaY = Math.abs(endY - startY.current);

      const startsFromEdge = startX.current < EDGE_ZONE_PX;
      const isRightSwipe = deltaX > MIN_SWIPE_PX;
      const isMoreHorizontal = deltaX > deltaY; // avoids triggering on vertical scroll

      if (startsFromEdge && isRightSwipe && isMoreHorizontal) {
        setMobileSidebarOpen(true);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [mobileSidebarOpen, setMobileSidebarOpen]);
}
