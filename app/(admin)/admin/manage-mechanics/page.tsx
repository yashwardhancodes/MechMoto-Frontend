"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import {
  useGetAllMechanicsQuery,
  useDeleteMechanicMutation,
} from "@/lib/redux/api/mechanicApi";
import { useRouter } from "next/navigation";
import DataTable, {
  TableColumn,
  TableAction,
} from "@/components/SuperDashboard/Table";

export default function ManageMechanics() {
  const { data, isLoading, isError } = useGetAllMechanicsQuery({});
  const [deleteMechanic] = useDeleteMechanicMutation();
  const router = useRouter();

  // ✅ Map backend response to table data
  const mechanics = (data?.data ?? []).map((mechanic: any) => ({
    id: mechanic.id,
    name: mechanic.full_name ?? "N/A",
    phone: mechanic.phone ?? "N/A",
    city: mechanic.city ?? "N/A",
    rating: mechanic.rating ?? "N/A",
    isAvailable: mechanic.is_available ? "Available" : "Unavailable",
    createdAt: mechanic.created_at
      ? new Date(mechanic.created_at).toLocaleDateString()
      : "N/A",
    raw: mechanic,
  }));

  // ✅ Table Columns
  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Mechanic",
      render: (value) => (
        <div className="flex row items-center gap-2">
          <div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-500">
            {value.name
              ?.split(" ")
              .map((word: string) => word.charAt(0).toUpperCase())
              .join("")}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">{value.name}</span>
            <span className="text-xs">{value.phone}</span>
          </div>
        </div>
      ),
    },
    { key: "city", header: "City" },
    { key: "rating", header: "Rating" },
    { key: "isAvailable", header: "Availability" },
    { key: "createdAt", header: "Created Date" },
  ];

  // ✅ Row Actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (mechanic) => {
        router.push(`/admin/manage-mechanics/edit/${mechanic.id}`);
      },
      tooltip: "Edit Mechanic",
    },
    {
      icon: Eye,
      onClick: (mechanic) => {
        router.push(`/admin/manage-mechanics/${mechanic.id}`);
      },
      tooltip: "View Mechanic",
    },
    {
      icon: Trash2,
      onClick: async (mechanic) => {
        try {
          await deleteMechanic(mechanic.id).unwrap();
          window.location.reload();
          console.log("Deleted successfully");
        } catch (error) {
          console.error("Delete failed", error);
        }
      },
      tooltip: "Delete Mechanic",
    },
  ];

  return (
    <DataTable
      title="Listed Mechanics"
      data={mechanics}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Mechanic"
      addButtonPath="/admin/manage-mechanics/addMechanic"
      emptyMessage="No mechanics found."
      errorMessage="Failed to load mechanics."
      loadingMessage="Loading mechanics..."
    />
  );
}
