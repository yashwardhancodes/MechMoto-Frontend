"use client";
import { Pencil, Trash2 } from "lucide-react";
import {
	useGetAllModificationsQuery,
	useDeleteModificationMutation,
} from "@/lib/redux/api/modificationApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

export default function ManageModifications() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllModificationsQuery({ page, limit });
	const [deleteModification] = useDeleteModificationMutation();
	const router = useRouter();

	const modifications = data?.data?.modifications ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const columns: TableColumn[] = [
		{ key: "name", header: "Modification" },
		{
			key: "model_line",
			header: "Model Line",
			render: (v: any) => v.model_line?.name ?? "N/A",
		},
	];

	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (row: any) => router.push(`/admin/manage-modifications/edit/${row.id}`),
			tooltip: "Edit Modification",
		},
		{
			icon: Trash2,
			onClick: async (row: any) => {
				await deleteModification(row.id);
			},
			tooltip: "Delete Modification",
		},
	];

	return (
		<DataTable
			title="Listed Modifications"
			data={modifications}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Modification"
			addButtonPath="/admin/manage-modifications/add"
			pagination={{
				currentPage: page,
				totalPages,
				totalItems: total,
				pageSize: limit,
				onPageChange: setPage,
			}}
		/>
	);
}
