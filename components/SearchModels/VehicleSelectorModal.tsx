// components/SearchModels/VehicleSelectorModal.tsx
"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Select from "react-select";

import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { useGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";

interface Vehicle {
	id: number;
	modification: {
		id: number;
		name: string;
		models: {
			id: number;
			name: string;
			model_line: {
				id: number;
				name: string;
				car_make: { id: number; name: string };
			};
		}[];
	};
	engine_type?: { id: number; name: string } | null;
	production_year: number;
}

interface Props {
	isOpen: boolean;
	onClose: () => void;
	onSelect: (vehicles: Vehicle[]) => void;
	mode?: "single" | "multi";
}

interface Option {
	value: string;
	label: string;
}

export default function VehicleSelectorModal({
	isOpen,
	onClose,
	onSelect,
	mode = "multi",
}: Props) {
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Record<number, Vehicle>>({});

	const [filters, setFilters] = useState({
		make: "",
		modelLine: "",
		generation: "",
		modification: "",
		engineType: "",
		productionYearFrom: "",
		productionYearTo: "",
	});

	const [selectedMakeId, setSelectedMakeId] = useState<number | null>(null);
const [, setSelectedModelLineId] = useState<number | null>(null);

	const limit = 10;

	/* ---------------- API CALLS ---------------- */
	const { data: carMakesRes } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });
	const { data: engineTypesRes } = useGetAllEngineTypesQuery({ page: 1, limit: 999999 });

	const { data: modelLinesRes } = useGetModelLinesQuery(
		selectedMakeId ? { car_make: selectedMakeId } : {},
		{ skip: !selectedMakeId },
	);

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			make: filters.make || undefined,
			modelLine: filters.modelLine || undefined,
			generation: filters.generation || undefined,
			modification: filters.modification || undefined,
			engineType: filters.engineType || undefined,
			productionYearFrom: filters.productionYearFrom ? Number(filters.productionYearFrom) : undefined,
			productionYearTo: filters.productionYearTo ? Number(filters.productionYearTo) : undefined,
		}),
		[page, filters],
	);

	const { data, isLoading } = useGetAllVehiclesQuery(queryParams);

	const vehicles = useMemo(
	() => data?.data?.vehicles ?? [],
	[data?.data?.vehicles],
);

	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	/* ---------------- OPTIONS ---------------- */
	const carMakes = carMakesRes?.data?.carMakes || [];
	const engineTypes = engineTypesRes?.data?.engineTypes || [];
	const modelLines = modelLinesRes?.data || [];

	// Unique generations from current loaded vehicles
	const generationOptions = useMemo(() => {
		const gens = new Set<string>();
		vehicles.forEach((v: Vehicle) => {
			v.modification.models.forEach((m) => gens.add(m.name));
		});
		return [
			{ value: "", label: "All Generations" },
			...Array.from(gens)
				.sort()
				.map((name) => ({ value: name, label: name })),
		];
	}, [vehicles]);

	const makeOptions: Option[] = [
		{ value: "", label: "All Makes" },
		...carMakes.map((m: any) => ({ value: m.name, label: m.name })),
	];

	const modelLineOptions: Option[] = [
		{ value: "", label: "All Model Lines" },
		...modelLines.map((m: any) => ({ value: m.name, label: m.name })),
	];

	const engineOptions: Option[] = [
		{ value: "", label: "All Engines" },
		...engineTypes.map((e: any) => ({ value: e.name, label: e.name })),
	];

	const years = useMemo(() => {
		const arr: string[] = [];
		for (let y = 1900; y <= new Date().getFullYear() + 1; y++) arr.push(y.toString());
		return arr;
	}, []);

	const yearOptions: Option[] = [
		{ value: "", label: "From/To" },
		...years.map((y) => ({ value: y, label: y })),
	];

	/* ---------------- FILTER HANDLER ---------------- */
	const handleFilterChange = (key: keyof typeof filters, value: string) => {
		setFilters((prev) => ({ ...prev, [key]: value }));

		if (key === "make") {
			const make = carMakes.find((m: any) => m.name === value);
			setSelectedMakeId(make?.id || null);
			setSelectedModelLineId(null);
			setFilters((prev) => ({
				...prev,
				modelLine: "",
				generation: "",
				modification: "",
			}));
		}

		if (key === "modelLine") {
			const line = modelLines.find((m: any) => m.name === value);
			setSelectedModelLineId(line?.id || null);
			setFilters((prev) => ({ ...prev, generation: "", modification: "" }));
		}

		setPage(1);
	};

	/* ---------------- SELECTION LOGIC ---------------- */
	const toggleVehicle = (vehicle: Vehicle) => {
		if (mode === "single") {
			onSelect([vehicle]);
			onClose();
			return;
		}

		setSelected((prev) => {
			const copy = { ...prev };
			if (copy[vehicle.id]) delete copy[vehicle.id];
			else copy[vehicle.id] = vehicle;
			return copy;
		});
	};

	const toggleSelectAll = () => {
		const allSelected = vehicles.every((v) => selected[v.id]);
		setSelected((prev) => {
			const copy = { ...prev };
			vehicles.forEach((v) => {
				if (allSelected) delete copy[v.id];
				else copy[v.id] = v;
			});
			return copy;
		});
	};

	if (!isOpen) return null;

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
					className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
				>
					{/* HEADER */}
					<div className="flex justify-between items-center p-6 border-b">
						<h2 className="text-xl font-semibold">
							{mode === "single"
								? "Select Vehicle"
								: `Select Vehicles (${Object.keys(selected).length} selected)`}
						</h2>
						<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* FILTERS */}
					<div className="p-6 border-b grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						<Select
							options={[{ value: "", label: "All Makes" }, ...makeOptions]}
							onChange={(o) => handleFilterChange("make", o?.value || "")}
							placeholder="Make"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						{selectedMakeId && (
							<Select
								options={[{ value: "", label: "All Models" }, ...modelLineOptions]}
								onChange={(o) => handleFilterChange("modelLine", o?.value || "")}
								placeholder="Model"
								menuPortalTarget={document.body}
								styles={selectStyles}
							/>
						)}

						<Select
							options={generationOptions}
							onChange={(o) => handleFilterChange("generation", o?.value || "")}
							placeholder="Generation"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						<Select
							options={[{ value: "", label: "All Engines" }, ...engineOptions]}
							onChange={(o) => handleFilterChange("engineType", o?.value || "")}
							placeholder="Engine"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						<Select
							options={[{ value: "", label: "From" }, ...yearOptions]}
							onChange={(o) =>
								handleFilterChange("productionYearFrom", o?.value || "")
							}
							placeholder="Year From"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>

						<Select
							options={[{ value: "", label: "To" }, ...yearOptions]}
							onChange={(o) =>
								handleFilterChange("productionYearTo", o?.value || "")
							}
							placeholder="Year To"
							menuPortalTarget={document.body}
							styles={selectStyles}
						/>
					</div>

					{/* VEHICLE LIST */}
					<div className="flex-1 overflow-y-auto p-6 space-y-3">
						{mode === "multi" && vehicles.length > 0 && (
							<div className="flex items-center gap-2 mb-4">
								<input
									type="checkbox"
									checked={vehicles.every((v) => selected[v.id])}
									onChange={toggleSelectAll}
									className="w-4 h-4 rounded border-gray-300"
								/>
								<span className="text-sm font-medium">Select all on this page</span>
							</div>
						)}

						{isLoading ? (
							<div className="text-center py-12 text-gray-500">
								Loading vehicles...
							</div>
						) : vehicles.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								No vehicles found matching filters
							</div>
						) : (
							vehicles.map((v: Vehicle) => {
								const checked = !!selected[v.id];
								const genNames = v.modification.models
									.map((m) => m.name)
									.join(" • ") || "N/A";

								return (
									<label
										key={v.id}
										onClick={mode === "single" ? () => toggleVehicle(v) : undefined}
										className={`flex gap-4 p-4 border rounded-lg cursor-pointer transition-all ${
											mode === "single"
												? "hover:bg-green-50 hover:border-green-300"
												: checked
												? "bg-green-50 border-green-400"
												: "hover:bg-gray-50"
										}`}
									>
										{mode === "multi" && (
											<input
												type="checkbox"
												checked={checked}
												onChange={() => toggleVehicle(v)}
												className="w-5 h-5 mt-1 text-[#9AE144] rounded focus:ring-[#9AE144]"
											/>
										)}
										<div className="flex-1">
											<div className="font-semibold text-gray-900">
												{v.modification.models[0]?.model_line.car_make.name}{" "}
												{v.modification.models[0]?.model_line.name}
											</div>
											<div className="text-sm text-gray-600 mt-1">
												<span className="font-medium">Generations:</span> {genNames}
											</div>
											<div className="text-sm text-gray-600">
												<span className="font-medium">Variant:</span> {v.modification.name}
											</div>
											<div className="text-sm text-gray-600">
												{v.engine_type?.name && (
													<>
														<span className="font-medium">Engine:</span> {v.engine_type.name} •{" "}
													</>
												)}
												<span className="font-medium">Year:</span> {v.production_year}
											</div>
										</div>
									</label>
								);
							})
						)}
					</div>

					{/* PAGINATION + FOOTER */}
					<div className="border-t p-4 flex items-center justify-between">
						<button
							onClick={onClose}
							className="px-6 py-2 border rounded hover:bg-gray-50 transition"
						>
							Cancel
						</button>

						{totalPages > 1 && (
							<div className="flex items-center gap-4">
								<button
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
								>
									Prev
								</button>
								<span className="text-sm font-medium">
									Page {page} of {totalPages}
								</span>
								<button
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
									className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
								>
									Next
								</button>
							</div>
						)}

						{mode === "multi" && (
							<button
								onClick={() => {
									onSelect(Object.values(selected));
									onClose();
								}}
								disabled={Object.keys(selected).length === 0}
								className="px-8 py-2 bg-[#9AE144] font-medium text-black rounded hover:bg-[#85d138] disabled:opacity-50 disabled:cursor-not-allowed transition"
							>
								Add Selected ({Object.keys(selected).length})
							</button>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}