"use client";

import { Pencil, Eye, Trash2, Filter, X } from "lucide-react";
import {
	useGetAllModelsQuery,
	useDeleteModelMutation,
} from "@/lib/redux/api/modelApi";
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
}

interface OptionType {
	value: string;
	label: string;
}

interface Model {
	id: number;
	name: string;
	model_line: {
		id: number;
		name: string;
		car_make_id: number;
		car_make?: { name: string };
	};
	created_at?: string;
}

interface TableRow {
	id: number;
	name: string;
	modelLine: string;
	carMake: string;
	createdAt: string;
	raw: Model;
}

export default function ManageModel() {
	const [page, setPage] = useState(1);
	const limit = 10;

	const [filters, setFilters] = useState<Filters>({
		carMake: "",
		modelLine: "",
	});

	const [showFilters, setShowFilters] = useState(false);
	const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);

	const router = useRouter();

	// Fetch car makes
	const { data: carMakesResponse } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });

	// Fetch model lines when make is selected
	const { data: modelLinesResponse } = useGetModelLinesQuery(
		selectedMakeId ? { car_make: selectedMakeId } : {},
		{ skip: !selectedMakeId }
	);

	// Fetch ALL generations (large limit) for client-side filtering & pagination
	const { data: allData, isLoading: allLoading, isError } = useGetAllModelsQuery({
		page: 1,
		limit: 999999,
	});

	const [deleteModel] = useDeleteModelMutation();

	const allGenerations = useMemo(() => allData?.models ?? [], [allData]);

	// Client-side filtering
	const filteredGenerations = useMemo(() => {
		let result = allGenerations;

		if (filters.carMake) {
			result = result.filter(
				(gen) =>
					gen.model_line?.car_make?.name?.toLowerCase() === filters.carMake.toLowerCase()
			);
		}

		if (filters.modelLine) {
			result = result.filter(
				(gen) =>
					gen.model_line?.name?.toLowerCase() === filters.modelLine.toLowerCase()
			);
		}

		return result;
	}, [allGenerations, filters]);

	// Paginated data for display
	const displayData = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredGenerations.slice(start, start + limit);
	}, [filteredGenerations, page, limit]);

	// Table rows mapping
	const generations: TableRow[] = displayData.map((model: Model) => ({
		id: model.id,
		name: model.name,
		modelLine: model.model_line.name,
		carMake: model.model_line.car_make.name,
		createdAt: model.created_at
			? new Date(model.created_at).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			})
			: "N/A",
		raw: model,
	}));

	// Pagination logic
	const totalItems = filteredGenerations.length;
	const totalPages = Math.ceil(totalItems / limit);
	const hasActiveFilters = filters.carMake || filters.modelLine;

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
			setFilters({ carMake: value, modelLine: "" });
		} else {
			setFilters((prev) => ({ ...prev, [key]: value }));
		}

		setPage(1);
	};

	const clearFilters = () => {
		setFilters({ carMake: "", modelLine: "" });
		setSelectedMakeId(null);
		setPage(1);
	};

	// Select options
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

	const columns: TableColumn[] = [
		{
			key: "name",
			header: "Generation",
			render: (value: TableRow) => (
				<div className="flex items-center gap-3">
					<div className="size-12 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br from-green-500 to-green-600 shadow-md">
						G
					</div>
					<div className="flex flex-col">
						<span className="font-semibold text-gray-900">{value.name}</span>
						<span className="text-xs text-gray-600">
							{value.carMake} • {value.modelLine}
						</span>
					</div>
				</div>
			),
		},
		{ key: "createdAt", header: "Created Date" },
	];

	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (gen: TableRow) => {
				router.push(`/admin/manage-model/edit/${gen.id}`);
			},
			tooltip: "Edit Generation",
		},
		{
			icon: Eye,
			onClick: (gen: TableRow) => {
				router.push(`/admin/manage-model/${gen.id}`);
			},
			tooltip: "View Details",
		},
		{
			icon: Trash2,
			onClick: async (gen: TableRow) => {
				if (confirm(`Delete generation "${gen.name}"? This may affect vehicles.`)) {
					try {
						await deleteModel(gen.id).unwrap();
						toast.success("Generation deleted");
					} catch {
						toast.error("Failed to delete generation");
					}
				}
			},
			tooltip: "Delete Generation",
		},
	];

	return (
		<>
			<DataTable
				title="Manage Generations"
				data={generations}
				setShowFilters={setShowFilters}
				columns={columns}
				actions={actions}
				isLoading={allLoading}
				isError={isError}
				addButtonText="Add Generation"
				addButtonPath="/admin/manage-model/addModel"
				emptyMessage={
					hasActiveFilters
						? "No generations match your filters."
						: "No generations found."
				}
				errorMessage="Failed to load generations."
				loadingMessage="Loading generations..."
				pagination={
					totalPages > 1
						? {
							currentPage: page,
							totalPages,
							totalItems,
							pageSize: limit,
							onPageChange: setPage,
						}
						: undefined
				}
			/>

			{/* Filters Sidebar */}
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

						{/* Model Line - only if make selected */}
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