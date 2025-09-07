import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthContext: Initializing session check.");
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("AuthContext: Error fetching Supabase session:", error);
        } else {
          setSession(session);
          console.log("AuthContext: Session fetched:", session);
        }
      } catch (err) {
        console.error("AuthContext: An unexpected error occurred while getting Supabase session:", err);
      } finally {
        setLoading(false);
        console.log("AuthContext: Loading set to false.");
      }
    }
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("AuthContext: Auth state changed, new session:", session);
    });

    return () => {
      subscription.unsubscribe();
      console.log("AuthContext: Auth state subscription unsubscribed.");
    };
  }, []);

  const value = {
    session,
    loading,
  };

  console.log("AuthContext: Rendered with session:", session, "loading:", loading);

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};