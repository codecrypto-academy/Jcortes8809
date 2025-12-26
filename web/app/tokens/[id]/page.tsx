"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TraceabilityTree } from "@/components/TraceabilityTree";
import { Token, UserStatus } from "@/types";
import { formatAddress, formatDate, parseTokenFeatures } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { Package, Calendar, User, Hash, ArrowRight, ArrowUp, Network, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";

interface ParentIngredient {
  token: Token;
  amount: bigint;
}

export default function TokenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<Token | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [pendingTransferAmount, setPendingTransferAmount] = useState<bigint>(0n);
  const [parentIngredients, setParentIngredients] = useState<ParentIngredient[]>([]);
  const [showTraceability, setShowTraceability] = useState(false);

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    loadTokenDetails();
  }, [isConnected, userInfo, router, id]);

  const loadTokenDetails = async () => {
    if (!web3Service || !account) return;

    try {
      setIsLoading(true);

      const tokenId = BigInt(id);
      const tokenData = await web3Service.getToken(tokenId);
      const tokenBalance = await web3Service.getTokenBalance(tokenId, account);

      setToken(tokenData);
      setBalance(tokenBalance);

      // Cargar transferencias pendientes del usuario para este token
      try {
        const transferIds = await web3Service.getUserTransfers(account);
        let pendingAmount = 0n;

        for (const transferId of transferIds) {
          const transfer = await web3Service.getTransfer(transferId);
          const transferStatus = typeof transfer.status === 'bigint' ? Number(transfer.status) : transfer.status;
          if (
            transfer.from.toLowerCase() === account.toLowerCase() &&
            transfer.tokenId.toString() === id &&
            transferStatus === 0 // TransferStatus.Pending = 0
          ) {
            pendingAmount += transfer.amount;
          }
        }

        setPendingTransferAmount(pendingAmount);
      } catch (error) {
        console.error("Error loading pending transfers:", error);
        setPendingTransferAmount(0n);
      }

      // Cargar ingredientes parent (si existen)
      if (tokenData.parentIds && tokenData.parentIds.length > 0) {
        const ingredients: ParentIngredient[] = [];

        for (let i = 0; i < tokenData.parentIds.length; i++) {
          try {
            const parentToken = await web3Service.getToken(tokenData.parentIds[i]);
            ingredients.push({
              token: parentToken,
              amount: tokenData.parentAmounts[i],
            });
          } catch (error) {
            console.error(`Error loading parent token ${tokenData.parentIds[i]}:`, error);
          }
        }

        setParentIngredients(ingredients);
      }
    } catch (error: any) {
      console.error("Error loading token:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load token details",
      });
      router.push("/tokens");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return null;
  }

  const features = parseTokenFeatures(token.features);
  const isOwner = token.creator.toLowerCase() === account?.toLowerCase();
  const hasBalance = balance > 0n;

  // Factory solo puede transferir tokens que ellos mismos crearon
  // Consumer no puede transferir tokens a nadie
  const canTransfer =
    userInfo?.role !== "Consumer" && // Consumer nunca puede transferir
    !(
      userInfo?.role === "Factory" &&
      !isOwner
    );

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            {token.name}
          </h1>
          <p className="text-muted-foreground mt-1">{t("tokens.tokenDetails")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            {t("common.back")}
          </Button>
          {hasBalance && canTransfer && (
            <Button asChild>
              <Link href={`/tokens/${id}/transfer`}>
                <ArrowRight className="mr-2 h-4 w-4" />
                {t("tokens.transfer")}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Main Token Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("tokens.tokenInformation")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  {t("tokens.tokenId")}
                </p>
                <p className="font-semibold">{token.id.toString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  {t("tokens.totalSupply")}
                </p>
                <p className="font-semibold">{token.totalSupply.toString()}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {t("tokens.creator")}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  {formatAddress(token.creator)}
                </code>
                {isOwner && <Badge variant="success">You</Badge>}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t("tokens.createdDate")}
              </p>
              <p className="font-semibold">{formatDate(token.dateCreated)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t("tokens.yourBalance")}</p>
              <p className="text-2xl font-bold text-primary">{balance.toString()}</p>
            </div>

            {/* Balance Breakdown - Show only if there are pending transfers */}
            {pendingTransferAmount > 0n && (
              <div className="pt-4 border-t">
                <p className="text-sm font-semibold mb-3">{t("tokens.balanceBreakdown")}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{t("tokens.totalBalance")}</span>
                    </div>
                    <span className="font-semibold">{balance.toString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-yellow-600">
                      <Lock className="h-4 w-4" />
                      <span>{t("tokens.pendingTransfers")}</span>
                    </div>
                    <span className="font-semibold text-yellow-600">-{pendingTransferAmount.toString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t("tokens.availableBalance")}</span>
                    </div>
                    <span className="font-bold text-green-600">{(balance - pendingTransferAmount).toString()}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("tokens.characteristics")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {features.description && (
              <div>
                <p className="text-sm font-semibold">{t("createToken.description")}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {features.description}
                </p>
              </div>
            )}

            {features.origin && (
              <div>
                <p className="text-sm font-semibold">{t("createToken.origin")}</p>
                <p className="text-sm text-muted-foreground mt-1">{features.origin}</p>
              </div>
            )}

            {features.certifications && Array.isArray(features.certifications) && (
              <div>
                <p className="text-sm font-semibold mb-2">{t("createToken.certifications")}</p>
                <div className="flex flex-wrap gap-2">
                  {features.certifications.map((cert: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(features).length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t("tokens.noCharacteristics")}
              </p>
            )}

            {Object.keys(features)
              .filter(key => !['description', 'origin', 'certifications'].includes(key))
              .map(key => (
                <div key={key}>
                  <p className="text-sm font-semibold capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {JSON.stringify(features[key])}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Ingredients Section (if any) */}
      {parentIngredients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUp className="h-5 w-5" />
              {t("tokens.ingredientsUsed")}
            </CardTitle>
            <CardDescription>
              {t("tokens.ingredientsDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {parentIngredients.map((ingredient, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Link
                          href={`/tokens/${ingredient.token.id}`}
                          className="font-semibold hover:underline text-primary"
                        >
                          {ingredient.token.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {t("tokens.tokenId")}: {ingredient.token.id.toString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{ingredient.amount.toString()} {t("tokens.units")}</p>
                    <p className="text-xs text-muted-foreground">{t("tokens.amountUsed")}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Material Badge */}
      {parentIngredients.length === 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                🌱
              </div>
              <div>
                <p className="font-semibold">{t("tokens.rawMaterial")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("tokens.rawMaterialDesc")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Traceability Section - Show full supply chain */}
      {parentIngredients.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Network className="h-6 w-6 text-primary" />
                {t("tokens.traceability.supplyChain")}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t("tokens.traceability.description")}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowTraceability(!showTraceability)}
            >
              {showTraceability
                ? t("tokens.traceability.hideFullChain")
                : t("tokens.traceability.viewFullChain")}
            </Button>
          </div>

          {showTraceability && <TraceabilityTree tokenId={token.id} />}
        </div>
      )}
    </div>
  );
}
