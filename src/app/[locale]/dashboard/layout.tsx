
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTransition, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Link } from "@/navigation";
import { Logo } from "@/components/dashboard/icons";
import { DashboardNav } from "@/components/dashboard/nav";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLocationContext } from "@/context/LocationContext";
import type { pathnames } from "@/navigation";
import { Progress } from "@/components/ui/progress";


type Pathname = keyof typeof pathnames;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("DashboardLayout");
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { isLoading: isLocationLoading } = useLocationContext();

  const isDashboardHome = pathname === '/dashboard';

  const handleLinkClick = (href: Pathname) => {
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  const showLoader = isPending || isLocationLoading;

  return (
    <SidebarProvider>
      <div className="flex w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-0 hidden md:block">
            <Link
              href="/dashboard"
              className={cn(
                  "flex items-center gap-2 font-semibold text-sidebar-foreground p-4",
                  isDashboardHome && "bg-sidebar-accent text-sidebar-accent-foreground"
              )}
            >
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-lg font-headline">{t("appName")}</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <DashboardNav onLinkClick={handleLinkClick} isPending={isPending} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
            {showLoader && (
              <Progress value={isLocationLoading ? 33 : 100} className="absolute top-0 left-0 right-0 h-1 w-full z-50 bg-primary/20" />
            )}
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
