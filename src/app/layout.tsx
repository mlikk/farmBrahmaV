
import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster"
import "./globals.css";
import { ptSans } from "@/app/fonts";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Kisan Mitra",
  description: "AI-powered insights for Indian farmers.",
};

type RootLayoutProps = {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default function RootLayout({
  children,
  params: {locale}
}: RootLayoutProps) {

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css" />
      </head>
      <body className={cn("font-body antialiased", ptSans.variable)}>
          {children}
        <Toaster />
      </body>
    </html>
  );
}
