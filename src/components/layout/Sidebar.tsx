'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Plane,
  Users,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  href: '/dashboard',  icon: LayoutDashboard },
  { label: 'Enquiries',  href: '/enquiries',  icon: ClipboardList },
  { label: 'Trips',      href: '/trips',      icon: Plane },
  { label: 'Customers',  href: '/customers',  icon: Users },
  { label: 'Packages',   href: '/packages',   icon: Package },
  { label: 'Quotes',     href: '/quotes',     icon: FileText },
];

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-gold text-white font-bold text-sm">
        KV
      </div>
      {!collapsed && (
        <div className="overflow-hidden">
          <p className="truncate text-sm font-semibold text-sidebar-foreground">KL Voyager</p>
          <p className="truncate text-xs text-sidebar-foreground/50">Travel Agency</p>
        </div>
      )}
    </div>
  );
}

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const pathname = usePathname();
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
        isActive
          ? 'bg-sidebar-primary text-white font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const { toggleSidebar } = useUIStore();

  return (
    <div className="flex h-full flex-col bg-sidebar-background">
      <SidebarLogo collapsed={collapsed} />

      {/* Main nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-sidebar-border px-3 py-3 space-y-1">
        <Link
          href="/admin/users"
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? 'Admin' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Admin</span>}
        </Link>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-60'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>
    </>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-60 p-0 bg-sidebar-background border-sidebar-border">
        <SidebarContent collapsed={false} />
      </SheetContent>
    </Sheet>
  );
}
