"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllVendorsQuery } from "@/lib/redux/api//vendorApi"; // ✅ Change API hook
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

export default function ManageVehicle() {
  const { data, isLoading, isError } = useGetAllVendorsQuery({});
  const router = useRouter();

  // Safely extract vehicles array from API response
  const vehicles = Array.isArray(data) ? data : data?.data ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "brand",
      header: "Brand",
    },
    {
      key: "model",
      header: "Model",
    },
    {
      key: "year",
      header: "Year",
    },
    {
      key: "variant",
      header: "Variant",
    }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (vehicle) => {
        console.log("Edit vehicle:", vehicle);
        // router.push(`/admin/dashboard/manage-vehicles/edit/${vehicle.id}`);
      },
      tooltip: "Edit vehicle"
    },
    {
      icon: Eye,
      onClick: (vehicle) => {
        router.push(`/admin/dashboard/manage-vehicles/${vehicle.id}`);
      },
      tooltip: "View vehicle"
    },
    {
      icon: Trash2,
      onClick: (vehicle) => {
        console.log("Delete vehicle:", vehicle);
        // Add confirmation dialog and delete logic here
      },
      tooltip: "Delete vehicle"
    }
  ];

  return (
    <DataTable
      title="Listed Vehicles"
      data={vehicles}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Vehicle"
      addButtonPath="/admin/dashboard/manage-vehicles/addVehicle"
      emptyMessage="No vehicles found."
      errorMessage="Failed to load vehicles."
      loadingMessage="Loading vehicles..."
      avatarConfig={{
        enabled: true,
        nameKey: "brand",
        subtitleKey: "model"
      }}
    />
  );
}
