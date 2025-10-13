"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllCarMakesQuery, useDeleteCarMakeMutation } from "@/lib/redux/api/caeMakeApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

// Define proper type for Car Make
interface CarMake {
	id: number | string;
	name: string;
	created_at?: string | number | Date;
}

interface TableRow {
	id: number | string;
	name: string;
	createdAt: string;
	raw: CarMake;
}

export default function ManageCarMake() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllCarMakesQuery({ page, limit });
	const [deleteCarMake] = useDeleteCarMakeMutation();
	const router = useRouter();

	// Safely extract and transform carMakes for table
	const carMakes: TableRow[] = (data?.data?.carMakes ?? []).map((carMake: CarMake) => ({
		id: carMake.id,
		name: carMake.name ?? "N/A",
		createdAt: carMake.created_at ? new Date(carMake.created_at).toLocaleDateString() : "N/A",
		raw: carMake,
	}));

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Car Make",
			render: (value: TableRow) => (
				<div className="flex row items-center gap-2">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
						{value.name
							?.split(" ")
							.map((word: string) => word.charAt(0).toUpperCase())
							.join("")}
					</div>
					<div className="flex flex-col">
						<span className="font-semibold">{value.name}</span>
						<span className="text-xs">{value.createdAt}</span>
					</div>
				</div>
			),
		},
		{ key: "createdAt", header: "Created Date" },
	];

	// Define actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (carMake: TableRow) => {
				router.push(`/admin/manage-car-make/edit/${carMake.id}`);
			},
			tooltip: "Edit Car Make",
		},
		{
			icon: Eye,
			onClick: (carMake: TableRow) => {
				router.push(`/admin/manage-car-make/${carMake.id}`);
			},
			tooltip: "View Car Make",
		},
		{
			icon: Trash2,
			onClick: async (carMake: TableRow) => {
				try {
					await deleteCarMake(carMake.id).unwrap();
					console.log("Deleted successfully");
				} catch (error) {
					console.error("Delete failed", error);
				}
			},
			tooltip: "Delete Car Make",
		},
	];

	return (
		<DataTable
			title="Listed Car Makes"
			data={carMakes}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Car Make"
			addButtonPath="/admin/manage-car-make/addCarMake"
			emptyMessage="No car makes found."
			errorMessage="Failed to load car makes."
			loadingMessage="Loading car makes..."
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
