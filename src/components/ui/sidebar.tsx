"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

// 1. Sidebar Context
interface SidebarContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SidebarContext = React.createContext<SidebarContextType | undefined>(undefined);

// 2. SidebarProvider
const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ open, setOpen }), [open]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
};

// 3. useSidebar hook
const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

// 4. Sidebar Variants
const sidebarVariants = cva(
  "fixed inset-y-0 z-50 flex h-full flex-col border-r bg-background transition-all duration-300 ease-in-out",
  {
    variants: {
      side: {
        left: "left-0 border-r",
        right: "right-0 border-l",
      },
      variant: {
        default: "data-[state=open]:w-64 data-[state=closed]:w-0 md:data-[state=closed]:w-16",
        floating: "m-2 rounded-lg shadow-lg border data-[state=open]:w-64 data-[state=closed]:w-0 md:data-[state=closed]:w-16",
        inset: "m-2 rounded-xl shadow-none border-none data-[state=open]:w-64 data-[state=closed]:w-0 md:data-[state=closed]:w-16",
      },
      collapsible: {
        default: "",
        icon: "md:data-[state=closed]:w-16", // This applies only to md screens when closed
        offcanvas: "w-0", // This forces it closed on all screens
      },
    },
    compoundVariants: [
      {
        collapsible: "icon",
        className: "data-[state=open]:w-64 md:data-[state=closed]:w-16",
      },
      {
        collapsible: "offcanvas",
        className: "w-0", // Overrides default width to always be closed
      }
    ],
    defaultVariants: {
      side: "left",
      variant: "default",
      collapsible: "default",
    },
  }
);

// 5. Sidebar Component
interface SidebarProps extends VariantProps<typeof sidebarVariants> {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ side = "left", className, children, open: controlledOpen, onOpenChange: controlledOnOpenChange, variant, collapsible, ...props }, ref) => {
    const { open: contextOpen, setOpen: setContextOpen } = useSidebar();
    const isOpen = controlledOpen !== undefined ? controlledOpen : contextOpen;
    const onOpenChange = controlledOnOpenChange !== undefined ? controlledOnOpenChange : setContextOpen;

    return (
      <SheetPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
        <SheetPrimitive.Portal>
          <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:hidden" />
          <SheetPrimitive.Content
            ref={ref}
            className={cn(sidebarVariants({ side, variant, collapsible }), className)}
            {...props}
          >
            {children}
            <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none md:hidden">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </SheetPrimitive.Close>
          </SheetPrimitive.Content>
        </SheetPrimitive.Portal>
      </SheetPrimitive.Root>
    );
  }
);
Sidebar.displayName = "Sidebar";

// 6. SidebarHeader
const SidebarHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-center justify-between border-b px-4 py-3", className)}
    {...props}
  />
);
SidebarHeader.displayName = "SidebarHeader";

// 7. SidebarContent
const SidebarContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-auto p-4", className)} {...props} />
);
SidebarContent.displayName = "SidebarContent";

// 8. SidebarFooter
const SidebarFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-2 border-t p-4", className)}
    {...props}
  />
);
SidebarFooter.displayName = "SidebarFooter";

// 9. SidebarMenu
const SidebarMenu = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <nav className={cn("grid gap-1 p-2", className)} {...props} />
);
SidebarMenu.displayName = "SidebarMenu";

// 10. SidebarMenuItem
const SidebarMenuItem = ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("relative", className)} {...props} />
);
SidebarMenuItem.displayName = "SidebarMenuItem";

// 11. SidebarMenuButton
interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  isActive?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarMenuButtonProps
>(({ className, isActive, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    className={cn(
      "w-full justify-start gap-2 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
      className
    )}
    {...props}
  />
));
SidebarMenuButton.displayName = "SidebarMenuButton";

// 12. SidebarTrigger
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Trigger ref={ref} className={cn(className)} {...props} />
));
SidebarTrigger.displayName = SheetPrimitive.Trigger.displayName;

// 13. SidebarInset
const SidebarInset = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex min-h-svh flex-1 flex-col", className)} {...props} />
);
SidebarInset.displayName = "SidebarInset";

export {
  SidebarProvider,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
};