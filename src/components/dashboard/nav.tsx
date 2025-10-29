
"use client"

import { usePathname } from "@/navigation"
import { BarChart, BotMessageSquare, Landmark, Leaf, LifeBuoy, Users, Loader2 } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTranslations } from "next-intl"
import type { pathnames } from "@/navigation";

type Pathname = keyof typeof pathnames;

type DashboardNavProps = {
  onLinkClick: (href: Pathname) => void;
  isPending: boolean;
};

export function DashboardNav({ onLinkClick, isPending }: DashboardNavProps) {
  const pathname = usePathname()
  const t = useTranslations("DashboardNav");
  const { setOpenMobile } = useSidebar();

  const handleLocalLinkClick = (href: Pathname) => {
    onLinkClick(href);
    setOpenMobile(false);
  }

  const navItems: { href: Pathname; label: string; icon: React.ElementType; tooltip: string; }[] = [
    { href: "/dashboard", label: t('dashboard'), icon: BarChart, tooltip: t('dashboard') },
    { href: "/dashboard/market-trends", label: t('marketTrends'), icon: Landmark, tooltip: t('marketTrends') },
    { href: "/dashboard/recommendations", label: t('aiAdvice'), icon: BotMessageSquare, tooltip: t('aiAdvice') },
    { href: "/dashboard/environment", label: t('environment'), icon: Leaf, tooltip: t('environment') },
    { href: "/dashboard/community", label: t('community'), icon: Users, tooltip: t('community') },
  ]

  const isLinkActive = (href: Pathname) => pathname === href;

  return (
    <nav className="flex flex-col h-full">
      <div className="flex-1">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                isActive={isLinkActive(item.href)}
                tooltip={item.tooltip}
                onClick={() => handleLocalLinkClick(item.href)}
                disabled={isPending}
              >
                  {isPending && isLinkActive(item.href) ? <Loader2 className="h-5 w-5 animate-spin" /> : <item.icon className="h-5 w-5" />}
                  <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
      <div className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton tooltip={t('support')}>
                <LifeBuoy className="h-5 w-5" />
                <span>{t('support')}</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </nav>
  )
}
