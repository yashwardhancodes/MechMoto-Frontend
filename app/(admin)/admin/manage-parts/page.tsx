"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllPartsQuery } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

export default function ManageParts() {
  const { data, isLoading, isError } = useGetAllPartsQuery({});
  const router = useRouter();

  // Log API data for debugging
  console.log("API data:", data);

  // Safely extract parts array from API response
  const parts = Array.isArray(data) ? data : data?.data ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "part_number",
      header: "Part Number",
      render: (value) => (
        <div className="flex row items-center gap-2">
          <img
            src={value.image_urls?.[0] || "/placeholder.png"}
            alt={value.part_number}
            className="size-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold">{value.part_number}</span>
            <span className="text-xs">{value.description}</span>
          </div>
        </div>
      )
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "vehicle.model_line",
      header: "Vehicle Model",
      render: (value) => `${value.vehicle?.model_line || "N/A"} (${value.vehicle?.production_year || "N/A"})`
    },
    {
      key: "subcategory.name",
      header: "Subcategory",
      render: (value) => value.subcategory?.name || "N/A"
    },
    {
      key: "part_brand.name",
      header: "Brand",
      render: (value) => value.part_brand?.name || "N/A"
    },
    {
      key: "price",
      header: "Price",
      render: (value) => `₹${value.price?.toLocaleString() || "N/A"}`
    },
    {
      key: "quantity",
      header: "Quantity",
    },
    {
      key: "availability_status",
      header: "Availability",
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
      onClick: (part) => {
        console.log("Edit part:", part);
        if (part?.id && typeof part.id === 'number') {
          // router.push(`/admin/dashboard/manage-parts/edit/${part.id}`);
        } else {
          console.error("Invalid part ID for edit:", part);
        }
      },
      tooltip: "Edit part"
    },
    {
      icon: Eye,
      onClick: (part) => {
        console.log("View part:", part);
        if (part?.id && typeof part.id === 'number') {
          // router.push(`/admin/dashboard/manage-parts/${part.id}`);
        } else {
          console.error("Invalid part ID for view:", part);
        }
      },
      tooltip: "View part"
    },
    {
      icon: Trash2,
      onClick: (part) => {
        console.log("Delete part:", part);
        if (part?.id && typeof part.id === 'number') {
          // Add confirmation dialog and delete logic using useDeletePartMutation
          console.log("Trigger delete for part ID:", part.id);
        } else {
          console.error("Invalid part ID for delete:", part);
        }
      },
      tooltip: "Delete part"
    }
  ];

  return (
    <DataTable
      title="Listed Parts"
      data={parts}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Part"
      addButtonPath="/admin/manage-parts/addParts"
      emptyMessage="No parts found."
      errorMessage="Failed to load parts."
      loadingMessage="Loading parts..."
      avatarConfig={{
        enabled: true,
        nameKey: "part_number",
        subtitleKey: "description",
        getAvatarUrl: (item) => item.image_urls?.[0] || "/placeholder.png",
        getAvatarAlt: (item) => item.part_number
      }}
    />
  );
}