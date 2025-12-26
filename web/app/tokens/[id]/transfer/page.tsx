"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/contexts/Web3Context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Token, UserStatus, User } from "@/types";
import { formatAddress, isValidAddress } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { TRANSFER_FLOW } from "@/contracts/config";
import { ArrowRight, AlertCircle, CheckCircle } from "lucide-react";

export default function TransferTokenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { isConnected, userInfo, web3Service, account } = useWeb3();
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [balance, setBalance] = useState<bigint>(0n);
  const [pendingTransferAmount, setPendingTransferAmount] = useState<bigint>(0n);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [recipientInfo, setRecipientInfo] = useState<User | null>(null);
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);

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

      if (tokenBalance === 0n) {
        toast({
          variant: "destructive",
          title: "Sin Balance",
          description: "No tienes balance de este token para transferir",
        });
        router.push(`/tokens/${id}`);
        return;
      }

      // Factory solo puede transferir tokens que ellos mismos crearon
      if (userInfo?.role === "Factory" && tokenData.creator.toLowerCase() !== account.toLowerCase()) {
        toast({
          variant: "destructive",
          title: "No Permitido",
          description: "Como Factory, solo puedes transferir tokens que tú creaste (productos manufacturados), no las materias primas recibidas.",
        });
        router.push(`/tokens/${id}`);
        return;
      }

      setToken(tokenData);
      setBalance(tokenBalance);

      // Cargar transferencias pendientes del usuario para este token
      try {
        const transferIds = await web3Service.getUserTransfers(account);
        let pendingAmount = 0n;

        for (const transferId of transferIds) {
          const transfer = await web3Service.getTransfer(transferId);
          // Contar solo las transferencias salientes (from = account) que estén en estado Pending
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
    } catch (error: any) {
      console.error("Error loading token:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al cargar detalles del token",
      });
      router.push("/tokens");
    } finally {
      setIsLoading(false);
    }
  };

  const checkRecipient = async (address: string) => {
    if (!isValidAddress(address)) {
      setRecipientInfo(null);
      return;
    }

    if (address.toLowerCase() === account?.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Destinatario Inválido",
        description: "No puedes transferir tokens a ti mismo",
      });
      setRecipientInfo(null);
      return;
    }

    if (!web3Service) return;

    setIsCheckingRecipient(true);

    try {
      const user = await web3Service.getUserInfo(address);
      setRecipientInfo(user);

      if (!user || user.status !== UserStatus.Approved) {
        toast({
          variant: "destructive",
          title: "Destinatario Inválido",
          description: "El destinatario no está aprobado",
        });
      }
    } catch (error) {
      setRecipientInfo(null);
      toast({
        variant: "destructive",
        title: "Destinatario Inválido",
        description: "Usuario no encontrado o no registrado",
      });
    } finally {
      setIsCheckingRecipient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!web3Service || !userInfo) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Servicio Web3 no inicializado",
      });
      return;
    }

    // Validaciones
    if (!isValidAddress(recipientAddress)) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "Dirección de destinatario inválida",
      });
      return;
    }

    if (recipientAddress.toLowerCase() === account?.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "No puedes transferir a ti mismo",
      });
      return;
    }

    if (!recipientInfo) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "Por favor ingresa una dirección de destinatario válida",
      });
      return;
    }

    if (recipientInfo.status !== UserStatus.Approved) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: "El destinatario no está aprobado",
      });
      return;
    }

    // Validar flujo de transferencia
    const flowValidation = validateTransferFlow();
    if (!flowValidation.valid) {
      toast({
        variant: "destructive",
        title: "Flujo de Transferencia Inválido",
        description: flowValidation.message,
      });
      return;
    }

    const transferAmount = BigInt(amount);
    if (transferAmount <= 0n || transferAmount > availableBalance) {
      toast({
        variant: "destructive",
        title: "Error de Validación",
        description: `La cantidad debe estar entre 1 y ${availableBalance.toString()} (balance disponible)`,
      });
      return;
    }

    setIsTransferring(true);

    try {
      // Ejecutar transferencia
      await web3Service.transfer(recipientAddress, BigInt(id), transferAmount);

      toast({
        title: "✅ Transferencia Iniciada",
        description: "La solicitud de transferencia ha sido enviada. Esperando aceptación del destinatario.",
        variant: "default",
      });

      // Pequeña pausa para que el usuario vea el mensaje antes de redirigir
      setTimeout(() => {
        router.push("/transfers");
      }, 1500);

    } catch (error: any) {
      console.error("Error transferring token:", error);
      
      // Mensajes de error más específicos
      let errorMessage = "Error al transferir el token";
      const errorStr = error.message || error.toString();
      
      // Mapear códigos de error personalizado del contrato
      // 0xf4d678b8 = InvalidTransferFlow()
      if (errorStr.includes("0xf4d678b8") || errorStr.includes("InvalidTransferFlow")) {
        errorMessage = `Flujo de transferencia inválido. Como ${userInfo?.role}, solo puedes transferir a: ${allowedRoles.join(", ")}`;
      } else if (errorStr.includes("rejected") || errorStr.includes("denied")) {
        errorMessage = "Transacción rechazada por el usuario";
      } else if (errorStr.includes("insufficient") || errorStr.includes("0x36c02340")) {
        errorMessage = "Balance insuficiente para realizar la transferencia";
      } else if (errorStr.includes("InsufficientBalance") || errorStr.includes("0x36c02340")) {
        errorMessage = "No tienes suficiente balance de este token";
      } else if (errorStr.includes("RecipientNotApproved") || errorStr.includes("0xd4a1a06f")) {
        errorMessage = "El destinatario no está aprobado para operar en el sistema";
      } else if (errorStr.includes("SelfTransferNotAllowed") || errorStr.includes("0x5fc3e81f")) {
        errorMessage = "No puedes transferir tokens a ti mismo";
      } else if (errorStr.includes("TokenNotFound")) {
        errorMessage = "El token no existe o ha sido eliminado";
      } else if (errorStr.includes("InvalidAmount")) {
        errorMessage = "La cantidad debe ser mayor a 0";
      } else if (errorStr.includes("unknown custom error")) {
        // Error genérico del contrato - mostrar el código
        errorMessage = "Error en la validación del contrato. Por favor verifica tus datos e intenta de nuevo.";
      } else if (errorStr) {
        errorMessage = errorStr;
      }

      toast({
        variant: "destructive",
        title: "❌ Error en Transferencia",
        description: errorMessage,
      });
    } finally {
      setIsTransferring(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!token) {
    return null;
  }

  const allowedRoles = userInfo ? (TRANSFER_FLOW[userInfo.role as keyof typeof TRANSFER_FLOW] || []) : [];
  
  // Debug: Log de roles para diagnóstico
  if (userInfo && allowedRoles.length === 0) {
    console.warn(`TRANSFER_FLOW: User role "${userInfo.role}" not found in TRANSFER_FLOW`, { availableRoles: Object.keys(TRANSFER_FLOW) });
  }
  
  const isValidRecipient = recipientInfo &&
    recipientInfo.status === UserStatus.Approved &&
    allowedRoles.length > 0 &&
    allowedRoles.includes(recipientInfo.role as any);

  // Calcular balance disponible (restar transferencias pendientes)
  const availableBalance = balance - pendingTransferAmount;
  
  // Validar cantidad
  let isValidAmount = false;
  let amountError = "";
  
  if (amount) {
    try {
      const transferAmount = BigInt(amount);
      isValidAmount = transferAmount > 0n && transferAmount <= availableBalance;
      
      if (!isValidAmount) {
        if (transferAmount <= 0n) {
          amountError = "Amount must be greater than 0";
        } else if (transferAmount > availableBalance) {
          amountError = `Exceeds available balance of ${availableBalance.toString()}`;
        }
      }
    } catch (e) {
      amountError = "Invalid amount";
    }
  }

  // Función auxiliar para validar flujo en handleSubmit
  const validateTransferFlow = () => {
    // Validar flujo de transferencia
    const currentAllowedRoles = TRANSFER_FLOW[userInfo!.role as keyof typeof TRANSFER_FLOW] || [];
    if (currentAllowedRoles.length === 0) {
      return {
        valid: false,
        message: `El rol ${userInfo!.role} no tiene permisos de transferencia configurados`,
      };
    }

    if (!currentAllowedRoles.includes(recipientInfo!.role as any)) {
      return {
        valid: false,
        message: `Como ${userInfo!.role}, solo puedes transferir a: ${currentAllowedRoles.join(", ")}`,
      };
    }

    return { valid: true };
  };

  return (
    <div className="container py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="h-6 w-6 text-primary" />
            Transferir Token
          </CardTitle>
          <CardDescription>
            Transferir {token.name} a otro usuario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Token Info */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Token</span>
                  <span className="font-semibold">{token.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tu Balance</span>
                  <span className="font-semibold text-primary">{balance.toString()}</span>
                </div>
                {pendingTransferAmount > 0n && (
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">En Transferencia Pendiente</span>
                    <span className="font-semibold text-orange-600">{pendingTransferAmount.toString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm text-muted-foreground font-semibold">Balance Disponible</span>
                  <span className="font-bold text-green-600">{availableBalance.toString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tu Rol</span>
                  <Badge>{userInfo?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Flow Info */}
          {allowedRoles.length > 0 ? (
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">
                    Flujo de Transferencia Permitido
                  </p>
                  <p className="text-blue-800 dark:text-blue-200 mt-1">
                    Como <strong>{userInfo?.role}</strong>, solo puedes transferir a:{" "}
                    <strong>{allowedRoles.join(", ")}</strong>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">
                    Sin Permisos de Transferencia
                  </p>
                  <p className="text-orange-800 dark:text-orange-200 mt-1">
                    El rol <strong>{userInfo?.role}</strong> no tiene permisos configurados para realizar transferencias
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Address */}
            <div className="space-y-2">
              <Label htmlFor="recipient">
                Dirección del Destinatario <span className="text-destructive">*</span>
              </Label>
              <Input
                id="recipient"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => {
                  setRecipientAddress(e.target.value);
                  if (e.target.value.length === 42) {
                    checkRecipient(e.target.value);
                  } else {
                    setRecipientInfo(null);
                  }
                }}
                required
                disabled={allowedRoles.length === 0}
              />
              {isCheckingRecipient && (
                <p className="text-sm text-muted-foreground">Verificando destinatario...</p>
              )}
              {recipientInfo && (
                <div className={`p-3 border rounded-lg ${
                  isValidRecipient 
                    ? "bg-green-50 dark:bg-green-950 border-green-500 dark:border-green-700" 
                    : "bg-red-50 dark:bg-red-950 border-red-500 dark:border-red-700"
                }`}>
                  <div className="flex items-start gap-2">
                    {isValidRecipient ? (
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        {recipientInfo.role} - {recipientInfo.status === UserStatus.Approved ? "Aprobado" : "No Aprobado"}
                      </p>
                      {!isValidRecipient && allowedRoles.length > 0 && (
                        <p className="text-red-800 dark:text-red-200 mt-1">
                          Destinatario inválido. Debe ser un {allowedRoles.join(" o ")} aprobado.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Cantidad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                max={availableBalance.toString()}
                placeholder={`Máximo: ${availableBalance.toString()}`}
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  setAmount(value);
                }}
                onWheel={(e) => e.currentTarget.blur()}
                required
                disabled={allowedRoles.length === 0}
                className={amountError ? "border-red-500" : ""}
              />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Disponible: {availableBalance.toString()}</span>
                {amountError && (
                  <span className="text-red-500 font-medium">{amountError}</span>
                )}
                {isValidAmount && (
                  <span className="text-green-500 font-medium">✓ Cantidad válida</span>
                )}
              </div>
              {!isValidAmount && amount && (
                <div className="p-3 border rounded-lg bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-200">
                    La cantidad debe ser mayor a 0 y no puede exceder tu balance disponible de {availableBalance.toString()}
                    {pendingTransferAmount > 0n && ` (tienes ${pendingTransferAmount.toString()} en transferencias pendientes)`}
                  </p>
                </div>
              )}
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setAmount(availableBalance.toString())}
                disabled={allowedRoles.length === 0 || availableBalance === 0n}
              >
                Usar Máximo
              </Button>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isTransferring}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isTransferring || !isValidRecipient || !isValidAmount || allowedRoles.length === 0}
                className="flex-1"
              >
                {isTransferring ? "Transfiriendo..." : "Transferir"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
