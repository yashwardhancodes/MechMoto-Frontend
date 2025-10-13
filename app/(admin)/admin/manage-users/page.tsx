// frontend/app/admin/dashboard/manage-users/page.tsx (or similar path)
"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllUsersQuery } from "@/lib/redux/api/userApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table"; // Adjust import path as needed
import { useState } from "react";

export default function ManageUsers() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllUsersQuery({ page, limit });
	const router = useRouter();

	// Safely extract users array from API response
	const users = data?.data?.users ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "profiles.full_name",
			header: "Name",
			render: (item) => (
				<div className="flex row items-center gap-2 ">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
						{item.profiles?.full_name
							?.split(" ")
							.map((word: string) => word.charAt(0).toUpperCase())
							.join("")}
					</div>
					<div className="flex flex-col ">
						<span className="font-semibold   ">{item.profiles?.full_name}</span>
						<span className=" text-xs">{item.email}</span>
					</div>
				</div>
			),
		},
		{
			key: "role.name",
			header: "Role",
			render: (item) => item.role?.name || "-",
		},
		{
			key: "phone",
			header: "Phone",
			render: (item) => item.profiles?.phone || "-",
		},
		{
			key: "created_at",
			header: "Created At",
			render: (item) => new Date(item.created_at).toLocaleDateString(),
		},
		{
			key: "status",
			header: "Status",
			render: (item) => {
				// Assuming a status based on role-specific fields, e.g., is_active for Vendor/ServiceCenter
				let status = "Active";
				if (item.vendors?.length > 0) {
					status = item.vendors[0].is_active ? "Active" : "Inactive";
				} else if (item.service_centers?.length > 0) {
					status = item.service_centers[0].is_active ? "Active" : "Inactive";
				} else if (item.mechanics?.length > 0) {
					status = item.mechanics[0].is_available ? "Available" : "Unavailable";
				}
				return (
					<span
						className={`px-2 py-1 rounded-full text-xs ${
							status === "Active" || status === "Available"
								? "bg-green-100 text-green-800"
								: "bg-red-100 text-red-800"
						}`}
					>
						{status}
					</span>
				);
			},
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (user) => {
				// Handle edit action
				console.log("Edit user:", user);
				router.push(`/admin/dashboard/manage-users/edit/${user.id}`);
			},
			tooltip: "Edit user",
		},
		{
			icon: Eye,
			onClick: (user) => {
				router.push(`/admin/dashboard/manage-users/${user.id}`);
			},
			tooltip: "View user",
		},
		{
			icon: Trash2,
			onClick: (user) => {
				// Handle delete action
				console.log("Delete user:", user);
				// Add confirmation dialog and delete logic here, e.g., using useDeleteUserMutation
			},
			tooltip: "Delete user",
		},
	];

	return (
		<DataTable
			title="Manage Users"
			data={users}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add User"
			addButtonPath="/admin/manage-users/add"
			emptyMessage="No users found."
			errorMessage="Failed to load users."
			loadingMessage="Loading users..."
			avatarConfig={{
				enabled: true,
				nameKey: "profiles.full_name",
				subtitleKey: "email",
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
