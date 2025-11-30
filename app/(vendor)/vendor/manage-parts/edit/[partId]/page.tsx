"use client";

import React, { useState, useEffect, useRef } from "react";
import {
	useUpdatePartMutation,
	useGetPartQuery,
	useRemoveCompatibilityMutation,
	useAddCompatibilityMutation,
} from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createPartSchema } from "@/lib/schema/partSchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { useGetAllSubcategoriesQuery } from "@/lib/redux/api/subCategoriesApi";
import { useGetAllPartBrandsQuery } from "@/lib/redux/api/partBrandApi";
import { ChevronDown, X } from "lucide-react";
import { useParams } from "next/navigation";
import { RootState } from "@/lib/redux/store";
import Image from "next/image";
import VehicleSelectorModal from "@/components/SearchModels/VehicleSelectorModal";

interface Vehicle {
	id: number;
	modification?: {
		name: string;
		model_line: {
			name: string;
			car_make: { name: string };
		};
	};
	engine_type?: { name: string };
	production_year?: number | string;
}

interface Discount {
	id: number;
	name: string;
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

	const { data: partRes, isLoading: isPartLoading, error: partError } = useGetPartQuery(partId);
	const [updatePart, { isLoading: isUpdating }] = useUpdatePartMutation();
	const [addCompatibility] = useAddCompatibilityMutation();
	const [removeCompatibility, { isLoading: isRemovingCompatibility }] =
		useRemoveCompatibilityMutation();

	const token = useSelector((state: RootState) => state.auth.token);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
	const [isCompatibilityModalOpen, setIsCompatibilityModalOpen] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [errors, setErrors] = useState<Record<string, string>>({});

