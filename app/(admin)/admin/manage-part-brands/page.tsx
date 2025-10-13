"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllPartBrandsQuery, useDeletePartBrandMutation } from "@/lib/redux/api/partBrandApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import toast from "react-hot-toast";
import { useState } from "react";

export default function ManageBrands() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllPartBrandsQuery({ page, limit });
	const router = useRouter();
	const [deletePartBrand] = useDeletePartBrandMutation();

	// Log API data for debugging
	console.log("API data:", data);

	// Safely extract brands array from API response
	const brands = data?.data?.brands ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Name",
			render: (item) => (
				<div className="flex row items-center gap-2 ">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
						{item.name
							?.split(" ")
							.map((word: string) => word.charAt(0).toUpperCase())
							.join("")}
					</div>
					<div className="flex flex-col ">
						<span className="font-semibold   ">{item.name}</span>
					</div>
				</div>
			),
		},
		{
			key: "created_at",
			header: "Created At",
			render: (item) => new Date(item.created_at).toLocaleDateString(),
		},
		{
			key: "parts",
			header: "Parts Count",
			render: (item) => item.parts?.length || 0,
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (brand) => {
				console.log("Edit brand:", brand);
				if (brand?.id && typeof brand.id === "number") {
					router.push(`/admin/manage-part-brands/edit/${brand.id}`);
				} else {
					console.error("Invalid brand ID for edit:", brand);
				}
			},
			tooltip: "Edit brand",
		},
		{
			icon: Eye,
			onClick: (brand) => {
				console.log("View brand:", brand);
				if (brand?.id && typeof brand.id === "number") {
					// router.push(`/admin/dashboard/manage-brands/${brand.id}`);
				} else {
					console.error("Invalid brand ID for view:", brand);
				}
			},
			tooltip: "View brand",
		},
		{
			icon: Trash2,
			onClick: async (brand) => {
				console.log("Delete brand:", brand);
				if (brand?.id && typeof brand.id === "number") {
					try {
						await deletePartBrand(brand.id).unwrap();
						toast.success("Brand deleted successfully!");
						console.log("Deleted successfully");
					} catch (error) {
						console.error("Delete failed", error);
						toast.error("Failed to delete brand. Please try again.");
					}
				} else {
					console.error("Invalid brand ID for delete:", brand);
					toast.error("Failed to delete brand. Please try again.");
				}
			},
			tooltip: "Delete brand",
		},
	];

	return (
		<DataTable
			title="Listed Brands"
			data={brands}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Brand"
			addButtonPath="/admin/manage-part-brands/addPartBrand"
			emptyMessage="No brands found."
			errorMessage="Failed to load brands."
			loadingMessage="Loading brands..."
			avatarConfig={{
				enabled: false,
				nameKey: "name",
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
