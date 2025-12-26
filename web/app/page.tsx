"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserStatus } from "@/types";
import { ROLES, Role } from "@/contracts/config";
import { ROLE_EMOJIS } from "@/lib/constants";
import { toast } from "@/components/ui/use-toast";
import { Package2, Wallet, CheckCircle, Users } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isConnected, isLoading, userInfo, web3Service, refreshUserInfo } = useWeb3();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<Role | "">("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    if (isConnected && userInfo && userInfo.status === UserStatus.Approved) {
      if (userInfo.role === "Admin") {
        router.push("/admin/users");
      } else {
        router.push("/dashboard");
      }
    }
  }, [isConnected, userInfo, router]);

  const handleRegister = async () => {
    if (!selectedRole) {
      toast({
        variant: "destructive",
        title: t("toast.error"),
        description: t("auth.selectRole"),
      });
      return;
    }

    if (!web3Service) {
      toast({
        variant: "destructive",
        title: t("toast.error"),
        description: t("messages.walletNotConnectedDesc"),
      });
      return;
    }

    setIsRegistering(true);

    try {
      await web3Service.requestUserRole(selectedRole);
      await refreshUserInfo();

      toast({
        title: t("toast.success"),
        description: t("auth.awaitingApproval"),
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: t("toast.error"),
        description: error.message || t("messages.unknownError"),
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Usuario no conectado
  if (!isConnected) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Package2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">{t("auth.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("auth.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("messages.walletNotConnectedDesc")}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">{t("auth.connectWallet")}</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Package2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Blockchain-based traceability</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm">Transparent and immutable records</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuario conectado pero no registrado
  if (!userInfo) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>{t("auth.register")}</CardTitle>
            <CardDescription>
              {t("auth.selectRole")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="role">{t("auth.selectRole")}</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                  <SelectTrigger id="role" className="bg-white dark:bg-slate-950 border border-input shadow-sm hover:shadow-md">
                    <SelectValue placeholder={t("auth.selectRole")} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-950">
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          <span>{ROLE_EMOJIS[role]}</span>
                          <span>{t(`roles.${role.toLowerCase()}`)}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedRole && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{ROLE_EMOJIS[selectedRole]}</span>
                    <div>
                      <h4 className="font-semibold">{t(`roles.${selectedRole.toLowerCase()}`)}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {t(`roles.${selectedRole.toLowerCase()}Desc`)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              onClick={handleRegister}
              disabled={!selectedRole || isRegistering}
              className="w-full"
            >
              {isRegistering ? t("auth.connecting") : t("auth.register")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuario registrado pero pendiente de aprobación
  if (userInfo.status === UserStatus.Pending) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                <span className="text-3xl">⏳</span>
              </div>
            </div>
            <CardTitle>{t("auth.awaitingApproval")}</CardTitle>
            <CardDescription>
              {t("auth.adminReview")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("auth.pleaseRegister")}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{t(`roles.${userInfo.role.toLowerCase()}`)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuario rechazado
  if (userInfo.status === UserStatus.Rejected) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-2xl border-destructive">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
            </div>
            <CardTitle className="text-destructive">{t("auth.rejected")}</CardTitle>
            <CardDescription>
              {t("auth.contactAdmin")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/5">
              <p className="text-sm text-muted-foreground mb-2">
                {t("auth.previousRoleRejected")}:
              </p>
              <div className="flex items-center justify-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4" />
                <span>{t(`roles.${userInfo.role.toLowerCase()}`)}</span>
              </div>
            </div>

            <div>
              <Label htmlFor="newRole" className="mb-3 block">{t("auth.tryDifferentRole")}</Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as Role)}>
                <SelectTrigger id="newRole" className="bg-white dark:bg-slate-950 border border-input shadow-sm hover:shadow-md">
                  <SelectValue placeholder={t("auth.selectRole")} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-950">
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <span>{ROLE_EMOJIS[role]}</span>
                        <span>{t(`roles.${role.toLowerCase()}`)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{ROLE_EMOJIS[selectedRole]}</span>
                  <div>
                    <h4 className="font-semibold">{t(`roles.${selectedRole.toLowerCase()}`)}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t(`roles.${selectedRole.toLowerCase()}Desc`)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleRegister}
              disabled={!selectedRole || isRegistering}
              className="w-full"
            >
              {isRegistering ? t("auth.connecting") : t("auth.register")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Usuario cancelado/revocado
  if (userInfo.status === UserStatus.Canceled) {
    return (
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
        <Card className="w-full max-w-lg border-orange-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                <span className="text-3xl">🚫</span>
              </div>
            </div>
            <CardTitle className="text-orange-600 dark:text-orange-400">
              {t("userStatus.revoked")}
            </CardTitle>
            <CardDescription>
              {t("auth.contactAdmin")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{t(`roles.${userInfo.role.toLowerCase()}`)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <LoadingSpinner />;
}
