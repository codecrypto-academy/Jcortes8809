"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Transfer, TransferStatus } from "@/types";
import { formatAddress, formatDate } from "@/lib/utils";
import { ArrowRight, Calendar, Package, Check, X } from "lucide-react";
import { TRANSFER_STATUS_LABELS } from "@/lib/constants";

interface TransferCardProps {
  transfer: Transfer;
  tokenName?: string;
  onAccept?: () => Promise<void>;
  onReject?: () => Promise<void>;
  showActions?: boolean;
}

export function TransferCard({
  transfer,
  tokenName,
  onAccept,
  onReject,
  showActions = false
}: TransferCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const getStatusVariant = (status: TransferStatus) => {
    switch (status) {
      case TransferStatus.Pending:
        return "warning";
      case TransferStatus.Accepted:
        return "success";
      case TransferStatus.Rejected:
        return "destructive";
      default:
        return "default";
    }
  };

  const handleAccept = async () => {
    if (!onAccept) return;
    setIsProcessing(true);
    try {
      await onAccept();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;
    setIsProcessing(true);
    try {
      await onReject();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">
            Transfer #{transfer.id.toString()}
          </CardTitle>
          <Badge variant={getStatusVariant(transfer.status) as any}>
            {TRANSFER_STATUS_LABELS[transfer.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {tokenName && (
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <span className="font-semibold">{tokenName}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">From:</span>
          <code className="bg-muted px-2 py-1 rounded text-xs">
            {formatAddress(transfer.from)}
          </code>
        </div>

        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">To:</span>
          <code className="bg-muted px-2 py-1 rounded text-xs">
            {formatAddress(transfer.to)}
          </code>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <p className="font-semibold">{transfer.amount.toString()}</p>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Token ID:</span>
            <p className="font-semibold">#{transfer.tokenId.toString()}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(transfer.dateCreated)}</span>
        </div>
      </CardContent>
      {showActions && transfer.status === TransferStatus.Pending && (onAccept || onReject) && (
        <CardFooter className="gap-2">
          {onReject && (
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={isProcessing}
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          )}
          {onAccept && (
            <Button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Accept
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
