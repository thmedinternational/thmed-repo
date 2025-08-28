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

const settingsFormSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters."),
  company_name: z.string().optional(),
  logo: z.custom<FileList>().optional(),
  logo_width: z.number().min(20).max(300),
  banking_details: z.string().optional(),
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
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        store_name: settings.store_name || "",
        company_name: settings.company_name || "",
        logo_width: settings.logo_width || 120,
        banking_details: settings.banking_details || "",
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
            const oldLogoKey = settings.logo_url.split('/').slice(-2).join('/');
            await supabase.storage.from('store-assets').remove([oldLogoKey]);
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
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["settings", session?.user.id] });
      window.location.reload();
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
            <FormField control={form.control} name="logo" render={({ field: { onChange, ...rest } }) => (
              <FormItem>
                <FormLabel>Store Logo</FormLabel>
                {settings?.logo_url && <img src={settings.logo_url} alt="Current logo" className="my-2 rounded-md" style={{ width: settings.logo_width || 120, height: 'auto' }} />}
                <FormControl><Input type="file" accept="image/*" onChange={e => onChange(e.target.files)} {...rest} /></FormControl>
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