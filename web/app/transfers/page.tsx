"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { TransferCard } from "@/components/TransferCard";
import { Transfer, TransferStatus, UserStatus, Token } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { Inbox, Send, List, X } from "lucide-react";

export default function TransfersPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isConnected, userInfo, web3Service, account, isAdmin } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [tokenNames, setTokenNames] = useState<Map<string, string>>(new Map());
  const [activeTab, setActiveTab] = useState<"pending" | "sent" | "received" | "rejected" | "all">("pending");

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

    loadTransfers();
  }, [isConnected, userInfo, isAdmin, router]);

  const loadTransfers = async () => {
    if (!web3Service || !account) return;

    try {
      setIsLoading(true);

      const transferIds = await web3Service.getUserTransfers(account);
      const transfersList: Transfer[] = [];
      const names = new Map<string, string>();

      for (const transferId of transferIds) {
        const transfer = await web3Service.getTransfer(transferId);
        transfersList.push(transfer);

        // Cargar nombre del token si no lo tenemos
        const tokenIdStr = transfer.tokenId.toString();
        if (!names.has(tokenIdStr)) {
          try {
            const token = await web3Service.getToken(transfer.tokenId);
            names.set(tokenIdStr, token.name);
          } catch (error) {
            names.set(tokenIdStr, `Token #${tokenIdStr}`);
          }
        }
      }

      // Ordenar por fecha (más reciente primero)
      transfersList.sort((a, b) => Number(b.dateCreated - a.dateCreated));

      setTransfers(transfersList);
      setTokenNames(names);
    } catch (error) {
      console.error("Error loading transfers:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("transfers.failedToLoad"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTransfer = async (transferId: bigint) => {
    if (!web3Service) return;

    try {
      await web3Service.acceptTransfer(transferId);
      toast({
        variant: "success",
        title: t("transfers.transferAccepted"),
        description: t("transfers.transferAcceptedDesc"),
      });
      await loadTransfers();
    } catch (error: any) {
      console.error("Error accepting transfer:", error);

      // Decodificar error
      let errorMsg = error.message || error.toString();

      if (errorMsg.includes("0xf4d678b8") || errorMsg.includes("InvalidTransferFlow")) {
        errorMsg = t("transfers.errorMessages.invalidFlow");
      } else if (errorMsg.includes("InsufficientBalance")) {
        errorMsg = t("transfers.errorMessages.insufficientBalance");
      } else if (errorMsg.includes("NotTransferRecipient")) {
        errorMsg = t("transfers.errorMessages.notRecipient");
      } else if (errorMsg.includes("TransferAlreadyProcessed")) {
        errorMsg = t("transfers.errorMessages.alreadyProcessed");
      } else if (errorMsg.includes("TransferNotFound")) {
        errorMsg = t("transfers.errorMessages.notFound");
      }

      toast({
        variant: "destructive",
        title: t("common.error"),
        description: errorMsg,
      });
    }
  };

  const handleRejectTransfer = async (transferId: bigint) => {
    if (!web3Service) return;

    try {
      await web3Service.rejectTransfer(transferId);
      toast({
        variant: "success",
        title: t("transfers.transferRejected"),
        description: t("transfers.transferRejectedDesc"),
      });
      await loadTransfers();
    } catch (error: any) {
      console.error("Error rejecting transfer:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: error.message || t("transfers.failedToReject"),
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Filtrar transferencias según la pestaña activa
  const pendingTransfers = transfers.filter(
    t => t.status === TransferStatus.Pending && t.to.toLowerCase() === account?.toLowerCase()
  );

  const sentTransfers = transfers.filter(
    t => t.from.toLowerCase() === account?.toLowerCase()
  );

  const receivedTransfers = transfers.filter(
    t => t.to.toLowerCase() === account?.toLowerCase() && t.status === TransferStatus.Accepted
  );

  const rejectedTransfers = transfers.filter(
    t => t.to.toLowerCase() === account?.toLowerCase() && t.status === TransferStatus.Rejected
  );

  const filteredTransfers = () => {
    switch (activeTab) {
      case "pending":
        return pendingTransfers;
      case "sent":
        return sentTransfers;
      case "received":
        return receivedTransfers;
      case "rejected":
        return rejectedTransfers;
      default:
        return transfers;
    }
  };

  const displayTransfers = filteredTransfers();

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t("transfers.title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("transfers.descriptionFull")}
        </p>
      </div>

      {/* Pending Transfers Alert */}
      {pendingTransfers.length > 0 && activeTab !== "pending" && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Inbox className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {t("transfers.pendingTransfersAlert", {
                    count: pendingTransfers.length,
                    plural: pendingTransfers.length > 1 ? "s" : ""
                  })}
                </p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-yellow-700"
                  onClick={() => setActiveTab("pending")}
                >
                  {t("transfers.viewPendingTransfers")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        <Button
          variant={activeTab === "pending" ? "default" : "ghost"}
          onClick={() => setActiveTab("pending")}
          className="relative"
        >
          <Inbox className="mr-2 h-4 w-4" />
          {t("transfers.pending")} ({pendingTransfers.length})
          {pendingTransfers.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-yellow-500 text-white text-xs flex items-center justify-center">
              {pendingTransfers.length}
            </span>
          )}
        </Button>
        <Button
          variant={activeTab === "sent" ? "default" : "ghost"}
          onClick={() => setActiveTab("sent")}
        >
          <Send className="mr-2 h-4 w-4" />
          {t("transfers.sent")} ({sentTransfers.length})
        </Button>
        <Button
          variant={activeTab === "received" ? "default" : "ghost"}
          onClick={() => setActiveTab("received")}
        >
          <Inbox className="mr-2 h-4 w-4" />
          {t("transfers.received")} ({receivedTransfers.length})
        </Button>
        <Button
          variant={activeTab === "rejected" ? "default" : "ghost"}
          onClick={() => setActiveTab("rejected")}
        >
          <X className="mr-2 h-4 w-4" />
          {t("transfers.rejected")} ({rejectedTransfers.length})
        </Button>
        <Button
          variant={activeTab === "all" ? "default" : "ghost"}
          onClick={() => setActiveTab("all")}
        >
          <List className="mr-2 h-4 w-4" />
          {t("transfers.all")} ({transfers.length})
        </Button>
      </div>

      {/* Transfers List */}
      {displayTransfers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {activeTab === "pending" && t("transfers.noPendingTransfers")}
              {activeTab === "sent" && t("transfers.noSentTransfers")}
              {activeTab === "received" && t("transfers.noReceivedTransfers")}
              {activeTab === "rejected" && t("transfers.noRejectedTransfers")}
              {activeTab === "all" && t("transfers.noTransfersYet")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {displayTransfers.map((transfer) => {
            const isPending = transfer.status === TransferStatus.Pending;
            const isRecipient = transfer.to.toLowerCase() === account?.toLowerCase();
            const showActions = isPending && isRecipient;

            return (
              <TransferCard
                key={transfer.id.toString()}
                transfer={transfer}
                tokenName={tokenNames.get(transfer.tokenId.toString())}
                showActions={showActions}
                onAccept={showActions ? () => handleAcceptTransfer(transfer.id) : undefined}
                onReject={showActions ? () => handleRejectTransfer(transfer.id) : undefined}
              />
            );
          })}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transfers.totalSent")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sentTransfers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentTransfers.filter(t => t.status === TransferStatus.Pending).length} {t("transfers.pending").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transfers.totalReceived")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedTransfers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {receivedTransfers.filter(t => t.status === TransferStatus.Accepted).length} {t("transfers.accepted").toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transfers.totalRejected")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedTransfers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("transfers.incomingRejected")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t("transfers.pendingAction")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingTransfers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("transfers.awaitingResponse")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
