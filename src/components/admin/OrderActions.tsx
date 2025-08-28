import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import type { Order } from "@/pages/admin/OrdersPage";

type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";
const statuses: OrderStatus[] = ["pending", "paid", "shipped", "cancelled"];

interface OrderActionsProps {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

export const OrderActions = ({ order, onStatusChange, isUpdating }: OrderActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Update Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status}
            disabled={order.status === status || isUpdating}
            onClick={() => onStatusChange(order.id, status)}
            className="capitalize"
          >
            Mark as {status}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};