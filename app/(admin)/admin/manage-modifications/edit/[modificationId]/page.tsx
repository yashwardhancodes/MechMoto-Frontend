// src/app/admin/manage-modification/edit/[modificationId]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { useGetModificationQuery, useUpdateModificationMutation } from "@/lib/redux/api/modificationApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { useLazyGetGenerationsByModelLineQuery } from "@/lib/redux/api/modelApi";
import { z } from "zod";

const updateModificationSchema = z.object({
	name: z.string().min(1, "Modification name is required").trim().optional(),
	modelIds: z.array(z.number().int().positive()).min(1, "At least one generation must be selected").optional(),
});

type UpdateData = {
	name?: string;
	modelIds?: number[];
};

export default function EditModification() {
	const router = useRouter();
	const { modificationId } = useParams() as { modificationId: string };

	const { data: modResponse, isLoading: modLoading } = useGetModificationQuery(modificationId);
	const [updateModification, { isLoading: updating }] = useUpdateModificationMutation();

	const [formData, setFormData] = useState({
		name: "",
		modelIds: [] as number[],
	});
	const [selectedCarMakeId, setSelectedCarMakeId] = useState<number | null>(null);
	const [selectedModelLineId, setSelectedModelLineId] = useState<number | null>(null);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const { data: carMakesResponse } = useGetAllCarMakesQuery({ page: 1, limit: 9999 });
	const { data: modelLinesResponse, isFetching: modelLinesLoading } = useGetModelLinesQuery(
		selectedCarMakeId ? { car_make: selectedCarMakeId } : {},
		{ skip: !selectedCarMakeId },
	);

	const [triggerGenerations, { data: generationsData = [], isFetching: generationsLoading }] =
		useLazyGetGenerationsByModelLineQuery();

	const carMakes = carMakesResponse?.data?.carMakes || [];
	const modelLines = modelLinesResponse?.data || [];
	const generations = generationsData;

	// Prefill form when modification loads
	useEffect(() => {
		if (modResponse?.data) {
			const mod = modResponse.data;
			setFormData({
				name: mod.name,
				modelIds: mod.models?.map((m: any) => m.id) || [],
			});

			// Set initial car make and model line from first linked generation (or any)
			if (mod.models && mod.models.length > 0) {
				const firstGen = mod.models[0];
				setSelectedCarMakeId(firstGen.model_line.car_make.id);
				setSelectedModelLineId(firstGen.model_line.id);
			}
		}
	}, [modResponse]);

	// Load generations when model line selected
	useEffect(() => {
		if (selectedModelLineId) {
			triggerGenerations(selectedModelLineId);
		}
	}, [selectedModelLineId, triggerGenerations]);

	const handleGenerationToggle = (genId: number) => {
		setFormData((prev) => {
			const newIds = prev.modelIds.includes(genId)
				? prev.modelIds.filter((id) => id !== genId)
				: [...prev.modelIds, genId];
			return { ...prev, modelIds: newIds };
		});
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			// Only send fields that changed or are required
			const payload: UpdateData = {};
			if (formData.name !== modResponse?.data?.name) {
				payload.name = formData.name;
			}

			// Compare current vs original modelIds
			const originalIds = modResponse?.data?.models?.map((m: any) => m.id) || [];
			const currentIds = formData.modelIds;

			const hasChanged = 
				originalIds.length !== currentIds.length ||
				!originalIds.every(id => currentIds.includes(id));

			if (hasChanged) {
				payload.modelIds = currentIds;
			}

			// Validate only if sending modelIds
			if (payload.modelIds) {
				updateModificationSchema.parse({ modelIds: payload.modelIds });
			}
			if (payload.name) {
				updateModificationSchema.parse({ name: payload.name });
			}

			if (Object.keys(payload).length === 0) {
				toast.success("No changes to save");
				return;
			}

			await updateModification({ id: modificationId, ...payload }).unwrap();

			toast.success("Modification updated successfully!");
			router.push("/admin/manage-modifications");
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => {
					const field = e.path[0] as string;
					formatted[field] = e.message;
				});
				setErrors(formatted);
				toast.error("Please fix the errors");
			} else {
				toast.error(err?.data?.message || "Failed to update modification");
			}
		}
	};

	const isSubmitDisabled = updating || formData.modelIds.length === 0;

	if (modLoading) return <div className="p-8 text-center">Loading modification...</div>;

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
			<div className="mx-auto max-w-3xl space-y-8">
				<h2 className="text-2xl font-bold text-gray-800">Edit Modification</h2>

				<div className="space-y-6">
					{/* Car Make */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Car Make
						</label>
						<select
							value={selectedCarMakeId || ""}
							onChange={(e) => {
								const val = e.target.value ? Number(e.target.value) : null;
								setSelectedCarMakeId(val);
								setSelectedModelLineId(null);
								setFormData((prev) => ({ ...prev, modelIds: [] }));
							}}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
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
									const val = e.target.value ? Number(e.target.value) : null;
									setSelectedModelLineId(val);
									setFormData((prev) => ({ ...prev, modelIds: [] }));
								}}
								disabled={modelLinesLoading}
								className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
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

					{/* Generations (Multi-select) */}
					{selectedModelLineId && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Generations <span className="text-red-500">*</span>
							</label>
							<div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto bg-gray-50">
								{generationsLoading ? (
									<p className="text-gray-500">Loading generations...</p>
								) : generations.length === 0 ? (
									<p className="text-gray-500">No generations found</p>
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

					{/* Name */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Modification Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
							placeholder="e.g., 1.2L MT/Petrol/BS4"
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800"
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
							{updating ? "Updating..." : "Update Modification"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}