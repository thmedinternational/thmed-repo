import { useSettings } from "@/contexts/SettingsContext"; // Keep import for context, but not used directly in formatCurrency

export const formatCurrency = (amount: number, currencyCode: string, options?: Intl.NumberFormatOptions) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amount);
};