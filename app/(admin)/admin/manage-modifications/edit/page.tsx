"use client";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
	useGetModificationQuery,
	useUpdateModificationMutation,
} from "@/lib/redux/api/modificationApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";

const schema = z.object({
	model_lineId: z.number().int().positive("Model Line is required"),
	name: z.string().min(1, "Name is required"),
});

export default function EditModification() {
	const router = useRouter();
	const params = useParams();
	const id = params?.modificationId as string;

	const { data } = useGetModificationQuery(id, { skip: !id });
	const [updateModification, { isLoading }] = useUpdateModificationMutation();
	const { data: carMakes } = useGetAllCarMakesQuery({ page: 1, limit: 100 });
	const [selectedMake, setSelectedMake] = useState<string>("");
	const { data: modelLines } = useGetModelLinesQuery(
		selectedMake ? { car_make: selectedMake } : {},
	);

	const [form, setForm] = useState({ name: "", model_lineId: "" });
	const [errors, setErrors] = useState<any>({});

	useEffect(() => {
		if (data) {
			setForm({ name: data.name, model_lineId: data.model_lineId });
		}
	}, [data]);

	const handleSubmit = async () => {
		try {
			setErrors({});
			const parsed = schema.parse({
				name: form.name,
				model_lineId: Number(form.model_lineId),
			});
			await updateModification({ id, ...parsed }).unwrap();
			toast.success("Modification updated successfully!");
			router.push("/admin/manage-modification");
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const e: any = {};
				err.errors.forEach((x) => (e[x.path[0]] = x.message));
				setErrors(e);
			} else toast.error("Something went wrong!");
		}
	};

	return (
		<div className="p-10 bg-white rounded-lg shadow">
			<h2 className="text-xl font-semibold mb-4">Edit Modification</h2>
			<select
				value={selectedMake}
				onChange={(e) => setSelectedMake(e.target.value)}
				className="border p-2 rounded w-[400px]"
			>
				<option value="">Select Car Make</option>
				{carMakes?.data?.carMakes?.map((make: any) => (
					<option key={make.id} value={make.id}>
						{make.name}
					</option>
				))}
			</select>
			<select
				value={form.model_lineId}
				onChange={(e) => setForm({ ...form, model_lineId: e.target.value })}
				className="border p-2 rounded w-[400px] mt-3"
			>
				<option value="">Select Model Line</option>
				{modelLines?.data?.map((ml: any) => (
					<option key={ml.id} value={ml.id}>
						{ml.name}
					</option>
				))}
			</select>
			<input
				value={form.name}
				onChange={(e) => setForm({ ...form, name: e.target.value })}
				className="border p-2 rounded w-[400px] mt-3 block"
			/>
			{errors.name && <p className="text-red-500">{errors.name}</p>}
			<button
				onClick={handleSubmit}
				disabled={isLoading}
				className="bg-[#9AE144] mt-4 px-6 py-2 rounded"
			>
				{isLoading ? "Updating..." : "Update Modification"}
			</button>
		</div>
	);
}
