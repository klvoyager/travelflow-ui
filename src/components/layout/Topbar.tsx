'use client';

import { Menu, Bell, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/hooks/useAuth';
import { useUIStore } from '@/store/uiStore';
import { MobileSidebar } from './Sidebar';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';

interface TopbarProps {
  breadcrumb?: React.ReactNode;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Topbar({ breadcrumb }: TopbarProps) {
  const { currentUser, tenant } = useAuth();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();

  return (
    <>
      <MobileSidebar open={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-card px-4 shadow-xs">
        {/* Mobile menu toggle (hamburger) */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb / page title */}
        <div className="flex-1 text-sm text-muted-foreground">
          {breadcrumb ?? <span className="font-medium text-foreground">{tenant.tenant_name}</span>}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />

          <Button variant="ghost" size="icon-sm" className="relative">
            <Bell className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive border-0">
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-9">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-brand-gold text-white text-xs font-semibold">
                    {getInitials(currentUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:block text-sm font-medium">{currentUser.full_name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div>
                  <p className="text-sm font-medium">{currentUser.full_name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.role_code}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Sign Out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
