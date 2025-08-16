 
"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllSubcategoriesQuery } from "@/lib/redux/api/subCategoriesApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

export default function ManageSubcategories() {
  const { data, isLoading, isError } = useGetAllSubcategoriesQuery({});
  const router = useRouter();

  // Log API data for debugging
  console.log("API data:", data);

  // Safely extract subcategories array from API response
  const subcategories = Array.isArray(data) ? data : data?.data ?? [];

  // Define table columns
  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Name",
      render: (value) => (
        <div className="flex row items-center gap-2">
          <img
            src={value.img_src}
            alt={value.name}
            className="size-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold">{value.name}</span>
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
      key: "category.name",
      header: "Category",
      render: (value) => value.category?.name || "N/A"
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
      onClick: (subcategory) => {
        console.log("Edit subcategory:", subcategory);
        if (subcategory?.id && typeof subcategory.id === 'number') {
          // router.push(`/admin/dashboard/manage-subcategories/edit/${subcategory.id}`);
        } else {
          console.error("Invalid subcategory ID for edit:", subcategory);
        }
      },
      tooltip: "Edit subcategory"
    },
    {
      icon: Eye,
      onClick: (subcategory) => {
        console.log("View subcategory:", subcategory);
        if (subcategory?.id && typeof subcategory.id === 'number') {
          // router.push(`/admin/dashboard/manage-subcategories/${subcategory.id}`);
        } else {
          console.error("Invalid subcategory ID for view:", subcategory);
        }
      },
      tooltip: "View subcategory"
    },
    {
      icon: Trash2,
      onClick: (subcategory) => {
        console.log("Delete subcategory:", subcategory);
        if (subcategory?.id && typeof subcategory.id === 'number') {
          // Add confirmation dialog and delete logic using useDeleteSubcategoryMutation
          console.log("Trigger delete for subcategory ID:", subcategory.id);
        } else {
          console.error("Invalid subcategory ID for delete:", subcategory);
        }
      },
      tooltip: "Delete subcategory"
    }
  ];

  return (
    <DataTable
      title="Listed Subcategories"
      data={subcategories}
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Subcategory"
      addButtonPath="/admin/manage-subcategories/addSubcategory"
      emptyMessage="No subcategories found."
      errorMessage="Failed to load subcategories."
      loadingMessage="Loading subcategories..."
      avatarConfig={{
        enabled: true,
        nameKey: "name",
        subtitleKey: "description",
        getAvatarUrl: (item) => item.img_src,  
        getAvatarAlt: (item) => item.name
      }}
    />
  );
}
 