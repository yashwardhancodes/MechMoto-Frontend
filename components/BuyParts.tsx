"use client";
import React, { useEffect, useState } from "react";
import { FaSearch, FaSpinner } from "react-icons/fa";
import CategoryGrid from "./CategoryGrid";
import PartCategorySearchModal from "./SearchModels/PartCategorySearchModal";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import {
	useLazyGetProductionYearsQuery,
	useLazyGetModificationsQuery,
	useLazyGetFilteredVehiclesQuery,
} from "@/lib/redux/api/vehicleApi";
import { useLazyGetModelLinesQuery } from "@/lib/redux/api/modelLineApi";
import toast from "react-hot-toast";

interface CarMake {
	id: number;
	name: string;
}

interface Part {
	id: number;
	name: string;
	// Add other relevant fields based on your data structure
}

interface Compatibility {
	id: number;
	vehicleId: number;
	partId: number;
	// Add other relevant fields based on your data structure
}

interface Vehicle {
	id: number;
	car_makeId: number;
	model_line: string;
	production_year: number;
	modification: string | null;
	engine_typeId: number | null;
	created_at: string;
	car_make: { id: number; name: string };
	engine_type: { id: number; name: string } | null;
	parts: Part[];
	compatibility: Compatibility[];
}

const BuyParts = () => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCarMake, setSelectedCarMake] = useState<number | null>(null);
	const [selectedModelLine, setSelectedModelLine] = useState<string | null>(null);
	const [selectedProductionYear, setSelectedProductionYear] = useState<string | null>(null);
	const [selectedModification, setSelectedModification] = useState<string | null>(null);
	const [searchResults, setSearchResults] = useState<Vehicle[]>([]);

	const { data: carMakesData, isLoading: carMakeLoading } = useGetAllCarMakesQuery();
	const [triggerGetModels, { data: modelLineData, isFetching: modelLineLoading }] =
		useLazyGetModelLinesQuery();
	const [
		triggerGetProductionYears,
		{ data: productionYearsData, isFetching: productionYearsLoading },
	] = useLazyGetProductionYearsQuery();
	const [triggerGetModifications, { data: modificationsData, isFetching: modificationsLoading }] =
		useLazyGetModificationsQuery();
	const [triggerGetFilteredVehicles, { isFetching: filteredVehiclesLoading }] =
		useLazyGetFilteredVehiclesQuery();

	useEffect(() => {
		if (selectedCarMake) {
			triggerGetModels({ car_make: selectedCarMake });
		} else {
			setSelectedModelLine(null);
		}
	}, [selectedCarMake, triggerGetModels]);

	useEffect(() => {
		if (selectedModelLine) {
			triggerGetProductionYears(selectedModelLine);
		} else {
			setSelectedProductionYear(null);
		}
	}, [selectedModelLine, triggerGetProductionYears]);

	useEffect(() => {
		if (selectedProductionYear && selectedModelLine) {
			triggerGetModifications({
				modelLine: selectedModelLine,
				productionYear: selectedProductionYear,
			});
		} else {
			setSelectedModification(null);
		}
	}, [selectedProductionYear, selectedModelLine, triggerGetModifications]);

	const handleSearch = async () => {
		if (
			!selectedCarMake &&
			!selectedModelLine &&
			!selectedProductionYear &&
			!selectedModification
		) {
			alert("Please select at least one filter to search.");
			return;
		}

		try {
			const result = await triggerGetFilteredVehicles({
				carMakeId: selectedCarMake,
				modelLine: selectedModelLine,
				productionYear: selectedProductionYear,
				modification: selectedModification,
			}).unwrap();
			setSearchResults(result.data || []);
			setIsModalOpen(true);
		} catch (error) {
			console.error("Failed to fetch filtered vehicles:", error);
			toast.error("Failed to fetch vehicles. Please try again.");
		}
	};

	const LoadingSpinner = ({ size = "sm" }: { size?: "sm" | "md" }) => (
		<FaSpinner
			className={`animate-spin ${size === "sm" ? "text-xs" : "text-sm"} text-gray-500`}
		/>
	);

	// Enhanced dropdown styling with custom CSS classes
	const dropdownStyles = `
    .custom-select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23374151' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 0.5rem center;
      background-repeat: no-repeat;
      background-size: 1rem 1rem;
    }

    .custom-select:focus {
      box-shadow: 0 0 0 2px rgba(154, 225, 68, 0.2);
      border-color: rgba(154, 225, 68, 0.5);
    }

    .custom-select option {
      padding: 8px 12px;
      border-radius: 6px;
      margin: 2px 0;
      background-color: white;
      color: #1f2937;
      font-weight: 500;
      transition: all 0.15s ease-in-out;
    }

    .custom-select option:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .custom-select option:checked,
    .custom-select option:focus {
      background-color: rgba(154, 225, 68, 0.1);
      color: #065f46;
      font-weight: 600;
    }

    .custom-select option[disabled] {
      background-color: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
    }

    .custom-select:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.6;
    }

    .custom-select:disabled option {
      color: #9ca3af;
    }

    @media (max-width: 768px) {
      .custom-select option {
        padding: 10px 8px;
        font-size: 14px;
      }
    }
  `;

	const selectClassName =
		"custom-select bg-transparent focus:outline-none text-gray-700 font-medium text-xs md:text-sm w-full pr-6 disabled:text-gray-400 appearance-none cursor-pointer hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 disabled:cursor-not-allowed border border-transparent focus:border-green-300";

	return (
		<div className="w-full flex flex-col items-center px-3 sm:px-4 md:px-6">
			<style jsx>{dropdownStyles}</style>

			{/* Desktop Layout - Horizontal */}
			<div className="hidden md:flex items-center bg-white rounded-full border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 px-4 py-3 w-full max-w-xl lg:max-w-4xl backdrop-blur-sm">
				<div className="flex items-center flex-1 space-x-4">
					<div className="relative flex-1 min-w-0">
						<select
							className={selectClassName}
							value={selectedCarMake ?? ""}
							disabled={carMakeLoading}
							onChange={(e) => {
								const selectedId = e.target.value ? Number(e.target.value) : null;
								setSelectedCarMake(selectedId);
							}}
						>
							<option
								value=""
								className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
							>
								{carMakeLoading ? "Loading..." : "🚗 Select Car Make"}
							</option>
							{carMakesData?.data?.map((carMake: CarMake) => (
								<option
									key={carMake.id}
									value={carMake.id}
									className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
								>
									{carMake.name}
								</option>
							))}
						</select>
						{carMakeLoading && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<LoadingSpinner />
							</div>
						)}
					</div>

					<div className="h-6 w-px bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200" />

					<div className="relative flex-1 min-w-0">
						<select
							className={selectClassName}
							disabled={!selectedCarMake || modelLineLoading}
							value={selectedModelLine ?? ""}
							onChange={(e) => setSelectedModelLine(e.target.value)}
						>
							<option
								value=""
								className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
							>
								{modelLineLoading ? "Loading..." : "🏎️ Select Model"}
							</option>
							{modelLineData?.data?.map((model: string, idx: number) => (
								<option
									key={idx}
									value={model}
									className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
								>
									{model}
								</option>
							))}
						</select>
						{modelLineLoading && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<LoadingSpinner />
							</div>
						)}
					</div>

					<div className="h-6 w-px bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200" />

					<div className="relative flex-1 min-w-0">
						<select
							className={selectClassName}
							disabled={!selectedModelLine || productionYearsLoading}
							value={selectedProductionYear ?? ""}
							onChange={(e) => setSelectedProductionYear(e.target.value)}
						>
							<option
								value=""
								className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
							>
								{productionYearsLoading ? "Loading..." : "📅 Select Year"}
							</option>
							{productionYearsData?.data?.map((year: string, idx: number) => (
								<option
									key={idx}
									value={year}
									className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
								>
									{year}
								</option>
							))}
						</select>
						{productionYearsLoading && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<LoadingSpinner />
							</div>
						)}
					</div>

					<div className="h-6 w-px bg-gradient-to-b from-gray-200 via-gray-400 to-gray-200" />

					<div className="relative flex-1 min-w-0">
						<select
							className={selectClassName}
							disabled={!selectedProductionYear || modificationsLoading}
							value={selectedModification ?? ""}
							onChange={(e) => setSelectedModification(e.target.value)}
						>
							<option
								value=""
								className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
							>
								{modificationsLoading ? "Loading..." : "⚙️ Select Modification"}
							</option>
							{modificationsData?.data?.map((modification: string, idx: number) => (
								<option
									key={idx}
									value={modification}
									className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
								>
									{modification}
								</option>
							))}
						</select>
						{modificationsLoading && (
							<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
								<LoadingSpinner />
							</div>
						)}
					</div>
				</div>

				<button
					className="ml-4 flex items-center bg-gradient-to-r from-[rgba(154,225,68,0.8)] to-[rgba(154,225,68,0.9)] hover:from-[rgba(154,225,68,0.9)] hover:to-[rgba(154,225,68,1)] text-gray-800 font-semibold px-6 py-2 rounded-full transition-all duration-300 whitespace-nowrap shadow-md hover:shadow-lg transform hover:scale-105"
					onClick={handleSearch}
					disabled={filteredVehiclesLoading}
				>
					{filteredVehiclesLoading ? (
						<LoadingSpinner size="md" />
					) : (
						<>
							<FaSearch className="mr-2 text-sm" />
							<span className="text-sm">Search</span>
						</>
					)}
				</button>
			</div>

			{/* Mobile Layout - Vertical */}
			<div className="md:hidden flex flex-col bg-white rounded-3xl border-2 border-gray-200 shadow-lg w-full max-w-md backdrop-blur-sm p-4 space-y-3">
				<div className="relative">
					<select
						className={selectClassName}
						value={selectedCarMake ?? ""}
						disabled={carMakeLoading}
						onChange={(e) => {
							const selectedId = e.target.value ? Number(e.target.value) : null;
							setSelectedCarMake(selectedId);
						}}
					>
						<option
							value=""
							className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
						>
							{carMakeLoading ? "Loading..." : "🚗 Select Car Make"}
						</option>
						{carMakesData?.data?.map((carMake: CarMake) => (
							<option
								key={carMake.id}
								value={carMake.id}
								className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
							>
								{carMake.name}
							</option>
						))}
					</select>
					{carMakeLoading && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<LoadingSpinner />
						</div>
					)}
				</div>

				<div className="relative">
					<select
						className={selectClassName}
						disabled={!selectedCarMake || modelLineLoading}
						value={selectedModelLine ?? ""}
						onChange={(e) => setSelectedModelLine(e.target.value)}
					>
						<option
							value=""
							className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
						>
							{modelLineLoading ? "Loading..." : "🏎️ Select Model"}
						</option>
						{modelLineData?.data?.map((model: string, idx: number) => (
							<option
								key={idx}
								value={model}
								className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
							>
								{model}
							</option>
						))}
					</select>
					{modelLineLoading && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<LoadingSpinner />
						</div>
					)}
				</div>

				<div className="relative">
					<select
						className={selectClassName}
						disabled={!selectedModelLine || productionYearsLoading}
						value={selectedProductionYear ?? ""}
						onChange={(e) => setSelectedProductionYear(e.target.value)}
					>
						<option
							value=""
							className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
						>
							{productionYearsLoading ? "Loading..." : "📅 Select Year"}
						</option>
						{productionYearsData?.data?.map((year: string, idx: number) => (
							<option
								key={idx}
								value={year}
								className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
							>
								{year}
							</option>
						))}
					</select>
					{productionYearsLoading && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<LoadingSpinner />
						</div>
					)}
				</div>

				<div className="relative">
					<select
						className={selectClassName}
						disabled={!selectedProductionYear || modificationsLoading}
						value={selectedModification ?? ""}
						onChange={(e) => setSelectedModification(e.target.value)}
					>
						<option
							value=""
							className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 py-3 font-medium"
						>
							{modificationsLoading ? "Loading..." : "⚙️ Select Modification"}
						</option>
						{modificationsData?.data?.map((modification: string, idx: number) => (
							<option
								key={idx}
								value={modification}
								className="bg-white text-gray-800 py-3 hover:bg-green-50 hover:text-green-800 font-medium transition-colors duration-150"
							>
								{modification}
							</option>
						))}
					</select>
					{modificationsLoading && (
						<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
							<LoadingSpinner />
						</div>
					)}
				</div>

				<button
					className="flex items-center justify-center bg-gradient-to-r from-[rgba(154,225,68,0.8)] to-[rgba(154,225,68,0.9)] hover:from-[rgba(154,225,68,0.9)] hover:to-[rgba(154,225,68,1)] text-gray-800 font-semibold px-6 py-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
					onClick={handleSearch}
					disabled={filteredVehiclesLoading}
				>
					{filteredVehiclesLoading ? (
						<LoadingSpinner size="md" />
					) : (
						<>
							<FaSearch className="mr-2 text-sm" />
							<span className="text-sm">Search</span>
						</>
					)}
				</button>
			</div>

			<div className="flex items-center my-4 md:my-6 w-full max-w-xs">
				<div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
				<span className="mx-3 text-xs md:text-sm text-gray-600 font-semibold bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
					OR
				</span>
				<div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
			</div>

			<div className="flex items-center justify-between bg-gradient-to-r from-[#D7F3B4] to-[#c5e89a] rounded-full px-4 py-3 w-full max-w-md shadow-lg hover:shadow-xl transition-all duration-300 border border-green-200">
				<div className="flex items-center flex-1 min-w-0">
					<span className="font-semibold text-gray-800 text-xs md:text-sm whitespace-nowrap mr-3">
						Search By Number Plate
					</span>
					<div className="h-4 w-px bg-gray-500 mr-3"></div>
					<span className="text-lg mr-2 flex-shrink-0">🔍</span>
					<input
						type="text"
						placeholder="IND: MH19 AD 7755"
						className="bg-transparent outline-none text-gray-700 placeholder-gray-400 text-xs md:text-sm flex-1 min-w-0 font-medium focus:placeholder-gray-400 transition-colors duration-200"
					/>
				</div>
			</div>

			<div className="mt-6 md:mt-8 w-full">
				<CategoryGrid />
			</div>

			{isModalOpen && (
				<PartCategorySearchModal
					onClose={() => {
						setIsModalOpen(false);
						setSearchResults([]);
					}}
					vehicles={searchResults}
				/>
			)}
		</div>
	);
};

export default BuyParts;
