// src/components/ProductListing/PartCategorySearchModal.tsx
"use client";

import React from "react";
import { IoMdClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import Image from "next/image";
import searchIcon from "@/public/assets/search.png";
import { useRouter } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice";
import Breadcrumb from "../ProductListing/Breadcrumb";

interface Vehicle {
	id: number;
	production_year: number | string;
	modification: {
		id: number;
		name: string;
		models: {
			id: number;
			name: string;
			model_line: {
				id: number;
				name: string;
				car_make: {
					id: number;
					name: string;
				};
			};
		}[];
	};
	engine_type?: { id: number; name: string } | null;
}

interface Category {
	id: string;
	name: string;
	img_src: string;
}

interface Subcategory {
	id: string;
	name: string;
	img_src: string;
}

interface PartCategory {
	id?: string;
	name: string;
	img_src: string;
}

interface PartCategorySearchModalProps {
	onClose: () => void;
	vehicles: Vehicle[];
	productionYear: string | null;
	selectedCategory: PartCategory | null;
	setSelectedCategory: React.Dispatch<React.SetStateAction<PartCategory | null>>;
	selectedSubCategory: PartCategory | null;
	setSelectedSubCategory: React.Dispatch<React.SetStateAction<PartCategory | null>>;
	triggerGetSubcategories: any;
	subcategoriesData: any;
	isLoadingSubcategories: boolean;
}

const PartCategorySearchModal: React.FC<PartCategorySearchModalProps> = ({
	onClose,
	vehicles,
	productionYear,
	selectedCategory,
	setSelectedCategory,
	selectedSubCategory,
	setSelectedSubCategory,
	triggerGetSubcategories,
	subcategoriesData,
	isLoadingSubcategories,
}) => {
	const router = useRouter();
	const dispatch = useDispatch();

	const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery({
		page: 1,
		limit: 999999,
	});

	const categories: PartCategory[] =
		categoriesData?.data?.categories?.map((category: Category) => ({
			id: category.id,
			name: category.name,
			img_src: category.img_src,
		})) || [];

	const subcategories: PartCategory[] =
		subcategoriesData?.data?.map((sub: Subcategory) => ({
			id: sub.id,
			name: sub.name,
			img_src: sub.img_src,
		})) || [];

	const title = selectedCategory
		? `Select a subcategory for "${selectedCategory.name}"`
		: "Select a part category to get started";

	if (isLoadingCategories) {
		return (
			<div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)] flex items-center justify-center p-4">
				<div className="bg-white w-full max-w-3xl rounded-lg p-6 px-8 relative max-h-[90vh]">
					<p>Loading categories...</p>
				</div>
			</div>
		);
	}

	const vehicleId = vehicles.length > 0 ? vehicles[0].id : null;

	// SAFE ACCESS: Handle many-to-many models array
	const firstModel = vehicles.length > 0 ? vehicles[0].modification.models[0] : null;

	const carMakeName = firstModel?.model_line.car_make.name || "";
	const modelLineName = firstModel?.model_line.name || "";
	const generationNames = vehicles.length > 0
		? vehicles[0].modification.models.map((m: any) => m.name).join(" • ")
		: "";
	const modificationName = vehicles.length > 0 ? vehicles[0].modification.name : "";

	// Build clean vehicle display name
	const vehicleName = vehicles.length > 0
		? `${carMakeName} ${modelLineName}${productionYear ? ` (${productionYear})` : ""} ${modificationName}${generationNames && generationNames !== "All Generations" ? ` - ${generationNames}` : ""}`.trim()
		: "";

	return (
		<div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)] flex items-center justify-center p-4">
			<div className="bg-white w-full max-w-3xl rounded-lg p-6 px-8 relative max-h-[90vh] overflow-y-auto">
				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black"
				>
					<IoMdClose />
				</button>

				{/* Search */}
				<div className="flex items-center mt-4 space-x-4">
					<h1 className="text-2xl font-bold text-black">Search</h1>
					<div className="relative flex-1 w-full">
						<input
							type="text"
							placeholder="Type Your Query"
							className="w-full px-4 py-1.5 rounded-full bg-[#F7F7F7] text-sm"
						/>
						<Image
							src={searchIcon}
							className="absolute right-2 size-6 top-1.5"
							alt="search"
							width={24}
							height={24}
						/>
					</div>
				</div>

				{/* Filters */}
				<div className="mt-6 flex items-center flex-wrap">
					{vehicles.length > 0 && (
						<span className="bg-[rgba(154,225,68,0.3)] text-green-800 font-medium px-3 py-1 rounded-full text-sm flex items-center mr-4 mb-2">
							{vehicleName}
							<IoMdClose
								className="ml-2 cursor-pointer"
								onClick={onClose}
							/>
						</span>
					)}

					<div className="ml-auto text-sm flex items-center gap-1 text-gray-700">
						Selected filter ({vehicles.length > 0 ? 1 : 0})
						<FiFilter className="ml-1" />
					</div>
				</div>

				{/* Title & Breadcrumbs */}
				<div className="mt-0 flex flex-col items-start justify-between">
					<h2 className="font-semibold text-lg mb-2">{title}</h2>
					<Breadcrumb />
				</div>

				{/* Category List */}
				{!selectedCategory && (
					<div className="grid grid-cols-2 mt-3 sm:grid-cols-4 gap-4 max-h-[250px] overflow-y-auto scrollbar-black">
						{categories.map((item, index) => (
							<div
								key={item.id || index}
								onClick={() => {
									setSelectedCategory(item);
									const breadcrumbs = [
										{ label: "All Categories", href: "/categories" },
										{
											label: item.name,
											href: vehicleId
												? `/products?category_id=${item.id}&vehicle_id=${vehicleId}`
												: `/products?category_id=${item.id}`,
										},
									];
									dispatch(setBreadcrumbs(breadcrumbs));
									triggerGetSubcategories(item.id!);
								}}
								className="flex flex-col items-center justify-center p-4 h-28 rounded-md cursor-pointer bg-gray-100 hover:bg-[#E8F9DB] transition"
							>
								<Image
									src={item.img_src}
									alt={item.name}
									className="h-10 w-auto"
									width={40}
									height={40}
								/>
								<span className="mt-2 text-center px-4 text-[13px] font-medium text-gray-800">
									{item.name}
								</span>
							</div>
						))}
					</div>
				)}

				{/* Subcategory List */}
				{selectedCategory && (
					<div className="grid grid-cols-2 mt-3 sm:grid-cols-4 gap-4 max-h-[250px] overflow-y-auto scrollbar-black">
						{isLoadingSubcategories ? (
							<p className="text-gray-500 col-span-full text-center">Loading subcategories...</p>
						) : subcategories.length === 0 ? (
							<p className="text-gray-500 col-span-full text-center">No subcategories found</p>
						) : (
							subcategories.map((item, index) => {
								const baseParams = new URLSearchParams();
								baseParams.append("sub_category_id", item.id);
								baseParams.append("category_id", selectedCategory.id);

								if (vehicleId) {
									baseParams.append("vehicle_id", vehicleId.toString());
									if (carMakeName) baseParams.append("make", carMakeName);
									if (modelLineName) baseParams.append("model", modelLineName);
									if (productionYear) baseParams.append("year", productionYear);
									// Removed generation & modification — clean URL
								}

								const subcatHref = `/products?${baseParams.toString()}`;

								return (
									<Link
										key={item.id || index}
										href={subcatHref}
										onClick={() => {
											setSelectedSubCategory(item);
											const breadcrumbs = [
												{ label: "All Categories", href: "/categories" },
												{
													label: selectedCategory.name,
													href: vehicleId
														? `/products?category_id=${selectedCategory.id}&vehicle_id=${vehicleId}`
														: `/products?category_id=${selectedCategory.id}`,
												},
												{
													label: item.name,
													href: subcatHref,
												},
											];
											dispatch(setBreadcrumbs(breadcrumbs));
											router.push(subcatHref);
										}}
										className={`
				flex flex-col items-center justify-center p-4 h-28 rounded-md cursor-pointer
				${selectedSubCategory?.id === item.id ? "bg-[#E8F9DB]" : "bg-gray-100"}
				hover:bg-[#E8F9DB] transition
			`}
									>
										<Image
											src={item.img_src}
											alt={item.name}
											className="h-10 w-auto"
											width={40}
											height={40}
										/>
										<span className="mt-2 text-center px-4 text-[13px] font-medium text-gray-800">
											{item.name}
										</span>
									</Link>
								);
							})
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default PartCategorySearchModal;