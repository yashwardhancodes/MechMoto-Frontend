import { z } from "zod";

export const signupSchema = z
	.object({
		fullName: z.string().min(1, "Name is required"),
		email: z.string().email("Invalid email"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
		phone: z.string().min(10, "Phone number is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});
