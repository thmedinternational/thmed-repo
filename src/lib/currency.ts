import { useSettings } from "@/contexts/SettingsContext";

export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions) => {
  const { settings } = useSettings();
  const currencyCode = settings?.currency || "USD"; // Default to USD if not set

  return new Intl.NumberFormat("en-ZA", { // Changed locale to 'en-ZA'
    style: "currency",
    currency: currencyCode,
    ...options,
  }).format(amount);
};