	// New files to upload
	const [newFiles, setNewFiles] = useState<File[]>([]);
	// Existing + newly uploaded preview URLs
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);

	const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

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

	// Supporting data
	const { data: subcategoryRes } = useGetAllSubcategoriesQuery({});
	const { data: partBrandRes } = useGetAllPartBrandsQuery({ page: 1, limit: 999999 });

	const subcategories = subcategoryRes?.data?.subcategories || [];
	const partBrands = partBrandRes?.data?.brands || [];

	// Load existing part data
	useEffect(() => {
		if (partRes?.data) {
			const p = partRes.data;
			setFormData({
				vehicleId: p.vehicleId?.toString() || "",
				subcategoryId: p.subcategoryId?.toString() || "",
				partNumber: p.part_number || "",
				description: p.description || "",
				quantity: p.quantity?.toString() || "1",
				imageUrls: p.image_urls || [],
				price: p.price?.toString() || "",
				remarks: p.remarks || "",
				availabilityStatus: p.availabilityStatus || "Unavailable",
				origin: p.origin || "OEM",
				partBrandId: p.part_brandId?.toString() || "",
				discountId: p.discountId?.toString() || "",
			});

			if (p.vehicle) setSelectedVehicle(p.vehicle);
		}
	}, [partRes]);

	// Update preview URLs whenever existing images or new files change
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

	const handleVehicleSelect = (vehicle: Vehicle) => {
		setSelectedVehicle(vehicle);
		setFormData((prev) => ({ ...prev, vehicleId: vehicle.id.toString() }));
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
			// Remove from existing URLs
			setFormData((prev) => ({
				...prev,
				imageUrls: prev.imageUrls.filter((_, i) => i !== index),
			}));
		} else {
			// Remove from new files
			setNewFiles((prev) => prev.filter((_, i) => i !== index - existingCount));
		}
	};

	const handleSubmit = async () => {
		try {
			setErrors({});

			let finalImageUrls = [...formData.imageUrls];
			if (newFiles.length > 0) {
				const uploaded = await Promise.all(
					newFiles.map((f) => uploadImageToBackend(f, token)),
				);
				finalImageUrls = [...finalImageUrls, ...uploaded];
			}

			const parsed = createPartSchema.parse({
				...formData,
				vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
				subcategoryId: formData.subcategoryId
					? parseInt(formData.subcategoryId)
					: undefined,
				partBrandId: formData.partBrandId ? parseInt(formData.partBrandId) : undefined,
				discountId: formData.discountId ? parseInt(formData.discountId) : undefined,
				quantity: parseInt(formData.quantity) || 1,
				price: parseFloat(formData.price) || undefined,
				imageUrls: finalImageUrls,
			});

			await updatePart({ id: parseInt(partId), ...parsed }).unwrap();
			toast.success("Part updated successfully!");
			window.location.href = "/vendor/manage-parts";
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const errMap = err.errors.reduce((acc, e) => {
					acc[e.path[0] as string] = e.message;
					return acc;
				}, {} as Record<string, string>);
				setErrors(errMap);
				toast.error("Please fix the validation errors");
			} else {
				toast.error(err?.data?.message || "Update failed");
			}
		}
	};

	const availabilityOptions = ["Available", "Unavailable", "On Backorder"];
	const originOptions = ["OEM", "Aftermarket", "Refurbished"];

	return (
		<div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-8 px-4">
			<div className="max-w-5xl mx-auto space-y-9">
				{/* Part Number, Quantity, Price */}
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

				{/* Description & Remarks */}
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

				{/* Vehicle */}
				<div>
					<button
						type="button"
						onClick={() => setIsVehicleModalOpen(true)}
						className="w-full px-4 py-3 border border-[#808080] rounded-lg text-left flex justify-between items-center hover:border-[#9AE144]"
					>
						<span className={selectedVehicle ? "text-gray-700" : "text-gray-400"}>
							{selectedVehicle
								? `${
										selectedVehicle.modification?.model_line?.car_make?.name ||
										""
								  } ${selectedVehicle.modification?.model_line?.name || ""} ${
										selectedVehicle.modification?.name
											? `(${selectedVehicle.modification.name})`
											: ""
								  } ${
										selectedVehicle.engine_type?.name
											? `- ${selectedVehicle.engine_type.name}`
											: ""
								  } [${selectedVehicle.production_year}]`
								: "Click to select vehicle"}
						</span>
						<ChevronDown className="w-5 h-5 text-[#9AE144]" />
					</button>
					{errors.vehicleId && (
						<p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>
					)}
				</div>

				{/* Subcategory, Brand, Discount */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<select
						value={formData.subcategoryId}
						onChange={(e) => handleSelectChange("subcategoryId", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
					>
						<option value="">Select Subcategory</option>
						{subcategories.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>

					<select
						value={formData.partBrandId}
						onChange={(e) => handleSelectChange("partBrandId", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
					>
						<option value="">Select Brand</option>
						{partBrands.map((b) => (
							<option key={b.id} value={b.id}>
								{b.name}
							</option>
						))}
					</select>

					<select
						value={formData.discountId}
						onChange={(e) => handleSelectChange("discountId", e.target.value)}
						className="px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
					>
						<option value="">No Discount</option>
						{[].map((d: Discount) => (
							<option key={d.id} value={d.id}>
								{d.name}
							</option>
						))}
					</select>
				</div>

				{/* Availability & Origin */}
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

				{/* Image Upload */}
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
								className={`h-44 w-44 border-2 border-dashed rounded-lg flex items-center justify-center text-center cursor-pointer transition-all ${
									isDragging
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

			{/* Compatibility Section */}
			<div className="max-w-5xl mx-auto mt-12 space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold">Compatible Vehicles</h3>
					<button
						onClick={() => setIsCompatibilityModalOpen(true)}
						className="px-4 py-2 bg-[#9AE144] text-black rounded-lg font-medium text-sm"
					>
						Add Compatible Vehicle
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
										onClick={() =>
											removeCompatibility({
												partId: parseInt(partId),
												vehicleId: v.id,
											}).unwrap()
										}
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

			{/* Modals */}
			<VehicleSelectorModal
				isOpen={isVehicleModalOpen}
				onClose={() => setIsVehicleModalOpen(false)}
				onSelect={handleVehicleSelect}
			/>
			<VehicleSelectorModal
				isOpen={isCompatibilityModalOpen}
				onClose={() => setIsCompatibilityModalOpen(false)}
				onSelect={async (vehicle) => {
					await addCompatibility({
						partId: parseInt(partId),
						vehicleId: vehicle.id,
					}).unwrap();
					toast.success("Vehicle added to compatibility");
					setIsCompatibilityModalOpen(false);
				}}
			/>
		</div>
	);
};

export default UpdatePart;
