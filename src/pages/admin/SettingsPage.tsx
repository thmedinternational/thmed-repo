import { useEffect, useState } from "react";
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
import { ImageCropperDialog } from "@/components/admin/ImageCropperDialog"; // Import ImageCropperDialog

const settingsFormSchema = z.object({
  store_name: z.string().min(2, "Store name must be at least 2 characters."),
  company_name: z.string().optional(),
  logo: z.custom<FileList>().optional(),
  logo_width: z.number().min(20).max(300),
  banking_details: z.string().optional(),
  currency: z.string().min(3, "Currency code must be 3 characters (e.g., USD, ZAR)."),
  show_store_name: z.boolean().default(true), // New field for toggling store name
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
      show_store_name: true, // Default to true
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(settings?.logo_url ?? null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  useEffect(() => {
    if (settings) {
      form.reset({
        store_name: settings.store_name || "",
        company_name: settings.company_name || "",
        logo_width: settings.logo_width || 120,
        banking_details: settings.banking_details || "",
        currency: settings.currency || "USD",
        show_store_name: settings.show_store_name ?? true, // Set from fetched settings
      });
      setImagePreview(settings.logo_url);
    }
  }, [settings, form]);

  const handleFileChangeForCropper = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setImageToCrop(fileUrl);
      setIsCropperOpen(true);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(croppedFile);
    form.setValue("logo", dataTransfer.files, { shouldValidate: true });
    setImagePreview(URL.createObjectURL(croppedFile));
    setIsCropperOpen(false);
    setImageToCrop(null);
    toast.success("Logo cropped successfully!");
  };

  const handleCropperClose = () => {
    setIsCropperOpen(false);
    setImageToCrop(null);
    // Optionally, clear the file input if the user cancels cropping
    form.setValue("logo", undefined);
    setImagePreview(settings?.logo_url ?? null); // Revert to original preview if available
  };

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
        show_store_name: values.show_store_name, // Save new field
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
            <FormItem>
              <FormLabel>Store Logo</FormLabel>
              {imagePreview && <img src={imagePreview} alt="Current logo" className="my-2 rounded-md" style={{ width: form.getValues("logo_width") || 120, height: 'auto' }} />}
              <FormControl>
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChangeForCropper} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            <FormField control={form.control} name="logo_width" render={({ field }) => (
              <FormItem>
                <FormLabel>Logo Width: {field.value}px</FormLabel>
                <FormControl><Slider defaultValue={[120]} value={[field.value]} onValueChange={v => field.onChange(v[0])} min={20} max={300} step={1} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField
              control={form.control}
              name="show_store_name"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Show Store Name Next to Logo</FormLabel>
                    <FormDescription>
                      Toggle to display or hide the store name alongside the logo in the header and footer.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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

        {imageToCrop && (
          <ImageCropperDialog
            imageSrc={imageToCrop}
            isOpen={isCropperOpen}
            onClose={handleCropperClose}
            onCropComplete={handleCropComplete}
            aspectRatio={1} // Default to square for logos, can be adjusted
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SettingsPage;