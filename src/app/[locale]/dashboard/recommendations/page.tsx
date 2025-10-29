
import { DashboardHeader } from "@/components/dashboard/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfitabilityForm, PlantingForm } from "@/components/dashboard/recommendations-client";
import { getTranslations } from "next-intl/server";

export default async function RecommendationsPage() {
  const t = await getTranslations("RecommendationsPage");
  return (
    <div className="flex flex-col h-full">
      <DashboardHeader
        title={t('title')}
        description={t('description')}
      />
      <main className="flex-1 p-4 md:p-6">
        <Tabs defaultValue="profitability" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profitability">{t('profitabilityTab')}</TabsTrigger>
            <TabsTrigger value="planting">{t('plantingTab')}</TabsTrigger>
          </TabsList>
          <TabsContent value="profitability" className="mt-6">
            <ProfitabilityForm />
          </TabsContent>
          <TabsContent value="planting" className="mt-6">
            <PlantingForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
