// Updated: src/components/ProductListing/FilterSection.tsx
"use client";

import FilterItem from "./FilterItem";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetFilterOptionsQuery } from "@/lib/redux/api/partApi";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { useLazyGetSubcategoriesByCategoryIdQuery } from "@/lib/redux/api/subCategoriesApi";
// import { skipToken } from "@reduxjs/toolkit/query";

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
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);
	const [subcatOptions, setSubcatOptions] = useState([]);

	const router = useRouter();
	const searchParams = useSearchParams();

	const { data: filterOptionsResponse, isLoading: optionsLoading } = useGetFilterOptionsQuery();

	const filterOptions = filterOptionsResponse?.data;

	// For category and subcategory dropdowns
	const { data: categoriesData } = useGetAllCategoriesQuery({page: 1, limit: 999999});
	// Normalize categoriesData to an array when API response might be wrapped
	const categoriesList = categoriesData?.data?.categories;
	const [triggerSubcats, { data: subcatsData }] = useLazyGetSubcategoriesByCategoryIdQuery();

	// For preselect from parts data
	// const subcategoryIdParam = searchParams.get("sub_category_id");
	// const vehicleIdParam = searchParams.get("vehicle_id");
	// const currentMakes = searchParams.getAll("make");
	// const currentModels = searchParams.getAll("model");
	// const currentYears = searchParams
	// 	.getAll("year")
	// 	.map(Number)
	// 	.filter((y) => !isNaN(y));
	// const currentEngines = searchParams.getAll("engine");
	// const currentBrands = searchParams.getAll("brand");
	// const currentCategories = searchParams.getAll("category");

	// const { data, isLoading } =
	// 	useGetPartsByFiltersQuery(
	// 		vehicleIdParam || subcategoryIdParam
	// 			? {
	// 					subcategoryId: subcategoryIdParam ? Number(subcategoryIdParam) : undefined,
	// 					vehicleId: vehicleIdParam ? Number(vehicleIdParam) : undefined,
	// 					make: currentMakes.length > 0 ? currentMakes : undefined,
	// 					model: currentModels.length > 0 ? currentModels : undefined,
	// 					year: currentYears.length > 0 ? currentYears : undefined,
	// 					engine: currentEngines.length > 0 ? currentEngines : undefined,
	// 					brand: currentBrands.length > 0 ? currentBrands : undefined,
	// 					category: currentCategories.length > 0 ? currentCategories : undefined,
	// 			  }
	// 			: skipToken,
	// 		{ skip: !vehicleIdParam && !subcategoryIdParam },
	// 	);

	// Update subcatOptions when subcatsData changes
	useEffect(() => {
		setSubcatOptions(subcatsData?.data || []);
	}, [subcatsData]);

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
		const subcategories = searchParams.getAll("sub_category_id");
		console.log("subcategories", subcategories)
		if (subcategories && subcategories.length > 0) {
			console.log('selecting ', subcategories[0])
			setSelectedSubcategoryId(Number(subcategories[0]));
		}

		setSelectedFilters({
			makes,
			models,
			years,
			engines,
			brands,
			categories,
		});
	}, [searchParams]);

	// Initialize dropdowns from URL params
	useEffect(() => {
		const catId = searchParams.get("category_id");
		if (catId) {
			setSelectedCategoryId(catId);
			triggerSubcats(catId);
		}

		const subId = searchParams.get("sub_category_id");
		if (subId) {
			setSelectedSubcategoryId(Number(subId));
		}
	}, [searchParams, triggerSubcats]);

	// Fetch subcats when selectedCategoryId changes
	useEffect(() => {
		if (selectedCategoryId) {
			triggerSubcats(selectedCategoryId);
		} else {
			setSubcatOptions([]);
			setSelectedSubcategoryId(null);
		}
	}, [selectedCategoryId, triggerSubcats]);

	useEffect(() => {
		const subId = searchParams.get("sub_category_id");
		if (subId && subcatOptions.length > 0) {
			const exists = subcatOptions.some((s) => s.id === Number(subId));
			if (exists) setSelectedSubcategoryId(Number(subId));
		}
	}, [subcatOptions, searchParams]);


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

	const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newId = e.target.value;
		const newCat = categoriesList.find((c) => c.id === newId);
		if (!newCat) return;

		setSelectedCategoryId(newId);
		setSelectedFilters((prev) => ({ ...prev, categories: [newCat.name] }));
		setSelectedSubcategoryId(null);

		const params = new URLSearchParams(searchParams.toString());
		params.delete("category");
		params.append("category", newCat.name);
		params.delete("category_id");
		params.append("category_id", newId);
		params.delete("sub_category_id");
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newId = Number(e.target.value) || null;
		setSelectedSubcategoryId(newId);

		const params = new URLSearchParams(searchParams.toString());
		params.delete("sub_category_id");
		if (newId) {
			params.append("sub_category_id", newId.toString());
		}
		router.push(`?${params.toString()}`, { scroll: false });
	};

	const handleShowMoreBrands = () => {
		setShowMoreBrands(!showMoreBrands);
	};

	const handleReset = () => {
		const params = new URLSearchParams(searchParams.toString());
		[
			"make",
			"model",
			"year",
			"engine",
			"brand",
			"category",
			"category_id",
			"sub_category_id",
		].forEach((key) => params.delete(key));
		router.push(`?${params.toString()}`, { scroll: false });
		setSelectedFilters({
			makes: [],
			models: [],
			years: [],
			engines: [],
			brands: [],
			categories: [],
		});
		setSelectedCategoryId(null);
		setSelectedSubcategoryId(null);
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

	// Dropdown styles (copied from BuyParts for consistency)
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
		<>
			<style jsx>{dropdownStyles}</style>
			<div className="bg-white rounded-lg">
				<h2 className="text-3xl font-dm-sans text-black font-bold mb-5 p-5 px-7">
					Filters
				</h2>
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
							onChange={(value, checked) =>
								handleFilterChange("makes", value, checked)
							}
						/>
						<FilterItem
							title="Models"
							options={filterOptions?.models || []}
							selected={selectedFilters.models}
							onChange={(value, checked) =>
								handleFilterChange("models", value, checked)
							}
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
							onChange={(value, checked) =>
								handleFilterChange("engines", value, checked)
							}
						/>
					</div>
					<div className="mb-8">
						<h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">
							Brand
						</h3>
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
									: `+ ${
											filterOptions.brands.length - visibleBrands.length
									  } more`}
							</div>
						)}
					</div>
					<div className="mb-8">
						<h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">
							Category & Subcategory
						</h3>
						<div className="mb-4">
							<h4 className="text-lg font-semibold mb-2">Category</h4>
							<select
								className={selectClassName}
								value={selectedCategoryId || ""}
								onChange={handleCategoryChange}
							>
								<option value="">Select Category</option>
								{categoriesList?.map((cat) => (
									<option key={cat.id} value={cat.id}>
										{cat.name}
									</option>
								))}
							</select>
						</div>
						{selectedCategoryId && (
							<div className="mb-4">
								<h4 className="text-lg font-semibold mb-2">Subcategory</h4>
								<select
									className={selectClassName}
									value={selectedSubcategoryId?.toString() || ""}
									onChange={handleSubcategoryChange}
									disabled={!selectedCategoryId || subcatOptions.length === 0}
								>
									<option value="">Select Subcategory</option>
									{subcatOptions.map((sub) => (
										<option key={sub.id} value={sub.id}>
											{sub.name}
										</option>
									))}
								</select>
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

export default FilterSection;
