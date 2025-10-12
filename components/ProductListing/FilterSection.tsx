// Updated: src/components/ProductListing/FilterSection.tsx
"use client";

import FilterItem from "./FilterItem";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetFilterOptionsQuery } from "@/lib/redux/api/partApi";

const FilterSection: React.FC = () => {
	const [showMoreBrands, setShowMoreBrands] = useState(false);
	const [selectedFilters, setSelectedFilters] = useState({
		makes: [] as string[],
		models: [] as string[],
		years: [] as number[],
		engines: [] as string[],
		brands: [] as string[],
		categories: [] as string[],
	});

	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: filterOptionsResponse, isLoading: optionsLoading } = useGetFilterOptionsQuery({
		undefined,
	});
	const filterOptions = filterOptionsResponse?.data;

	// Helper to map filterType to URL key
	const getUrlKey = (filterType: keyof typeof selectedFilters): string => {
		const mapping: Record<keyof typeof selectedFilters, string> = {
			makes: "make",
			models: "model",
			years: "year",
			engines: "engine",
			brands: "brand",
			categories: "category",
		};
		return mapping[filterType];
	};

	// Initialize selected filters from URL params
	useEffect(() => {
		const makes = searchParams.getAll("make");
		const models = searchParams.getAll("model");
		const years = searchParams
			.getAll("year")
			.map(Number)
			.filter((y) => !isNaN(y));
		const engines = searchParams.getAll("engine");
		const brands = searchParams.getAll("brand");
		const categories = searchParams.getAll("category");

		setSelectedFilters({
			makes,
			models,
			years,
			engines,
			brands,
			categories,
		});
	}, [searchParams]);

	const handleFilterChange = (
		filterType: keyof typeof selectedFilters,
		value: string | number,
		checked: boolean,
	) => {
		const current = selectedFilters[filterType];
		const newSelected = checked
			? [...current, value]
			: current.filter((item) => item !== value);

		setSelectedFilters((prev) => ({ ...prev, [filterType]: newSelected }));

		// Update URL
		const urlKey = getUrlKey(filterType);
		const params = new URLSearchParams(searchParams.toString());
		params.delete(urlKey);

		newSelected.forEach((item) => {
			params.append(urlKey, String(item));
		});

		// Clean empty arrays
		if (newSelected.length === 0) {
			params.delete(urlKey);
		}

		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleShowMoreBrands = () => {
		setShowMoreBrands(!showMoreBrands);
	};

	const handleReset = () => {
		const params = new URLSearchParams(searchParams.toString());
		["make", "model", "year", "engine", "brand", "category"].forEach((key) =>
			params.delete(key),
		);
		router.push(`?${params.toString()}`, { scroll: false });
		setSelectedFilters({
			makes: [],
			models: [],
			years: [],
			engines: [],
			brands: [],
			categories: [],
		});
	};

	if (optionsLoading) {
		return <div className="bg-white rounded-lg p-5">Loading filters...</div>;
	}

	// Ensure selected brands are always visible, even in limited view
	const selectedBrandsSet = new Set(selectedFilters.brands);
	const nonSelectedBrands = (filterOptions?.brands || []).filter(
		(b) => !selectedBrandsSet.has(b),
	);
	const baseVisibleBrands = [
		...selectedFilters.brands,
		...nonSelectedBrands.slice(
			0,
			showMoreBrands ? nonSelectedBrands.length : 3 - selectedFilters.brands.length,
		),
	];
	const visibleBrands = showMoreBrands
		? filterOptions?.brands || []
		: [...new Set(baseVisibleBrands)]; // Dedupe in case of overlap

	return (
		<div className="bg-white rounded-lg">
			<h2 className="text-3xl font-dm-sans text-black font-bold mb-5 p-5 px-7">Filters</h2>
			<div className="p-5 px-7">
				<div className="mb-8">
					<h3 className="text-2xl font-dm-sans text-black font-semibold mb-3 flex items-center justify-between">
						Vehicle
						<button
							onClick={handleReset}
							className="text-[#9AE144] text-sm hover:underline"
						>
							Reset
						</button>
					</h3>
					<FilterItem
						title="Makes"
						options={filterOptions?.makes || []}
						selected={selectedFilters.makes}
						onChange={(value, checked) => handleFilterChange("makes", value, checked)}
					/>
					<FilterItem
						title="Models"
						options={filterOptions?.models || []}
						selected={selectedFilters.models}
						onChange={(value, checked) => handleFilterChange("models", value, checked)}
					/>
					<FilterItem
						title="Years"
						options={filterOptions?.years || []}
						selected={selectedFilters.years.map(String)}
						onChange={(value, checked) =>
							handleFilterChange("years", Number(value), checked)
						}
					/>
					<FilterItem
						title="Engines"
						options={filterOptions?.engines || []}
						selected={selectedFilters.engines}
						onChange={(value, checked) => handleFilterChange("engines", value, checked)}
					/>
				</div>
				<div className="mb-8">
					<h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">Brand</h3>
					{visibleBrands.map((brand) => (
						<div key={brand} className="flex items-center mb-2">
							<input
								type="checkbox"
								id={brand.toLowerCase()}
								checked={selectedFilters.brands.includes(brand)}
								onChange={(e) =>
									handleFilterChange("brands", brand, e.target.checked)
								}
								className="mr-3 w-5 h-5 rounded appearance-none border border-[#9AE144] checked:bg-[#9AE144] checked:border-[#9AE144] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center"
							/>
							<label
								htmlFor={brand.toLowerCase()}
								className="text-[14px] font-semibold text-black cursor-pointer"
							>
								{brand}
							</label>
						</div>
					))}
					{filterOptions?.brands && filterOptions.brands.length > 3 && (
						<div
							onClick={handleShowMoreBrands}
							className="text-[#9AE144] text-sm cursor-pointer mt-2"
						>
							{showMoreBrands
								? "- Show less"
								: `+ ${filterOptions.brands.length - visibleBrands.length} more`}
						</div>
					)}
				</div>
				<div>
					<h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">
						Category
					</h3>
					{filterOptions?.categories?.map((category) => (
						<div key={category} className="flex items-center mb-2">
							<input
								type="checkbox"
								id={category.toLowerCase()}
								checked={selectedFilters.categories.includes(category)}
								onChange={(e) =>
									handleFilterChange("categories", category, e.target.checked)
								}
								className="mr-3 w-5 h-5 rounded appearance-none border border-[#9AE144] checked:bg-[#9AE144] checked:border-[#9AE144] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center"
							/>
							<label
								htmlFor={category.toLowerCase()}
								className="text-[14px] font-semibold text-black cursor-pointer"
							>
								{category}
							</label>
						</div>
					)) || []}
				</div>
			</div>
		</div>
	);
};

export default FilterSection;
