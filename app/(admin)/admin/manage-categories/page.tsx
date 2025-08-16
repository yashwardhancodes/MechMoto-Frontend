
"use client";

import { Pencil, Eye, Trash2 } from "lucide-react";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";

export default function ManageCategories() {
    const { data, isLoading, isError } = useGetAllCategoriesQuery({});
    const router = useRouter();

    // Log API data for debugging
    console.log("API data:", data);

    // Safely extract categories array from API response
    const categories = Array.isArray(data) ? data : data?.data ?? [];

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
            key: "created_at",
            header: "Created At",
            render: (value) => new Date(value.created_at).toLocaleDateString()
        }
    ];

    // Define table actions
    const actions: TableAction[] = [
        {
            icon: Pencil,
            onClick: (category) => {
                console.log("Edit category:", category);
                if (category?.id && typeof category.id === 'number') {
                    //   router.push(`/admin/dashboard/manage-categories/edit/${category.id}`);
                } else {
                    console.error("Invalid category ID for edit:", category);
                }
            },
            tooltip: "Edit category"
        },
        {
            icon: Eye,
            onClick: (category) => {
                console.log("View category:", category);
                if (category?.id && typeof category.id === 'number') {
                    //   router.push(`/admin/dashboard/manage-categories/${category.id}`);
                } else {
                    console.error("Invalid category ID for view:", category);
                }
            },
            tooltip: "View category"
        },
        {
            icon: Trash2,
            onClick: (category) => {
                console.log("Delete category:", category);
                if (category?.id && typeof category.id === 'number') {
                    // Add confirmation dialog and delete logic using useDeleteCategoryMutation
                    console.log("Trigger delete for category ID:", category.id);
                } else {
                    console.error("Invalid category ID for delete:", category);
                }
            },
            tooltip: "Delete category"
        }
    ];

    return (
        <DataTable
            title="Listed Categories"
            data={categories}
            columns={columns}
            actions={actions}
            isLoading={isLoading}
            isError={isError}
            addButtonText="Add Category"
            addButtonPath="/admin/manage-categories/addCategory"
            emptyMessage="No categories found."
            errorMessage="Failed to load categories."
            loadingMessage="Loading categories..."
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
