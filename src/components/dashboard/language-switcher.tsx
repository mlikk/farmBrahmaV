
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/navigation";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" disabled={isPending}>
          <Globe className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("changeLanguage")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLocaleChange("en")}
          disabled={locale === "en"}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("hi")}
          disabled={locale === "hi"}
        >
          हिंदी (Hindi)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("ta")}
          disabled={locale === "ta"}
        >
          தமிழ் (Tamil)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("te")}
          disabled={locale === "te"}
        >
          తెలుగు (Telugu)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLocaleChange("mr")}
          disabled={locale === "mr"}
        >
          मराठी (Marathi)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
