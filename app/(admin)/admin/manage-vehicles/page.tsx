"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useDeleteVehicleMutation    } from "@/lib/redux/api/vehicleApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

// Define a type for the API response
interface ApiVehicle {
  id: number;
  car_make?: { name?: string };
  model_line?: string;
  production_year?: number | string;
  modification?: string;
  // Add other fields if needed
}

 


export default function ManageVehicle() {
  const { data, isLoading, isError } = useGetAllVehiclesQuery({});
  console.log("Vehicle data:", data);
  const [deleteVehicle] = useDeleteVehicleMutation();

  const router = useRouter();

  // Safely extract and transform vehicles for table
  const vehicles = (data?.data ?? []).map((vehicle: ApiVehicle) => ({
    id: vehicle.id,
    brand: vehicle.car_make?.name ?? "N/A",
    model: vehicle.model_line ?? "N/A",
    year: vehicle.production_year ?? "N/A",
    variant: vehicle.modification ?? "N/A",
    raw: vehicle
  }));

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "brand", header: "Car Make", render: (value) =>
        <div className="flex row items-center gap-2 ">
          <div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
            <div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
              {value.brand
                ?.split(" ")
                .map((word: string) => word.charAt(0).toUpperCase())
                .join("")
              }
            </div>
          </div>
          <div className="flex flex-col ">
            <span className="font-semibold   " >{value.brand}</span>
            <span className=" text-xs" >{value.model}</span>
          </div></div>
    },
    { key: "model", header: "Model Line" },
    { key: "year", header: "Year" },
    { key: "variant", header: "Modification" }
  ];

  // Define table actions
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (vehicle) => {
        console.log("Edit vehicle:", vehicle.raw);
        router.push(`/admin/manage-vehicles/edit/${vehicle.id}`);
      },
      tooltip: "Edit vehicle"
    },
    {
      icon: Eye,
      onClick: (vehicle) => {
        router.push(`/admin/manage-vehicles/${vehicle.id}`);
      },
      tooltip: "View vehicle"
    },
    {
      icon: Trash2,
      onClick: async (vehicle) => {
        try {
          await deleteVehicle(vehicle.id).unwrap();
         } catch (error) {
           console.error("Delete failed", error);
        }
      },
      tooltip: "Delete Vehicle"
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
      addButtonPath="/admin/manage-vehicles/addVehicle"
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
