// src/app/admin/manage-model-line/addModelLine/page.tsx
"use client";

import React, { useState } from "react";
import { z } from "zod";
import { createModelLineSchema } from "@/lib/schema/modelLineSchema";
import { useCreateModelLineMutation } from "@/lib/redux/api/modelLineCrudApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function AddModelLine() {
	const [formData, setFormData] = useState({ name: "", car_makeId: 0 });
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [addModelLine, { isLoading }] = useCreateModelLineMutation();
	const { data: carMakeData } = useGetAllCarMakesQuery({ page: 1, limit: 100 });
	const router = useRouter();

	const handleSubmit = async () => {
		try {
			setErrors({});
			const parsed = createModelLineSchema.parse(formData);
			const result = await addModelLine(parsed).unwrap();
			if (result?.success) {
				toast.success("Model Line added successfully!");
				router.push("/admin/manage-model-line");
			} else toast.error("Failed to add Model Line.");
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
			<h2 className="text-xl font-semibold mb-6">Add Model Line</h2>
			<div className="flex flex-col gap-4 w-[600px]">
				<select
					name="car_makeId"
					value={formData.car_makeId}
					onChange={(e) =>
						setFormData({ ...formData, car_makeId: Number(e.target.value) })
					}
					className="px-4 py-3 border border-gray-400 rounded-lg"
				>
					<option value={0}>Select Car Make</option>
					{carMakeData?.data?.carMakes?.map((make: any) => (
						<option key={make.id} value={make.id}>
							{make.name}
						</option>
					))}
				</select>
				{errors.car_makeId && <p className="text-red-500 text-sm">{errors.car_makeId}</p>}

				<input
					type="text"
					name="name"
					placeholder="Model Line Name"
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
					{isLoading ? "Adding..." : "Add Model Line"}
				</button>
			</div>
		</div>
	);
}
