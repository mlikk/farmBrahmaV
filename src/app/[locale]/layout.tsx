
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { Info } from "lucide-react";
import { LocationProvider } from "@/context/LocationContext";

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const t = await getTranslations("DashboardLayout");

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocationProvider>
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 flex flex-col">{children}</main>
          <footer className="bg-background border-t p-4 text-center text-xs text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <Info size={14} />
              <span>{t('footerDisclaimer')}</span>
            </div>
          </footer>
        </div>
      </LocationProvider>
    </NextIntlClientProvider>
  );
}
