"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { toast } from "@/components/ui/use-toast";
import { UserStatus, TokenWithBalance } from "@/types";
import { Package, Plus, X } from "lucide-react";

interface ParentIngredient {
  tokenId: string;
  amount: string;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, account, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<TokenWithBalance[]>([]);
  const [parentIngredients, setParentIngredients] = useState<ParentIngredient[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    totalSupply: "",
    description: "",
    origin: "",
    certifications: "",
  });

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    if (isAdmin) {
      toast({
        variant: "destructive",
        title: t("admin.accessDenied"),
        description: t("admin.accessDeniedDesc"),
      });
      router.push("/dashboard");
      return;
    }

    if (userInfo.role === "Consumer") {
      toast({
        variant: "destructive",
        title: t("admin.accessDenied"),
        description: "Consumers cannot create tokens",
      });
      router.push("/dashboard");
      return;
    }

    // NUEVO: Bloquear acceso a Retailer
    if (userInfo.role === "Retailer") {
      toast({
        variant: "destructive",
        title: t("createToken.accessDeniedRetailer"),
        description: t("createToken.accessDeniedRetailerDesc"),
      });
      router.push("/dashboard");
      return;
    }

    loadAvailableTokens();
  }, [isConnected, userInfo, isAdmin, router]);

  const loadAvailableTokens = async () => {
    if (!web3Service || !account) return;

    try {
      setIsLoading(true);

      // Factory necesita tokens con balance para usarlos como parent
      if (userInfo?.role === "Factory") {
        const tokenIds = await web3Service.getUserTokens(account);
        const tokensWithBalance: TokenWithBalance[] = [];

        for (const tokenId of tokenIds) {
          try {
            const token = await web3Service.getToken(tokenId);
            const balance = await web3Service.getTokenBalance(tokenId, account);

            if (balance > 0n) {
              tokensWithBalance.push({ ...token, balance });
            }
          } catch (error: any) {
            if (error?.message?.includes("TokenNotFound") || error?.reason?.includes("TokenNotFound")) {
              console.warn(`Token ${tokenId.toString()} not found, skipping...`);
            } else {
              console.error(`Error loading token ${tokenId.toString()}:`, error);
            }
          }
        }

        setAvailableTokens(tokensWithBalance);
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addParentIngredient = () => {
    setParentIngredients([...parentIngredients, { tokenId: "", amount: "" }]);
  };

  const removeParentIngredient = (index: number) => {
    setParentIngredients(parentIngredients.filter((_, i) => i !== index));
  };

  const updateParentIngredient = (index: number, field: keyof ParentIngredient, value: string) => {
    const updated = [...parentIngredients];
    updated[index][field] = value;
    setParentIngredients(updated);
  };

  const getAvailableBalance = (tokenId: string): bigint => {
    const token = availableTokens.find(t => t.id.toString() === tokenId);
    return token?.balance || 0n;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!web3Service) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Web3 service not initialized",
      });
      return;
    }

    // Validaciones
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("createToken.nameRequired"),
      });
      return;
    }

    const supply = parseInt(formData.totalSupply);
    if (isNaN(supply) || supply <= 0) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("createToken.supplyPositive"),
      });
      return;
    }

    // Validación específica por rol
    if (userInfo?.role === "Producer" && parentIngredients.length > 0) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("createToken.noIngredientsForProducer"),
      });
      return;
    }

    if (userInfo?.role === "Factory" && parentIngredients.length === 0) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("createToken.ingredientsRequiredForFactory"),
      });
      return;
    }

    // Validar parent ingredients
    if (parentIngredients.length > 0) {
      for (let i = 0; i < parentIngredients.length; i++) {
        const ingredient = parentIngredients[i];

        if (!ingredient.tokenId) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Ingredient ${i + 1}: Please select a token`,
          });
          return;
        }

        if (!ingredient.amount || parseInt(ingredient.amount) <= 0) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Ingredient ${i + 1}: Amount must be greater than 0`,
          });
          return;
        }

        const balance = getAvailableBalance(ingredient.tokenId);
        if (BigInt(ingredient.amount) > balance) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: `Ingredient ${i + 1}: Insufficient balance. Available: ${balance.toString()}, Requested: ${ingredient.amount}`,
          });
          return;
        }
      }

      // Check for duplicate tokens
      const tokenIds = parentIngredients.map(p => p.tokenId);
      const uniqueTokenIds = new Set(tokenIds);
      if (tokenIds.length !== uniqueTokenIds.size) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: t("tokens.duplicateIngredient"),
        });
        return;
      }
    }

    setIsCreating(true);

    try {
      // Construir objeto de características
      const features: any = {};

      if (formData.description) features.description = formData.description;
      if (formData.origin) features.origin = formData.origin;
      if (formData.certifications) {
        features.certifications = formData.certifications
          .split(",")
          .map(c => c.trim())
          .filter(c => c);
      }

      const featuresJson = JSON.stringify(features);

      // Preparar arrays de parents
      const parentIds = parentIngredients.map(p => BigInt(p.tokenId));
      const parentAmounts = parentIngredients.map(p => BigInt(p.amount));

      await web3Service.createToken(
        formData.name,
        BigInt(supply),
        featuresJson,
        parentIds,
        parentAmounts
      );

      toast({
        variant: "success",
        title: "Token Created",
        description: `${formData.name} has been created successfully`,
      });

      router.push("/tokens");
    } catch (error: any) {
      console.error("Error creating token:", error);
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message || "Failed to create token",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const needsParent = userInfo?.role === "Factory";

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">{t("createToken.title")}</CardTitle>
          </div>
          <CardDescription>
            {t("createToken.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Parent Ingredients Section (Factory only) */}
            {needsParent && (
              <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">
                    {t("tokens.ingredients")} <span className="text-destructive">*</span>
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addParentIngredient}
                    disabled={availableTokens.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("tokens.addIngredient")}
                  </Button>
                </div>

                {availableTokens.length === 0 ? (
                  <div className="p-4 border border-yellow-500 rounded-lg bg-yellow-50 text-sm">
                    <p className="font-semibold text-yellow-800">{t("tokens.noIngredientsAvailable")}</p>
                    <p className="text-yellow-700 mt-1">
                      {t("tokens.noIngredientsAvailableDesc")}
                    </p>
                  </div>
                ) : parentIngredients.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t("createToken.parentIngredientsDesc")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {parentIngredients.map((ingredient, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-2">
                          <Label htmlFor={`ingredient-${index}`} className="text-sm">
                            {t("tokens.ingredient")} {index + 1}
                          </Label>
                          <Select
                            value={ingredient.tokenId}
                            onValueChange={(value) => updateParentIngredient(index, "tokenId", value)}
                          >
                            <SelectTrigger className="bg-white dark:bg-slate-950">
                              <SelectValue placeholder={t("tokens.selectIngredient")} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-950">
                              {availableTokens.map((token) => (
                                <SelectItem key={token.id.toString()} value={token.id.toString()}>
                                  {token.name} ({t("tokens.balance")}: {token.balance.toString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="w-32 space-y-2">
                          <Label htmlFor={`amount-${index}`} className="text-sm">
                            {t("transfer.amount")}
                          </Label>
                          <Input
                            id={`amount-${index}`}
                            type="number"
                            min="1"
                            max={ingredient.tokenId ? getAvailableBalance(ingredient.tokenId).toString() : undefined}
                            placeholder="Amount"
                            value={ingredient.amount}
                            onChange={(e) => updateParentIngredient(index, "amount", e.target.value)}
                            onWheel={(e) => e.currentTarget.blur()}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeParentIngredient(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Token Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t("createToken.tokenName")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder={t("createToken.tokenNamePlaceholder")}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Total Supply */}
            <div className="space-y-2">
              <Label htmlFor="totalSupply">
                {t("createToken.totalSupply")} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="totalSupply"
                type="number"
                min="1"
                placeholder={t("createToken.totalSupplyPlaceholder")}
                value={formData.totalSupply}
                onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
                onWheel={(e) => e.currentTarget.blur()}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t("createToken.description")}</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={t("createToken.descriptionPlaceholder")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Origin */}
            <div className="space-y-2">
              <Label htmlFor="origin">{t("createToken.origin")}</Label>
              <Input
                id="origin"
                placeholder={t("createToken.originPlaceholder")}
                value={formData.origin}
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              />
            </div>

            {/* Certifications */}
            <div className="space-y-2">
              <Label htmlFor="certifications">{t("createToken.certifications")}</Label>
              <Input
                id="certifications"
                placeholder={t("createToken.certificationsPlaceholder")}
                value={formData.certifications}
                onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                {t("common.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={isCreating || (needsParent && availableTokens.length === 0)}
                className="flex-1"
              >
                {isCreating ? t("createToken.creating") : t("createToken.title")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
