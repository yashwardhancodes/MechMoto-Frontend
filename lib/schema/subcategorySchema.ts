
import { z } from "zod";

export const createSubcategorySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  imgSrc: z.string().min(3, "Image URL is required").optional(),
  categoryId: z.number().int().positive("Category ID must be a positive integer").optional(),
});