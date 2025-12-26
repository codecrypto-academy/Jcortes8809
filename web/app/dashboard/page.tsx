"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserStatus, TransferStatus } from "@/types";
import { ROLE_EMOJIS } from "@/lib/constants";
import { Package, Send, Inbox, Plus, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, userInfo, web3Service, account, isAdmin } = useWeb3();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    tokensCreated: 0,
    tokensOwned: 0,
    transfersSent: 0,
    transfersReceived: 0,
    pendingTransfers: 0,
  });

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    if (isAdmin || userInfo.role === "Admin") {
      router.push("/admin/users");
      return;
    }

    loadDashboardData();
  }, [isConnected, userInfo, router, isAdmin]);

  const loadDashboardData = async () => {
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
      let pendingTransfers = 0;

      for (const transferId of transferIds) {
        const transfer = await web3Service.getTransfer(transferId);

        if (transfer.from.toLowerCase() === account.toLowerCase()) {
          transfersSent++;
        }

        if (transfer.to.toLowerCase() === account.toLowerCase()) {
          transfersReceived++;
          if (transfer.status === TransferStatus.Pending) {
            pendingTransfers++;
          }
        }
      }

      setStats({
        tokensCreated,
        tokensOwned,
        transfersSent,
        transfersReceived,
        pendingTransfers,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!userInfo) {
    return null;
  }

  const roleEmoji = ROLE_EMOJIS[userInfo.role as keyof typeof ROLE_EMOJIS];
  const role = userInfo.role.toLowerCase();

  // Configuración específica por rol
  const roleConfig = {
    producer: {
      primaryAction: {
        label: t("dashboard.primaryAction.producer"),
        href: "/tokens/create",
        icon: Plus,
      },
      stats: [
        { label: t("dashboard.stats.rawMaterialsCreated"), value: stats.tokensCreated, icon: Package },
        { label: t("dashboard.stats.activeMaterials"), value: stats.tokensOwned, icon: TrendingUp },
        { label: t("dashboard.stats.transfersToFactories"), value: stats.transfersSent, icon: Send },
      ],
    },
    factory: {
      primaryAction: {
        label: t("dashboard.primaryAction.factory"),
        href: "/tokens/create",
        icon: Plus,
      },
      stats: [
        { label: t("dashboard.stats.productsCreated"), value: stats.tokensCreated, icon: Package },
        { label: t("dashboard.stats.activeInventory"), value: stats.tokensOwned, icon: TrendingUp },
        { label: t("dashboard.stats.pendingReceipts"), value: stats.pendingTransfers, icon: Inbox },
        { label: t("dashboard.stats.transfersToRetailers"), value: stats.transfersSent, icon: Send },
      ],
    },
    retailer: {
      primaryAction: {
        label: t("dashboard.primaryAction.retailer"),
        href: "/tokens",
        icon: Package,
      },
      stats: [
        { label: t("dashboard.stats.productsInStock"), value: stats.tokensOwned, icon: Package },
        { label: t("dashboard.stats.pendingReceipts"), value: stats.pendingTransfers, icon: Inbox },
        { label: t("dashboard.stats.distributedToConsumers"), value: stats.transfersSent, icon: Send },
      ],
    },
    consumer: {
      primaryAction: {
        label: t("dashboard.primaryAction.consumer"),
        href: "/tokens",
        icon: Package,
      },
      stats: [
        { label: t("dashboard.stats.productsOwned"), value: stats.tokensOwned, icon: Package },
        { label: t("dashboard.stats.productsReceived"), value: stats.transfersReceived, icon: Inbox },
      ],
    },
  };

  const config = roleConfig[role as keyof typeof roleConfig];

  if (!config) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Role</CardTitle>
            <CardDescription>
              Your role "{userInfo.role}" does not have a configured dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const PrimaryIcon = config.primaryAction.icon;

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className="text-4xl">{roleEmoji}</span>
            {t(`dashboard.title.${role}`)}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t(`dashboard.description.${role}`)}
          </p>
        </div>
        <Button asChild size="lg">
          <Link href={config.primaryAction.href}>
            <PrimaryIcon className="mr-2 h-5 w-5" />
            {config.primaryAction.label}
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {config.stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          <CardDescription>{t("common.filter")}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link href="/tokens">
              <Package className="h-6 w-6" />
              <span>{t("dashboard.viewAllTokens")}</span>
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link href="/transfers">
              <Send className="h-6 w-6" />
              <span>{t("dashboard.manageTransfers")}</span>
            </Link>
          </Button>

          {stats.pendingTransfers > 0 && (
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 border-yellow-500">
              <Link href="/transfers">
                <Inbox className="h-6 w-6 text-yellow-600" />
                <span className="text-yellow-600">
                  {stats.pendingTransfers} {stats.pendingTransfers > 1 ? t("dashboard.pendingTransfers") : t("dashboard.pendingTransfer")}
                </span>
              </Link>
            </Button>
          )}

          {userInfo.role !== "Consumer" && (
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
              <Link href="/tokens/create">
                <Plus className="h-6 w-6" />
                <span>{t("dashboard.createNewToken")}</span>
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Role-specific information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.aboutYourRole")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {t(`roles.${role}Desc`)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
