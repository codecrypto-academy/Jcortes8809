"use client";

import { Badge } from "@/components/ui/badge";
import { UserStatus } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const { t } = useLanguage();

  const getVariant = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Pending:
        return "warning";
      case UserStatus.Approved:
        return "success";
      case UserStatus.Rejected:
        return "destructive";
      case UserStatus.Canceled:
        return "secondary";
      default:
        return "default";
    }
  };

  const getLabel = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Pending:
        return t("userStatus.pending");
      case UserStatus.Approved:
        return t("userStatus.approved");
      case UserStatus.Rejected:
        return t("userStatus.rejected");
      case UserStatus.Canceled:
        return t("userStatus.revoked");
      default:
        return "Unknown";
    }
  };

  return (
    <Badge variant={getVariant(status) as any}>
      {getLabel(status)}
    </Badge>
  );
}
