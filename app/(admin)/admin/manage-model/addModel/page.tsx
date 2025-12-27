// src/app/admin/manage-model/addModel/page.tsx
'use client';

import React, { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCreateModelMutation } from "@/lib/redux/api/modelApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { z } from "zod";

const modelSchema = z.object({
	model_lineId: z.number().int().positive("Model line is required"),
	name: z.string().min(1, "Generation name is required").trim(),
});

interface FormData {
	carMakeId: number | null;
	modelLineId: number | null;
	name: string;
}

const AddModel: React.FC = () => {
	const router = useRouter();
	const [formData, setFormData] = useState<FormData>({
		carMakeId: null,
		modelLineId: null,
		name: "",
	});
	const [, setErrors] = useState<Record<string, string>>({});
	const [addModel, { isLoading }] = useCreateModelMutation();

	const { data: carMakesResponse, isLoading: carMakesLoading } = useGetAllCarMakesQuery({
		page: 1,
		limit: 999999,
	});

	const { data: modelLinesResponse, isFetching: modelLinesLoading } = useGetModelLinesQuery(
		formData.carMakeId ? { car_make: formData.carMakeId } : {},
		{ skip: !formData.carMakeId },
	);

	const carMakes = carMakesResponse?.data?.carMakes || [];
	const modelLines = modelLinesResponse?.data || [];

	const handleCarMakeChange = (value: number | null) => {
		setFormData({
			carMakeId: value,
			modelLineId: null,
			name: "",
		});
	};

	const handleModelLineChange = (value: number | null) => {
		setFormData((prev) => ({ ...prev, modelLineId: value }));
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, name: e.target.value }));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			const payload = {
				model_lineId: formData.modelLineId!,
				name: formData.name.trim(),
			};

			modelSchema.parse(payload);

			const result = await addModel(payload).unwrap();

			if (result?.success) {
				toast.success("Generation added successfully!");
				setFormData({ carMakeId: null, modelLineId: null, name: "" });
				router.push("/admin/manage-model");
			} else {
				toast.error(result?.message || "Failed to add generation.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => {
					formatted[e.path[0] as string] = e.message;
				});
				setErrors(formatted);
				toast.error("Please fix the errors below.");
			} else {
				toast.error(err?.data?.message || "Something went wrong!");
			}
		}
	};

	const isSubmitDisabled =
		isLoading ||
		!formData.carMakeId ||
		!formData.modelLineId ||
		!formData.name.trim();

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
			<div className="mx-auto max-w-3xl space-y-8">
				<h2 className="text-2xl font-bold text-gray-800">Add New Generation</h2>

				<div className="space-y-6">
					{/* Car Make */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Car Make
						</label>
						<select
							value={formData.carMakeId ?? ""}
							onChange={(e) =>
								handleCarMakeChange(e.target.value ? Number(e.target.value) : null)
							}
							disabled={carMakesLoading}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 disabled:opacity-60"
						>
							<option value="">Select Car Make</option>
							{carMakes.map((make) => (
								<option key={make.id} value={make.id}>
									{make.name}
								</option>
							))}
						</select>
					</div>

					{/* Model Line */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Model Line
						</label>
						<select
							value={formData.modelLineId ?? ""}
							onChange={(e) =>
								handleModelLineChange(e.target.value ? Number(e.target.value) : null)
							}
							disabled={!formData.carMakeId || modelLinesLoading}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 disabled:opacity-60"
						>
							<option value="">
								{formData.carMakeId
									? modelLinesLoading
										? "Loading..."
										: "Select Model Line"
									: "Select Car Make first"}
							</option>
							{modelLines.map((line: any) => (
								<option key={line.id} value={line.id}>
									{line.name}
								</option>
							))}
						</select>
					</div>

					{/* Generation Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Generation Name
						</label>
						<input
							type="text"
							placeholder="e.g., 1ST GEN F/L 02.2014 - 12.2017"
							value={formData.name}
							onChange={handleNameChange}
							disabled={!formData.modelLineId}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 placeholder-gray-400 disabled:opacity-60"
						/>
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							onClick={handleSubmit}
							disabled={isSubmitDisabled}
							className="px-10 py-3.5 bg-[#9AE144] hover:bg-[#85d138] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
						>
							{isLoading ? "Adding..." : "Add Generation"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AddModel;