"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
	useGetAllServiceCentersQuery,
	useDeleteServiceCenterMutation,
} from "@/lib/redux/api/serviceCenterApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

export default function ManageServiceCenters() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllServiceCentersQuery({ page, limit });
	const router = useRouter();
	const [deleteServiceCenter] = useDeleteServiceCenterMutation();

	// Log API data for debugging
	console.log("API data:", data);

	// Safely extract service centers array from API response
	const serviceCenters = data?.data?.serviceCenters ?? [];

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Service Center",
			render: (value) => (
				<div className="flex flex-col">
					<span className="font-semibold">{value.name}</span>
					<span className="text-xs text-gray-500">
						{value.city}, {value.state}
					</span>
				</div>
			),
		},
		{
			key: "phone",
			header: "Phone",
			render: (value) => value.phone || "N/A",
		},
		{
			key: "address",
			header: "Address",
			render: (value) => (
				<span>{`${value.address}, ${value.city}, ${value.state}, ${value.zip}, ${value.country}`}</span>
			),
		},
		{
			key: "is_active",
			header: "Status",
			render: (value) => (value.is_active ? "Active" : "Inactive"),
		},
		{
			key: "created_at",
			header: "Created At",
			render: (value) => new Date(value.created_at).toLocaleDateString(),
		},
		{
			key: "updated_at",
			header: "Updated At",
			render: (value) => new Date(value.updated_at).toLocaleDateString(),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (center) => {
				console.log("Edit service center:", center);
				if (center?.id && typeof center.id === "number") {
					router.push(`/admin/manage-service-center/edit/${center.id}`);
				} else {
					console.error("Invalid service center ID for edit:", center);
				}
			},
			tooltip: "Edit service center",
		},
		{
			icon: Eye,
			onClick: (center) => {
				console.log("View service center:", center);
				if (center?.id && typeof center.id === "number") {
					// router.push(`/admin/manage-service-center/${center.id}`);
				} else {
					console.error("Invalid service center ID for view:", center);
				}
			},
			tooltip: "View service center",
		},
		{
			icon: Trash2,
			onClick: async (center) => {
				console.log("Delete service center:", center);
				if (center?.id && typeof center.id === "number") {
					try {
						await deleteServiceCenter(center.id).unwrap();
						console.log("Deleted successfully");
					} catch (error) {
						console.error("Delete failed", error);
					}
				} else {
					console.error("Invalid service center ID for delete:", center);
				}
			},
			tooltip: "Delete service center",
		},
	];

	return (
		<DataTable
			title="Listed Service Centers"
			data={serviceCenters}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Service Center"
			addButtonPath="/admin/manage-service-center/addServiceCenter"
			emptyMessage="No service centers found."
			errorMessage="Failed to load service centers."
			loadingMessage="Loading service centers..."
			avatarConfig={{
				enabled: false, // No avatar for service centers
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
