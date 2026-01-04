"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	useUpdatePartMutation,
	useGetPartQuery,
	useRemoveCompatibilityMutation,
	useAddCompatibilityBulkMutation,
} from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createPartSchema } from "@/lib/schema/partSchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { useLazyGetSubcategoriesByCategoryIdQuery } from "@/lib/redux/api/subCategoriesApi";
import { useGetAllPartBrandsQuery } from "@/lib/redux/api/partBrandApi";
import { ChevronDown, X } from "lucide-react";
import { useParams } from "next/navigation";
import { RootState } from "@/lib/redux/store";
import Image from "next/image";
import VehicleSelectorModal from "@/components/SearchModels/VehicleSelectorModal";

interface Vehicle {
	id: number;
	modification: {
		model_line: any;
		id: number;
		name: string;
		models: {
			id: number;
			name: string;
			model_line: {
				id: number;
				name: string;
				car_make: { id: number; name: string };
			};
		}[];
	};
	engine_type?: { id: number; name: string } | null;
	production_year: number;
}

interface FormData {
	vehicleId: string;
	subcategoryId: string;
	partNumber: string;
	description: string;
	quantity: string;
	imageUrls: string[];
	price: string;
	remarks: string;
	availabilityStatus: string;
	origin: string;
	partBrandId: string;
	discountId: string;
}

