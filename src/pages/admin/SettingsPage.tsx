import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Import Switch component

const settingsFormSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters."),
  company_name: z.string().optional(),
  logo: z.custom<FileList>().optional(),
  logo_width: z.number().min(20).max(300),
  banking_details: z.string().optional(),
  currency: z.string().min(3, "Currency code must be 3 characters (e.g., USD, ZAR)."),
  hero_overlay_opacity: z.number().min(0).max(1).default(0.5), // New field for overlay opacity
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const fetchSettings = async (userId: string) => {
  const { data, error } = await supabase.from("settings").select("*").eq("user_id", userId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const SettingsPage = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings", session?.user.id],
    queryFn: () => fetchSettings(session!.user.id),
    enabled: !!session,
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      store_name: "",
      company_name: "",
      logo_width: 120,
      banking_details: "",
      currency: "USD",
      hero_overlay_opacity: 0.5, // Default value
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        store_name: settings.store_name || "",
        company_name: settings.company_name || "",
        logo_width: settings.logo_width || 120,
        banking_details: settings.banking_details || "",
        currency: settings.currency || "USD",
        hero_overlay_opacity: settings.hero_overlay_opacity ?? 0.5, // Set from fetched settings
      });
    }
  }, [settings, form]);

  const upsertSettingsMutation = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      if (!session) throw new Error("Not authenticated");

      let logoUrl = settings?.logo_url;

      if (values.logo && values.logo.length > 0) {
        const file = values.logo[0];
        const fileName = `public/${session.user.id}/${Date.now()}-${file.name}`;
        
        if (settings?.logo_url) {
            const oldLogoPath = settings.logo_url.split('/store-assets/')[1];
            if (oldLogoPath) {
              await supabase.storage.from('store-assets').remove([oldLogoPath]);
            }
        }

        const { error: uploadError } = await supabase.storage.from("store-assets").upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("store-assets").getPublicUrl(fileName);
        logoUrl = publicUrl;
      }

      const { error } = await supabase.from("settings").upsert({
        user_id: session.user.id,
        store_name: values.store_name,
        company_name: values.company_name,
        logo_url: logoUrl,
        logo_width: values.logo_width,
        banking_details: values.banking_details,
        currency: values.currency,
        hero_overlay_opacity: values.hero_overlay_opacity, // Save new field
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings", session?.user.id] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Store Settings</CardTitle>
        <CardDescription>Manage your store's branding and general information.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(v => upsertSettingsMutation.mutate(v))} className="space-y-8">
            <FormField control={form.control} name="store_name" render={({ field }) => (
              <FormItem><FormLabel>Store Name</FormLabel><FormControl><Input placeholder="My Awesome Store" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="company_name" render={({ field }) => (
              <FormItem><FormLabel>Company Name (Optional)</FormLabel><FormControl><Input placeholder="Awesome Inc." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="logo" render={({ field: { onChange, value, ...restField } }) => (
              <FormItem>
                <FormLabel>Store Logo</FormLabel>
                {settings?.logo_url && <img src={settings.logo_url} alt="Current logo" className="my-2 rounded-md" style={{ width: settings.logo_width || 120, height: 'auto' }} />}
                <FormControl>
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={e => onChange(e.target.files)} 
                    {...restField} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="logo_width" render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Width: {field.value}px</FormLabel>
                <FormControl><Slider defaultValue={[120]} value={[field.value]} onValueChange={v => field.onChange(v[0])} min={20} max={300} step={1} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Currency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USD">USD - United States Dollar</SelectItem>
                      <SelectItem value="ZAR">R - South African Rand</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="hero_overlay_opacity" render={({ field }) => (
              <FormItem>
                <FormLabel>Hero Overlay Opacity: {field.value?.toFixed(1)}</FormLabel>
                <FormControl>
                  <Slider 
                    defaultValue={[0.5]} 
                    value={[field.value ?? 0.5]} 
                    onValueChange={v => field.onChange(v[0])} 
                    min={0} 
                    max={1} 
                    step={0.1} 
                  />
                </FormControl>
                <FormDescription>
                  Adjust the darkness of the overlay on hero banner images (0.0 = transparent, 1.0 = opaque).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="banking_details" render={({ field }) => (
              <FormItem>
                <FormLabel>Banking Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Bank Name: ...&#10;Account Number: ...&#10;Branch Code: ..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  These details will be shown on quotations. Use line breaks for formatting.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" disabled={upsertSettingsMutation.isPending}>
              {upsertSettingsMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SettingsPage;