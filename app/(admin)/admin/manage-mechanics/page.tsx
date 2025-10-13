"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllMechanicsQuery, useDeleteMechanicMutation } from "@/lib/redux/api/mechanicApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

// ✅ Define API mechanic type
interface MechanicAPI {
	id: number | string;
	full_name: string;
	phone?: string;
	city?: string;
	rating?: string;
	is_available?: boolean;
	created_at?: string;
}

export default function ManageMechanics() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllMechanicsQuery({ page, limit });
	const [deleteMechanic] = useDeleteMechanicMutation();
	const router = useRouter();

	// ✅ Map backend response to table data
	const mechanics = (data?.data?.mechanics ?? []).map((mechanic: MechanicAPI) => ({
		id: mechanic.id,
		name: mechanic.full_name ?? "N/A",
		phone: mechanic.phone ?? "N/A",
		city: mechanic.city ?? "N/A",
		rating: mechanic.rating ?? "N/A",
		isAvailable: mechanic.is_available ? "Available" : "Unavailable",
		createdAt: mechanic.created_at ? new Date(mechanic.created_at).toLocaleDateString() : "N/A",
		raw: mechanic,
	}));

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// ✅ Table Columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Mechanic",
			render: (value) => (
				<div className="flex row items-center gap-2">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-500">
						{value.name
							?.split(" ")
							.map((word: string) => word.charAt(0).toUpperCase())
							.join("")}
					</div>
					<div className="flex flex-col">
						<span className="font-semibold">{value.name}</span>
						<span className="text-xs">{value.phone}</span>
					</div>
				</div>
			),
		},
		{ key: "city", header: "City" },
		{ key: "rating", header: "Rating" },
		{ key: "isAvailable", header: "Availability" },
		{ key: "createdAt", header: "Created Date" },
	];

	// ✅ Row Actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (mechanic: { id: string | number }) => {
				router.push(`/admin/manage-mechanics/edit/${mechanic.id}`);
			},
			tooltip: "Edit Mechanic",
		},
		{
			icon: Eye,
			onClick: (mechanic: { id: string | number }) => {
				router.push(`/admin/manage-mechanics/${mechanic.id}`);
			},
			tooltip: "View Mechanic",
		},
		{
			icon: Trash2,
			onClick: async (mechanic: { id: string | number }) => {
				try {
					await deleteMechanic(mechanic.id).unwrap();
					window.location.reload();
					console.log("Deleted successfully");
				} catch (error) {
					console.error("Delete failed", error);
				}
			},
			tooltip: "Delete Mechanic",
		},
	];

	return (
		<DataTable
			title="Listed Mechanics"
			data={mechanics}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Mechanic"
			addButtonPath="/admin/manage-mechanics/addMechanic"
			emptyMessage="No mechanics found."
			errorMessage="Failed to load mechanics."
			loadingMessage="Loading mechanics..."
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
