"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
import { useGetVehicleQuery, useUpdateVehicleMutation } from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { useGetAllModificationsQuery } from "@/lib/redux/api/modificationApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import { vehicleSchema } from "@/lib/schema/vehicleSchema";

interface FormData {
	carMakeId: number | null;
	modelLineId: number | null;
	productionYear: string;
	modificationId: number | null;
	engineTypeId: number | null;
}

const UpdateVehicle: React.FC = () => {
	const router = useRouter();
	const { vehicleId } = useParams(); // ✅ vehicle ID from route like /admin/vehicles/[id]/edit

	const {
		data: vehicleData,
		isLoading: vehicleLoading,
		error: vehicleError,
	} = useGetVehicleQuery(vehicleId);
	const [updateVehicle, { isLoading: updating }] = useUpdateVehicleMutation();

	const [formData, setFormData] = useState<FormData>({
		carMakeId: null,
		modelLineId: null,
		productionYear: "",
		modificationId: null,
		engineTypeId: null,
	});
	const [errors, setErrors] = useState<{ [key: string]: string }>({});

	// Fetch options
	const { data: carMakesResponse, isLoading: carMakesLoading } = useGetAllCarMakesQuery({
		page: 1,
		limit: 999999,
	});
	const { data: engineTypesResponse } = useGetAllEngineTypesQuery({
		page: 1,
		limit: 999999,
	});
	const { data: modificationsResponse } = useGetAllModificationsQuery({ page: 1, limit: 999999 });
	const { data: modelLineData } = useGetModelLinesQuery(
		formData.carMakeId ? { car_make: formData.carMakeId } : {},
		{ skip: !formData.carMakeId },
	);

	// Dropdown states
	const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
	const [modelLineDropdown, setModelLineDropdown] = useState(false);
	const [modificationDropdown, setModificationDropdown] = useState(false);
	const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);

	// Derived data
	const carMakes = carMakesResponse?.data?.carMakes ?? [];
	const modelLines = modelLineData?.data ?? [];
	const modifications = formData.modelLineId
		? modificationsResponse?.data?.modifications?.filter(
				(m: any) => m.model_lineId === formData.modelLineId,
		  ) ?? []
		: [];
	const engineTypes = engineTypesResponse?.data?.engineTypes ?? [];

	// Prefill form when vehicle data loads
	useEffect(() => {
		if (vehicleData?.data) {
			const v = vehicleData.data;
			setFormData({
				carMakeId: v?.modification?.model_line?.car_make?.id ?? null,
				modelLineId: v?.modification?.model_line?.id ?? null,
				productionYear: v?.production_year?.toString() ?? "",
				modificationId: v?.modification?.id ?? null,
				engineTypeId: v?.engine_type?.id ?? null,
			});
		}
	}, [vehicleData]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleSelectChange = (field: keyof FormData, value: string | number | null) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			const payload = {
				carMakeId: formData.carMakeId,
				modificationId: formData.modificationId,
				productionYear: Number(formData.productionYear),
				engineTypeId: formData.engineTypeId,
			};

			const parsedData = vehicleSchema.parse(payload);
			const result = await updateVehicle({ id: vehicleId, ...parsedData }).unwrap();

			if (result?.success) {
				toast.success("Vehicle updated successfully!");
				router.push("/admin/manage-vehicles?refresh=true");
			} else {
				toast.error("Vehicle update failed!");
			}
		} catch (err: unknown) {
			if (err instanceof z.ZodError) {
				const formattedErrors: { [key: string]: string } = {};
				err.errors.forEach((e) => {
					const key = e.path[0] as string;
					formattedErrors[key] = e.message;
				});
				setErrors(formattedErrors);
				Object.values(formattedErrors).forEach((error) => toast.error(error));
			} else {
				toast.error("Error updating vehicle!");
				console.error(err);
			}
		}
	};

	if (vehicleLoading) return <div className="p-8 text-center">Loading vehicle data...</div>;
	if (vehicleError)
		return <div className="p-8 text-red-500 text-center">Failed to load vehicle data</div>;

	return (
		<div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<h2 className="text-2xl font-semibold mb-8">Update Vehicle</h2>

				<div className="space-y-9">
					{/* --- Car Make & Model Line --- */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Car Make */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={carMakesLoading}
							>
								<span>
									{formData.carMakeId
										? carMakes.find((c) => c.id === formData.carMakeId)?.name
										: "Select Car Make"}
								</span>
								<ChevronDown
									className={`w-5 h-5 ${brandDropdownOpen ? "rotate-180" : ""}`}
								/>
							</button>
							{brandDropdownOpen && (
								<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{carMakes.map((brand) => (
										<button
											key={brand.id}
											onClick={() => {
												handleSelectChange("carMakeId", brand.id);
												setBrandDropdownOpen(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{brand.name}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Model Line */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setModelLineDropdown(!modelLineDropdown)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							>
								<span>
									{formData.modelLineId
										? modelLines.find((m) => m.id === formData.modelLineId)
												?.name
										: "Select Model Line"}
								</span>
								<ChevronDown
									className={`w-5 h-5 ${modelLineDropdown ? "rotate-180" : ""}`}
								/>
							</button>
							{modelLineDropdown && (
								<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{modelLines.map((line) => (
										<button
											key={line.id}
											onClick={() => {
												handleSelectChange("modelLineId", line.id);
												setModelLineDropdown(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{line.name}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* --- Modification & Engine --- */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Modification */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setModificationDropdown(!modificationDropdown)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							>
								<span>
									{formData.modificationId
										? modifications.find(
												(m) => m.id === formData.modificationId,
										  )?.name
										: "Select Modification"}
								</span>
								<ChevronDown
									className={`w-5 h-5 ${
										modificationDropdown ? "rotate-180" : ""
									}`}
								/>
							</button>
							{modificationDropdown && (
								<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{modifications.map((mod) => (
										<button
											key={mod.id}
											onClick={() => {
												handleSelectChange("modificationId", mod.id);
												setModificationDropdown(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{mod.name}
										</button>
									))}
								</div>
							)}
						</div>

						{/* Engine Type */}
						<div className="relative">
							<button
								type="button"
								onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							>
								<span>
									{formData.engineTypeId
										? engineTypes.find((e) => e.id === formData.engineTypeId)
												?.name
										: "Select Engine Type"}
								</span>
								<ChevronDown
									className={`w-5 h-5 ${engineDropdownOpen ? "rotate-180" : ""}`}
								/>
							</button>
							{engineDropdownOpen && (
								<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{engineTypes.map((engine) => (
										<button
											key={engine.id}
											onClick={() => {
												handleSelectChange("engineTypeId", engine.id);
												setEngineDropdownOpen(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{engine.name}
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* --- Production Year --- */}
					<div>
						<input
							type="text"
							name="productionYear"
							placeholder="Production Year"
							value={formData.productionYear}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						/>
					</div>

					{/* --- Submit --- */}
					<div className="flex justify-end pt-3">
						<button
							type="button"
							onClick={handleSubmit}
							disabled={updating}
							className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg disabled:opacity-50"
						>
							{updating ? "Updating..." : "Update Vehicle"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default UpdateVehicle;
