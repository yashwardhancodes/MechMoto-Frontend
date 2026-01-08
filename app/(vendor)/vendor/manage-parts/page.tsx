"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
	useDeletePartMutation,
	useGetAllPartsByVendorQuery,
} from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import DataTable, {
	TableColumn,
	TableAction,
} from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Image from "next/image";
import { useState } from "react";

export default function ManageParts() {
	const { user } = useAuth();
	const router = useRouter();

	const [page, setPage] = useState(1);
	const limit = 10;

	const [deletePart] = useDeletePartMutation();

	// Skip query if not vendor
	const shouldSkip = !user || user.role?.name !== ROLES.VENDOR;

	const { data, isLoading, isError } = useGetAllPartsByVendorQuery(
		{ page, limit },
		{ skip: shouldSkip }
	);

	// -----------------------------
	// DATA EXTRACTION (VERIFIED)
	// -----------------------------
	// Backend response: { success: true, data: { data: [...], meta: {...} } }
	const parts = data?.data?.data ?? []; // ← Correct path
	const meta = data?.data?.meta;

	const total = meta?.total ?? 0;
	const totalPages = meta?.totalPages ?? 1;

	// -----------------------------
	// COLUMNS
	// -----------------------------
	const columns: TableColumn[] = [
		{
			key: "part_number",
			header: "Part Number",
			render: (row: any) => (
				<div className="flex items-center gap-3">
					<Image
						src={row.image_urls?.[0] || "/placeholder-part.jpg"}
						alt={row.part_number}
						width={48}
						height={48}
						className="size-12 rounded object-cover bg-gray-100"
					/>
					<div className="flex flex-col">
						<span className="font-semibold text-gray-900">{row.part_number}</span>
						<span className="text-sm text-gray-600 truncate max-w-xs">
							{row.description}
						</span>
					</div>
				</div>
			),
		},
		{
			key: "vehicle",
			header: "Vehicle Fitment",
			render: (row: any) => {
				const v = row.vehicle;
				if (!v) return <span className="text-gray-500">General Part</span>;

				const genNames = v.modification?.models
					?.map((m: any) => m.name)
					.join(", ") || "N/A";

				return (
					<div className="text-sm">
						<span className=" ">
							{v.modification?.models?.[0]?.model_line?.car_make?.name || "N/A"}{" "}
							{v.modification?.models?.[0]?.model_line?.name || "N/A"}
						</span>
						<br />
						{/* <span className="text-gray-600">
							{genNames} ({v.production_year})
						</span>
						<br />
						<span className="text-gray-500">{v.modification?.name}</span> */}
					</div>
				);
			},
		},
		{
			key: "subcategory",
			header: "Subcategory",
			render: (row: any) => row.subcategory?.name || "N/A",
		},
		{
			key: "brand",
			header: "Brand",
			render: (row: any) => row.part_brand?.name || "N/A",
		},
		{
			key: "price",
			header: "Price",
			render: (row: any) => `₹${row.price?.toLocaleString("en-IN") || "N/A"}`,
		},
	];

	// -----------------------------
	// ACTIONS
	// -----------------------------
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (part: any) =>
				router.push(`/vendor/manage-parts/edit/${part.id}`),
			tooltip: "Edit part",
		},
		{
			icon: Eye,
			onClick: (part: any) =>
				router.push(`/vendor/manage-parts/view/${part.id}`),
			tooltip: "View part",
		},
		{
			icon: Trash2,
			onClick: async (part: any) => {
				if (confirm(`Delete part "${part.part_number}"?`)) {
					try {
						await deletePart(part.id).unwrap();
						toast.success("Part deleted successfully");
						// Reset to page 1 if current page becomes empty
						if (parts.length === 1 && page > 1) {
							setPage(page - 1);
						}
					} catch {
						toast.error("Failed to delete part");
					}
				}
			},
			tooltip: "Delete part",
		},
	];

	return (
		<DataTable
			title="My Listed Parts"
			data={parts}
			columns={columns}
			actions={actions}
			isLoading={isLoading || shouldSkip}
			isError={isError}
			addButtonText="Add New Part"
			addButtonPath="/vendor/manage-parts/addParts"
			emptyMessage="No parts listed yet."
			errorMessage="Failed to load your parts."
			loadingMessage="Loading your parts..."
			pagination={
				totalPages > 1
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