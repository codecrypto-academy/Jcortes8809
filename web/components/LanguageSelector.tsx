"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {locale === "en" ? "English" : "Español"}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className="gap-2"
        >
          {locale === "en" && <Check className="h-4 w-4" />}
          {locale !== "en" && <span className="w-4" />}
          <span>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("es")}
          className="gap-2"
        >
          {locale === "es" && <Check className="h-4 w-4" />}
          {locale !== "es" && <span className="w-4" />}
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
