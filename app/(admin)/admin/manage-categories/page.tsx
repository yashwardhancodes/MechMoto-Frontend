"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllCategoriesQuery, useDeleteCategoryMutation } from "@/lib/redux/api/categoriesApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { useState } from "react";

interface Category {
	id: number;
	name: string;
	description: string;
	img_src: string;
	created_at: string | number | Date;
}

export default function ManageCategories() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllCategoriesQuery({ page, limit });
	const [deleteCategory] = useDeleteCategoryMutation();
	const router = useRouter();

	// Safely extract categories array from API response
	const categories: Category[] = data?.data?.categories ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Name",
			render: (item: Category) => (
				<div className="flex row items-center gap-2">
					{item.img_src ? (
						<div className="relative w-10 h-10 rounded-full overflow-hidden">
							<Image
								src={item.img_src}
								alt={item.name}
								fill
								className="object-cover"
							/>
						</div>
					) : (
						<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
							{item.name
								.split(" ")
								.map((word) => word.charAt(0).toUpperCase())
								.join("")}
						</div>
					)}
					<div className="flex flex-col">
						<span className="font-semibold">{item.name}</span>
						<span className="text-xs">{item.description}</span>
					</div>
				</div>
			),
		},
		{ key: "description", header: "Description" },
		{
			key: "created_at",
			header: "Created At",
			render: (item: Category) => new Date(item.created_at).toLocaleDateString(),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (category: Category) => {
				if (category.id) router.push(`/admin/manage-categories/edit/${category.id}`);
			},
			tooltip: "Edit category",
		},
		{
			icon: Eye,
			onClick: (category: Category) => {
				if (category.id) {
					// Example: router.push(`/admin/manage-categories/view/${category.id}`);
				}
			},
			tooltip: "View category",
		},
		{
			icon: Trash2,
			onClick: async (category: Category) => {
				if (category.id) {
					try {
						await deleteCategory(category.id).unwrap();
						toast.success("Category deleted successfully!");
					} catch (error) {
						console.error("Error deleting category:", error);
						toast.error("Failed to delete category. Please try again.");
					}
				}
			},
			tooltip: "Delete category",
		},
	];

	return (
		<DataTable
			title="Listed Categories"
			data={categories}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Category"
			addButtonPath="/admin/manage-categories/addCategory"
			emptyMessage="No categories found."
			errorMessage="Failed to load categories."
			loadingMessage="Loading categories..."
			avatarConfig={{
				enabled: true,
				nameKey: "name",
				subtitleKey: "description",
				getAvatarUrl: (item: Category) => item.img_src,
				getAvatarAlt: (item: Category) => item.name,
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
