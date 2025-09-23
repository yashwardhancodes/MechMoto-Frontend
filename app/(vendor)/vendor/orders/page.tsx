"use client";

import { Eye, Pencil } from "lucide-react";
import { useGetOrdersQuery, useUpdateOrderStatusMutation } from "@/lib/redux/api/partApi";
import { useRouter } from "next/navigation";
import DataTable, { TableColumn, TableAction } from "@/components/SuperDashboard/Table";
import { toast } from "react-hot-toast";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import { useState } from "react";

export default function ManageOrders() {
	const { user } = useAuth();
	const router = useRouter();
	const [updateOrderStatus] = useUpdateOrderStatusMutation();

	// Fetch orders
	const { data, isLoading, isError } = useGetOrdersQuery({});
	const orders = Array.isArray(data) ? data : data?.data ?? [];

	// State for status update dropdown
	const [selectedStatus, setSelectedStatus] = useState<{ [key: number]: string }>({});

	// Define table columns
	const columns: TableColumn[] = [
		{
			key: "id",
			header: "Order ID",
		},
		{
			key: "user.profiles.full_name",
			header: "Customer",
			render: (value) => value.user?.profiles?.full_name || "N/A",
		},
		{
			key: "total_amount",
			header: "Total Amount",
			render: (value) => `₹${value.total_amount?.toLocaleString() || "N/A"}`,
		},
		{
			key: "discount_amount",
			header: "Discount",
			render: (value) => `₹${value.discount_amount?.toLocaleString() || "0"}`,
		},
		{
			key: "final_amount",
			header: "Final Amount",
			render: (value) => `₹${value.final_amount?.toLocaleString() || "N/A"}`,
		},
		{
			key: "payment_status",
			header: "Payment Status",
		},
		{
			key: "payment_method",
			header: "Payment Method",
		},
		{
			key: "status",
			header: "Order Status",
			render: (value) =>
				user?.role.name === ROLES.VENDOR || user?.role.name === ROLES.SUPER_ADMIN ? (
					<select
						value={selectedStatus[value.id] || value.status}
						onChange={(e) => {
							const newStatus = e.target.value;
							setSelectedStatus((prev) => ({ ...prev, [value.id]: newStatus }));
							updateOrderStatus({ id: value.id, status: newStatus })
								.unwrap()
								.then(() => toast.success("Order status updated successfully!"))
								.catch((error) => toast.error("Failed to update order status."));
						}}
						className="border rounded p-1"
					>
						<option value="pending">Pending</option>
						<option value="confirmed">Confirmed</option>
						<option value="shipped">Shipped</option>
						<option value="delivered">Delivered</option>
						<option value="cancelled">Cancelled</option>
					</select>
				) : (
					value.status
				),
		},
		{
			key: "created_at",
			header: "Created At",
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
					router.push(`/vendor/manage-orders/view/${order.id}`);
				} else {
					console.error("Invalid order ID for view:", order);
				}
			},
			tooltip: "View order",
		},
	];

	return (
		<DataTable
			title="Manage Orders"
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
				nameKey: "user.profiles.full_name",
				subtitleKey: "id",
				getAvatarUrl: () => "/placeholder.png", // Replace with actual avatar if available
				getAvatarAlt: (item) => item.user?.profiles?.full_name || "Order",
			}}
		/>
	);
}
