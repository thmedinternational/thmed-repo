import { useSettings } from "@/contexts/SettingsContext";

export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD"; // Default to USD if not set

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amount);
};