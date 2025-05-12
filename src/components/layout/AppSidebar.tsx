"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CreditCard, TrendingUp, Target, User, Settings, FileText, Briefcase, Landmark } from 'lucide-react';
import Logo from '@/components/icons/Logo';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar"; // Using the provided custom sidebar

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  matchSubPaths?: boolean;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, matchSubPaths: false },
  { href: '/expenses', label: 'Expenses', icon: CreditCard, matchSubPaths: true },
  { href: '/incomes', label: 'Incomes', icon: TrendingUp, matchSubPaths: true },
  { href: '/budgets', label: 'Budgets', icon: Target, matchSubPaths: true },
  { href: '/profile', label: 'Profile', icon: User, matchSubPaths: false },
  { href: '/settings', label: 'Settings', icon: Settings, matchSubPaths: true },
  { href: '/data-management', label: 'Data Management', icon: FileText, matchSubPaths: false },
];

const AppSidebar = () => {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" defaultOpen={true}>
      <SidebarHeader className="border-b">
        <Link href="/dashboard" className="flex items-center gap-2 p-2">
          <Landmark className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden">FinTrack</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = item.matchSubPaths ? pathname.startsWith(item.href) : pathname === item.href;
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    asChild={false} // important for Link to work correctly with next/link
                    isActive={isActive}
                    tooltip={{ children: item.label, side: 'right', align: 'center' }}
                    className={cn(
                      "justify-start w-full",
                      isActive && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 border-t mt-auto">
        {/* Can add something here if needed, e.g. quick actions or user info */}
        <div className="text-xs text-muted-foreground text-center group-data-[collapsible=icon]:hidden">
          © {new Date().getFullYear()} FinTrack
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
