import { z } from "zod";

export const createCouponSchema = z.object({
	code: z.string().min(1, "Coupon code is required"),
	description: z.string().optional(),
	discount_type: z.string().min(1, "Discount type is required"),
	discount_value: z.number().positive("Discount value must be positive"),
	max_discount: z.number().positive().optional(),
	min_order_amount: z.number().positive().optional(),
	valid_from: z.string().datetime().optional(),
	valid_until: z.string().datetime().optional(),
	usage_limit: z.number().int().positive().optional(),
	is_active: z.boolean().default(true),
});

export const updateCouponSchema = z.object({
	code: z.string().min(1).optional(),
	description: z.string().optional(),
	discount_type: z.string().min(1).optional(),
	discount_value: z.number().positive().optional(),
	max_discount: z.number().positive().optional(),
	min_order_amount: z.number().positive().optional(),
	valid_from: z.string().datetime().optional(),
	valid_until: z.string().datetime().optional(),
	usage_limit: z.number().int().positive().optional(),
	is_active: z.boolean().optional(),
});
