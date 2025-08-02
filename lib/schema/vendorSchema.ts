import { z } from "zod";

export const vendorSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    shop_name: z.string().min(1, "Shop name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number must be at least 10 digits"),
    address: z.string().min(1, "Address is required"),
    state: z.string().min(1, "State is required"),
    city: z.string().min(1, "City is required"),
    country: z.string().min(1, "Country is required"),
    zip: z.string().min(4, "ZIP code is required"),
    
  })
 
