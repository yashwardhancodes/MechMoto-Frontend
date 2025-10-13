"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
	useGetAllEngineTypesQuery,
	useDeleteEngineTypeMutation,
} from "@/lib/redux/api/engineTypeApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

interface EngineType {
	id: number | string;
	name: string;
	created_at?: string;
}

interface EngineTypeRow {
	id: number | string;
	name: string;
	createdAt: string;
	raw: EngineType;
}

export default function ManageEngineType() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllEngineTypesQuery({ page, limit });
	const [deleteEngineType] = useDeleteEngineTypeMutation();
	const router = useRouter();

	const engineTypes: EngineTypeRow[] = (data?.data?.engineTypes ?? []).map(
		(engineType: EngineType) => ({
			id: engineType.id,
			name: engineType.name ?? "N/A",
			createdAt: engineType.created_at
				? new Date(engineType.created_at).toLocaleDateString()
				: "N/A",
			raw: engineType,
		}),
	);

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Engine Type",
			render: (value: EngineTypeRow) => (
				<div className="flex row items-center gap-2">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-green-500">
						{value.name
							?.split(" ")
							.map((word) => word.charAt(0).toUpperCase())
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

	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (engineType: EngineTypeRow) => {
				router.push(`/admin/manage-engine-type/edit/${engineType.id}`);
			},
			tooltip: "Edit Engine Type",
		},
		{
			icon: Eye,
			onClick: (engineType: EngineTypeRow) => {
				router.push(`/admin/manage-engine-type/${engineType.id}`);
			},
			tooltip: "View Engine Type",
		},
		{
			icon: Trash2,
			onClick: async (engineType: EngineTypeRow) => {
				try {
					await deleteEngineType(engineType.id).unwrap();
					console.log("Deleted successfully");
				} catch (error) {
					console.error("Delete failed", error);
				}
			},
			tooltip: "Delete Engine Type",
		},
	];

	return (
		<DataTable
			title="Listed Engine Types"
			data={engineTypes}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Engine Type"
			addButtonPath="/admin/manage-engine-type/addEngineType"
			emptyMessage="No engine types found."
			errorMessage="Failed to load engine types."
			loadingMessage="Loading engine types..."
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
