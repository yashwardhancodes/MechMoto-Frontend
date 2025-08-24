"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { useGetPartsByFiltersQuery } from "@/lib/redux/api/partApi";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice"; // ✅ use setBreadcrumbs

interface Product {
	id: number;
	title: string;
	specs: string;
	price: string;
	oldPrice?: string;
	image: string;
	alt: string;
	isGreatPrice?: boolean;
	discount?: string;
}

const ProductsSection: React.FC = () => {
	const searchParams = useSearchParams();
	const subcategoryId = searchParams.get("sub_category_id");
	const vehicleId = searchParams.get("vehicle_id");

	const dispatch = useDispatch();

	const {
		data: partsData,
		isLoading,
		error,
	} = useGetPartsByFiltersQuery({
		subcategoryId: subcategoryId ? Number(subcategoryId) : undefined,
		vehicleId: vehicleId ? Number(vehicleId) : undefined,
	});

	// Map API response to ProductCard props
	const products: Product[] =
		partsData?.data?.map((part: any) => ({
			id: part.id,
			title: part.part_number || "Unknown Part",
			specs: `${part.subcategory.name} • ${part.vehicle.modification || "N/A"}`,
			price: `Rs-${part.price}`,
			oldPrice: part.discount
				? `Rs-${Math.round(
						part.price / (1 - parseFloat(part.discount.percentage) / 100)
				  )}`
				: undefined,
			image: part.image_urls[0] || "https://via.placeholder.com/300x200",
			alt: part.subcategory.name || "Part Image",
			isGreatPrice: part.discount ? true : false,
			discount: part.discount ? `-${part.discount.percentage}%` : undefined,
		})) || [];

	// 🔹 Dispatch breadcrumb trail for the current page
	useEffect(() => {
		if (partsData?.data?.length > 0) {
			const firstPart = partsData.data[0];

			// Construct a breadcrumb trail dynamically
			const breadcrumbs = [
				{ label: "All Categories", href: "/categories" }, // Starting point
				{
					label: firstPart.category?.name || "Category",
					href: `/products?category_id=${firstPart.category?.id}&vehicle_id=${firstPart.vehicle.id}`,
				},
				{
					label: firstPart.subcategory.name || "Subcategory",
					href: `/products?sub_category_id=${firstPart.subcategory.id}&vehicle_id=${firstPart.vehicle.id}`,
				},
			];

			console.log("🚀 Adding breadcrumbs:", breadcrumbs);
			dispatch(setBreadcrumbs(breadcrumbs));
		}
	}, [partsData, dispatch]);

	if (isLoading) {
		return <div className="bg-white p-5 rounded-lg">Loading parts...</div>;
	}

	if (error) {
		return (
			<div className="bg-white p-5 rounded-lg">
				Error loading parts. Please try again.
			</div>
		);
	}

	return (
		<div className="bg-white p-5 rounded-lg">
			<div className="mb-5">
				<h1 className="text-4xl text-[rgba(23,24,59,1)] font-dm-sans mb-2">
					{partsData?.data[0]?.subcategory.name || "Parts"} for{" "}
					<span className="text-[#9AE144]">
						{partsData?.data[0]?.vehicle.car_make?.name || "Vehicle"}{" "}
						{partsData?.data[0]?.vehicle.model_line || ""}{" "}
						{partsData?.data[0]?.vehicle.modification || ""}
					</span>
				</h1>
				<div className="text-[#9AE144] text-base font-roboto font-medium">
					{products.length} Parts available
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
				{products.map((product) => (
					<ProductCard key={product.id} product={product} />
				))}
			</div>
		</div>
	);
};

export default ProductsSection;