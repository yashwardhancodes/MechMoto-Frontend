import { z } from "zod";

export const createPartSchema = z.object({
  vehicleId: z.number().int().positive("Vehicle ID must be a positive integer").optional(),
  subcategoryId: z.number().int().positive("Subcategory ID must be a positive integer").optional(),
  partNumber: z.string().min(1, "Part number is required"),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").default(1),
  imageUrls: z.array(z.string()).default([]),
  price: z.number().positive("Price must be positive"),
  remarks: z.string().optional(),
  availabilityStatus: z.string().default("Unavailable"),
  origin: z.string().default("OEM"),
  partBrandId: z.number().int().positive("Part Brand ID must be a positive integer").optional(),
  discountId: z.number().int().positive("Discount ID must be a positive integer").optional(),
});

export const updatePartSchema = z.object({
  vehicleId: z.number().int().positive("Vehicle ID must be a positive integer").optional(),
  subcategoryId: z.number().int().positive("Subcategory ID must be a positive integer").optional(),
  partNumber: z.string().min(1, "Part number is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional(),
  imageUrls: z.array(z.string()).optional(),
  price: z.number().positive("Price must be positive").optional(),
  remarks: z.string().optional(),
  availabilityStatus: z.string().optional(),
  origin: z.string().optional(),
  partBrandId: z.number().int().positive("Part Brand ID must be a positive integer").optional(),
  // discountId: z.number().int().positive("Discount ID must be a positive integer").optional(),
});