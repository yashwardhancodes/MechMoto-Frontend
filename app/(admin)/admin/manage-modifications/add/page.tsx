// src/app/admin/manage-modification/addModification/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCreateModificationMutation } from "@/lib/redux/api/modificationApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { useLazyGetGenerationsByModelLineQuery } from "@/lib/redux/api/modelApi";
import { z } from "zod";

const createModificationSchema = z.object({
	name: z.string().min(1, "Modification name is required").trim(),
	modelIds: z.array(z.number().int().positive()).min(1, "At least one generation must be selected"),
});

type FormData = z.infer<typeof createModificationSchema>;

export default function AddModification() {
	const router = useRouter();

	const [formData, setFormData] = useState<FormData>({
		name: "",
		modelIds: [],
	});

	const [selectedCarMakeId, setSelectedCarMakeId] = useState<number | null>(null);
	const [selectedModelLineId, setSelectedModelLineId] = useState<number | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [addModification, { isLoading }] = useCreateModificationMutation();

	const { data: carMakesResponse, isLoading: carMakesLoading } = useGetAllCarMakesQuery({
		page: 1,
		limit: 9999,
	});

	const { data: modelLinesResponse, isFetching: modelLinesLoading } = useGetModelLinesQuery(
		selectedCarMakeId ? { car_make: selectedCarMakeId } : {},
		{ skip: !selectedCarMakeId },
	);

	const [triggerGenerations, { data: generationsData = [], isFetching: generationsLoading }] =
		useLazyGetGenerationsByModelLineQuery();

	const carMakes = carMakesResponse?.data?.carMakes || [];
	const modelLines = modelLinesResponse?.data || [];
	const generations = generationsData;

	// Load generations when model line selected
	useEffect(() => {
		if (selectedModelLineId) {
			triggerGenerations(selectedModelLineId);
		} else {
			setFormData((prev) => ({ ...prev, modelIds: [] }));
		}
	}, [selectedModelLineId, triggerGenerations]);

	const handleGenerationToggle = (generationId: number) => {
		setFormData((prev) => {
			const newIds = prev.modelIds.includes(generationId)
				? prev.modelIds.filter((id) => id !== generationId)
				: [...prev.modelIds, generationId];
			return { ...prev, modelIds: newIds };
		});
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			const payload = createModificationSchema.parse(formData);

			const result = await addModification(payload).unwrap();

			if (result?.success) {
				toast.success("Modification added successfully!");
				router.push("/admin/manage-modifications");
			} else {
				toast.error(result?.message || "Failed to add modification");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => {
					const field = e.path[0] as string;
					formatted[field] = e.message;
				});
				setErrors(formatted);
				toast.error("Please fix the errors below");
			} else {
				toast.error(err?.data?.message || "Something went wrong");
			}
		}
	};

	const isSubmitDisabled = isLoading || formData.name.trim() === "" || formData.modelIds.length === 0;

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
			<div className="mx-auto max-w-3xl space-y-8">
				<h2 className="text-2xl font-bold text-gray-800">Add New Modification</h2>

				<div className="space-y-6">
					{/* Car Make */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Car Make
						</label>
						<select
							value={selectedCarMakeId || ""}
							onChange={(e) => {
								const value = e.target.value ? Number(e.target.value) : null;
								setSelectedCarMakeId(value);
								setSelectedModelLineId(null);
								setFormData({ name: "", modelIds: [] });
							}}
							disabled={carMakesLoading}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 disabled:opacity-60"
						>
							<option value="">Select Car Make</option>
							{carMakes.map((make: any) => (
								<option key={make.id} value={make.id}>
									{make.name}
								</option>
							))}
						</select>
					</div>

					{/* Model Line */}
					{selectedCarMakeId && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Model Line
							</label>
							<select
								value={selectedModelLineId || ""}
								onChange={(e) => {
									const value = e.target.value ? Number(e.target.value) : null;
									setSelectedModelLineId(value);
									setFormData((prev) => ({ ...prev, modelIds: [] }));
								}}
								disabled={modelLinesLoading}
								className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 disabled:opacity-60"
							>
								<option value="">Select Model Line</option>
								{modelLines.map((line: any) => (
									<option key={line.id} value={line.id}>
										{line.name}
									</option>
								))}
							</select>
						</div>
					)}

					{/* Generations (Multi-select checkboxes) */}
					{selectedModelLineId && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Generations <span className="text-red-500">*</span>
							</label>
							<div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
								{generationsLoading ? (
									<p className="text-gray-500 text-sm">Loading generations...</p>
								) : generations.length === 0 ? (
									<p className="text-gray-500 text-sm">No generations found</p>
								) : (
									<div className="space-y-2">
										{generations.map((gen: any) => (
											<label
												key={gen.id}
												className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded"
											>
												<input
													type="checkbox"
													checked={formData.modelIds.includes(gen.id)}
													onChange={() => handleGenerationToggle(gen.id)}
													className="w-4 h-4 text-[#9AE144] rounded focus:ring-[#9AE144]"
												/>
												<span className="text-gray-800">{gen.name}</span>
											</label>
										))}
									</div>
								)}
							</div>
							{errors.modelIds && (
								<p className="text-red-500 text-sm mt-2">{errors.modelIds}</p>
							)}
						</div>
					)}

					{/* Modification Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Modification Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							placeholder="e.g., 1.2L MT/Petrol/BS4"
							value={formData.name}
							onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 placeholder-gray-400"
						/>
						{errors.name && <p className="text-red-500 text-sm mt-2">{errors.name}</p>}
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							onClick={handleSubmit}
							disabled={isSubmitDisabled}
							className="px-10 py-3.5 bg-[#9AE144] hover:bg-[#85d138] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
						>
							{isLoading ? "Adding..." : "Add Modification"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}