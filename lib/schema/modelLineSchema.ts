// modelLine.schema.ts
import { z } from "zod";

export const createModelLineSchema = z.object({
	car_makeId: z.number().int().positive("Car make ID is required"),
	name: z.string().min(1, "Name is required"),
});

export const updateModelLineSchema = z.object({
	car_makeId: z.number().int().positive().optional(),
	name: z.string().min(1).optional(),
});
