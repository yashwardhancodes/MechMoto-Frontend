// src/app/admin/manage-model-line/page.tsx
"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
	useGetAllModelLinesQuery,
	useDeleteModelLineMutation,
} from "@/lib/redux/api/modelLineCrudApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

interface ModelLine {
	id: number | string;
	name: string;
	car_make?: { id: number; name: string };
	created_at?: string | number | Date;
}

interface TableRow {
	id: number | string;
	name: string;
	carMake: string;
	createdAt: string;
	raw: ModelLine;
}

export default function ManageModelLine() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllModelLinesQuery({ page, limit });
	const [deleteModelLine] = useDeleteModelLineMutation();
	const router = useRouter();
	console.log("data", data)
	const modelLines: TableRow[] =
		(data?.data ?? []).map((m: ModelLine) => ({
			id: m.id,
			name: m.name ?? "N/A",
			carMake: m.car_make?.name ?? "N/A",
			createdAt: m.created_at ? new Date(m.created_at).toLocaleDateString() : "N/A",
			raw: m,
		})) ?? [];

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const columns: TableColumn[] = [
		{ key: "name", header: "Model Line" },
		{ key: "carMake", header: "Car Make" },
		{ key: "createdAt", header: "Created Date" },
	];

	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (row: TableRow) => router.push(`/admin/manage-model-line/edit/${row.id}`),
			tooltip: "Edit",
		},
		{
			icon: Eye,
			onClick: (row: TableRow) => router.push(`/admin/manage-model-line/${row.id}`),
			tooltip: "View",
		},
		{
			icon: Trash2,
			onClick: async (row: TableRow) => {
				try {
					await deleteModelLine(row.id).unwrap();
				} catch (err) {
					console.error("Delete failed", err);
				}
			},
			tooltip: "Delete",
		},
	];

	return (
		<DataTable
			title="Listed Model Lines"
			data={modelLines}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Model Line"
			addButtonPath="/admin/manage-model-line/add"
			emptyMessage="No model lines found."
			errorMessage="Failed to load model lines."
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
