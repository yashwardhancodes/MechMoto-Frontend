import { z } from "zod";

export const serviceCenterSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Service center name is required").max(150),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be a valid 10-digit number")
    .optional(),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z
    .string()
    .regex(/^\d{5,6}$/, "ZIP must be 5–6 digits")
    .optional(),
  country: z.string().default("India"),
    email: z.string().email("Invalid email address"),   
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  is_active: z.boolean().default(true),
  geom: z.string().optional(), // WKT or GeoJSON string
});

export type ServiceCenterSchema = z.infer<typeof serviceCenterSchema>;
