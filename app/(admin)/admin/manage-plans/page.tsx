"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState } from "react";

interface PlanModule {
	id: number;
	quota: number;
	quota_unit?: string;
	module: {
		id: number;
		name: string;
	};
}

export default function ManagePlans() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const { data, isLoading, isError } = useGetAllPlansQuery({ page, limit });

	// Log API data for debugging
	console.log("API data:", data);

	// Safely extract plans array from API response
	const plans = data?.plans ?? [];
	const total = data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Plan Name",
			render: (item) => (
				<div className="flex flex-col">
					<span className="font-semibold">{item.name}</span>
					<span className="text-xs">{item.description || "No description"}</span>
				</div>
			),
		},
		{
			key: "price",
			header: "Price",
			render: (item) => `₹${item.price?.toLocaleString() || "N/A"}`,
		},
		{
			key: "period",
			header: "Billing Period",
			render: (item) =>
				`${item.period.charAt(0).toUpperCase() + item.period.slice(1)} (Every ${
					item.interval
				} ${item.period})`,
		},
		{
			key: "plan_modules",
			header: "Modules",
			render: (item) => (
				<div className="flex flex-col">
					{item.plan_modules?.length > 0 ? (
						item.plan_modules.map((module: PlanModule) => (
							<span key={module.id} className="text-sm">
								{module.module.name}: {module.quota} {module.quota_unit || "units"}
							</span>
						))
					) : (
						<span>No modules</span>
					)}
				</div>
			),
		},
		{
			key: "razorpay_plan_id",
			header: "Razorpay Plan ID",
			render: (item) => item.razorpay_plan_id || "N/A",
		},
		{
			key: "is_active",
			header: "Status",
			render: (item) => (item.is_active ? "Active" : "Inactive"),
		},
		{
			key: "created_at",
			header: "Created At",
			render: (item) => new Date(item.created_at).toLocaleDateString(),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (plan) => {
				console.log("Edit plan:", plan);
				if (plan?.id && typeof plan.id === "number") {
					// router.push(`/admin/dashboard/manage-plans/edit/${plan.id}`);
				} else {
					console.error("Invalid plan ID for edit:", plan);
				}
			},
			tooltip: "Edit plan",
		},
		{
			icon: Eye,
			onClick: (plan) => {
				console.log("View plan:", plan);
				if (plan?.id && typeof plan.id === "number") {
					// router.push(`/admin/dashboard/manage-plans/${plan.id}`);
				} else {
					console.error("Invalid plan ID for view:", plan);
				}
			},
			tooltip: "View plan",
		},
		{
			icon: Trash2,
			onClick: (plan) => {
				console.log("Delete plan:", plan);
				if (plan?.id && typeof plan.id === "number") {
					// Add confirmation dialog and delete logic using useDeletePlanMutation
					console.log("Trigger delete for plan ID:", plan.id);
				} else {
					console.error("Invalid plan ID for delete:", plan);
				}
			},
			tooltip: "Delete plan",
		},
	];

	return (
		<DataTable
			title="Listed Plans"
			data={plans}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			addButtonText="Add Plan"
			addButtonPath="/admin/manage-plans/addPlan"
			emptyMessage="No plans found."
			errorMessage="Failed to load plans."
			loadingMessage="Loading plans..."
			avatarConfig={{
				enabled: false, // No avatar for plans
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
