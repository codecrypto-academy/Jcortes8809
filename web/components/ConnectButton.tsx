"use client";

import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatAddress } from "@/lib/utils";
import { Wallet, LogOut } from "lucide-react";

export function ConnectButton() {
  const { isConnected, account, connect, disconnect, isLoading } = useWeb3();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <Button disabled variant="outline">
        {t("common.loading")}
      </Button>
    );
  }

  if (isConnected && account) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground hidden md:inline">
          {formatAddress(account)}
        </span>
        <Button onClick={disconnect} variant="outline" size="sm">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} variant="default">
      <Wallet className="mr-2 h-4 w-4" />
      {t("nav.connectWallet")}
    </Button>
  );
}
