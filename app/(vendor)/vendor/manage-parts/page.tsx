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

  // -----------------------------
  // PAGINATION STATE
  // -----------------------------
  const [page, setPage] = useState(1);
  const limit = 10;

  const [deletePart] = useDeletePartMutation();

  // -----------------------------
  // SAFE SKIP LOGIC (FIX)
  // -----------------------------
  const shouldSkip =
    !user || !user.role || user.role.name !== ROLES.VENDOR;

  // -----------------------------
  // API CALL
  // -----------------------------
  const { data, isLoading, isError } = useGetAllPartsByVendorQuery(
    { page, limit },
    { skip: shouldSkip }
  );

  // -----------------------------
  // DEBUG LOGS (REMOVE AFTER FIX)
  // -----------------------------
  console.log("🧑 USER:", user);
  console.log("👤 ROLE:", user?.role?.name);
  console.log("⛔ SHOULD SKIP API:", shouldSkip);
  console.log("📦 RAW API DATA:", data);

  /**
   * ✅ CORRECT DATA EXTRACTION
   * Based on actual API response:
   * data -> { success, data: { data: [], meta: {} } }
   */
  const parts = Array.isArray(data?.data?.data) ? data.data.data : [];
  const meta = data?.data?.meta;

  console.log("📄 PARTS ARRAY:", parts);
  console.log("📊 META:", meta);

  const total = meta?.total ?? 0;
  const totalPages = meta?.totalPages ?? 0;

  // -----------------------------
  // TABLE COLUMNS
  // -----------------------------
  const columns: TableColumn[] = [
    {
      key: "part_number",
      header: "Part Number",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Image
            src={row.image_urls?.[0] || "/placeholder.png"}
            alt={row.part_number}
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-semibold">{row.part_number}</span>
            <span className="text-xs">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      key: "vehicle.model_line",
      header: "Vehicle Model",
      render: (row) =>
        `${row.vehicle?.modification?.model_line?.name || "N/A"} ${
          row.vehicle?.modification?.name || ""
        } (${row.vehicle?.production_year || "N/A"})`,
    },
    {
      key: "subcategory.name",
      header: "Subcategory",
      render: (row) => row.subcategory?.name || "N/A",
    },
    {
      key: "part_brand.name",
      header: "Brand",
      render: (row) => row.part_brand?.name || "N/A",
    },
  ];

  // -----------------------------
  // TABLE ACTIONS
  // -----------------------------
  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (part) =>
        router.push(`/vendor/manage-parts/edit/${part.id}`),
      tooltip: "Edit part",
    },
    {
      icon: Eye,
      onClick: (part) =>
        router.push(`/vendor/manage-parts/view/${part.id}`),
      tooltip: "View part",
    },
    {
      icon: Trash2,
      onClick: async (part) => {
        try {
          await deletePart(part.id).unwrap();
          toast.success("Part deleted successfully!");
          setPage(1); // reset page after delete
        } catch {
          toast.error("Failed to delete part");
        }
      },
      tooltip: "Delete part",
    },
  ];

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <DataTable
      title="Listed Parts"
      data={parts} // ✅ ALWAYS ARRAY
      columns={columns}
      actions={actions}
      isLoading={isLoading}
      isError={isError}
      addButtonText="Add Part"
      addButtonPath="/vendor/manage-parts/addParts"
      emptyMessage="No parts found."
      errorMessage="Failed to load parts."
      loadingMessage="Loading parts..."
      avatarConfig={{
        enabled: true,
        nameKey: "part_number",
        subtitleKey: "description",
        getAvatarUrl: (item) =>
          item.image_urls?.[0] || "/placeholder.png",
        getAvatarAlt: (item) => item.part_number,
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
