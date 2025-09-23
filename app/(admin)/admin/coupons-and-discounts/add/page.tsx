"use client";

import React, { useState } from "react";
import { useCreateCouponMutation } from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createCouponSchema } from "@/lib/schema/couponSchema";
import { ChevronDown } from "lucide-react";

interface FormData {
	code: string;
	description: string;
	discount_type: string;
	discount_value: string;
	max_discount: string;
	min_order_amount: string;
	valid_from: string;
	valid_until: string;
	usage_limit: string;
	is_active: string;
}

interface FormErrors {
	[key: string]: string;
}

const AddCoupon: React.FC = () => {
	const [formData, setFormData] = useState<FormData>({
		code: "",
		description: "",
		discount_type: "percentage",
		discount_value: "",
		max_discount: "",
		min_order_amount: "",
		valid_from: "",
		valid_until: "",
		usage_limit: "",
		is_active: "true",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [dropdownOpen, setDropdownOpen] = useState({
		discount_type: false,
		is_active: false,
	});
	const [createCoupon, { isLoading }] = useCreateCouponMutation();
	const token = useSelector((state: any) => state.auth.token);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSelectChange = (name: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
		setDropdownOpen((prev) => ({
			...prev,
			[name]: false,
		}));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
            console.log("formData.valid_from", formData.valid_from);
			const parsedData = createCouponSchema.parse({
				...formData,
				discount_value: formData.discount_value
					? parseFloat(formData.discount_value)
					: undefined,
				max_discount: formData.max_discount ? parseFloat(formData.max_discount) : undefined,
				min_order_amount: formData.min_order_amount
					? parseFloat(formData.min_order_amount)
					: undefined,
				valid_from: formData.valid_from
					? new Date(formData.valid_from).toISOString()
					: undefined,
				valid_until: formData.valid_until
					? new Date(formData.valid_until).toISOString()
					: undefined,
				usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : undefined,
				is_active: formData.is_active === "true",
			});
			console.log("✅ Valid Data:", parsedData);

			const result = await createCoupon(parsedData).unwrap();
			console.log("✅ API Response:", result);

			if (result?.success) {
				toast.success("Coupon created successfully! Redirecting...");
				window.location.href = "/admin/coupons-and-discounts";
			} else {
				toast.error("Coupon creation failed. Please try again.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formattedErrors: { [key: string]: string } = {};
				err.errors.forEach((e) => {
					formattedErrors[e.path[0]] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Validation failed!");
				console.log("❌ Validation Errors:", formattedErrors);
			} else {
				console.error("❌ Error:", err);
				toast.error(err?.data?.message || "Something went wrong!");
			}
		}
	};

	const discountTypeOptions = ["percentage", "fixed"];
	const booleanOptions = ["true", "false"];

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-8 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="space-y-9">
					{/* Row 1: Coupon Code, Discount Type, Discount Value */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<input
								type="text"
								name="code"
								placeholder="Coupon Code"
								value={formData.code}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors["code"] && (
								<p className="text-red-500 text-sm mt-1">{errors["code"]}</p>
							)}
						</div>
						<div className="relative">
							<button
								type="button"
								onClick={() =>
									setDropdownOpen((prev) => ({
										...prev,
										discount_type: !prev.discount_type,
									}))
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							>
								<span
									className={
										formData.discount_type ? "text-gray-700" : "text-gray-400"
									}
								>
									{formData.discount_type || "Select Discount Type"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										dropdownOpen.discount_type ? "rotate-180" : ""
									}`}
								/>
							</button>
							{dropdownOpen.discount_type && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{discountTypeOptions.map((type) => (
										<button
											key={type}
											type="button"
											onClick={() =>
												handleSelectChange("discount_type", type)
											}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</button>
									))}
								</div>
							)}
							{errors["discount_type"] && (
								<p className="text-red-500 text-sm mt-1">
									{errors["discount_type"]}
								</p>
							)}
						</div>
						<div>
							<input
								type="number"
								name="discount_value"
								placeholder="Discount Value"
								value={formData.discount_value}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
								step="0.01"
							/>
							{errors["discount_value"] && (
								<p className="text-red-500 text-sm mt-1">
									{errors["discount_value"]}
								</p>
							)}
						</div>
					</div>

					{/* Row 2: Max Discount, Min Order Amount, Usage Limit */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<input
								type="number"
								name="max_discount"
								placeholder="Max Discount (₹)"
								value={formData.max_discount}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
								step="0.01"
							/>
							{errors["max_discount"] && (
								<p className="text-red-500 text-sm mt-1">
									{errors["max_discount"]}
								</p>
							)}
						</div>
						<div>
							<input
								type="number"
								name="min_order_amount"
								placeholder="Min Order Amount (₹)"
								value={formData.min_order_amount}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
								step="0.01"
							/>
							{errors["min_order_amount"] && (
								<p className="text-red-500 text-sm mt-1">
									{errors["min_order_amount"]}
								</p>
							)}
						</div>
						<div>
							<input
								type="number"
								name="usage_limit"
								placeholder="Usage Limit"
								value={formData.usage_limit}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors["usage_limit"] && (
								<p className="text-red-500 text-sm mt-1">{errors["usage_limit"]}</p>
							)}
						</div>
					</div>

					{/* Row 3: Valid From, Valid Until, Is Active */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<input
								type="datetime-local"
								name="valid_from"
								value={formData.valid_from}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors["valid_from"] && (
								<p className="text-red-500 text-sm mt-1">{errors["valid_from"]}</p>
							)}
						</div>
						<div>
							<input
								type="datetime-local"
								name="valid_until"
								value={formData.valid_until}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							/>
							{errors["valid_until"] && (
								<p className="text-red-500 text-sm mt-1">{errors["valid_until"]}</p>
							)}
						</div>
						<div className="relative">
							<button
								type="button"
								onClick={() =>
									setDropdownOpen((prev) => ({
										...prev,
										is_active: !prev.is_active,
									}))
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							>
								<span
									className={
										formData.is_active ? "text-gray-700" : "text-gray-400"
									}
								>
									{formData.is_active === "true"
										? "Active"
										: formData.is_active === "false"
										? "Inactive"
										: "Select Status"}
								</span>
								<ChevronDown
									className={`w-5 h-5 text-[#9AE144] ${
										dropdownOpen.is_active ? "rotate-180" : ""
									}`}
								/>
							</button>
							{dropdownOpen.is_active && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{booleanOptions.map((option) => (
										<button
											key={option}
											type="button"
											onClick={() => handleSelectChange("is_active", option)}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{option === "true" ? "Active" : "Inactive"}
										</button>
									))}
								</div>
							)}
							{errors["is_active"] && (
								<p className="text-red-500 text-sm mt-1">{errors["is_active"]}</p>
							)}
						</div>
					</div>

					{/* Row 4: Description, Submit Button */}
					<div className="flex justify-between items-start">
						<div className="w-full">
							<textarea
								name="description"
								placeholder="Description"
								rows={4}
								value={formData.description}
								onChange={handleInputChange}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
							/>
							{errors["description"] && (
								<p className="text-red-500 text-sm mt-1">{errors["description"]}</p>
							)}
						</div>
						<div className="flex justify-end pt-3 pl-4">
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isLoading}
								className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
							>
								{isLoading ? "Creating..." : "Create Coupon"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddCoupon;
