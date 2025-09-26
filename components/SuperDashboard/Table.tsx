"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// Types for the table component
export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableAction<T> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  onClick: (item: T, index: number) => void;
  className?: string;
  tooltip?: string;
}

export interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  isLoading?: boolean;
  isError?: boolean;
  addButtonText?: string;
  addButtonPath?: string;
  onAddClick?: () => void;
  showFilters?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string;
  errorMessage?: string;
  loadingMessage?: string;
  rowClassName?: (item: T, index: number) => string;
  avatarConfig?: {
    enabled: boolean;
    getAvatarUrl?: (item: T) => string;
    getAvatarAlt?: (item: T) => string;
    nameKey?: string;
    subtitleKey?: string;
  };
}

export default function DataTable<T extends { id?: string | number }>({
  title,
  data = [],
  columns,
  actions = [],
  isLoading = false,
  isError = false,
  addButtonText,
  addButtonPath,
  onAddClick,
  showFilters = true,
  pagination,
  emptyMessage = "No data available.",
  errorMessage = "Failed to load data.",
  loadingMessage = "Loading...",
  rowClassName,
 }: DataTableProps<T>) {
  const router = useRouter();

  const handleAddClick = () => {
    if (onAddClick) {
      onAddClick();
    } else if (addButtonPath) {
      router.push(addButtonPath);
    }
  };

const defaultRowClassName = () => "hover:bg-[#9AE144]/20";
  const getRowClassName = rowClassName || defaultRowClassName;

const renderCellContent = (item: T, column: TableColumn<T>, index: number) => {
  if (column.render) return column.render(item, index);

  const value = column.key
    .split(".")
    .reduce<unknown>((obj, key) => {
      if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
      return undefined;
    }, item);

  return value !== undefined && value !== null ? String(value) : "-";
};

  return (
    <div className="p-6 bg-white rounded shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex gap-2">
          {(addButtonText || addButtonPath || onAddClick) && (
            <button
              onClick={handleAddClick}
              className="flex items-center font-semibold cursor-pointer text-black px-3 py-2 gap-2 rounded text-sm"
            >
              <div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
                <Plus className="w-4 h-4" />
              </div>
              {addButtonText || "Add Item"}
            </button>
          )}
          {showFilters && (
            <button className="flex items-center">
              <div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
            </button>
          )}
        </div>
      </div>

      <hr />

      {/* Table Container */}
      <div className="w-full h-[calc(100vh-250px)] pt-2 overflow-y-auto">
        {isLoading ? (
          <p className="text-sm text-gray-500 p-4">{loadingMessage}</p>
        ) : isError ? (
          <p className="text-sm text-red-500 p-4">{errorMessage}</p>
        ) : data.length === 0 ? (
          <p className="text-sm text-gray-500 p-4">{emptyMessage}</p>
        ) : (
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="font-medium">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-2">
                    {column.header}
                  </th>
                ))}
                {actions.length > 0 && <th className="px-4 py-2">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={item.id ?? index}
                  className={getRowClassName(item, index)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-2">
                      {renderCellContent(item, column, index)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-4 py-2">
                      <div className="flex gap-2 text-gray-600">
                        {actions.map((action, actionIndex) => {
                          const IconComponent = action.icon;
                          return (
                            <IconComponent
                              key={actionIndex}
                              className={`w-4 h-4 cursor-pointer ${
                                action.className || ""
                              }`}
                              onClick={() => action.onClick(item, index)}
                              aria-label={action.tooltip}
                            />
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-gray-500">
            Showing {data.length} of {data.length} items
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="text-gray-500 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from(
              { length: pagination.totalPages },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => pagination.onPageChange(page)}
                className={`w-6 h-6 rounded-full text-sm ${
                  page === pagination.currentPage
                    ? "bg-[#9AE144] text-white"
                    : "text-[#9AE144] bg-gray-200"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="text-gray-500 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
