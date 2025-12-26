"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { UserStatus } from "@/types";
import { formatAddress, copyToClipboard } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { ROLE_EMOJIS } from "@/lib/constants";
import { User, Package, Send, Inbox, Copy, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, account, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    tokensCreated: 0,
    tokensOwned: 0,
    totalTokens: 0,
    transfersSent: 0,
    transfersReceived: 0,
  });

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    loadProfileStats();
  }, [isConnected, userInfo, router]);

  const loadProfileStats = async () => {
    if (!web3Service || !account) return;

    try {
      setIsLoading(true);

      const tokenIds = await web3Service.getUserTokens(account);
      const transferIds = await web3Service.getUserTransfers(account);

      let tokensCreated = 0;
      let tokensOwned = 0;

      for (const tokenId of tokenIds) {
        const token = await web3Service.getToken(tokenId);
        const balance = await web3Service.getTokenBalance(tokenId, account);

        if (token.creator.toLowerCase() === account.toLowerCase()) {
          tokensCreated++;
        }

        if (balance > 0n) {
          tokensOwned++;
        }
      }

      let transfersSent = 0;
      let transfersReceived = 0;

      for (const transferId of transferIds) {
        const transfer = await web3Service.getTransfer(transferId);

        if (transfer.from.toLowerCase() === account.toLowerCase()) {
          transfersSent++;
        }

        if (transfer.to.toLowerCase() === account.toLowerCase()) {
          transfersReceived++;
        }
      }

      setStats({
        tokensCreated,
        tokensOwned,
        totalTokens: tokenIds.length,
        transfersSent,
        transfersReceived,
      });
    } catch (error) {
      console.error("Error loading profile stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!account) return;
    const success = await copyToClipboard(account);
    if (success) {
      toast({
        title: t("common.copied"),
        description: t("admin.addressCopied"),
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!userInfo || !account) {
    return null;
  }

  const roleEmoji = ROLE_EMOJIS[userInfo.role as keyof typeof ROLE_EMOJIS];

  // Obtener la descripción del rol según el idioma actual
  const getRoleDescription = () => {
    const roleKey = userInfo.role.toLowerCase();
    return t(`roles.${roleKey}Desc`) as string;
  };

  const roleDescription = getRoleDescription();

  return (
    <div className="container py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <User className="h-8 w-8" />
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("profile.descriptionFull")}
        </p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">{roleEmoji}</span>
            {t("profile.accountInfo")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{t("profile.address")}</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded font-mono text-sm">
                {account}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyAddress}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("profile.shortAddress")}: {formatAddress(account)}
            </p>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{t("profile.role")}</p>
            <div className="flex items-center gap-2">
              <Badge className="text-lg py-1 px-3">
                {roleEmoji} {userInfo.role}
              </Badge>
              {isAdmin && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {t("roles.admin")}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{roleDescription}</p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{t("profile.accountStatus")}</p>
            <UserStatusBadge status={userInfo.status} />
          </div>

          {/* User ID */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">{t("profile.userId")}</p>
            <p className="font-mono">#{userInfo.id.toString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.activityStats")}</CardTitle>
          <CardDescription>{t("profile.activityStatsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Token Stats */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t("nav.tokens")}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("profile.totalTokens")}</span>
                  <span className="text-2xl font-bold">{stats.totalTokens}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("profile.tokensCreated")}</span>
                  <span className="text-lg font-semibold text-primary">{stats.tokensCreated}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("profile.tokensOwned")}</span>
                  <span className="text-lg font-semibold text-green-600">{stats.tokensOwned}</span>
                </div>
              </div>
            </div>

            {/* Transfer Stats */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" />
                {t("nav.transfers")}
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{t("profile.totalTransfers")}</span>
                  <span className="text-2xl font-bold">
                    {stats.transfersSent + stats.transfersReceived}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Send className="h-3 w-3" />
                    {t("transfers.sent")}
                  </span>
                  <span className="text-lg font-semibold text-blue-600">{stats.transfersSent}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Inbox className="h-3 w-3" />
                    {t("transfers.received")}
                  </span>
                  <span className="text-lg font-semibold text-purple-600">{stats.transfersReceived}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("profile.roleCapabilities")}</CardTitle>
          <CardDescription>{t("profile.roleCapabilitiesDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userInfo.role === "Producer" && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                {(t("profile.capabilities.producer", { returnObjects: true }) as string[]).map((cap: string, idx: number) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            )}

            {userInfo.role === "Factory" && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                {(t("profile.capabilities.factory", { returnObjects: true }) as string[]).map((cap: string, idx: number) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            )}

            {userInfo.role === "Retailer" && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                {(t("profile.capabilities.retailer", { returnObjects: true }) as string[]).map((cap: string, idx: number) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            )}

            {userInfo.role === "Consumer" && (
              <ul className="list-disc list-inside space-y-2 text-sm">
                {(t("profile.capabilities.consumer", { returnObjects: true }) as string[]).map((cap: string, idx: number) => (
                  <li key={idx}>{cap}</li>
                ))}
              </ul>
            )}

            {isAdmin && (
              <div className="mt-4 p-4 border border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      {t("profile.adminPrivileges") as string}
                    </p>
                    <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 mt-1 space-y-1">
                      {(t("profile.capabilities.admin", { returnObjects: true }) as string[]).map((cap: string, idx: number) => (
                        <li key={idx}>{cap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
