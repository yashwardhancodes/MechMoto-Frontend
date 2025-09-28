"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllPlansQuery } from "@/lib/redux/api/planApi";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

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
  const { data, isLoading, isError } = useGetAllPlansQuery();

  // Log API data for debugging
  console.log("API data:", data);

  // Safely extract plans array from API response
  const plans = Array.isArray(data) ? data : (data && typeof data === 'object' && 'data' in data ? (data as any).data : []) ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Plan Name",
      render: (value) => (
        <div className="flex flex-col">
          <span className="font-semibold">{value.name}</span>
          <span className="text-xs">{value.description || "No description"}</span>
        </div>
      )
    },
    {
      key: "price",
      header: "Price",
      render: (value) => `₹${value.price?.toLocaleString() || "N/A"}`
    },
    {
      key: "period",
      header: "Billing Period",
      render: (value) => `${value.period.charAt(0).toUpperCase() + value.period.slice(1)} (Every ${value.interval} ${value.period})`
    },
    {
      key: "plan_modules",
      header: "Modules",
      render: (value) => (
        <div className="flex flex-col">
          {value.plan_modules?.length > 0 ? (
            value.plan_modules.map((module: PlanModule) => (
              <span key={module.id} className="text-sm">
                {module.module.name}: {module.quota} {module.quota_unit || "units"}
              </span>
            ))

          ) : (
            <span>No modules</span>
          )}
        </div>
      )
    },
    {
      key: "razorpay_plan_id",
      header: "Razorpay Plan ID",
      render: (value) => value.razorpay_plan_id || "N/A"
    },
    {
      key: "is_active",
      header: "Status",
      render: (value) => (value.is_active ? "Active" : "Inactive")
    },
    {
      key: "created_at",
      header: "Created At",
      render: (value) => new Date(value.created_at).toLocaleDateString()
    }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (plan) => {
        console.log("Edit plan:", plan);
        if (plan?.id && typeof plan.id === 'number') {
          // router.push(`/admin/dashboard/manage-plans/edit/${plan.id}`);
        } else {
          console.error("Invalid plan ID for edit:", plan);
        }
      },
      tooltip: "Edit plan"
    },
    {
      icon: Eye,
      onClick: (plan) => {
        console.log("View plan:", plan);
        if (plan?.id && typeof plan.id === 'number') {
          // router.push(`/admin/dashboard/manage-plans/${plan.id}`);
        } else {
          console.error("Invalid plan ID for view:", plan);
        }
      },
      tooltip: "View plan"
    },
    {
      icon: Trash2,
      onClick: (plan) => {
        console.log("Delete plan:", plan);
        if (plan?.id && typeof plan.id === 'number') {
          // Add confirmation dialog and delete logic using useDeletePlanMutation
          console.log("Trigger delete for plan ID:", plan.id);
        } else {
          console.error("Invalid plan ID for delete:", plan);
        }
      },
      tooltip: "Delete plan"
    }
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
        enabled: false // No avatar for plans
      }}
    />
  );
}