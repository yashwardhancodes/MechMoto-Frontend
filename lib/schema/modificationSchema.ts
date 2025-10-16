// modification.schema.ts
import { z } from "zod";

export const createModificationSchema = z.object({
	model_lineId: z.number().int().positive("Model line ID is required"),
	name: z.string().min(1, "Name is required"),
});

export const updateModificationSchema = z.object({
	model_lineId: z.number().int().positive().optional(),
	name: z.string().min(1).optional(),
});
