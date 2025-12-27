"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCreatePartMutation } from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createPartSchema } from "@/lib/schema/partSchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { useLazyGetSubcategoriesByCategoryIdQuery } from "@/lib/redux/api/subCategoriesApi";
import { useGetAllPartBrandsQuery } from "@/lib/redux/api/partBrandApi";
import { ChevronDown, X } from "lucide-react";
import { RootState } from "@/lib/redux/store";
import Image from "next/image";
import VehicleSelectorModal from "@/components/SearchModels/VehicleSelectorModal";

// Removed local Vehicle interface to avoid conflict
// The correct Vehicle type comes from the modal or API

interface PartBrand {
	id: string;
	name: string;
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

interface FormErrors {
	[key: string]: string;
}

const AddPart: React.FC = () => {
	const token = useSelector((state: RootState) => state.auth.token);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [formData, setFormData] = useState<FormData>({
		vehicleId: "",
		subcategoryId: "",
		partNumber: "",
		description: "",
		quantity: "1",
		imageUrls: [],
		price: "",
		remarks: "",
		availabilityStatus: "Available",
		origin: "OEM",
		partBrandId: "",
		discountId: "",
	});
	const [files, setFiles] = useState<File[]>([]);
	const [previewUrls, setPreviewUrls] = useState<string[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});
	const [dropdownOpen, setDropdownOpen] = useState({
		vehicle: false,
		subcategory: false,
		availabilityStatus: false,
		origin: false,
		partBrand: false,
		discount: false,
		category: false,
	});

