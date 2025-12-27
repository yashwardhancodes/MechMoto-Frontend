// src/lib/schema/modificationSchema.ts
import { z } from "zod";

export const createModificationSchema = z.object({
	name: z.string().min(1, "Modification name is required").trim(),
	modelIds: z.array(z.number().int().positive()).min(1, "At least one generation must be selected"),
});

export const updateModificationSchema = z.object({
	name: z.string().min(1).trim().optional(),
	modelIds: z.array(z.number().int().positive()).min(1, "At least one generation must be selected").optional(),
});