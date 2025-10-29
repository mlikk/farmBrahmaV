
"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { LocationDialog } from "@/components/dashboard/recommendations-client";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationPage() {
  const t = useTranslations("LocationPage");

  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={t('title')}
        description={t('description')}
      />
      <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
        <Card>
            <CardContent className="p-6">
                 <LocationDialog 
                    triggerButtonText="Select Farm Location"
                    triggerButtonVariant="default"
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
