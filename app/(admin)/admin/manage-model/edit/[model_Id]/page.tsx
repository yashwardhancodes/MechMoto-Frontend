// src/app/admin/manage-model/edit/[modelId]/page.tsx
'use client';

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { useGetModelQuery, useUpdateModelMutation } from "@/lib/redux/api/modelApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { z } from "zod";

const modelSchema = z.object({
	model_lineId: z.number().int().positive("Model line is required"),
	name: z.string().min(1, "Generation name is required").trim(),
});

const EditModel: React.FC = () => {
	const router = useRouter();
	 const params = useParams();
	const { model_Id } = useParams() as { model_Id: string };
	console.log("params:", params.model_Id);

	const {
		data: modelResponse,
		isLoading: modelLoading,
		isError: modelError,
	} = useGetModelQuery(Number(model_Id));

	const [updateModel, { isLoading: updating }] = useUpdateModelMutation();

	const [formData, setFormData] = useState({
		carMakeId: null as number | null,
		modelLineId: 0,
		name: "",
	});
const [, setErrors] = useState<Record<string, string>>({});

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

	// Prefill form when model loads
	useEffect(() => {
		if (modelResponse) {
			// modelResponse is now directly the Model object
			setFormData({
				carMakeId: modelResponse.model_line.car_make_id,
				modelLineId: modelResponse.model_line.id,
				name: modelResponse.name,
			});
		}
	}, [modelResponse]);

	const handleCarMakeChange = (value: number | null) => {
		setFormData((prev) => ({
			...prev,
			carMakeId: value,
			modelLineId: 0,
		}));
	};

	const handleModelLineChange = (value: number) => {
		setFormData((prev) => ({ ...prev, modelLineId: value }));
	};

	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, name: e.target.value }));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			const payload = {
				model_lineId: formData.modelLineId,
				name: formData.name.trim(),
			};

			modelSchema.parse(payload);

			const result = await updateModel({ id: Number(model_Id), ...payload }).unwrap();

			if (result?.success) {
				toast.success("Generation updated successfully!");
				router.push("/admin/manage-model");
			} else {
				toast.error(result?.message || "Failed to update generation.");
			}
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => {
					formatted[e.path[0] as string] = e.message;
				});
				setErrors(formatted);
				toast.error("Please fix the errors.");
			} else {
				toast.error(err?.data?.message || "Update failed");
			}
		}
	};

	if (modelLoading) return <div className="p-8 text-center">Loading generation...</div>;
	if (modelError || !modelResponse) return <div className="p-8 text-center text-red-500">Failed to load generation</div>;

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
			<div className="mx-auto max-w-3xl space-y-8">
				<h2 className="text-2xl font-bold text-gray-800">Edit Generation</h2>

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
							value={formData.modelLineId}
							onChange={(e) => handleModelLineChange(Number(e.target.value))}
							disabled={!formData.carMakeId || modelLinesLoading}
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 disabled:opacity-60"
						>
							<option value={0}>
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
							value={formData.name}
							onChange={handleNameChange}
							placeholder="e.g., 1ST GEN F/L 02.2014 - 12.2017"
							className="w-full px-5 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none text-gray-800 placeholder-gray-400"
						/>
					</div>

					{/* Submit */}
					<div className="flex justify-start">
						<button
							onClick={handleSubmit}
							disabled={updating}
							className="px-10 py-3.5 bg-[#9AE144] hover:bg-[#85d138] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
						>
							{updating ? "Updating..." : "Update Generation"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EditModel;