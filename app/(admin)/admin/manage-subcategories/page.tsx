"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
	useGetAllSubcategoriesQuery,
	useDeleteSubcategoryMutation,
} from "@/lib/redux/api/subCategoriesApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useState } from "react";

export default function ManageSubcategories() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllSubcategoriesQuery({ page, limit });
	const router = useRouter();
	const [deleteSubcategory] = useDeleteSubcategoryMutation();

	// Log API data for debugging
	console.log("API data:", data);

	// Safely extract subcategories array from API response
	const subcategories = data?.data?.subcategories ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Name",
			render: (item) => (
				<div className="flex row items-center gap-2">
					<Image
						src={item.img_src}
						alt={item.name}
						width={40}
						height={40}
						className="size-10 rounded-full object-cover"
					/>
					<div className="flex flex-col">
						<span className="font-semibold">{item.name}</span>
						<span className="text-xs">{item.description}</span>
					</div>
				</div>
			),
		},
		{
			key: "description",
			header: "Description",
		},
		{
			key: "category.name",
			header: "Category",
			render: (item) => item.category?.name || "N/A",
		},
		{
			key: "created_at",
			header: "Created At",
			render: (item) => new Date(item.created_at).toLocaleDateString(),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (subcategory) => {
				console.log("Edit subcategory:", subcategory);
				if (subcategory?.id && typeof subcategory.id === "number") {
					router.push(`/admin/manage-subcategories/edit/${subcategory.id}`);
				} else {
					console.error("Invalid subcategory ID for edit:", subcategory);
				}
			},
			tooltip: "Edit subcategory",
		},
		{
			icon: Eye,
			onClick: (subcategory) => {
				console.log("View subcategory:", subcategory);
				if (subcategory?.id && typeof subcategory.id === "number") {
					// router.push(`/admin/dashboard/manage-subcategories/${subcategory.id}`);
				} else {
					console.error("Invalid subcategory ID for view:", subcategory);
				}
			},
			tooltip: "View subcategory",
		},
		{
			icon: Trash2,
			onClick: async (subcategory) => {
				console.log("Delete subcategory:", subcategory);
				if (subcategory?.id && typeof subcategory.id === "number") {
					try {
						await deleteSubcategory(subcategory.id).unwrap();
						toast.success("Subcategory deleted successfully!");
					} catch (error) {
						console.error("Error deleting subcategory:", error);
						toast.error("Failed to delete subcategory. Please try again.");
					}
				}
			},
			tooltip: "Delete subcategory",
		},
	];

	return (
		<DataTable
			title="Listed Subcategories"
			data={subcategories}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Subcategory"
			addButtonPath="/admin/manage-subcategories/addSubcategory"
			emptyMessage="No subcategories found."
			errorMessage="Failed to load subcategories."
			loadingMessage="Loading subcategories..."
			avatarConfig={{
				enabled: true,
				nameKey: "name",
				subtitleKey: "description",
				getAvatarUrl: (item) => item.img_src,
				getAvatarAlt: (item) => item.name,
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
