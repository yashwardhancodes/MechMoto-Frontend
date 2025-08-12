"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllVendorsQuery } from "@/lib/redux/api/vendorApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table"; // Adjust import path as needed

export default function Mvendor() {
  const { data, isLoading, isError } = useGetAllVendorsQuery({});
  const router = useRouter();

  // Safely extract vendors array from API response
  const vendors = Array.isArray(data) ? data : data?.data ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Name",
    },
    {
      key: "purchases",
      header: "Purchases",
      render: () => "-" // Since this data isn't available in your API
    },
    {
      key: "user.role.name",
      header: "Orders",
    },
    {
      key: "revenue",
      header: "Revenue",
      render: () => "-" // Since this data isn't available in your API
    },
    {
      key: "totalProducts",
      header: "Total Products",
      render: () => "-" // Since this data isn't available in your API
    }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (vendor) => {
        // Handle edit action
        console.log("Edit vendor:", vendor);
        // router.push(`/admin/dashboard/manage-vendors/edit/${vendor.id}`);
      },
      tooltip: "Edit vendor"
    },
    {
      icon: Eye,
      onClick: (vendor) => {
        router.push(`/admin/dashboard/manage-vendors/${vendor.id}`);
      },
      tooltip: "View vendor"
    },
    {
      icon: Trash2,
      onClick: (vendor) => {
        // Handle delete action
        console.log("Delete vendor:", vendor);
        // Add confirmation dialog and delete logic here
      },
      tooltip: "Delete vendor"
    }
  ];

  return (
    <DataTable
      title="Listed Vendors"
      data={vendors}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Vendors"
      addButtonPath="/admin/dashboard/manage-vendors/addVendor"
      emptyMessage="No vendors found."
      errorMessage="Failed to load vendors."
      loadingMessage="Loading vendors..."
      avatarConfig={{
        enabled: true,
        nameKey: "name",
        subtitleKey: "user.email"
      }}
    />
  );
}