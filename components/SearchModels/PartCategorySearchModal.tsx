import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import searchIcon from "@/public/assets/search.png";
import { useRouter } from "next/navigation";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { useLazyGetSubcategoriesByCategoryIdQuery } from "@/lib/redux/api/subCategoriesApi";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice";
import Breadcrumb from "../ProductListing/Breadcrumb"; // ✅ use breadcrumb component

interface PartCategorySearchModalProps {
	onClose: () => void;
	vehicles: any[];
}

interface PartCategory {
	id?: string;
	name: string;
	img_src: string;
}

const PartCategorySearchModal: React.FC<PartCategorySearchModalProps> = ({ onClose, vehicles }) => {
	const [selectedCategory, setSelectedCategory] = useState<PartCategory | null>(null);
	const [selectedSubCategory, setSelectedSubCategory] = useState<PartCategory | null>(null);
	const router = useRouter();
	const dispatch = useDispatch();

	// Categories
	const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllCategoriesQuery({});
	const categories: PartCategory[] =
		categoriesData?.data.map((category: any) => ({
			id: category.id,
			name: category.name,
			img_src: category.img_src,
		})) || [];

	useEffect(() => {
		console.log("vehicles", vehicles);
	}, [vehicles]);

	// Subcategories
	const [triggerSubcategories, { data: subcategoriesData, isLoading: isLoadingSubcategories }] =
		useLazyGetSubcategoriesByCategoryIdQuery();

	const subcategories: PartCategory[] =
		subcategoriesData?.data.map((sub: any) => ({
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
	const vehicleName = vehicles.length > 0
		? vehicles[0]?.car_make.name + " " + vehicles[0].model_line + vehicles[0]?.modification
		: "";

	return (
		<div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)] flex items-center justify-center p-4">
			<div className="bg-white w-full max-w-3xl rounded-lg p-6 px-8 relative max-h-[90vh] ">
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
					<div className="relative flex-2 w-full">
						<input
							type="text"
							placeholder="Type Your Query"
							className="w-full px-4 py-1.5 rounded-full bg-[#F7F7F7] text-sm"
						/>
						<Image
							src={searchIcon}
							className="absolute right-2 size-6 top-1.5"
							alt="search"
						/>
					</div>
				</div>

				{/* Filters */}
				<div className="mt-6 flex items-center flex-wrap">
					<span className="bg-[rgba(154,225,68,0.3)] text-green-800 font-medium px-3 py-1 rounded-full text-sm flex items-center mr-4 mb-2">
						{vehicleName}
						<IoMdClose className="ml-2 cursor-pointer" />
					</span>

					<div className="ml-auto text-sm flex items-center gap-1 text-gray-700">
						Selected filter (1)
						<FiFilter className="ml-1" />
					</div>
				</div>

				{/* Title & Breadcrumbs */}
				<div className="mt-0 flex flex-col items-start justify-between">
					<h2 className="font-semibold text-lg mb-2">{title}</h2>
					<Breadcrumb /> {/* ✅ central breadcrumb component */}
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
										{ label: 'All Categories', href: '/categories' },
										{ label: item.name, href: vehicleId ? `/products?category_id=${item.id}&vehicle_id=${vehicleId}` : `/products?category_id=${item.id}` },
									];
									dispatch(setBreadcrumbs(breadcrumbs));
									triggerSubcategories(item.id!);
								}}
								className="flex flex-col items-center justify-center p-4 h-28 rounded-md cursor-pointer bg-gray-100 hover:bg-[#E8F9DB] transition"
							>
								<img src={item.img_src} alt={item.name} className="h-10 w-auto" />
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
							<p>Loading subcategories...</p>
						) : subcategories.length === 0 ? (
							<p className="text-gray-500">No subcategories found</p>
						) : (
							subcategories.map((item, index) => (
								<Link
									key={item.id || index}
									onClick={() => {
										setSelectedSubCategory(item);
										const breadcrumbs = [
											{ label: 'All Categories', href: '/categories' },
											{ label: selectedCategory.name, href: vehicleId ? `/products?category_id=${selectedCategory.id}&vehicle_id=${vehicleId}` : `/products?category_id=${selectedCategory.id}` },
											{ label: item.name, href: vehicleId ? `/products?sub_category_id=${item.id}&vehicle_id=${vehicleId}` : `/products?sub_category_id=${item.id}` },
										];
										dispatch(setBreadcrumbs(breadcrumbs));
										router.push(vehicleId ? `/products?sub_category_id=${item.id}&vehicle_id=${vehicleId}` : `/products?sub_category_id=${item.id}`);
									}}
									href={vehicleId ? `/products?sub_category_id=${item.id}&vehicle_id=${vehicleId}` : `/products?sub_category_id=${item.id}`}
									className={`
										flex flex-col items-center justify-center p-4 h-28 rounded-md cursor-pointer
										${selectedSubCategory?.id === item.id ? "bg-[#E8F9DB]" : "bg-gray-100"}
										hover:bg-[#E8F9DB] transition
									`}
								>
									<img src={item.img_src} alt={item.name} className="h-10 w-auto" />
									<span className="mt-2 text-center px-4 text-[13px] font-medium text-gray-800">
										{item.name}
									</span>
								</Link>
							))
						)}
					</div>
				)}

				{/* View More */}
				<div className="mt-4 flex items-center justify-center text-black text-sm font-medium cursor-pointer hover:underline group">
					View More
					<IoIosArrowDown className="ml-1 text-[#9AE144] transform transition-transform duration-300 group-hover:rotate-180" />
				</div>
			</div>
		</div>
	);
};

export default PartCategorySearchModal;