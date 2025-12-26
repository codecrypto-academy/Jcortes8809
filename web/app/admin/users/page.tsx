"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { UserStatusBadge } from "@/components/UserStatusBadge";
import { User, UserStatus } from "@/types";
import { formatAddress, copyToClipboard } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { ROLE_EMOJIS } from "@/lib/constants";
import { Users, Check, X, RotateCcw, Copy } from "lucide-react";

export default function AdminUsersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  useEffect(() => {
    if (!isConnected || !userInfo || userInfo.status !== UserStatus.Approved) {
      router.push("/");
      return;
    }

    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: t("admin.accessDenied"),
        description: t("admin.accessDeniedDesc"),
      });
      router.push("/dashboard");
      return;
    }

    loadUsers();
  }, [isConnected, userInfo, isAdmin, router]);

  const loadUsers = async () => {
    if (!web3Service) return;

    try {
      setIsLoading(true);

      // Obtener todos los usuarios del contrato
      const allUsers = await web3Service.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("admin.errorLoadingUsers"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeStatus = async (userAddress: string, newStatus: UserStatus) => {
    if (!web3Service) return;

    try {
      await web3Service.changeUserStatus(userAddress, newStatus);

      const statusName = {
        [UserStatus.Pending]: t("userStatus.pending"),
        [UserStatus.Approved]: t("userStatus.approved"),
        [UserStatus.Rejected]: t("userStatus.rejected"),
        [UserStatus.Canceled]: t("userStatus.revoked"),
      }[newStatus];

      toast({
        title: t("admin.statusUpdated"),
        description: t("admin.statusUpdatedDesc", { status: statusName }),
        variant: "default",
      });

      await loadUsers();
    } catch (error: any) {
      console.error("Error changing user status:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message || t("admin.errorChangingStatus"),
      });
    }
  };

  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
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

  const filteredUsers = users.filter(user => {
    if (filter === "all") return true;
    if (filter === "pending") return user.status === UserStatus.Pending;
    if (filter === "approved") return user.status === UserStatus.Approved;
    if (filter === "rejected") return user.status === UserStatus.Rejected;
    return true;
  });

  const stats = {
    total: users.length,
    pending: users.filter(u => u.status === UserStatus.Pending).length,
    approved: users.filter(u => u.status === UserStatus.Approved).length,
    rejected: users.filter(u => u.status === UserStatus.Rejected).length,
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Users className="h-8 w-8" />
          {t("admin.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("admin.description")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("admin.totalUsers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("admin.pending")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("admin.approved")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("admin.rejected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
          size="sm"
        >
          {t("admin.all")} ({stats.total})
        </Button>
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          size="sm"
        >
          {t("admin.pending")} ({stats.pending})
        </Button>
        <Button
          variant={filter === "approved" ? "default" : "outline"}
          onClick={() => setFilter("approved")}
          size="sm"
        >
          {t("admin.approved")} ({stats.approved})
        </Button>
        <Button
          variant={filter === "rejected" ? "default" : "outline"}
          onClick={() => setFilter("rejected")}
          size="sm"
        >
          {t("admin.rejected")} ({stats.rejected})
        </Button>
      </div>

      {/* Manual User Lookup */}
      <Card>
        <CardHeader>
          <CardTitle>{t("admin.lookup")}</CardTitle>
          <CardDescription>
            {t("admin.lookupDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const address = formData.get("address") as string;

              if (!web3Service) return;

              try {
                const user = await web3Service.getUserInfo(address);
                const statusName = {
                  [UserStatus.Pending]: t("userStatus.pending"),
                  [UserStatus.Approved]: t("userStatus.approved"),
                  [UserStatus.Rejected]: t("userStatus.rejected"),
                  [UserStatus.Canceled]: t("userStatus.revoked"),
                }[user.status];

                toast({
                  title: t("admin.userFound"),
                  description: `${user.role} - ${statusName}`,
                });
              } catch (error) {
                toast({
                  variant: "destructive",
                  title: t("admin.userNotFound"),
                  description: t("admin.noUsersFound"),
                });
              }
            }}
            className="flex gap-2"
          >
            <input
              name="address"
              placeholder="0x..."
              className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              required
            />
            <Button type="submit">{t("admin.search")}</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {filter === "all" && t("admin.noUsersFound")}
              {filter === "pending" && t("admin.noPendingUsers")}
              {filter === "approved" && t("admin.noApprovedUsers")}
              {filter === "rejected" && t("admin.noRejectedUsers")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.userAddress}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {ROLE_EMOJIS[user.role as keyof typeof ROLE_EMOJIS]}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {formatAddress(user.userAddress)}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyAddress(user.userAddress)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge>{user.role}</Badge>
                          <UserStatusBadge status={user.status} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {user.status === UserStatus.Pending && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          onClick={() => handleChangeStatus(user.userAddress, UserStatus.Approved)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {t("admin.approve")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                          onClick={() => handleChangeStatus(user.userAddress, UserStatus.Rejected)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          {t("admin.reject")}
                        </Button>
                      </>
                    )}

                    {user.status === UserStatus.Rejected && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => handleChangeStatus(user.userAddress, UserStatus.Pending)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("admin.restore")}
                      </Button>
                    )}

                    {user.status === UserStatus.Canceled && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        onClick={() => handleChangeStatus(user.userAddress, UserStatus.Pending)}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        {t("admin.restore")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
