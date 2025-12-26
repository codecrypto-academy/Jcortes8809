"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Token, TokenWithBalance } from "@/types";
import { formatDate, parseTokenFeatures } from "@/lib/utils";
import { Package, Calendar, Hash, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeb3 } from "@/contexts/Web3Context";
import Link from "next/link";

interface TokenCardProps {
  token: Token | TokenWithBalance;
  balance?: bigint;
  showActions?: boolean;
}

export function TokenCard({ token, balance, showActions = false }: TokenCardProps) {
  const { t } = useLanguage();
  const { userInfo, account } = useWeb3();
  const features = parseTokenFeatures(token.features);
  const tokenBalance = "balance" in token ? token.balance : balance;

  // Factory solo puede transferir tokens que ellos mismos crearon
  // Consumer no puede transferir tokens a nadie
  const canTransfer =
    userInfo?.role !== "Consumer" && // Consumer nunca puede transferir
    !(
      userInfo?.role === "Factory" &&
      token.creator.toLowerCase() !== account?.toLowerCase()
    );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">{token.name}</CardTitle>
          </div>
          {tokenBalance !== undefined && (
            <Badge variant={tokenBalance > 0n ? "success" : "secondary"}>
              {t("tokens.balance")}: {tokenBalance.toString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span>ID: {token.id.toString()}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="h-4 w-4" />
            <span>{t("tokens.supply")}: {token.totalSupply.toString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{t("tokens.created")}: {formatDate(token.dateCreated)}</span>
        </div>

        {token.parentIds && token.parentIds.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="outline">
              {token.parentIds.length === 1
                ? t("tokens.ingredientCount", { count: token.parentIds.length })
                : t("tokens.ingredientCount_plural", { count: token.parentIds.length })
              }
            </Badge>
          </div>
        )}

        {features.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {features.description}
          </p>
        )}

        {features.origin && (
          <div className="text-sm">
            <span className="font-semibold">{t("createToken.origin")}:</span> {features.origin}
          </div>
        )}

        {features.certifications && Array.isArray(features.certifications) && features.certifications.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {features.certifications.map((cert: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {cert}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      {showActions && (
        <CardFooter className="gap-2">
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/tokens/${token.id}`}>
              {t("tokens.viewDetails")}
            </Link>
          </Button>
          {tokenBalance !== undefined && tokenBalance > 0n && canTransfer && (
            <Button asChild className="flex-1">
              <Link href={`/tokens/${token.id}/transfer`}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {t("tokens.transfer")}
              </Link>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
