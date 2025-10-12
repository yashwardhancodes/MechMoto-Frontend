// New: src/components/ProductListing/FilterItem.tsx (assuming this component; implement if not exists)
"use client";

import React from "react";

interface FilterItemProps {
	title: string;
	options: (string | number)[];
	selected: string[];
	onChange: (value: string | number, checked: boolean) => void;
}

const FilterItem: React.FC<FilterItemProps> = ({ title, options, selected, onChange }) => {
	return (
		<div className="mb-4">
			<h4 className="text-lg font-semibold mb-2">{title}</h4>
			{options.map((option) => {
				const value = String(option);
				const checked = selected.includes(value);
				return (
					<div key={value} className="flex items-center mb-1">
						<input
							type="checkbox"
							id={`${title.toLowerCase()}-${value}`}
							checked={checked}
							onChange={(e) => onChange(option, e.target.checked)}
							className="mr-3 w-5 h-5 rounded appearance-none border border-[#9AE144] checked:bg-[#9AE144] checked:border-[#9AE144] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center"
						/>
						<label
							htmlFor={`${title.toLowerCase()}-${value}`}
							className="text-[14px] font-semibold text-black cursor-pointer"
						>
							{value}
						</label>
					</div>
				);
			})}
		</div>
	);
};

export default FilterItem;
