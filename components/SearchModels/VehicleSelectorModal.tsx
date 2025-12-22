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
	onSelect: (vehicles: Vehicle[]) => void;
	mode?: "single" | "multi"; // 👈 ADDED
}

interface Option {
	value: string;
	label: string;
}

export default function VehicleSelectorModal({
	isOpen,
	onClose,
	onSelect,
	mode = "multi", // 👈 DEFAULT TO MULTI (backward-safe)
}: Props) {
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Record<number, Vehicle>>({});

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

	/* ---------------- API CALLS ---------------- */
	const { data: carMakesRes } = useGetAllCarMakesQuery({ page: 1, limit: 999999 });
	const { data: engineTypesRes } = useGetAllEngineTypesQuery({ page: 1, limit: 999999 });
	const { data: modificationsRes } = useGetAllModificationsQuery({ page: 1, limit: 999999 });

	const { data: modelLinesRes } = useGetModelLinesQuery(
		selectedMakeId ? { car_make: selectedMakeId } : {},
		{ skip: !selectedMakeId },
	);

	const queryParams = useMemo(
		() => ({
			page,
			limit,
			...filters,
			...(filters.productionYearFrom && {
				productionYearFrom: Number(filters.productionYearFrom),
			}),
			...(filters.productionYearTo && {
				productionYearTo: Number(filters.productionYearTo),
			}),
		}),
		[page, filters],
	);

	const { data, isLoading } = useGetAllVehiclesQuery(queryParams);

	const vehicles = data?.data?.vehicles ?? [];
	const total = data?.data?.total ?? 0;
	const totalPages = Math.ceil(total / limit);

	/* ---------------- OPTIONS ---------------- */
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

	/* ---------------- FILTER HANDLER ---------------- */
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

	/* ---------------- SELECTION LOGIC ---------------- */
	const toggleVehicle = (vehicle: Vehicle) => {
		if (mode === "single") {
			// 🔥 Single selection: select one and auto-close
			onSelect([vehicle]);
			onClose();
			return;
		}

		// 🔁 Multi selection: existing toggle behavior
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
						<button onClick={onClose}>
							<X />
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

						{selectedModelLineId && (
							<Select
								options={[
									{ value: "", label: "All Variants" },
									...modificationOptions,
								]}
								onChange={(o) => handleFilterChange("modification", o?.value || "")}
								placeholder="Variant"
								menuPortalTarget={document.body}
								styles={selectStyles}
							/>
						)}

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
						{mode === "multi" && (
							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={vehicles.length > 0 && vehicles.every((v) => selected[v.id])}
									onChange={toggleSelectAll}
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
								No vehicles found
							</div>
						) : (
							vehicles.map((v) => {
								const checked = !!selected[v.id];
								return (
									<label
										key={v.id}
										onClick={mode === "single" ? () => toggleVehicle(v) : undefined}
										className={`flex gap-3 p-4 border rounded-lg cursor-pointer ${mode === "single"
												? "hover:bg-green-50"
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
											/>
										)}
										<div>
											<div className="font-medium">
												{v.modification?.model_line?.car_make?.name}{" "}
												{v.modification?.model_line?.name}{" "}
												{v.modification?.name &&
													`(${v.modification.name})`}
											</div>
											<div className="text-sm text-gray-600">
												{v.engine_type?.name} • {v.production_year}
											</div>
										</div>
									</label>
								);
							})
						)}
					</div>

					{/* PAGINATION + FOOTER */}
					<div className="border-t p-4 flex items-center justify-between">
						{/* Cancel button - left */}
						<button
							onClick={onClose}
							className="px-6 py-2 border rounded hover:bg-gray-50"
						>
							Cancel
						</button>

						{/* Pagination - center (only shown if >1 page) */}
						{totalPages > 1 && (
							<div className="flex items-center gap-4">
								<button
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
									className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
								>
									Prev
								</button>
								<span className="text-sm font-medium min-w-[100px] text-center">
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

						{/* Add button - right (only in multi mode) */}
						{mode === "multi" && (
							<button
								onClick={() => {
									onSelect(Object.values(selected));
									onClose();
								}}
								disabled={Object.keys(selected).length === 0}
								className="px-8 py-2 bg-[#9AE144] font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#8CD134]"
							>
								Add Selected Vehicles
							</button>
						)}
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}