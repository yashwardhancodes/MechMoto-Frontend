"use client";

import { Pencil, Trash2, Filter, X, Search } from "lucide-react";
import {
  useGetAllModificationsQuery,
  useDeleteModificationMutation,
} from "@/lib/redux/api/modificationApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useState, useMemo } from "react";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import Select, { SingleValue } from "react-select";
import toast from "react-hot-toast";

interface Filters {
  carMake: string;
  modelLine: string;
  generation: string;
}

interface OptionType {
  value: string;
  label: string;
}

export default function ManageModifications() {
  const [page, setPage] = useState(1);
  const limit = 10;

  const [filters, setFilters] = useState<Filters>({
    carMake: "",
    modelLine: "",
    generation: "",
  });

  // New: Search term state
  const [searchTerm, setSearchTerm] = useState("");

  const [showFilters, setShowFilters] = useState(false);
  const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);

  const router = useRouter();

  // Fetch car makes
  const { data: carMakesResponse } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });

  // Fetch model lines when make selected
  const { data: modelLinesResponse } = useGetModelLinesQuery(
    selectedMakeId ? { car_make: selectedMakeId } : {},
    { skip: !selectedMakeId }
  );

  // Fetch ALL modifications for client-side handling
  const { data: allData, isLoading: allLoading, isError } = useGetAllModificationsQuery({
    page: 1,
    limit: 999999,
  });

  const [deleteModification] = useDeleteModificationMutation();

  const allModifications = useMemo(() => allData?.data?.modifications ?? [], [allData]);

  // Client-side filtering (including search term)
  const filteredModifications = useMemo(() => {
    let result = allModifications;

    // Search by modification name
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((mod: any) =>
        mod.name?.toLowerCase().includes(lowerSearch)
      );
    }

    if (filters.carMake) {
      result = result.filter((mod: any) =>
        mod.models?.some(
          (m: any) =>
            m.model_line?.car_make?.name?.toLowerCase() === filters.carMake.toLowerCase()
        )
      );
    }

    if (filters.modelLine) {
      result = result.filter((mod: any) =>
        mod.models?.some(
          (m: any) => m.model_line?.name?.toLowerCase() === filters.modelLine.toLowerCase()
        )
      );
    }

    if (filters.generation) {
      result = result.filter((mod: any) =>
        mod.models?.some((m: any) =>
          m.name?.toLowerCase().includes(filters.generation.toLowerCase())
        )
      );
    }

    return result;
  }, [allModifications, filters, searchTerm]);

  // Determine which data to display and paginate
  const displayData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredModifications.slice(start, start + limit);
  }, [filteredModifications, page, limit]);

  // Total count and pages for current view
  const totalItems = filteredModifications.length;
  const totalPages = Math.ceil(totalItems / limit);
  const hasActiveFilters = filters.carMake || filters.modelLine || filters.generation || searchTerm;

  const handleFilterChange = (
    key: keyof Filters,
    selected: SingleValue<OptionType> | null
  ) => {
    const value = selected ? selected.value : "";

    if (key === "carMake") {
      const selectedMake = carMakesResponse?.data?.carMakes.find(
        (m: any) => m.name === value
      );
      setSelectedMakeId(selectedMake ? selectedMake.id : null);
      setFilters({ carMake: value, modelLine: "", generation: "" });
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
    }

    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ carMake: "", modelLine: "", generation: "" });
    setSelectedMakeId(null);
    setSearchTerm(""); // Also clear search
    setPage(1);
  };

  const carMakes = carMakesResponse?.data?.carMakes || [];
  const makeOptions: OptionType[] = [
    { value: "", label: "All Makes" },
    ...carMakes.map((make: any) => ({ value: make.name, label: make.name })),
  ];

  const modelLines = modelLinesResponse?.data || [];
  const modelLineOptions: OptionType[] = [
    { value: "", label: "All Model Lines" },
    ...modelLines.map((line: any) => ({ value: line.name, label: line.name })),
  ];

  const generationOptions = useMemo(() => {
    const gens = new Set<string>();
    allModifications.forEach((mod: any) => {
      mod.models?.forEach((m: any) => {
        if (m.name) gens.add(m.name);
      });
    });
    return [
      { value: "", label: "All Generations" },
      ...Array.from(gens).sort().map((name) => ({ value: name, label: name })),
    ];
  }, [allModifications]);

  const columns: TableColumn[] = [
    {
      key: "name",
      header: "Modification Name",
      render: (row: any) => (
        <span className="font-medium text-gray-900">{row.name}</span>
      ),
    },
    {
      key: "generations",
      header: "Generations",
      render: (row: any) => {
        if (!row.models || row.models.length === 0)
          return <span className="text-gray-500">No generations</span>;

        return (
          <div className="flex flex-col gap-1">
            {row.models.map((model: any) => (
              <div key={model.id} className="text-sm">
                <span className="font-medium">{model.name}</span>
                <span className="text-gray-500 ml-2">
                  ({model.model_line?.car_make?.name} • {model.model_line?.name})
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  const actions: TableAction[] = [
    {
      icon: Pencil,
      onClick: (row: any) => router.push(`/admin/manage-modifications/edit/${row.id}`),
      tooltip: "Edit Modification",
    },
    {
      icon: Trash2,
      onClick: async (row: any) => {
        if (confirm(`Delete modification "${row.name}"? This may affect vehicles.`)) {
          try {
            await deleteModification(row.id).unwrap();
            toast.success("Modification deleted");
          } catch {
            toast.error("Failed to delete modification");
          }
        }
      },
      tooltip: "Delete Modification",
    },
  ];

  return (
    <>
      <DataTable
        title="Listed Modifications"
        data={displayData}
        setShowFilters={setShowFilters}
        columns={columns}
        actions={actions}
        isLoading={allLoading}
        isError={isError}
        addButtonText="Add Modification"
        addButtonPath="/admin/manage-modifications/add"
        emptyMessage={
          hasActiveFilters
            ? "No modifications match your search or filters."
            : "No modifications found."
        }
        errorMessage="Failed to load modifications."
        loadingMessage="Loading modifications..."
        pagination={
          totalPages > 1
            ? {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                pageSize: limit,
                onPageChange: setPage,
              }
            : undefined
        }
        // Custom header content with search bar
      headerContent={
  <div className="relative w-full">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
    <input
      type="text"
      placeholder="Search modifications..."
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setPage(1);
      }}
      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9AE144] focus:border-transparent"
    />
    {searchTerm && (
      <button
        onClick={() => {
          setSearchTerm("");
          setPage(1);
        }}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        <X className="w-5 h-5" />
      </button>
    )}
  </div>
}
      />

      {/* Filters sidebar remains unchanged */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
          <div className="bg-white w-80 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Car Make */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Car Make</label>
              <Select
                value={makeOptions.find((opt) => opt.value === filters.carMake) || null}
                onChange={(selected) => handleFilterChange("carMake", selected)}
                options={makeOptions}
                isSearchable
                placeholder="All Makes"
                classNamePrefix="react-select"
              />
            </div>

            {/* Model Line */}
            {selectedMakeId && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Model Line</label>
                <Select
                  value={
                    modelLineOptions.find((opt) => opt.value === filters.modelLine) ||
                    null
                  }
                  onChange={(selected) => handleFilterChange("modelLine", selected)}
                  options={modelLineOptions}
                  isSearchable
                  placeholder="All Model Lines"
                  classNamePrefix="react-select"
                />
              </div>
            )}

            {/* Generation */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Generation</label>
              <Select
                value={
                  generationOptions.find((opt) => opt.value === filters.generation) ||
                  null
                }
                onChange={(selected) => handleFilterChange("generation", selected)}
                options={generationOptions}
                isSearchable
                placeholder="All Generations"
                classNamePrefix="react-select"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={clearFilters}
                className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="flex-1 py-2 text-sm bg-[#9AE144] text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}