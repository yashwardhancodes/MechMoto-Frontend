import { z } from "zod";

export const updateShipmentSchema = z.object({
  carrier: z.string().min(1, "Carrier is required").optional(),
  tracking_number: z.string().min(1, "Tracking number is required").optional(),
  status: z.enum(["pending", "shipped", "in_transit", "delivered"]).optional(),
  shipped_at: z.string().datetime().optional(),
  estimated_delivery: z.string().datetime().optional(),
  delivered_at: z.string().datetime().optional(),
});