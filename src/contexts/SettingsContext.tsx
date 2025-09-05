import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export type StoreSettings = {
  store_name: string | null;
  company_name: string | null;
  logo_url: string | null;
  logo_width: number | null;
  banking_details: string | null;
  currency: string | null; // Added currency field
};

interface SettingsContextType {
  settings: StoreSettings | null;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!session) {
        setLoading(false);
        return;
      };

      setLoading(true);
      const { data, error } = await supabase
        .from('settings')
        .select('store_name, company_name, logo_url, logo_width, banking_details, currency') // Select currency
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error("Error fetching settings:", error);
      }
      
      setSettings(data);
      setLoading(false);
    };

    fetchSettings();
  }, [session]);

  const value = { settings, loading };

  return <SettingsContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};