import { z } from "zod";

export const planSchema = z.object({
    name: z.string().min(1, "Plan name is required").max(100, "Plan name must be 100 characters or less"),
    amount: z.number().min(0, "Amount must be a non-negative number"),
    period: z.enum(["monthly", "yearly"], { message: "Period must be either 'monthly' or 'yearly'" }),
    interval: z.number().int().min(1, "Interval must be a positive integer"),
    modules: z.array(
        z.object({
            moduleName: z.string().min(1, "Module name is required").max(50, "Module name must be 50 characters or less"),
            limit: z.number().int().min(0, "Module limit must be a non-negative integer"),
        })
    ).min(0, "Modules are optional but must be valid if provided"),
});