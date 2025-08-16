import { z } from "zod";

export const vehicleSchema = z.object({
  carMakeId: z.number().min(1, "Car make is required"),
  modelLine: z.string().min(1, "Model line is required"),
  productionYear: z
    .number()
    .min(1886, "Year must be valid") // 1886 = first car invention
    .max(new Date().getFullYear() + 1, "Year cannot be in the far future"),
  modification: z.string().min(1, "Modification/variant is required"),
});
