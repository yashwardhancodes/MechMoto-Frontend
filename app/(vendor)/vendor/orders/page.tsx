"use client";

import { Eye, Truck, XCircle } from "lucide-react";
import { useGetOrdersQuery } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";

export default function ManageOrders() {
	const { user } = useAuth();
	const router = useRouter();
	const { data: ordersData, isLoading, isError } = useGetOrdersQuery({});

	// Log API data for debugging
	console.log("API orders data:", ordersData);

	// Safely extract orders array and filter for vendor-specific orders
	const orders = ordersData?.data;

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "id",
			header: "Order ID",
			render: (value) => `#${value.id}`,
		},
		{
			key: "user",
			header: "Customer",
			render: (value) => value.user?.profiles?.full_name || value.user?.email || "N/A",
		},
		{
			key: "order_items",
			header: "Parts Ordered",
			render: (value) => {
				const vendorItems = value.order_items;
				return (
					<div className="flex flex-col gap-1">
						{vendorItems.map((item: any) => (
							<div key={item.id} className="flex items-center gap-2">
								<img
									src={item.part?.image_urls?.[0] || "/placeholder.png"}
									alt={item.part?.part_number}
									className="size-8 rounded-full object-cover"
								/>
								<span>
									{item.part?.part_number} (Qty: {item.quantity})
								</span>
							</div>
						))}
					</div>
				);
			},
		},
		{
			key: "total_amount",
			header: "Total Amount",
			render: (value) => `₹${value.total_amount.toLocaleString()}`,
		},
		{
			key: "discount_amount",
			header: "Discount",
			render: (value) =>
				value.discount_amount > 0 ? `₹${value.discount_amount.toLocaleString()}` : "-",
		},
		{
			key: "final_amount",
			header: "Final Amount",
			render: (value) => `₹${value.final_amount.toLocaleString()}`,
		},
		{
			key: "status",
			header: "Order Status",
			render: (value) => (
				<span
					className={`capitalize ${
						value.status === "delivered"
							? "text-green-600"
							: value.status === "cancelled"
							? "text-red-600"
							: "text-yellow-600"
					}`}
				>
					{value.status}
				</span>
			),
		},
		{
			key: "payment_status",
			header: "Payment Status",
			render: (value) => (
				<span
					className={`capitalize ${
						value.payment_status === "completed" ? "text-green-600" : "text-yellow-600"
					}`}
				>
					{value.payment_status}
				</span>
			),
		},
		{
			key: "created_at",
			header: "Order Date",
			render: (value) => new Date(value.created_at).toLocaleDateString(),
		},
	];

	// Define table actions
	const actions: TableAction[] = [
		{
			icon: Eye,
			onClick: (order) => {
				console.log("View order:", order);
				if (order?.id && typeof order.id === "number") {
					router.push(`/vendor/orders/${order.id}`);
				} else {
					console.error("Invalid order ID for view:", order);
				}
			},
			tooltip: "View order details",
		},
		{
			icon: Truck,
			onClick: (order) => {
				console.log("Update shipment for order:", order);
				if (order?.id && typeof order.id === "number") {
					router.push(`/vendor/manage-orders/shipment/${order.id}`);
				} else {
					console.error("Invalid order ID for shipment:", order);
				}
			},
			tooltip: "Update shipment status",
		},
		{
			icon: XCircle,
			onClick: async (order) => {
				console.log("Cancel order:", order);
				if (order?.id && typeof order.id === "number") {
					try {
						// Assuming an endpoint exists to cancel an order
						await fetch(
							`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/cancel`,
							{
								method: "PATCH",
								headers: {
									Authorization: `Bearer ${user?.token}`,
									"Content-Type": "application/json",
								},
								body: JSON.stringify({ status: "cancelled" }),
							},
						);
						toast.success("Order cancelled successfully!");
					} catch (error) {
						console.error("Error cancelling order:", error);
						toast.error("Failed to cancel order. Please try again.");
					}
				} else {
					console.error("Invalid order ID for cancel:", order);
				}
			},
			tooltip: "Cancel order",
		},
	];

	return (
		<DataTable
			title="Vendor Orders"
			data={orders}
			columns={columns}
			actions={actions}
			isLoading={isLoading}
			isError={isError}
			emptyMessage="No orders found."
			errorMessage="Failed to load orders."
			loadingMessage="Loading orders..."
			avatarConfig={{
				enabled: true,
				nameKey: "id",
				subtitleKey: "user.profiles.full_name",
				getAvatarUrl: (item) =>
					item.order_items.part
						?.image_urls?.[0] || "/placeholder.png",
				getAvatarAlt: (item) => `#${item.id}`,
			}}
		/>
	);
}
