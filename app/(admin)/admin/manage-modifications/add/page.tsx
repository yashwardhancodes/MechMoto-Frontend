// src/app/admin/manage-modification/addModification/page.tsx
"use client";

import React, { useState } from "react";
import { z } from "zod";
import { createModificationSchema } from "@/lib/schema/modificationSchema";
import { useCreateModificationMutation } from "@/lib/redux/api/modificationApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddModification() {
	const [carMakeId, setCarMakeId] = useState<number>(0);
	const [formData, setFormData] = useState({ name: "", model_lineId: 0 });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [addModification, { isLoading }] = useCreateModificationMutation();
	const { data: carMakeData } = useGetAllCarMakesQuery({ page: 1, limit: 100 });
	const { data: modelLineData } = useGetModelLinesQuery(
		carMakeId ? { car_make: carMakeId } : {},
		{ skip: !carMakeId },
	);
	const router = useRouter();

	const handleSubmit = async () => {
		try {
			setErrors({});
			const parsed = createModificationSchema.parse(formData);
			const result = await addModification(parsed).unwrap();
			if (result?.success) {
				toast.success("Modification added successfully!");
				router.push("/admin/manage-modifications");
			} else toast.error("Failed to add Modification.");
		} catch (err: unknown) {
			if (err instanceof z.ZodError) {
				const formatted: Record<string, string> = {};
				err.errors.forEach((e) => (formatted[e.path[0] as string] = e.message));
				setErrors(formatted);
				toast.error("Validation failed!");
			} else toast.error("Something went wrong!");
		}
	};

	return (
		<div className="p-10 bg-white shadow-sm rounded-md">
			<h2 className="text-xl font-semibold mb-6">Add Modification</h2>

			<div className="flex flex-col gap-4 w-[600px]">
				<select
					name="car_makeId"
					value={carMakeId}
					onChange={(e) => setCarMakeId(Number(e.target.value))}
					className="px-4 py-3 border border-gray-400 rounded-lg"
				>
					<option value={0}>Select Car Make</option>
					{carMakeData?.data?.carMakes?.map((make: any) => (
						<option key={make.id} value={make.id}>
							{make.name}
						</option>
					))}
				</select>

				{carMakeId > 0 && (
					<select
						name="model_lineId"
						value={formData.model_lineId}
						onChange={(e) =>
							setFormData({ ...formData, model_lineId: Number(e.target.value) })
						}
						className="px-4 py-3 border border-gray-400 rounded-lg"
					>
						<option value={0}>Select Model Line</option>
						{modelLineData?.data?.map((line: any) => (
							<option key={line.id} value={line.id}>
								{line.name}
							</option>
						))}
					</select>
				)}
				{errors.model_lineId && (
					<p className="text-red-500 text-sm">{errors.model_lineId}</p>
				)}

				<input
					type="text"
					name="name"
					placeholder="Modification Name"
					value={formData.name}
					onChange={(e) => setFormData({ ...formData, name: e.target.value })}
					className="px-4 py-3 border border-gray-400 rounded-lg"
				/>
				{errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

				<button
					onClick={handleSubmit}
					disabled={isLoading}
					className="px-6 py-3 bg-[#9AE144] rounded-lg font-medium disabled:opacity-50"
				>
					{isLoading ? "Adding..." : "Add Modification"}
				</button>
			</div>
		</div>
	);
}