	const [createPart, { isLoading }] = useCreatePartMutation();
	const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
	const { data: categoryResponse } = useGetAllCategoriesQuery({ page: 1, limit: 999 });
	const [fetchSubcategoriesByCategory, { data: filteredSubcategories }] =
		useLazyGetSubcategoriesByCategoryIdQuery();
	const {
		data: partBrandResponse,
		isLoading: isPartBrandsLoading,
		error: partBrandsError,
	} = useGetAllPartBrandsQuery({ page: 1, limit: 999999 });
	const {
		data: discounts,
		isLoading: isDiscountsLoading,
		error: discountsError,
	} = useGetAllVehiclesQuery({}); // Note: This seems to be incorrectly querying vehicles instead of discounts
	const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
	const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null); // Using 'any' temporarily to avoid deep type conflict

	const subcategories = selectedCategoryId ? filteredSubcategories?.data : [];

	const partBrands = partBrandResponse?.data?.brands;

	useEffect(() => {
		if (files.length > 0) {
			const urls = files.map((file) => URL.createObjectURL(file));
			setPreviewUrls(urls);
			return () => urls.forEach((url) => URL.revokeObjectURL(url));
		} else {
			setPreviewUrls([]);
		}
	}, [files]);

	// Early return after hooks
	if (!token) {
		return (
			<div className="flex items-center justify-center h-[calc(100vh-140px)]">
				<p className="text-red-500 text-lg">You are not logged in!</p>
			</div>
		);
	}

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	// Fixed type: accepts array of vehicles from modal (single mode still takes first)
	const handleVehicleSelect = (vehicles: any[]) => {
		if (vehicles.length === 0) return;

		const vehicle = vehicles[0];
		setSelectedVehicle(vehicle);
		setFormData((prev) => ({ ...prev, vehicleId: vehicle.id.toString() }));
		setIsVehicleModalOpen(false);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
		}
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files) {
			const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
				file.type.startsWith("image/"),
			);
			setFiles((prev) => [...prev, ...newFiles]);
		}
	};

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => {
		setIsDragging(false);
	};

	const handleImageClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const removeImage = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const handleSelectChange = (name: string, value: string | number) => {
		setFormData((prev) => ({
			...prev,
			[name]: value.toString(),
		}));
		setDropdownOpen((prev) => ({
			...prev,
			[name === "vehicleId"
				? "vehicle"
				: name === "subcategoryId"
				? "subcategory"
				: name === "partBrandId"
				? "partBrand"
				: name === "discountId"
				? "discount"
				: name === "availabilityStatus"
				? "availabilityStatus"
				: "origin"]: false,
		}));
	};

	const handleSubmit = async () => {
		try {
			setErrors({});
			let imageUrls = formData.imageUrls;
			if (files.length > 0) {
				imageUrls = await Promise.all(
					files.map((file) => uploadImageToBackend(file, token)),
				);
			}
			const parsedData = createPartSchema.parse({
				...formData,
				vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
				subcategoryId: formData.subcategoryId
					? parseInt(formData.subcategoryId)
					: undefined,
				partBrandId: formData.partBrandId ? parseInt(formData.partBrandId) : undefined,
				discountId: formData.discountId ? parseInt(formData.discountId) : undefined,
				quantity: formData.quantity ? parseInt(formData.quantity) : 1,
				price: formData.price ? parseFloat(formData.price) : undefined,
				imageUrls,
			});
			console.log("✅ Valid Data:", parsedData);

			const result = await createPart(parsedData).unwrap();
			console.log("✅ API Response:", result);

			// Fixed: safely access part ID from response
			const partId = result?.data?.id;
			if (!partId) {
				toast.error("Part added but no part ID returned!");
				return;
			}

			toast.success("Part added successfully! Redirecting...");
			window.location.href = `/vendor/manage-parts/edit/${partId}`;
		} catch (err: unknown) {
			if (err instanceof z.ZodError) {
				const formattedErrors: Record<string, string> = {};
				err.errors.forEach((e) => {
					formattedErrors[e.path[0] as string] = e.message;
				});
				setErrors(formattedErrors);
				toast.error("Validation failed!");
				console.log("❌ Validation Errors:", formattedErrors);
			} else if (err && typeof err === "object" && "data" in err) {
				const errorMessage = (err as { data?: { message?: string } }).data?.message;
				toast.error(errorMessage || "Something went wrong!");
				console.error("❌ Error:", err);
			} else {
				toast.error("Something went wrong!");
				console.error("❌ Error:", err);
			}
		}
	};

	const availabilityOptions = ["Available", "Unavailable", "On Backorder"];
	const originOptions = ["OEM", "Aftermarket", "Refurbished"];

	return (
		<div className="bg-white py-8 px-4">
			<div className="max-w-5xl mx-auto space-y-9">
				{/* Row 1: Part Number, Quantity, Price */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<input
							type="text"
							name="partNumber"
							placeholder="Part Number"
							value={formData.partNumber}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
						/>
						{errors["partNumber"] && (
							<p className="text-red-500 text-sm mt-1">{errors["partNumber"]}</p>
						)}
					</div>
					<div>
						<input
							type="number"
							name="quantity"
							placeholder="Quantity"
							value={formData.quantity}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
						/>
						{errors["quantity"] && (
							<p className="text-red-500 text-sm mt-1">{errors["quantity"]}</p>
						)}
					</div>
					<div>
						<input
							type="number"
							name="price"
							placeholder="Price"
							value={formData.price}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
							step="0.01"
						/>
						{errors["price"] && (
							<p className="text-red-500 text-sm mt-1">{errors["price"]}</p>
						)}
					</div>
				</div>

				{/* Row 2: Description, Remarks */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<textarea
							name="description"
							placeholder="Description"
							rows={4}
							value={formData.description}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
						/>
						{errors["description"] && (
							<p className="text-red-500 text-sm mt-1">{errors["description"]}</p>
						)}
					</div>
					<div>
						<textarea
							name="remarks"
							placeholder="Remarks"
							rows={4}
							value={formData.remarks}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
						/>
						{errors["remarks"] && (
							<p className="text-red-500 text-sm mt-1">{errors["remarks"]}</p>
						)}
					</div>
				</div>

				{/* Row 3: Vehicle, Category, Subcategory */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<button
							type="button"
							onClick={() => setIsVehicleModalOpen(true)}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg text-left flex justify-between items-center hover:border-[#9AE144] transition-colors"
						>
							<span className={selectedVehicle ? "text-gray-700" : "text-gray-400"}>
								{selectedVehicle
									? `${
											selectedVehicle.modification?.model_line?.car_make
												?.name || ""
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

						{errors["vehicleId"] && (
							<p className="text-red-500 text-sm mt-1">{errors["vehicleId"]}</p>
						)}
					</div>

					{/* CATEGORY DROPDOWN */}
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									category: !prev.category,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
						>
							<span
								className={selectedCategoryId ? "text-gray-700" : "text-gray-400"}
							>
								{selectedCategoryId
									? categoryResponse?.data?.categories.find(
											(c: any) => c.id === Number(selectedCategoryId),
									  )?.name
									: "Select Category"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.category ? "rotate-180" : ""
								}`}
							/>
						</button>

						{dropdownOpen.category &&
							categoryResponse?.data?.categories &&
							categoryResponse.data.categories.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{categoryResponse.data.categories.map((category: any) => (
										<button
											key={category.id}
											type="button"
											onClick={() => {
												setSelectedCategoryId(category.id.toString());
												setFormData((prev) => ({
													...prev,
													subcategoryId: "",
												}));
												fetchSubcategoriesByCategory(category.id);
												setDropdownOpen((prev) => ({
													...prev,
													category: false,
												}));
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{category.name}
										</button>
									))}
								</div>
							)}
					</div>
				</div>

				{/* Subcategory */}
				<div className="grid grid-cols-1 gap-4">
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									subcategory: !prev.subcategory,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							disabled={!selectedCategoryId}
						>
							<span
								className={
									formData.subcategoryId && Array.isArray(subcategories)
										? "text-gray-700"
										: "text-gray-400"
								}
							>
								{!selectedCategoryId
									? "Select a Category first"
									: formData.subcategoryId && Array.isArray(subcategories)
									? subcategories.find(
											(s: any) => s.id === Number(formData.subcategoryId),
									  )?.name || "Select Subcategory"
									: "Select Subcategory"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.subcategory ? "rotate-180" : ""
								}`}
							/>
						</button>

						{dropdownOpen.subcategory &&
							Array.isArray(subcategories) &&
							subcategories.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{subcategories.map((subcategory: any) => (
										<button
											key={subcategory.id}
											type="button"
											onClick={() =>
												handleSelectChange("subcategoryId", subcategory.id)
											}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{subcategory.name}
										</button>
									))}
								</div>
							)}
					</div>
				</div>

				{/* Row 4: Part Brand, Discount */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									partBrand: !prev.partBrand,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							disabled={isPartBrandsLoading || !!partBrandsError}
						>
							<span
								className={
									formData.partBrandId && Array.isArray(partBrands)
										? "text-gray-700"
										: "text-gray-400"
								}
							>
								{isPartBrandsLoading
									? "Loading part brands..."
									: partBrandsError
									? "Error loading part brands"
									: formData.partBrandId && Array.isArray(partBrands)
									? partBrands?.find(
											(pb: PartBrand) =>
												pb.id.toString() === formData.partBrandId,
									  )?.name || "Select a Part Brand"
									: "Select a Part Brand"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.partBrand ? "rotate-180" : ""
								}`}
							/>
						</button>
						{dropdownOpen.partBrand &&
							!isPartBrandsLoading &&
							!partBrandsError &&
							Array.isArray(partBrands) &&
							partBrands?.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{partBrands?.map((partBrand: PartBrand) => (
										<button
											key={partBrand.id}
											type="button"
											onClick={() =>
												handleSelectChange("partBrandId", partBrand.id)
											}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{partBrand.name}
										</button>
									))}
								</div>
							)}
						{errors["partBrandId"] && (
							<p className="text-red-500 text-sm mt-1">{errors["partBrandId"]}</p>
						)}
					</div>
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									discount: !prev.discount,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
							disabled={isDiscountsLoading || !!discountsError}
						>
							<span
								className={
									formData.discountId && Array.isArray(discounts?.data)
										? "text-gray-700"
										: "text-gray-400"
								}
							>
								{isDiscountsLoading
									? "Loading discounts..."
									: discountsError
									? "Error loading discounts"
									: formData.discountId && Array.isArray(discounts?.data)
									? discounts.data.find(
											(d: Discount) =>
												d.id === Number(formData.discountId),
									  )?.name || "Select a Discount"
									: "Select a Discount"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.discount ? "rotate-180" : ""
								}`}
							/>
						</button>
						{dropdownOpen.discount &&
							!isDiscountsLoading &&
							!discountsError &&
							Array.isArray(discounts?.data) &&
							discounts.data.length > 0 && (
								<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
									{discounts.data.map((discount: Discount) => (
										<button
											key={discount.id}
											type="button"
											onClick={() =>
												handleSelectChange("discountId", discount.id)
											}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{discount.name}
										</button>
									))}
								</div>
							)}
						{errors["discountId"] && (
							<p className="text-red-500 text-sm mt-1">{errors["discountId"]}</p>
						)}
					</div>
				</div>

				{/* Row 5: Availability Status, Origin */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									availabilityStatus: !prev.availabilityStatus,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
						>
							<span
								className={
									formData.availabilityStatus ? "text-gray-700" : "text-gray-400"
								}
							>
								{formData.availabilityStatus || "Select Availability Status"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.availabilityStatus ? "rotate-180" : ""
								}`}
							/>
						</button>
						{dropdownOpen.availabilityStatus && (
							<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
								{availabilityOptions.map((status) => (
									<button
										key={status}
										type="button"
										onClick={() =>
											handleSelectChange("availabilityStatus", status)
										}
										className="w-full px-4 py-2 text-left hover:bg-gray-50"
									>
										{status}
									</button>
								))}
							</div>
						)}
						{errors["availabilityStatus"] && (
							<p className="text-red-500 text-sm mt-1">
								{errors["availabilityStatus"]}
							</p>
						)}
					</div>
					<div className="relative">
						<button
							type="button"
							onClick={() =>
								setDropdownOpen((prev) => ({
									...prev,
									origin: !prev.origin,
								}))
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
						>
							<span className={formData.origin ? "text-gray-700" : "text-gray-400"}>
								{formData.origin || "Select Origin"}
							</span>
							<ChevronDown
								className={`w-5 h-5 text-[#9AE144] ${
									dropdownOpen.origin ? "rotate-180" : ""
								}`}
							/>
						</button>
						{dropdownOpen.origin && (
							<div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-30 max-h-48 overflow-y-auto">
								{originOptions.map((origin) => (
									<button
										key={origin}
										type="button"
										onClick={() => handleSelectChange("origin", origin)}
										className="w-full px-4 py-2 text-left hover:bg-gray-50"
									>
										{origin}
									</button>
								))}
							</div>
						)}
						{errors["origin"] && (
							<p className="text-red-500 text-sm mt-1">{errors["origin"]}</p>
						)}
					</div>
				</div>

				{/* Row 6: Image Upload */}
				<div className="flex justify-between items-start">
					<div className="flex gap-4">
						<div className="flex flex-wrap gap-4">
							{previewUrls.length > 0 ? (
								previewUrls.map((url, index) => (
									<div
										key={index}
										className="relative h-44 w-44 cursor-pointer group"
										onClick={handleImageClick}
										title="Click to add more images"
									>
										<Image
											src={url}
											alt={`Part preview ${index + 1}`}
											className="w-full h-full p-4 object-cover rounded-lg border border-[#808080] group-hover:opacity-80 transition-opacity duration-200"
											width={100}
											height={100}
										/>
										<button
											onClick={(e) => {
												e.stopPropagation();
												removeImage(index);
											}}
											className="absolute top-2 right-2 p-1 z-10 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200"
											title="Remove image"
										>
											<X className="w-5 h-5" />
										</button>
										<div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#9AE144] bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
											<span className="text-black font-medium text-sm">
												Add More Images
											</span>
										</div>
									</div>
								))
							) : (
								<div
									className={`h-44 w-44 border-2 border-dashed rounded-lg p-4 flex items-center justify-center text-center transition-all duration-200 ${
										isDragging
											? "border-[#9AE144] bg-[#9AE144]/10"
											: "border-[#808080]"
									}`}
									onDrop={handleDrop}
									onDragOver={handleDragOver}
									onDragLeave={handleDragLeave}
									onClick={handleImageClick}
								>
									<div>
										<p className="text-gray-700">
											{isDragging
												? "Drop images here"
												: "Drag & drop or click to select"}
										</p>
										<p className="text-gray-400 text-sm mt-1">
											Supports multiple images
										</p>
									</div>
								</div>
							)}
						</div>
						<input
							type="file"
							accept="image/*"
							multiple
							onChange={handleFileChange}
							className="hidden"
							ref={fileInputRef}
						/>
						{errors["imageUrls"] && (
							<p className="text-red-500 text-sm mt-1">{errors["imageUrls"]}</p>
						)}
					</div>
				</div>

				{/* Submit Button */}
				<div className="flex justify-end pt-3">
					<button
						type="button"
						onClick={handleSubmit}
						disabled={isLoading}
						className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144]/90 text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
					>
						{isLoading ? "Adding..." : "Add Part"}
					</button>
				</div>
			</div>

			{/* Vehicle Selector Modal */}
			<VehicleSelectorModal
				isOpen={isVehicleModalOpen}
				onClose={() => setIsVehicleModalOpen(false)}
				onSelect={handleVehicleSelect}
				mode="single"
			/>
		</div>
	);
};

export default AddPart;