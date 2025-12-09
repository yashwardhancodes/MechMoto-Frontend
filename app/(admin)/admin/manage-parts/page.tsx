"use client";

import {  Eye } from "lucide-react";
import { useGetAllPartsQuery } from "@/lib/redux/api/partApi";
// import { useDeletePartMutation } from "@/lib/redux/api/partApi";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import Image from "next/image";
import { useState } from "react";

export default function ManageParts() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllPartsQuery({ page, limit });
	// const [deletePart] = useDeletePartMutation();

	// Log API data for debugging
	console.log("API data:", data);

	// Safely extract parts array from API response
	const parts = data?.data?.parts ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "part_number",
			header: "Part Number",
			render: (item) => (
				<div className="flex row items-center gap-2">
					<Image
						src={item.image_urls?.[0] || "/placeholder.png"}
						alt={item.part_number}
						className="size-10 rounded-full object-cover"
						width={100}
						height={100}
					/>
					<div className="flex flex-col">
						<span className="font-semibold">{item.part_number}</span>
						<span className="text-xs">{item.description}</span>
					</div>
				</div>
			),
		},
		// {
		// 	key: "description",
		// 	header: "Description",
		// },
		{
			key: "vehicle.model_line",
			header: "Vehicle Model",
			render: (item) =>
				`${item.vehicle?.model_line || "N/A"} (${item.vehicle?.production_year || "N/A"})`,
		},
		{
			key: "subcategory.name",
			header: "Subcategory",
			render: (item) => item.subcategory?.name || "N/A",
		},
		{
			key: "part_brand.name",
			header: "Brand",
			render: (item) => item.part_brand?.name || "N/A",
		},
		// {
		// 	key: "price",
		// 	header: "Price",
		// 	render: (item) => `₹${item.price?.toLocaleString() || "N/A"}`,
		// },
		// {
		// 	key: "quantity",
		// 	header: "Quantity",
		// },
		// {
		// 	key: "availability_status",
		// 	header: "Availability",
		// },
		// {
		// 	key: "created_at",
		// 	header: "Created At",
		// 	render: (item) => new Date(item.created_at).toLocaleDateString(),
		// },
	];

	// Define table actions
	const actions: TableAction[] = [
		// {
		// 	icon: Pencil,
		// 	onClick: (part) => {
		// 		console.log("Edit part:", part);
		// 		if (part?.id && typeof part.id === "number") {
		// 			// router.push(`/admin/dashboard/manage-parts/edit/${part.id}`);
		// 		} else {
		// 			console.error("Invalid part ID for edit:", part);
		// 		}
		// 	},
		// 	tooltip: "Edit part",
		// },
		{
			icon: Eye,
			onClick: (part) => {
				console.log("View part:", part);
				if (part?.id && typeof part.id === "number") {
					// router.push(`/admin/dashboard/manage-parts/${part.id}`);
				} else {
					console.error("Invalid part ID for view:", part);
				}
			},
			tooltip: "View part",
		},
		// {
		// 	icon: Trash2,
		// 	onClick: async (part) => {
		// 		console.log("Delete part:", part);
		// 		if (part?.id && typeof part.id === "number") {
		// 			try {
		// 				await deletePart(part.id).unwrap();
		// 				window.location.reload();
		// 				console.log("Deleted successfully");
		// 			} catch (error) {
		// 				console.error("Delete failed", error);
		// 			}
		// 		} else {
		// 			console.error("Invalid part ID for delete:", part);
		// 		}
		// 	},
		// 	tooltip: "Delete part",
		// },
	];

	return (
		<DataTable
			title="Listed Parts"
			data={parts}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Part"
			addButtonPath="/admin/manage-parts/addParts"
			emptyMessage="No parts found."
			errorMessage="Failed to load parts."
			loadingMessage="Loading parts..."
			avatarConfig={{
				enabled: true,
				nameKey: "part_number",
				subtitleKey: "description",
				getAvatarUrl: (item) => item.image_urls?.[0] || "/placeholder.png",
				getAvatarAlt: (item) => item.part_number,
			}}
			pagination={
				totalPages > 0
					? {
							currentPage: page,
							totalPages,
							totalItems: total,
							pageSize: limit,
							onPageChange: setPage,
					  }
					: undefined
			}
		/>
	);
}
