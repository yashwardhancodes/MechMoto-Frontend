"use client";

import { Pencil, Eye, Trash2, Filter, X } from "lucide-react";
import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useDeleteVehicleMutation } from "@/lib/redux/api/vehicleApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { useMemo, useState } from "react";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { useGetAllModificationsQuery } from "@/lib/redux/api/modificationApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import Select, { SingleValue } from "react-select";

interface VehicleFilters {
	make: string;
	modelLine: string;
	modification: string;
	engineType: string;
	productionYearFrom: number | "";
	productionYearTo: number | "";
	sortBy: "newest" | "oldest" | "";
}

// Define a type for the API response
interface ApiVehicle {
	id: number;
	model_line?: string;
	production_year?: number | string;
	modification?: {
		name: string;
		model_line: {
			name: string;
			car_make: {
				name: string;
			};
		};
	};
	engine_type: {
		name: string;
	}
}

interface OptionType {
	value: string;
	label: string;
}

export default function ManageVehicle() {
	const [page, setPage] = useState(1);
	const limit = 10;
	const [filters, setFilters] = useState<VehicleFilters>({
		make: "",
		modelLine: "",
		modification: "",
		engineType: "",
		productionYearFrom: "",
		productionYearTo: "",
		sortBy: "",
	});
	const [showFilters, setShowFilters] = useState<boolean>(false);
	const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
	const [selectedModelLineId, setSelectedModelLineId] = useState<number | null>(null);

	const { data: carMakesResponse } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });
	const { data: engineTypesResponse } = useGetAllEngineTypesQuery({ page: 1, limit: 999999 });
	const { data: modificationsResponse } = useGetAllModificationsQuery({ page: 1, limit: 999999 });
	const { data: modelLinesResponse } = useGetModelLinesQuery(
		selectedMakeId ? { car_make: selectedMakeId } : {},
		{ skip: !selectedMakeId },
	);

	const years = useMemo(() => {
		const yearArray: number[] = [];
		for (let year = 1900; year <= 2025; year++) {
			yearArray.push(year);
		}
		return yearArray;
	}, []);

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			...filters,
			...(filters.productionYearFrom && {
				productionYearFrom: Number(filters.productionYearFrom),
			}),
			...(filters.productionYearTo && { productionYearTo: Number(filters.productionYearTo) }),
			...(filters.sortBy && { sortBy: filters.sortBy }),
		}),
		[page, limit, filters],
	);

	const { data, isLoading, isError } = useGetAllVehiclesQuery(queryParams);
	console.log("Vehicle data:", data);
	const [deleteVehicle] = useDeleteVehicleMutation();

	const router = useRouter();

	// Safely extract and transform vehicles for table
	const vehicles = (data?.data?.vehicles ?? []).map((vehicle: ApiVehicle) => ({
		id: vehicle.id,
		brand: vehicle?.modification?.model_line?.car_make?.name ?? "N/A",
		model: vehicle?.modification?.model_line?.name ?? "N/A",
		year: vehicle.production_year ?? "N/A",
		variant: vehicle.modification.name ?? "N/A",
		engine_type: vehicle?.engine_type?.name ?? "N/A",
		raw: vehicle,
	}));

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	const handleSelectChange = (
		key: keyof VehicleFilters,
		selected: SingleValue<OptionType> | null,
	) => {
		const value = selected ? selected.value : "";
		if (key === "make") {
			const selectedMake = carMakesResponse?.data?.carMakes.find((m) => m.name === value);
			if (value === "") {
				setSelectedMakeId(null);
				setSelectedModelLineId(null);
				setFilters((prev) => ({ ...prev, make: "", modelLine: "", modification: "" }));
				return;
			}
			if (selectedMake) {
				setSelectedMakeId(selectedMake.id);
				setSelectedModelLineId(null);
				setFilters((prev) => ({ ...prev, make: value, modelLine: "", modification: "" }));
			}
			setPage(1);
			return;
		}

		if (key === "modelLine") {
			const selectedModel = modelLinesResponse?.data?.find((m) => m.name === value);
			if (value === "") {
				setSelectedModelLineId(null);
				setFilters((prev) => ({ ...prev, modelLine: "", modification: "" }));
				setPage(1);
				return;
			}
			if (selectedModel) {
				setSelectedModelLineId(selectedModel.id);
				setFilters((prev) => ({ ...prev, modelLine: value, modification: "" }));
			}
			setPage(1);
			return;
		}

		if (key === "modification") {
			if (value === "") {
				setFilters((prev) => ({ ...prev, modification: "" }));
				setPage(1);
				return;
			}
			setFilters((prev) => ({ ...prev, modification: value }));
			setPage(1);
			return;
		}

		setFilters((prev) => ({ ...prev, [key]: value }));
		setPage(1);
	};

	const clearFilters = () => {
		setFilters({
			make: "",
			modelLine: "",
			modification: "",
			engineType: "",
			productionYearFrom: "",
			productionYearTo: "",
			sortBy: "",
		});
		setSelectedMakeId(null);
		setSelectedModelLineId(null);
		setPage(1);
	};

	const carMakes = carMakesResponse?.data?.carMakes || [];
	const makeOptions: OptionType[] = carMakes.map((make) => ({
		value: make.name,
		label: make.name,
	}));

	const modelLines = modelLinesResponse?.data || [];
	const modelLineOptions: OptionType[] = modelLines.map((model) => ({
		value: model.name,
		label: model.name,
	}));

	const availableModifications = selectedModelLineId
		? modificationsResponse?.data?.modifications?.filter(
				(modi) => modi.model_lineId === selectedModelLineId,
		  ) || []
		: [];
	const modificationOptions: OptionType[] = availableModifications.map((modi) => ({
		value: modi.name,
		label: modi.name,
	}));

	const engineTypes = engineTypesResponse?.data?.engineTypes || [];
	const engineTypeOptions: OptionType[] = engineTypes.map((engine) => ({
		value: engine.name,
		label: engine.name,
	}));

	const yearOptions: OptionType[] = years.map((year) => ({
		value: year.toString(),
		label: year.toString(),
	}));

	const sortByOptions: OptionType[] = [
		{ value: "", label: "Default (Newest)" },
		{ value: "newest", label: "Newest" },
		{ value: "oldest", label: "Oldest" },
	];

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "brand",
			header: "Car Make",
			render: (value) => (
				<div className="flex row items-center gap-2 ">
					<div className="size-10 rounded-full p-2 flex items-center text-white justify-center bg-blue-400">
						{value.brand
							?.split(" ")
							.map((word: string) => word.charAt(0).toUpperCase())
							.join("")}
					</div>
					<div className="flex flex-col ">
						<span className="font-semibold   ">{value.brand}</span>
						<span className=" text-xs">{value.model}</span>
					</div>
				</div>
			),
		},
		{ key: "model", header: "Model Line" },
		{ key: "year", header: "Year" },
		{ key: "variant", header: "Modification" },
		{ key: "engine_type", header: "Engine Type" },
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Pencil,
			onClick: (vehicle) => {
				console.log("Edit vehicle:", vehicle.raw);
				router.push(`/admin/manage-vehicles/edit/${vehicle.id}`);
			},
			tooltip: "Edit vehicle",
		},
		{
			icon: Eye,
			onClick: (vehicle) => {
				router.push(`/admin/manage-vehicles/${vehicle.id}`);
			},
			tooltip: "View vehicle",
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
			tooltip: "Delete Vehicle",
		},
	];

	return (
		<>
			<DataTable
				title="Listed Vehicles"
				data={vehicles}
				setShowFilters={setShowFilters}
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
					subtitleKey: "model",
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
								value={
									makeOptions.find((opt) => opt.value === filters.make) || null
								}
								onChange={(selected) => handleSelectChange("make", selected)}
								options={[{ value: "", label: "All" }, ...makeOptions]}
								isSearchable={true}
								placeholder="All"
								classNamePrefix="react-select"
								styles={{
									control: (provided) => ({
										...provided,
										border: "1px solid #d1d5db",
										borderRadius: "0.5rem",
										minHeight: "2.5rem",
									}),
								}}
								isDisabled={false}
							/>
						</div>

						{/* Model Line (Dependent) */}
						{selectedMakeId && (
							<div className="mb-4">
								<label className="block text-sm font-medium mb-2">Model Line</label>
								<Select
									value={
										modelLineOptions.find(
											(opt) => opt.value === filters.modelLine,
										) || null
									}
									onChange={(selected) =>
										handleSelectChange("modelLine", selected)
									}
									options={[{ value: "", label: "All" }, ...modelLineOptions]}
									isSearchable={true}
									placeholder="All"
									classNamePrefix="react-select"
									styles={{
										control: (provided) => ({
											...provided,
											border: "1px solid #d1d5db",
											borderRadius: "0.5rem",
											minHeight: "2.5rem",
										}),
									}}
									isDisabled={!selectedMakeId}
								/>
							</div>
						)}

						{/* Modification (Dependent) */}
						{selectedModelLineId && (
							<div className="mb-4">
								<label className="block text-sm font-medium mb-2">
									Modification/Variant
								</label>
								<Select
									value={
										modificationOptions.find(
											(opt) => opt.value === filters.modification,
										) || null
									}
									onChange={(selected) =>
										handleSelectChange("modification", selected)
									}
									options={[{ value: "", label: "All" }, ...modificationOptions]}
									isSearchable={true}
									placeholder="All"
									classNamePrefix="react-select"
									styles={{
										control: (provided) => ({
											...provided,
											border: "1px solid #d1d5db",
											borderRadius: "0.5rem",
											minHeight: "2.5rem",
										}),
									}}
									isDisabled={!selectedModelLineId}
								/>
							</div>
						)}

						{/* Engine Type */}
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">Engine Type</label>
							<Select
								value={
									engineTypeOptions.find(
										(opt) => opt.value === filters.engineType,
									) || null
								}
								onChange={(selected) => handleSelectChange("engineType", selected)}
								options={[{ value: "", label: "All" }, ...engineTypeOptions]}
								isSearchable={true}
								placeholder="All"
								classNamePrefix="react-select"
								styles={{
									control: (provided) => ({
										...provided,
										border: "1px solid #d1d5db",
										borderRadius: "0.5rem",
										minHeight: "2.5rem",
									}),
								}}
							/>
						</div>

						{/* Production Year Range */}
						<div className="mb-4">
							<label className="block text-sm font-medium mb-2">
								Production Year
							</label>
							<div className="flex gap-2">
								<Select
									value={
										yearOptions.find(
											(opt) =>
												opt.value === filters.productionYearFrom.toString(),
										) || null
									}
									onChange={(selected) =>
										handleSelectChange("productionYearFrom", selected)
									}
									options={[{ value: "", label: "From" }, ...yearOptions]}
									isSearchable={true}
									placeholder="From"
									classNamePrefix="react-select"
									styles={{
										control: (provided) => ({
											...provided,
											border: "1px solid #d1d5db",
											borderRadius: "0.5rem",
											minHeight: "2.5rem",
										}),
									}}
								/>
								<Select
									value={
										yearOptions.find(
											(opt) =>
												opt.value === filters.productionYearTo.toString(),
										) || null
									}
									onChange={(selected) =>
										handleSelectChange("productionYearTo", selected)
									}
									options={[{ value: "", label: "To" }, ...yearOptions]}
									isSearchable={true}
									placeholder="To"
									classNamePrefix="react-select"
									styles={{
										control: (provided) => ({
											...provided,
											border: "1px solid #d1d5db",
											borderRadius: "0.5rem",
											minHeight: "2.5rem",
										}),
									}}
								/>
							</div>
						</div>

						{/* Sort By */}
						<div className="mb-6">
							<label className="block text-sm font-medium mb-2">Sort By</label>
							<Select
								value={
									sortByOptions.find((opt) => opt.value === filters.sortBy) ||
									null
								}
								onChange={(selected) => handleSelectChange("sortBy", selected)}
								options={sortByOptions}
								isSearchable={false}
								placeholder="Default (Newest)"
								classNamePrefix="react-select"
								styles={{
									control: (provided) => ({
										...provided,
										border: "1px solid #d1d5db",
										borderRadius: "0.5rem",
										minHeight: "2.5rem",
									}),
								}}
							/>
						</div>

						{/* Actions */}
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
