"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllVendorsQuery } from "@/lib/redux/api/vendorApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table"; // Adjust import path as needed
import { useState } from "react";

export default function Mvendor() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllVendorsQuery({ page, limit });
	const router = useRouter();

	// Safely extract vendors array from API response
	const vendors = data?.data?.vendors ?? [];
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
						<span className=" text-xs">{item.user.email}</span>
					</div>
				</div>
			),
		},
		{
			key: "purchases",
			header: "Purchases",
			render: (item) => item.shipments?.length || 0,
		},
		{
			key: "user.role.name",
			header: "Role",
			render: (item) => item.user.role.name,
		},
		{
			key: "revenue",
			header: "Revenue",
			render: () => "-", // Since this data isn't available in your API
		},
		{
			key: "totalProducts",
			header: "Total Products",
			render: (item) => item.parts?.length || 0,
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (vendor) => {
				// Handle edit action
				console.log("Edit vendor:", vendor);
				router.push(`/admin/manage-vendors/edit/${vendor.id}`);
			},
			tooltip: "Edit vendor",
		},
		{
			icon: Eye,
			onClick: (vendor) => {
				router.push(`/admin/dashboard/manage-vendors/${vendor.id}`);
			},
			tooltip: "View vendor",
		},
		{
			icon: Trash2,
			onClick: (vendor) => {
				// Handle delete action
				console.log("Delete vendor:", vendor);
				// Add confirmation dialog and delete logic here
			},
			tooltip: "Delete vendor",
		},
	];

	return (
		<DataTable
			title="Listed Vendors"
			data={vendors}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Vendors"
			addButtonPath="/admin/manage-vendors/addVendor"
			emptyMessage="No vendors found."
			errorMessage="Failed to load vendors."
			loadingMessage="Loading vendors..."
			avatarConfig={{
				enabled: true,
				nameKey: "name",
				subtitleKey: "user.email",
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
