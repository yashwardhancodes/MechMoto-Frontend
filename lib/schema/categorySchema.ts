import { z } from "zod";

export const createCategorySchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
	img_src: z.string().min(3, "Image URL is required"),
});
