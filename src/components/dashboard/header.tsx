
"use client";

import { LocationDialog } from "@/components/dashboard/recommendations-client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useLocationContext } from "@/context/LocationContext";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./language-switcher";

type DashboardHeaderProps = {
  title: string;
  description?: string;
}

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  const t = useTranslations("DashboardHeader");
  const { location, address } = useLocationContext();
  
  const coordinates = location ? `(${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})` : '';

  return (
    <header className="flex h-auto min-h-14 items-center gap-4 border-b bg-card px-4 py-2 lg:h-[60px] lg:px-6 z-40">
       <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold md:text-2xl font-headline truncate">{title}</h1>
        {description && <p className="text-sm text-muted-foreground truncate hidden sm:block">{description}</p>}
        {/* Mobile Location Display */}
        <div className="md:hidden text-xs text-muted-foreground mt-1">
            <span>{t('farmLocation')}: </span>
            <span className="font-medium">{address || t('notSet')} </span>
            {address && address !== 'India' && <span className="text-muted-foreground/80">{coordinates}</span>}
        </div>
      </div>
      <div className="flex items-center gap-4 shrink-0">
        {/* Desktop Location Display */}
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="font-semibold text-foreground text-nowrap">{t('farmLocation')}:</span>
          <div className="flex flex-col items-end">
             <span className="text-muted-foreground">{address || t('notSet')}</span>
             {address && address !== 'India' && <span className="text-xs text-muted-foreground/80">{coordinates}</span>}
          </div>
        </div>
         <LocationDialog 
            triggerButtonVariant="secondary"
            triggerButtonText={t('change')}
        />
        <LanguageSwitcher />
      </div>
    </header>
  );
}
