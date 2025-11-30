// components/VehicleSelectorModal.tsx
"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";

import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { useGetAllModificationsQuery } from "@/lib/redux/api/modificationApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";

interface Vehicle {
	id: number;
	modification?: {
		name: string;
		model_line: {
			name: string;
			car_make: { name: string };
		};
	};
	engine_type?: { name: string };
	production_year?: number | string;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (vehicle: Vehicle) => void;
}

interface Option {
	value: string;
	label: string;
}

export default function VehicleSelectorModal({ isOpen, onClose, onSelect }: Props) {
	const [page, setPage] = useState(1);
	const [filters, setFilters] = useState({
		make: "",
		modelLine: "",
		modification: "",
		engineType: "",
		productionYearFrom: "",
		productionYearTo: "",
	});

	const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
	const [selectedModelLineId, setSelectedModelLineId] = useState<number | null>(null);

	const limit = 10;

	const { data: carMakesRes } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });
	const { data: engineTypesRes } = useGetAllEngineTypesQuery({ page: 1, limit: 999999 });
	const { data: modificationsRes } = useGetAllModificationsQuery({ page: 1, limit: 999999 });
	const { data: modelLinesRes } = useGetModelLinesQuery(
		selectedMakeId ? { car_make: selectedMakeId } : {},
		{ skip: !selectedMakeId },
	);

	// --------------------
	// Query Params
	// --------------------
	const queryParams = useMemo(
		() => ({
			page,
			limit,
			...filters,
			...(filters.productionYearFrom && {
				productionYearFrom: Number(filters.productionYearFrom),
			}),
			...(filters.productionYearTo && { productionYearTo: Number(filters.productionYearTo) }),
		}),
		[page, filters],
	);

	const { data, isLoading } = useGetAllVehiclesQuery(queryParams);

	const vehicles = data?.data?.vehicles ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	// --------------------
	// Options
	// --------------------
	const carMakes = carMakesRes?.data?.carMakes || [];
	const engineTypes = engineTypesRes?.data?.engineTypes || [];
	const modelLines = modelLinesRes?.data || [];
	const modifications = selectedModelLineId
		? modificationsRes?.data?.modifications?.filter(
				(m) => m.model_lineId === selectedModelLineId,
		  ) || []
		: [];

	const makeOptions: Option[] = carMakes.map((m) => ({ value: m.name, label: m.name }));
	const modelLineOptions: Option[] = modelLines.map((m) => ({ value: m.name, label: m.name }));
	const modificationOptions: Option[] = modifications.map((m) => ({
		value: m.name,
		label: m.name,
	}));
	const engineOptions: Option[] = engineTypes.map((e) => ({ value: e.name, label: e.name }));

	const years = useMemo(() => {
		const arr: string[] = [];
		for (let y = 1900; y <= new Date().getFullYear() + 1; y++) arr.push(y.toString());
		return arr;
	}, []);
	const yearOptions: Option[] = years.map((y) => ({ value: y, label: y }));

	// --------------------
	// Filter Handler
	// --------------------
	const handleFilterChange = (key: keyof typeof filters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));

		if (key === "make") {
			const make = carMakes.find((m) => m.name === value);
			setSelectedMakeId(make?.id || null);
			setSelectedModelLineId(null);
			setFilters((prev) => ({ ...prev, modelLine: "", modification: "" }));
		}

		if (key === "modelLine") {
			const mdl = modelLines.find((m) => m.name === value);
			setSelectedModelLineId(mdl?.id || null);
			setFilters((prev) => ({ ...prev, modification: "" }));
		}

		setPage(1);
	};

	if (!isOpen) return null;

	// ----------------------------------------------------------------
	// REACT-SELECT: Fix menu overflow so dropdowns are never clipped
	// ----------------------------------------------------------------
	const selectStyles = {
		menuPortal: (base: any) => ({ ...base, zIndex: 9999 }),
		menu: (base: any) => ({ ...base, zIndex: 9999 }),
		container: (base: any) => ({ ...base, zIndex: 9999 }),
	};

	return (
		<AnimatePresence>
			<motion.div
				className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
			>
				<motion.div
					initial={{ scale: 0.8, opacity: 0, y: 40 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.7, opacity: 0, y: 40 }}
					transition={{ type: "spring", stiffness: 120, damping: 14 }}
					className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-visible"
				>
					{/* HEADER */}
					<div className="flex justify-between items-center p-6 border-b">
						<h2 className="text-xl font-semibold tracking-wide">Select Vehicle</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-100 rounded-lg transition"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* FILTERS */}
					<div className="p-6 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						<Select
							options={[{ value: "", label: "All Makes" }, ...makeOptions]}
							value={makeOptions.find((o) => o.value === filters.make) || null}
							onChange={(o) => handleFilterChange("make", o?.value || "")}
							placeholder="Make"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						{selectedMakeId && (
							<Select
								options={[{ value: "", label: "All Models" }, ...modelLineOptions]}
								value={
									modelLineOptions.find((o) => o.value === filters.modelLine) ||
									null
								}
								onChange={(o) => handleFilterChange("modelLine", o?.value || "")}
								placeholder="Model"
								menuPortalTarget={document.body}
								styles={selectStyles}
							/>
						)}

						{selectedModelLineId && (
							<Select
								options={[
									{ value: "", label: "All Variants" },
									...modificationOptions,
								]}
								value={
									modificationOptions.find(
										(o) => o.value === filters.modification,
									) || null
								}
								onChange={(o) => handleFilterChange("modification", o?.value || "")}
								placeholder="Variant"
								menuPortalTarget={document.body}
								styles={selectStyles}
							/>
						)}

						<Select
							options={[{ value: "", label: "All Engines" }, ...engineOptions]}
							value={
								engineOptions.find((o) => o.value === filters.engineType) || null
							}
							onChange={(o) => handleFilterChange("engineType", o?.value || "")}
							placeholder="Engine"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						<Select
							options={[{ value: "", label: "From" }, ...yearOptions]}
							value={
								yearOptions.find((o) => o.value === filters.productionYearFrom) ||
								null
							}
							onChange={(o) =>
								handleFilterChange("productionYearFrom", o?.value || "")
							}
							placeholder="Year From"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						<Select
							options={[{ value: "", label: "To" }, ...yearOptions]}
							value={
								yearOptions.find((o) => o.value === filters.productionYearTo) ||
								null
							}
							onChange={(o) => handleFilterChange("productionYearTo", o?.value || "")}
							placeholder="Year To"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>
					</div>

					{/* VEHICLE LIST */}
					<div className="flex-1 overflow-y-auto p-6">
						{isLoading ? (
							<div className="text-center py-12 text-gray-500">
								Loading vehicles...
							</div>
						) : vehicles.length === 0 ? (
							<div className="text-center py-12 text-gray-500">No vehicles found</div>
						) : (
							<div className="grid gap-3">
								{vehicles.map((vehicle) => {
									const make =
										vehicle.modification?.model_line?.car_make?.name || "N/A";
									const model = vehicle.modification?.model_line?.name || "N/A";
									const variant = vehicle.modification?.name || "";
									const engine = vehicle.engine_type?.name || "";
									const year = vehicle.production_year || "";

									return (
										<motion.button
											key={vehicle.id}
											whileHover={{ scale: 1.02 }}
											whileTap={{ scale: 0.98 }}
											onClick={() => {
												onSelect(vehicle);
												onClose();
											}}
											className="text-left p-4 border rounded-lg hover:bg-green-50 hover:border-green-400 transition shadow-sm"
										>
											<div className="font-medium">
												{make} {model} {variant && `(${variant})`}
											</div>
											<div className="text-sm text-gray-600">
												{engine} • {year}
											</div>
										</motion.button>
									);
								})}
							</div>
						)}
					</div>

					{/* PAGINATION */}
					{totalPages > 1 && (
						<div className="border-t p-4 flex justify-center gap-2">
							<button
								onClick={() => setPage((p) => Math.max(1, p - 1))}
								disabled={page === 1}
								className="px-3 py-1 border rounded disabled:opacity-50"
							>
								Prev
							</button>
							<span className="px-3 py-1">
								Page {page} of {totalPages}
							</span>
							<button
								onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
								disabled={page === totalPages}
								className="px-3 py-1 border rounded disabled:opacity-50"
							>
								Next
							</button>
						</div>
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
