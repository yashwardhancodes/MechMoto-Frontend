"use client";

import React, { ReactElement } from "react";
import { Eye, Package, Calendar, MapPin, CreditCard, Truck } from "lucide-react";
import { useGetOrdersQuery } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";


interface ShippingAddress {
	label: string;
	address_line1: string;
	city: string;
	state: string;
	zip: string;
}

interface OrderItem {
	id: number;
	name: string;
	quantity: number;
	price: number;
}

interface Order {
	id: number;
	created_at: string;
	final_amount: number;
	payment_method: string;
	payment_status: string;
	status: string;
	order_items: OrderItem[];
	shipping_address?: ShippingAddress;
}


interface TableColumn {
	key: keyof Order | string; // string for custom render keys
	header: string;
	render?: (order: Order) => string | ReactElement;
}

interface TableAction {
	icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
	onClick: (order: Order) => void;
	tooltip: string;
}



export default function ManageOrders() {
	const { user } = useAuth();
	const router = useRouter();

	// Fetch orders
	const { data, isLoading, isError } = useGetOrdersQuery({});
	const orders: Order[] = data ? data.data : [];

	// Helper function to get status colors
	const getStatusStyle = (status: string) => {
		switch (status.toLowerCase()) {
			case "delivered":
				return "bg-emerald-50 text-emerald-700 border border-emerald-200";
			case "confirmed":
				return "bg-blue-50 text-blue-700 border border-blue-200";
			case "pending":
				return "bg-amber-50 text-amber-700 border border-amber-200";
			case "cancelled":
				return "bg-red-50 text-red-700 border border-red-200";
			case "shipped":
				return "bg-purple-50 text-purple-700 border border-purple-200";
			default:
				return "bg-gray-50 text-gray-700 border border-gray-200";
		}
	};

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "id",
			header: "Order ID",
			render: (order) => (
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 bg-[#9AE144]/10 rounded-lg flex items-center justify-center">
						<Package className="w-4 h-4 text-[#9AE144]" />
					</div>
					<span className="font-semibold text-gray-900">#{order.id}</span>
				</div>
			),
		},
		{
			key: "created_at",
			header: "Order Date",
			render: (order) => (
				<div className="flex items-center gap-2 text-gray-600">
					<Calendar className="w-4 h-4 text-gray-400" />
					<div>
						<div className="font-medium">
							{new Date(order.created_at).toLocaleDateString("en-IN", {
								day: "2-digit",
								month: "short",
								year: "numeric",
							})}
						</div>
						<div className="text-xs text-gray-500">
							{new Date(order.created_at).toLocaleTimeString("en-IN", {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</div>
					</div>
				</div>
			),
		},
		{
			key: "final_amount",
			header: "Total Amount",
			render: (order) => (
				<div className="text-right">
					<div className="font-bold text-lg text-gray-900">
						₹
						{order.final_amount.toLocaleString("en-IN", {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</div>
					<div className="text-xs text-gray-500 flex items-center justify-end gap-1">
						<CreditCard className="w-3 h-3" />
						{order.payment_method}
					</div>
				</div>
			),
		},
		{
			key: "status",
			header: "Order Status",
			render: (order) => (
				<div>
					<span
						className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
							order.status,
						)}`}
					>
						{order.status === "confirmed" && <Truck className="w-3 h-3 mr-1" />}
						{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
					</span>
					<div className="text-xs text-gray-500 mt-1">
						Payment: {order.payment_status}
					</div>
				</div>
			),
		},
		{
			key: "items",
			header: "Items",
			render: (order) => (
				<div className="text-center">
					<div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
						<span className="text-sm font-semibold text-gray-700">
							{order.order_items.length}
						</span>
					</div>
					<div className="text-xs text-gray-500 mt-1">
						{order.order_items.length === 1 ? "item" : "items"}
					</div>
				</div>
			),
		},
		{
			key: "shippingAddress",
			header: "Shipping Address",
			render: (order) =>
				order.shipping_address ? (
					<div className="flex items-start gap-2 max-w-xs">
						<MapPin className="w-4 h-4 text-[#9AE144] mt-0.5 flex-shrink-0" />
						<div className="text-sm">
							<div className="font-medium text-gray-900 line-clamp-1">
								{order.shipping_address.label}
							</div>
							<div className="text-gray-600 text-xs line-clamp-2">
								{order.shipping_address.address_line1}
							</div>
							<div className="text-gray-500 text-xs">
								{order.shipping_address.city}, {order.shipping_address.state}{" "}
								{order.shipping_address.zip}
							</div>
						</div>
					</div>
				) : (
					<span className="text-gray-400 italic">No address</span>
				),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Eye,
			onClick: (order) => {
				if (order?.id && typeof order.id === "number") {
					router.push(`/orders/${order.id}`);
				} else {
					console.error("Invalid order ID for view:", order);
					toast.error("Unable to view order details.");
				}
			},
			tooltip: "View order details",
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
								<Package className="text-white size-6" />
							</div>
							<div>
								<h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
									Your Orders
								</h1>
								<p className="text-gray-600 mt-1">
									Track and manage all your orders in one place
								</p>
							</div>
						</div>
						<div className="hidden md:flex items-center gap-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-[#9AE144]">
									{orders.length}
								</div>
								<div className="text-xs text-gray-500 uppercase tracking-wide">
									Total Orders
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
							<div className="text-2xl font-bold text-[#9AE144]">{orders.length}</div>
							<div className="text-sm text-gray-500">Total Orders</div>
						</div>
					</div>
				</div>

				{/* Orders Table/Cards */}
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
													Loading your orders...
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
													<Package className="w-6 h-6 text-red-500" />
												</div>
												<p className="text-red-600 font-medium">
													Failed to load orders
												</p>
												<p className="text-gray-500 text-sm">
													Please try again later
												</p>
											</div>
										</td>
									</tr>
								) : orders.length === 0 ? (
									<tr>
										<td
											colSpan={columns.length + 1}
											className="px-6 py-12 text-center"
										>
											<div className="flex flex-col items-center gap-4">
												<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
													<Package className="w-8 h-8 text-gray-400" />
												</div>
												<div>
													<p className="text-gray-900 font-medium text-lg">
														No orders yet
													</p>
													<p className="text-gray-500 text-sm mt-1">
														Start shopping to see your orders here
													</p>
												</div>
											</div>
										</td>
									</tr>
								) : (
									orders.map((order: Order) => (
										<tr
											key={order.id}
											className="hover:bg-gray-50 transition-colors duration-150"
										>
											{columns.map((column) => (
												<td
													key={column.key}
													className="px-6 py-4 whitespace-nowrap"
												>
													{column.render
														? column.render(order)
														: (order as unknown as Record<string, string | number | undefined>)[column.key] ?? "N/A"}

												</td>
											))}
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex gap-2">
													{actions.map((action, index) => (
														<button
															key={index}
															onClick={() => action.onClick(order)}
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
									<p className="text-gray-500">Loading your orders...</p>
								</div>
							</div>
						) : isError ? (
							<div className="p-6 text-center">
								<div className="flex flex-col items-center gap-3">
									<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
										<Package className="w-6 h-6 text-red-500" />
									</div>
									<p className="text-red-600 font-medium">
										Failed to load orders
									</p>
									<p className="text-gray-500 text-sm">Please try again later</p>
								</div>
							</div>
						) : orders.length === 0 ? (
							<div className="p-6 text-center">
								<div className="flex flex-col items-center gap-4">
									<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
										<Package className="w-8 h-8 text-gray-400" />
									</div>
									<div>
										<p className="text-gray-900 font-medium text-lg">
											No orders yet
										</p>
										<p className="text-gray-500 text-sm mt-1">
											Start shopping to see your orders here
										</p>
									</div>
								</div>
							</div>
						) : (
							<div className="divide-y divide-gray-200">
								{orders.map((order: Order) => (
									<div key={order.id} className="p-4">
										<div className="flex items-start justify-between mb-3">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 bg-[#9AE144]/10 rounded-lg flex items-center justify-center">
													<Package className="w-5 h-5 text-[#9AE144]" />
												</div>
												<div>
													<h3 className="font-semibold text-gray-900">
														Order #{order.id}
													</h3>
													<p className="text-sm text-gray-500">
														{new Date(
															order.created_at,
														).toLocaleDateString("en-IN")}
													</p>
												</div>
											</div>
											<button
												onClick={() => actions[0].onClick(order)}
												className="p-2 rounded-lg hover:bg-[#9AE144]/10 hover:text-[#9AE144] transition-colors text-gray-500"
											>
												<Eye className="w-5 h-5" />
											</button>
										</div>

										<div className="space-y-3">
											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">
													Total Amount
												</span>
												<span className="font-bold text-gray-900">
													₹
													{order.final_amount.toLocaleString("en-IN", {
														minimumFractionDigits: 2,
													})}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">
													Status
												</span>
												<span
													className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(
														order.status,
													)}`}
												>
													{order.status.charAt(0).toUpperCase() +
														order.status.slice(1)}
												</span>
											</div>

											<div className="flex items-center justify-between">
												<span className="text-sm text-gray-600">Items</span>
												<span className="text-sm font-medium text-gray-900">
													{order.order_items.length}{" "}
													{order.order_items.length === 1
														? "item"
														: "items"}
												</span>
											</div>

											{order.shipping_address && (
												<div className="pt-2 border-t border-gray-100">
													<div className="flex items-start gap-2">
														<MapPin className="w-4 h-4 text-[#9AE144] mt-0.5 flex-shrink-0" />
														<div className="text-sm">
															<div className="font-medium text-gray-900">
																{order.shipping_address.label}
															</div>
															<div className="text-gray-600">
																{
																	order.shipping_address
																		.address_line1
																}
															</div>
															<div className="text-gray-500">
																{order.shipping_address.city},{" "}
																{order.shipping_address.state}{" "}
																{order.shipping_address.zip}
															</div>
														</div>
													</div>
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
