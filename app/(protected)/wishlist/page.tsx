"use client";

import React, { ReactElement } from "react";
import { Heart, Eye, Package, Star, Clock, ShoppingCart } from "lucide-react";
import { useGetWishlistsQuery } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

interface TableColumn {
	key: string;
	header: string;
	render?: (value: any) => string | ReactElement;
}

interface TableAction {
	icon: React.ComponentType<any>;
	onClick: (item: any) => void;
	tooltip: string;
}

export default function ManageWishlist() {
	const { user } = useAuth();
	const router = useRouter();

	// Fetch wishlist items
	const { data, isLoading, isError } = useGetWishlistsQuery({});
	const wishlists = data ? data.data : [];

	// Helper function to get availability status colors
	const getAvailabilityStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case "available":
				return "bg-emerald-50 text-emerald-700 border border-emerald-200";
			case "unavailable":
				return "bg-red-50 text-red-700 border border-red-200";
			default:
				return "bg-gray-50 text-gray-700 border border-gray-200";
		}
	};

	// Helper function to get origin status colors
	const getOriginStyle = (origin: string) => {
		switch (origin.toLowerCase()) {
			case "oem":
				return "bg-blue-50 text-blue-700 border border-blue-200";
			case "aftermarket":
				return "bg-purple-50 text-purple-700 border border-purple-200";
			default:
				return "bg-gray-50 text-gray-700 border border-gray-200";
		}
	};

	// Helper function to format date
	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-IN", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "part",
			header: "Part Details",
			render: (wishlist) => (
				<div className="flex items-center gap-3">
					<div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
						{wishlist.part.image_urls && wishlist.part.image_urls.length > 0 ? (
							<img
								src={wishlist.part.image_urls[0]}
								alt={wishlist.part.subcategory?.name || "Part"}
								className="w-full h-full object-cover"
								onError={(e) => {
									e.currentTarget.style.display = 'none';
									e.currentTarget.nextElementSibling.style.display = 'flex';
								}}
							/>
						) : null}
						<div className="w-full h-full bg-[#9AE144]/10 rounded-lg flex items-center justify-center">
							<Package className="w-6 h-6 text-[#9AE144]" />
						</div>
					</div>
					<div className="min-w-0 flex-1">
						<h3 className="font-semibold text-gray-900 truncate">
							{wishlist.part.subcategory?.name || "Unknown Part"}
						</h3>
						<p className="text-sm text-gray-600 truncate">
							{wishlist.part.part_brand?.name || "Unknown Brand"}
						</p>
						<p className="text-xs text-gray-500">
							{wishlist.part.part_number}
						</p>
					</div>
				</div>
			),
		},
		{
			key: "pricing",
			header: "Price & Stock",
			render: (wishlist) => (
				<div className="text-left">
					<div className="font-bold text-lg text-gray-900">
						₹{wishlist.part.price.toLocaleString("en-IN", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</div>
					<p className="text-sm text-gray-600">
						Stock: {wishlist.part.quantity} units
					</p>
				</div>
			),
		},
		{
			key: "status",
			header: "Status & Origin",
			render: (wishlist) => (
				<div className="space-y-2">
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(
							wishlist.part.availability_status,
						)}`}
					>
						{wishlist.part.availability_status.charAt(0).toUpperCase() +
							wishlist.part.availability_status.slice(1)}
					</span>
					<br />
					<span
						className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOriginStyle(
							wishlist.part.origin,
						)}`}
					>
						{wishlist.part.origin.toUpperCase()}
					</span>
				</div>
			),
		},
		{
			key: "added_date",
			header: "Added Date",
			render: (wishlist) => (
				<div className="text-sm text-gray-600">
					<div className="flex items-center gap-1">
						<Clock className="w-4 h-4" />
						{formatDate(wishlist.created_at)}
					</div>
				</div>
			),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Eye,
			onClick: (wishlist) => {
				if (wishlist?.part?.id && typeof wishlist.part.id === "number") {
					router.push(`/products/${wishlist.part.id}`);
				} else {
					console.error("Invalid part ID for view:", wishlist);
					toast.error("Unable to view product details.");
				}
			},
			tooltip: "View product details",
		},
		{
			icon: ShoppingCart,
			onClick: (wishlist) => {
				// Add to cart functionality
				toast.success("Added to cart!");
			},
			tooltip: "Add to cart",
		},
	];

	// Redirect to login if not authenticated
	if (!user) {
		router.push("/login");
		return null;
	}

	return (
		<div className="min-h-screen bg-gray-50 mt-16 mb-20 md:mb-0 lg:mb-0">
			{/* Header Section */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-xl bg-gradient-to-br from-[#9AE144] to-[#7BC935] shadow-lg">
								<Heart className="text-white size-6" />
							</div>
							<div>
								<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
									Your Wishlist
								</h1>
								<p className="text-gray-600 mt-1">
									View and manage all your wishlist items in one place
								</p>
							</div>
						</div>
						<div className="hidden md:flex items-center gap-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-[#9AE144]">
									{wishlists.length}
								</div>
								<div className="text-xs text-gray-500 uppercase tracking-wide">
									Total Items
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Mobile Stats */}
				<div className="md:hidden mb-6">
					<div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
						<div className="text-center">
							<div className="text-2xl font-bold text-[#9AE144]">
								{wishlists.length}
							</div>
							<div className="text-sm text-gray-500">Total Items</div>
						</div>
					</div>
				</div>

				{/* Wishlist Table/Cards */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
					{/* Desktop Table View */}
					<div className="hidden lg:block overflow-x-auto">
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									{columns.map((column) => (
										<th
											key={column.key}
											className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
										>
											{column.header}
										</th>
									))}
									<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{isLoading ? (
									<tr>
										<td
											colSpan={columns.length + 1}
											className="px-6 py-12 text-center"
										>
											<div className="flex flex-col items-center gap-3">
												<div className="animate-spin w-8 h-8 border-4 border-[#9AE144] border-t-transparent rounded-full"></div>
												<p className="text-gray-500">
													Loading your wishlist...
												</p>
											</div>
										</td>
									</tr>
								) : isError ? (
									<tr>
										<td
											colSpan={columns.length + 1}
											className="px-6 py-12 text-center"
										>
											<div className="flex flex-col items-center gap-3">
												<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
													<Heart className="w-6 h-6 text-red-500" />
												</div>
												<p className="text-red-600 font-medium">
													Failed to load wishlist
												</p>
												<p className="text-gray-500 text-sm">
													Please try again later
												</p>
											</div>
										</td>
									</tr>
								) : wishlists.length === 0 ? (
									<tr>
										<td
											colSpan={columns.length + 1}
											className="px-6 py-12 text-center"
										>
											<div className="flex flex-col items-center gap-4">
												<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
													<Heart className="w-8 h-8 text-gray-400" />
												</div>
												<div>
													<p className="text-gray-900 font-medium text-lg">
														No items in wishlist
													</p>
													<p className="text-gray-500 text-sm mt-1">
														Add items to your wishlist to see them here
													</p>
												</div>
											</div>
										</td>
									</tr>
								) : (
									wishlists.map((wishlist: any) => (
										<tr
											key={wishlist.id}
											className="hover:bg-gray-50 transition-colors duration-150"
										>
											{columns.map((column) => (
												<td
													key={column.key}
													className="px-6 py-4 whitespace-nowrap"
												>
													{column.render
														? column.render(wishlist)
														: wishlist[column.key] || "N/A"}
												</td>
											))}
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex gap-2">
													{actions.map((action, index) => (
														<button
															key={index}
															onClick={() => action.onClick(wishlist)}
															title={action.tooltip}
															className="p-2 rounded-lg hover:bg-[#9AE144]/10 hover:text-[#9AE144] transition-colors duration-150 text-gray-500"
														>
															<action.icon className="w-5 h-5" />
														</button>
													))}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* Mobile Card View */}
					<div className="lg:hidden">
						{isLoading ? (
							<div className="p-6 text-center">
								<div className="flex flex-col items-center gap-3">
									<div className="animate-spin w-8 h-8 border-4 border-[#9AE144] border-t-transparent rounded-full"></div>
									<p className="text-gray-500">Loading your wishlist...</p>
								</div>
							</div>
						) : isError ? (
							<div className="p-6 text-center">
								<div className="flex flex-col items-center gap-3">
									<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
										<Heart className="w-6 h-6 text-red-500" />
									</div>
									<p className="text-red-600 font-medium">
										Failed to load wishlist
									</p>
									<p className="text-gray-500 text-sm">Please try again later</p>
								</div>
							</div>
						) : wishlists.length === 0 ? (
							<div className="p-6 text-center">
								<div className="flex flex-col items-center gap-4">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
										<Heart className="w-8 h-8 text-gray-400" />
									</div>
									<div>
										<p className="text-gray-900 font-medium text-lg">
											No items in wishlist
										</p>
										<p className="text-gray-500 text-sm mt-1">
											Add items to your wishlist to see them here
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="divide-y divide-gray-200">
								{wishlists.map((wishlist: any) => (
									<div key={wishlist.id} className="p-4">
										<div className="flex items-start gap-4 mb-4">
											<div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
												{wishlist.part.image_urls && wishlist.part.image_urls.length > 0 ? (
													<img
														src={wishlist.part.image_urls[0]}
														alt={wishlist.part.subcategory?.name || "Part"}
														className="w-full h-full object-cover"
														onError={(e) => {
															e.currentTarget.style.display = 'none';
															e.currentTarget.nextElementSibling.style.display = 'flex';
														}}
													/>
												) : null}
												<div className="w-full h-full bg-[#9AE144]/10 rounded-lg flex items-center justify-center">
													<Package className="w-8 h-8 text-[#9AE144]" />
												</div>
											</div>
											<div className="flex-1 min-w-0">
												<h3 className="font-semibold text-gray-900 mb-1">
													{wishlist.part.subcategory?.name || "Unknown Part"}
												</h3>
												<p className="text-sm text-gray-600 mb-1">
													{wishlist.part.part_brand?.name || "Unknown Brand"}
												</p>
												<p className="text-xs text-gray-500">
													Part: {wishlist.part.part_number}
												</p>
											</div>
											<div className="flex gap-2">
												{actions.map((action, index) => (
													<button
														key={index}
														onClick={() => action.onClick(wishlist)}
														title={action.tooltip}
														className="p-2 rounded-lg hover:bg-[#9AE144]/10 hover:text-[#9AE144] transition-colors text-gray-500"
													>
														<action.icon className="w-5 h-5" />
													</button>
												))}
											</div>
										</div>

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Price</span>
												<span className="font-bold text-gray-900">
													₹{wishlist.part.price.toLocaleString("en-IN", {
														minimumFractionDigits: 2,
													})}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Stock</span>
												<span className="text-sm text-gray-900">
													{wishlist.part.quantity} units
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Status</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityStyle(
														wishlist.part.availability_status,
													)}`}
												>
													{wishlist.part.availability_status
														.charAt(0)
														.toUpperCase() +
														wishlist.part.availability_status.slice(1)}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Origin</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getOriginStyle(
														wishlist.part.origin,
													)}`}
												>
													{wishlist.part.origin.toUpperCase()}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Added</span>
												<span className="text-xs text-gray-500">
													{formatDate(wishlist.created_at)}
												</span>
											</div>

											{wishlist.part.description && (
												<div className="pt-2 border-t border-gray-100">
													<p className="text-sm text-gray-600">
														{wishlist.part.description}
													</p>
												</div>
											)}

											{wishlist.part.remarks && (
												<div className="pt-1">
													<p className="text-xs text-gray-500 italic">
														Note: {wishlist.part.remarks}
													</p>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}