const UpdatePart: React.FC = () => {
	const params = useParams();
	const partId = params.partId as string;

	const {
		data: partRes,
		isLoading: isPartLoading,
		error: partError,
		refetch,
	} = useGetPartQuery(partId);

	const [updatePart, { isLoading: isUpdating }] = useUpdatePartMutation();
	const [removeCompatibility, { isLoading: isRemovingCompatibility }] =
		useRemoveCompatibilityMutation();
	const [addCompatibilityBulk] = useAddCompatibilityBulkMutation();

	const token = useSelector((state: RootState) => state.auth.token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
	const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	const [newFiles, setNewFiles] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

	const [isAddingCompatibility, setIsAddingCompatibility] = useState(false);

	const [formData, setFormData] = useState<FormData>({
		vehicleId: "",
		subcategoryId: "",
		partNumber: "",
		description: "",
		quantity: "1",
		imageUrls: [],
		price: "",
		remarks: "",
		availabilityStatus: "Unavailable",
		origin: "OEM",
		partBrandId: "",
		discountId: "",
	});

	const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
	const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string>("");

	const { data: categoryRes } = useGetAllCategoriesQuery({ page: 1, limit: 999 });
	const [fetchSubcategoriesByCategory, { data: filteredSubcategories }] =
		useLazyGetSubcategoriesByCategoryIdQuery();

	const { data: partBrandRes } = useGetAllPartBrandsQuery({ page: 1, limit: 999999 });

	const subcategories = selectedCategoryId ? filteredSubcategories?.data : [];

	useEffect(() => {
		if (selectedCategoryId) {
			fetchSubcategoriesByCategory(selectedCategoryId);
		}
	}, [selectedCategoryId, fetchSubcategoriesByCategory]);

	const partBrands = partBrandRes?.data?.brands || [];

	useEffect(() => {
		if (partRes?.data) {
			const p = partRes.data;
			setFormData({
				vehicleId: p.vehicle?.toString() || "",
				subcategoryId: p.subcategory?.toString() || "",
				partNumber: p.part_number || "",
				description: p.description || "",
				quantity: p.quantity?.toString() || "1",
				imageUrls: p.image_urls || [],
				price: p.price?.toString() || "",
				remarks: p.remarks || "",
				availabilityStatus: p.availability_status || "Unavailable",
				origin: p.origin || "OEM",
				partBrandId: p.part_brand?.id.toString() || "",
				discountId: p.discount?.toString() || "",
			});

			if (p.subcategory) {
				setSelectedCategoryId(p.subcategory.categoryId);
				setSelectedSubCategoryId(p.subcategory.id.toString());
			}

			if (p.vehicle) setSelectedVehicle(p.vehicle);
		}
	}, [partRes]);

	useEffect(() => {
		const existing = formData.imageUrls;
		const newPreviews = newFiles.map((f) => URL.createObjectURL(f));

		setPreviewUrls([...existing, ...newPreviews]);

		return () => {
			newPreviews.forEach((url) => URL.revokeObjectURL(url));
		};
	}, [formData.imageUrls, newFiles]);

	if (!token) {
		toast.error("You are not logged in!");
		return null;
	}

	if (isPartLoading) return <div className="text-center py-10">Loading part...</div>;
	if (partError) return <div className="text-center py-10 text-red-500">Failed to load part</div>;

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (name: string, value: string | number) => {
		setFormData((prev) => ({ ...prev, [name]: value.toString() }));
	};

	const handleVehicleSelect = (vehicles: Vehicle[]) => {
		if (vehicles.length > 0) {
			const vehicle = vehicles[0];
			setSelectedVehicle(vehicle);
			setFormData((prev) => ({ ...prev, vehicleId: vehicle.id.toString() }));
		}
		setIsVehicleModalOpen(false);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setNewFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
		setNewFiles((prev) => [...prev, ...files]);
	};

	const handleDragOver = (e: React.DragEvent) => e.preventDefault();
	const handleDragLeave = () => setIsDragging(false);

	const removeImage = (index: number) => {
		const existingCount = formData.imageUrls.length;
		if (index < existingCount) {
			setFormData((prev) => ({
				...prev,
				imageUrls: prev.imageUrls.filter((_, i) => i !== index),
			}));
		} else {
			setNewFiles((prev) => prev.filter((_, i) => i !== index - existingCount));
		}
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			let finalImageUrls = [...formData.imageUrls];
			if (newFiles.length > 0) {
				const uploaded = await Promise.all(
					newFiles.map((file) => uploadImageToBackend(file, token!))
				);
				finalImageUrls = [...finalImageUrls, ...uploaded];
			}

			// FIXED PAYLOAD: Never send undefined, properly handle clearing fields
			const payload: any = {
				imageUrls: finalImageUrls,
				availabilityStatus: formData.availabilityStatus,
				origin: formData.origin,
			};

			// Optional fields - only include if meaningful or intentionally cleared
			if (formData.partNumber.trim() !== "") {
				payload.partNumber = formData.partNumber.trim();
			}

			if (formData.description.trim() !== "") {
				payload.description = formData.description.trim();
			} else if (formData.description.trim() === "" && partRes?.data?.description) {
				payload.description = ""; // Explicitly clear
			}

			if (formData.quantity && !isNaN(parseInt(formData.quantity))) {
				payload.quantity = parseInt(formData.quantity);
			}

			if (formData.price && !isNaN(parseFloat(formData.price))) {
				payload.price = parseFloat(formData.price);
			}

			if (formData.remarks.trim() !== "") {
				payload.remarks = formData.remarks.trim();
			} else if (formData.remarks.trim() === "" && partRes?.data?.remarks) {
				payload.remarks = ""; // Explicitly clear
			}

			if (formData.vehicleId && !isNaN(parseInt(formData.vehicleId))) {
				payload.vehicleId = parseInt(formData.vehicleId);
			}

			if (formData.subcategoryId && !isNaN(parseInt(formData.subcategoryId))) {
				payload.subcategoryId = parseInt(formData.subcategoryId);
			}

			if (formData.partBrandId && !isNaN(parseInt(formData.partBrandId))) {
				payload.partBrandId = parseInt(formData.partBrandId);
			}

			if (formData.discountId && !isNaN(parseInt(formData.discountId))) {
				payload.discountId = parseInt(formData.discountId);
			}

			createPartSchema.parse(payload);

			await updatePart({ id: partId, ...payload }).unwrap();

			toast.success("Part updated successfully!");
			window.location.href = "/vendor/manage-parts";
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formattedErrors: Record<string, string> = {};
				err.errors.forEach((e) => {
					const field = e.path[0] as string;
					formattedErrors[field] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Please fix the errors below");
			} else {
				const message = err?.data?.message || "Failed to update part";
				toast.error(message);
			}
		}
	};

	const availabilityOptions = ["Available", "Unavailable", "On Backorder"];
	const originOptions = ["OEM", "Aftermarket", "Refurbished"];

	const existingCompatibilityIds =
		partRes?.data?.compatibility
			?.map((c: any) => c.vehicle?.id)
			.filter(Boolean) || [];

	return (
		<div className="overflow-y-auto bg-white py-8 px-4">
			<div className="max-w-5xl mx-auto space-y-9">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<input
							type="text"
							name="partNumber"
							placeholder="Part Number"
							value={formData.partNumber}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
						/>
						{errors.partNumber && (
							<p className="text-red-500 text-sm mt-1">{errors.partNumber}</p>
						)}
					</div>
					<div>
						<input
							type="number"
							name="quantity"
							placeholder="Quantity"
							value={formData.quantity}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
						/>
						{errors.quantity && (
							<p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
						)}
					</div>
					<div>
						<input
							type="number"
							name="price"
							placeholder="Price"
							step="0.01"
							value={formData.price}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
						/>
						{errors.price && (
							<p className="text-red-500 text-sm mt-1">{errors.price}</p>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<textarea
							name="description"
							placeholder="Description"
							rows={4}
							value={formData.description}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none resize-none"
						/>
						{errors.description && (
							<p className="text-red-500 text-sm mt-1">{errors.description}</p>
						)}
					</div>
					<div>
						<textarea
							name="remarks"
							placeholder="Remarks (optional)"
							rows={4}
							value={formData.remarks}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none resize-none"
						/>
					</div>
				</div>

				<div>
					<button
						type="button"
						onClick={() => setIsVehicleModalOpen(true)}
						className="w-full px-4 py-3 border border-[#808080] rounded-lg text-left flex justify-between items-center hover:border-[#9AE144]"
					>
						<span className={selectedVehicle ? "text-gray-700" : "text-gray-400"}>
							{selectedVehicle
								? (() => {
									const models = selectedVehicle.modification.models ?? [];

									const specificModel =
										models.find(
											(m: any) =>
												m.name.toLowerCase().includes("gen") ||
												m.name.toLowerCase().includes("1st") ||
												!m.name.toLowerCase().includes("all")
										) || models[0];

									const make = specificModel?.model_line?.car_make?.name ?? "N/A";
									const modelLine = specificModel?.model_line?.name ?? "N/A";
									const generation =
										specificModel?.name && !specificModel.name.toLowerCase().includes("all")
											? specificModel.name
											: "";

									const rawVariant = selectedVehicle.modification.name ?? "";
									const variant = rawVariant
										? `(${rawVariant.replace(/\//g, " • ")})`
										: "";

									const engine = selectedVehicle.engine_type?.name
										? `- ${selectedVehicle.engine_type.name}`
										: "";

									const year = selectedVehicle.production_year
										? `[${selectedVehicle.production_year}]`
										: "";

									const parts = [
										make,
										modelLine,
										generation && generation !== modelLine ? generation : "",
										variant,
										engine,
										year,
									].filter(Boolean);

									return parts.join(" ").trim() || "Selected Vehicle";
								})()
								: "Click to select vehicle"}
						</span>
						<ChevronDown className="w-5 h-5 text-[#9AE144]" />
					</button>
					{errors.vehicleId && (
						<p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<select
						value={selectedCategoryId}
						onChange={(e) => {
							const id = e.target.value;
							setSelectedCategoryId(id);
							setFormData((prev) => ({ ...prev, subcategoryId: "" }));
							if (id) fetchSubcategoriesByCategory(id);
						}}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144]"
					>
						<option value="">Select Category</option>
						{categoryRes?.data?.categories?.map((cat) => (
							<option key={cat.id} value={cat.id}>
								{cat.name}
							</option>
						))}
					</select>

					<select
						value={selectedSubCategoryId}
						onChange={(e) => {
							setSelectedSubCategoryId(e.target.value);
							handleSelectChange("subcategoryId", e.target.value);
						}}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144]"
						disabled={!selectedCategoryId}
					>
						<option value="">
							{!selectedCategoryId ? "Select Category First" : "Select Subcategory"}
						</option>
						{subcategories?.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>

					<select
						value={formData.partBrandId}
						onChange={(e) => handleSelectChange("partBrandId", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144]"
					>
						<option value="">Select Brand</option>
						{partBrands.map((b) => (
							<option key={b.id} value={b.id}>
								{b.name}
							</option>
						))}
					</select>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<select
						value={formData.availabilityStatus}
						onChange={(e) => handleSelectChange("availabilityStatus", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
					>
						{availabilityOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>

					<select
						value={formData.origin}
						onChange={(e) => handleSelectChange("origin", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
					>
						{originOptions.map((opt) => (
							<option key={opt} value={opt}>
								{opt}
							</option>
						))}
					</select>
				</div>

				<div className="flex justify-between items-start">
					<div className="flex flex-wrap gap-4">
						{previewUrls.length > 0 ? (
							previewUrls.map((url, index) => (
								<div
									key={index}
									className="relative h-44 w-44 cursor-pointer group"
									onClick={() => fileInputRef.current?.click()}
									title="Click to add more images"
								>
									<Image
										src={url}
										alt={`Preview ${index + 1}`}
										width={176}
										height={176}
										className="w-full h-full object-cover rounded-lg border border-[#808080] group-hover:opacity-80 transition"
									/>
									<button
										onClick={(e) => {
											e.stopPropagation();
											removeImage(index);
										}}
										className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
									>
										<X className="w-5 h-5" />
									</button>
									{index >= formData.imageUrls.length && (
										<div className="absolute inset-0 flex items-center justify-center bg-[#9AE144]/60 opacity-0 group-hover:opacity-100 transition rounded-lg">
											<span className="text-black font-medium">Add More</span>
										</div>
									)}
								</div>
							))
						) : (
							<div
								className={`h-44 w-44 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-all ${isDragging
									? "border-[#9AE144] bg-[#9AE144]/10"
									: "border-[#808080]"
									}`}
								onDrop={handleDrop}
								onDragOver={handleDragOver}
								onDragLeave={handleDragLeave}
								onClick={() => fileInputRef.current?.click()}
							>
								<div>
									<p className="text-gray-700">
										{isDragging ? "Drop here" : "Drag & drop or click"}
									</p>
									<p className="text-gray-400 text-sm mt-1">
										Supports multiple images
									</p>
								</div>
							</div>
						)}
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							multiple
							onChange={handleFileChange}
							className="hidden"
						/>
					</div>

					<button
						onClick={handleSubmit}
						disabled={isUpdating}
						className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cc93d] transition"
					>
						{isUpdating ? "Updating..." : "Update Part"}
					</button>
				</div>
			</div>

			<div className="max-w-5xl mx-auto mt-12 space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Compatible Vehicles</h3>
					<button
						onClick={() => setIsCompatibilityModalOpen(true)}
						disabled={isAddingCompatibility}
						className="px-4 py-2 bg-[#9AE144] text-black rounded-lg font-medium text-sm disabled:opacity-60"
					>
						{isAddingCompatibility ? "Adding..." : "Add Compatible Vehicle"}
					</button>
				</div>

				{partRes?.data?.compatibility && partRes.data.compatibility.length > 0 ? (
					<div className="space-y-3">
						{partRes.data.compatibility.map((comp) => {
							const v = comp.vehicle;
							if (!v) return null;
							return (
								<div
									key={comp.id}
									className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition"
								>
									<div>
										<div className="font-medium">
											{v.modification?.model_line?.car_make?.name}{" "}
											{v.modification?.model_line?.name}{" "}
											{v.modification?.name && `(${v.modification.name})`}
										</div>
										<div className="text-sm text-gray-600">
											{v.engine_type?.name} • {v.production_year}
										</div>
									</div>
									<button
										onClick={async () => {
											await removeCompatibility({
												partId: parseInt(partId),
												vehicleId: v.id,
											}).unwrap();
											refetch();
										}}
										disabled={isRemovingCompatibility}
										className="text-red-600 hover:text-red-700 font-medium text-sm"
									>
										Remove
									</button>
								</div>
							);
						})}
					</div>
				) : (
					<p className="text-gray-500 text-center py-8">
						No compatible vehicles added yet.
					</p>
				)}
			</div>

			<VehicleSelectorModal
				isOpen={isVehicleModalOpen}
				onClose={() => setIsVehicleModalOpen(false)}
				onSelect={handleVehicleSelect}
				mode="single"
			/>
			<VehicleSelectorModal
				isOpen={isCompatibilityModalOpen}
				onClose={() => setIsCompatibilityModalOpen(false)}
				onSelect={async (vehicles: Vehicle[]) => {
					if (vehicles.length === 0) return;

					setIsAddingCompatibility(true);

					const newVehicleIds = vehicles
						.map((v) => v.id)
						.filter((id) => !existingCompatibilityIds.includes(id));

					if (newVehicleIds.length === 0) {
						toast.success("Selected vehicles are already compatible");
						setIsCompatibilityModalOpen(false);
						setIsAddingCompatibility(false);
						return;
					}

					try {
						await addCompatibilityBulk({
							partId: parseInt(partId),
							vehicleIds: newVehicleIds,
						}).unwrap();

						toast.success(`${newVehicleIds.length} vehicle(s) added to compatibility`);
						refetch();
						setIsCompatibilityModalOpen(false);
					} catch (err: any) {
						toast.error(err?.data?.message || "Failed to add compatibility");
					} finally {
						setIsAddingCompatibility(false);
					}
				}}
				mode="multi"
			/>
		</div>
	);
};

export default UpdatePart;