"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TokenCard } from "@/components/TokenCard";
import { Button } from "@/components/ui/button";
import { TokenWithBalance, UserStatus } from "@/types";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TokensPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, account, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<TokenWithBalance[]>([]);

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    // Redirigir admins al dashboard
    if (isAdmin) {
      router.push("/dashboard");
      return;
    }

    loadTokens();
  }, [isConnected, userInfo, isAdmin, router, account]);

  const loadTokens = async () => {
    if (!web3Service || !account) return;

    try {
      setIsLoading(true);

      const tokenIds = await web3Service.getUserTokens(account);
      const tokensList: TokenWithBalance[] = [];

      for (const tokenId of tokenIds) {
        const token = await web3Service.getToken(tokenId);
        const balance = await web3Service.getTokenBalance(tokenId, account);
        // Mostrar todos los tokens que el usuario posee (creados o recibidos)
        tokensList.push({
          ...token,
          balance,
        });
      }

      // Ordenar por fecha de creación (más reciente primero)
      tokensList.sort((a, b) => Number(b.dateCreated - a.dateCreated));

      setTokens(tokensList);
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{t("tokens.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("tokens.description")}
          </p>
        </div>
        {/* Solo mostrar botón de crear token si el usuario NO es Retailer ni Consumer */}
        {userInfo?.role !== "Consumer" && userInfo?.role !== "Retailer" && (
          <Button asChild>
            <Link href="/tokens/create">
              <Plus className="mr-2 h-4 w-4" />
              {t("tokens.createToken")}
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          {t("tokens.allTokens")} ({tokens.length})
        </Button>
        <Button variant="outline" size="sm">
          {t("tokens.withBalance")} ({tokens.filter(t => t.balance > 0n).length})
        </Button>
        <Button variant="outline" size="sm">
          {t("tokens.createdByMe")} ({tokens.filter(t => t.creator.toLowerCase() === account?.toLowerCase()).length})
        </Button>
      </div>

      {/* Tokens Grid */}
      {tokens.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {t("tokens.noTokensDesc")}
          </p>
          {/* Solo mostrar botón de crear token si el usuario NO es Retailer ni Consumer */}
          {userInfo?.role !== "Consumer" && userInfo?.role !== "Retailer" && (
            <Button asChild>
              <Link href="/tokens/create">
                <Plus className="mr-2 h-4 w-4" />
                {t("tokens.createToken")}
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tokens.map((token) => (
            <TokenCard
              key={token.id.toString()}
              token={token}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
