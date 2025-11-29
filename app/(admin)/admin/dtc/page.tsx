"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllDtcsQuery, useDeleteDtcMutation } from "@/lib/redux/api/dtcApi";
import { useRouter } from "next/navigation";
import DataTable from "@/components/SuperDashboard/Table";
import { useState } from "react";

export default function ManageDtcs() {
	const router = useRouter();
	const [page, setPage] = useState(1);
	const limit = 15;
	const { data, isLoading, isError } = useGetAllDtcsQuery({ page, limit });
	const [deleteDtc] = useDeleteDtcMutation();

	const dtcs = (data?.data?.dtcs || []).map((d: any) => ({
		id: d.id,
		code: d.code,
		title: d.title,
		system: d.system?.name || d.system?.code,
		severity: d.severity,
		raw: d,
	}));

	const columns = [
		{ key: "code", header: "Code" },
		{ key: "title", header: "Title" },
		{ key: "system", header: "System" },
		{
			key: "severity",
			header: "Severity",
			render: (v: any) => (
				<span
					className={`px-2 py-1 rounded text-xs font-medium ${
						v.severity === "critical"
							? "bg-red-100 text-red-700"
							: v.severity === "high"
							? "bg-orange-100 text-orange-700"
							: v.severity === "moderate"
							? "bg-yellow-100 text-yellow-700"
							: "bg-green-100 text-green-700"
					}`}
				>
					{v.severity.toUpperCase()}
				</span>
			),
		},
	];

	const actions = [
		{
			icon: Eye,
			onClick: (item: any) => router.push(`/admin/dtc/${item.id}`),
			tooltip: "View Details",
		},
		{
			icon: Pencil,
			onClick: (item: any) => router.push(`/admin/dtc/edit/${item.id}`),
			tooltip: "Edit",
		},
		{
			icon: Trash2,
			onClick: async (item: any) => {
				if (confirm(`Delete ${item.code}?`)) {
					await deleteDtc(item.id);
				}
			},
			tooltip: "Delete",
		},
	];

	return (
		<DataTable
			title="DTC Codes"
			data={dtcs}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add DTC"
			addButtonPath="/admin/dtc/add"
			pagination={{
				currentPage: page,
				totalPages: Math.ceil((data?.total || 0) / limit),
				totalItems: data?.total || 0,
				pageSize: limit,
				onPageChange: setPage,
			}}
		/>
	);
}
