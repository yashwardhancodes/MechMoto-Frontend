"use client";

import { Plus, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

// Types for the table component
export interface TableColumn {
	key: string;
	header: string;
	render?: (item: any, index: number) => React.ReactNode;
	sortable?: boolean;
	width?: string;
}

export interface TableAction {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	onClick: (item: any, index: number) => void;
	className?: string;
	tooltip?: string;
}

export interface PaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export interface DataTableProps<T> {
	title: string;
	data: T[];
	columns: TableColumn[];
	actions?: TableAction[];
	isLoading?: boolean;
	isError?: boolean;
	addButtonText?: string;
	addButtonPath?: string;
	onAddClick?: () => void;
	showFilters?: boolean;
	pagination?: PaginationProps;
	emptyMessage?: string;
	errorMessage?: string;
	loadingMessage?: string;
	rowClassName?: (item: T, index: number) => string;
	avatarConfig?: {
		enabled: boolean;
		getAvatarUrl?: (item: T) => string;
		getAvatarAlt?: (item: T) => string;
		nameKey?: string;
		subtitleKey?: string;
	};
}

export default function DataTable<
	T extends { id?: string | number; code?: any; image_urls?: any; part_number?: any },
>({
	title,
	data = [],
	columns,
	actions = [],
	isLoading = false,
	isError = false,
	addButtonText,
	addButtonPath,
	onAddClick,
	showFilters = true,
	pagination,
	emptyMessage = "No data available.",
	errorMessage = "Failed to load data.",
	loadingMessage = "Loading...",
	rowClassName,
}: DataTableProps<T>) {
	const router = useRouter();

	const handleAddClick = () => {
		if (onAddClick) {
			onAddClick();
		} else if (addButtonPath) {
			router.push(addButtonPath);
		}
	};

	const defaultRowClassName = () => "hover:bg-[#9AE144]/20";
	const getRowClassName = rowClassName || defaultRowClassName;

	const renderCellContent = (item: T, column: TableColumn, index: number) => {
		if (column.render) return column.render(item, index);

		const value = column.key.split(".").reduce<unknown>((obj, key) => {
			if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[key];
			return undefined;
		}, item);

		return value !== undefined && value !== null ? String(value) : "-";
	};

	const getPageNumbers = (currentPage: number, totalPages: number): (number | string)[] => {
		const pageNumbers: (number | string)[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) {
				pageNumbers.push(i);
			}
		} else {
			if (currentPage <= 4) {
				for (let i = 1; i <= 5; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			} else if (currentPage >= totalPages - 3) {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = totalPages - 4; i <= totalPages; i++) {
					pageNumbers.push(i);
				}
			} else {
				pageNumbers.push(1);
				pageNumbers.push("...");
				for (let i = currentPage - 1; i <= currentPage + 1; i++) {
					pageNumbers.push(i);
				}
				pageNumbers.push("...");
				pageNumbers.push(totalPages);
			}
		}
		return pageNumbers;
	};

	if (pagination) {
		const { currentPage, totalPages, totalItems, pageSize, onPageChange } = pagination;
		const pageNumbers = getPageNumbers(currentPage, totalPages);
		const startItem = (currentPage - 1) * pageSize + 1;
		const endItem = Math.min(currentPage * pageSize, totalItems);

		return (
			<div className="p-6 bg-white rounded shadow-sm">
				{/* Header */}
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-semibold">{title}</h2>
					<div className="flex gap-2">
						{(addButtonText || addButtonPath || onAddClick) && (
							<button
								onClick={handleAddClick}
								className="flex items-center font-semibold cursor-pointer text-black px-3 py-2 gap-2 rounded text-sm"
							>
								<div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
									<Plus className="w-4 h-4" />
								</div>
								{addButtonText || "Add Item"}
							</button>
						)}
						{showFilters && (
							<button className="flex items-center">
								<div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
									<SlidersHorizontal className="w-4 h-4" />
								</div>
							</button>
						)}
					</div>
				</div>

				<hr />

				{/* Table Container */}
				<div className="w-full h-[calc(100vh-250px)] pt-2 overflow-y-auto">
					{isLoading ? (
						<p className="text-sm text-gray-500 p-4">{loadingMessage}</p>
					) : isError ? (
						<p className="text-sm text-red-500 p-4">{errorMessage}</p>
					) : data.length === 0 ? (
						<p className="text-sm text-gray-500 p-4">{emptyMessage}</p>
					) : (
						<table className="w-full text-sm text-left text-gray-700">
							<thead className="font-medium">
								<tr>
									{columns.map((column) => (
										<th
											key={column.key}
											className="px-4 py-2"
											style={{ width: column.width || "auto" }}
										>
											{column.header}
										</th>
									))}
									{actions.length > 0 && <th className="px-4 py-2">Actions</th>}
								</tr>
							</thead>
							<tbody>
								{data.map((item, index) => (
									<tr
										key={item.id ?? index}
										className={getRowClassName(item, index)}
									>
										{columns.map((column) => (
											<td key={column.key} className="px-4 py-2">
												{renderCellContent(item, column, index)}
											</td>
										))}
										{actions.length > 0 && (
											<td className="px-4 py-2">
												<div className="flex gap-2 text-gray-600">
													{actions.map((action, actionIndex) => {
														const IconComponent = action.icon;
														return (
															<IconComponent
																key={actionIndex}
																className={`w-4 h-4 cursor-pointer ${
																	action.className || ""
																}`}
																onClick={() =>
																	action.onClick(item, index)
																}
																aria-label={action.tooltip}
															/>
														);
													})}
												</div>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					)}
				</div>

				{/* Pagination */}
				{pagination && totalPages > 1 && (
					<div className="flex justify-between items-center mt-4">
						<p className="text-sm text-gray-500">
							Showing {startItem} to {endItem} of {totalItems} items
						</p>
						<div className="flex items-center gap-1">
							<button
								onClick={() => onPageChange(currentPage - 1)}
								disabled={currentPage <= 1}
								className="px-3 py-1 text-gray-500 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
							>
								Prev
							</button>
							{pageNumbers.map((pageNum, idx) =>
								pageNum === "..." ? (
									<span
										key={idx}
										className="px-2 text-gray-500 flex items-center"
									>
										...
									</span>
								) : (
									<button
										key={idx}
										onClick={() => onPageChange(Number(pageNum))}
										className={`w-8 h-8 rounded-full text-sm transition-colors ${
											pageNum === currentPage
												? "bg-[#9AE144] text-white shadow-sm"
												: "text-[#9AE144] bg-gray-200 hover:bg-gray-300"
										}`}
									>
										{pageNum}
									</button>
								),
							)}
							<button
								onClick={() => onPageChange(currentPage + 1)}
								disabled={currentPage >= totalPages}
								className="px-3 py-1 text-gray-500 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
							>
								Next
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Fallback without pagination
	return (
		<div className="p-6 bg-white rounded shadow-sm">
			{/* Header */}
			<div className="flex justify-between items-center mb-2">
				<h2 className="text-xl font-semibold">{title}</h2>
				<div className="flex gap-2">
					{(addButtonText || addButtonPath || onAddClick) && (
						<button
							onClick={handleAddClick}
							className="flex items-center font-semibold cursor-pointer text-black px-3 py-2 gap-2 rounded text-sm"
						>
							<div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
								<Plus className="w-4 h-4" />
							</div>
							{addButtonText || "Add Item"}
						</button>
					)}
					{showFilters && (
						<button className="flex items-center">
							<div className="flex items-center bg-[#9AE144] text-white p-2 rounded">
								<SlidersHorizontal className="w-4 h-4" />
							</div>
						</button>
					)}
				</div>
			</div>

			<hr />

			{/* Table Container */}
			<div className="w-full h-[calc(100vh-250px)] pt-2 overflow-y-auto">
				{isLoading ? (
					<p className="text-sm text-gray-500 p-4">{loadingMessage}</p>
				) : isError ? (
					<p className="text-sm text-red-500 p-4">{errorMessage}</p>
				) : data.length === 0 ? (
					<p className="text-sm text-gray-500 p-4">{emptyMessage}</p>
				) : (
					<table className="w-full text-sm text-left text-gray-700">
						<thead className="font-medium">
							<tr>
								{columns.map((column) => (
									<th
										key={column.key}
										className="px-4 py-2"
										style={{ width: column.width || "auto" }}
									>
										{column.header}
									</th>
								))}
								{actions.length > 0 && <th className="px-4 py-2">Actions</th>}
							</tr>
						</thead>
						<tbody>
							{data.map((item, index) => (
								<tr key={item.id ?? index} className={getRowClassName(item, index)}>
									{columns.map((column) => (
										<td key={column.key} className="px-4 py-2">
											{renderCellContent(item, column, index)}
										</td>
									))}
									{actions.length > 0 && (
										<td className="px-4 py-2">
											<div className="flex gap-2 text-gray-600">
												{actions.map((action, actionIndex) => {
													const IconComponent = action.icon;
													return (
														<IconComponent
															key={actionIndex}
															className={`w-4 h-4 cursor-pointer ${
																action.className || ""
															}`}
															onClick={() =>
																action.onClick(item, index)
															}
															aria-label={action.tooltip}
														/>
													);
												})}
											</div>
										</td>
									)}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
