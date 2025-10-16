import { z } from "zod";

export const vehicleSchema = z.object({
	carMakeId: z.number().int().positive().optional(),
	// modelLine: z.string().min(1, "Model line is required"),
	productionYear: z.number().int().positive("Production year must be a positive integer"),
	modificationId: z.number().int().positive().optional(),
	engineTypeId: z.number().int().positive().optional(),
});
