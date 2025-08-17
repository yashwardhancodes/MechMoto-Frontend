"use client";

import React, { useState } from "react";
import { useCreateCategoryMutation } from "@/lib/redux/api/categoriesApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createCategorySchema } from "@/lib/schema/categorySchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";

interface FormData {
	name: string;
	description: string;
	img_src: string;
}

interface FormErrors {
	[key: string]: string;
}

const AddCategory: React.FC = () => {
	const [formData, setFormData] = useState<FormData>({
		name: "",
		description: "",
		img_src: "",
	});
	const [file, setFile] = useState<File | null>(null);
	const [errors, setErrors] = useState<FormErrors>({});
	const [createCategory, { isLoading }] = useCreateCategoryMutation();
	const token = useSelector((state: any) => state.auth.token);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			let imgSrc = formData.img_src;
			if (file) {
				imgSrc = await uploadImageToBackend(file, token);
				setFormData((prev) => ({ ...prev, img_src: imgSrc }));
			}
			const parsedData = createCategorySchema.parse({ ...formData, img_src: imgSrc });
			console.log("✅ Valid Data:", parsedData);

			const result = await createCategory(parsedData).unwrap();
			console.log("✅ API Response:", result);

			if (result?.success) {
				toast.success("Category added successfully! Redirecting...");
				window.location.href = "/dashboard/superAdmin";
			} else {
				toast.error("Category addition failed. Please try again.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formattedErrors: { [key: string]: string } = {};
				err.errors.forEach((e) => {
					formattedErrors[e.path[0]] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Validation failed!", formattedErrors);
				console.log("❌ Validation Errors:", formattedErrors);
			} else {
				console.error("❌ Error:", err);
				toast.error(err?.data?.message || "Something went wrong!");
			}
		}
	};

	return (
		<div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<div className="space-y-9">
					{/* Name Field */}
					<div>
						<input
							type="text"
							name="name"
							placeholder="Category Name"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
						/>
						{errors["name"] && (
							<p className="text-red-500 text-sm mt-1">{errors["name"]}</p>
						)}
					</div>

					{/* Description Field */}
					<div>
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

					{/* Image Upload Field */}
					<div>
						<input
							type="file"
							accept="image/*"
							onChange={handleFileChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700"
						/>
						{errors["img_src"] && (
							<p className="text-red-500 text-sm mt-1">{errors["img_src"]}</p>
						)}
					</div>

					{/* Submit Button */}
					<div className="flex justify-end pt-3">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={isLoading}
							className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
						>
							{isLoading ? "Adding..." : "Add Category"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddCategory;
