// Estos son solo los emojis y colores que no cambian con el idioma
// Las etiquetas de texto se obtienen de las traducciones

export const ROLE_EMOJIS = {
  Producer: "👨‍🌾",
  Factory: "🏭",
  Retailer: "🏪",
  Consumer: "🛒",
  Admin: "👑",
} as const;

export const ROLE_DESCRIPTIONS = {
  Producer: "Creates and produces tokens for supply chain tracking",
  Factory: "Processes and transforms products in the supply chain",
  Retailer: "Distributes and sells products to consumers",
  Consumer: "Purchases and receives products",
  Admin: "Manages users and maintains platform integrity",
} as const;

export const STATUS_COLORS = {
  Pending: "warning",
  Approved: "success",
  Rejected: "destructive",
  Canceled: "secondary",
  Revoked: "secondary",
} as const;

export const TRANSFER_STATUS_COLORS = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "destructive",
} as const;

export const TRANSFER_STATUS_LABELS = {
  Pending: "Pending",
  Accepted: "Accepted",
  Rejected: "Rejected",
} as const;
