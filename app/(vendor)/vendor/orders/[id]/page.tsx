"use client";

import { useRouter, useParams } from "next/navigation";
import { useGetOrderQuery } from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import { Truck, XCircle, ArrowLeft } from "lucide-react";
import { ROLES } from "@/constants/roles";

export default function ManageSingleOrder() {
	const { user } = useAuth();
	const router = useRouter();
	const { id } = useParams(); // Get order ID from URL
	const { data: orderData, isLoading, isError } = useGetOrderQuery(id);
    const order = orderData?.data;
	// Handle loading and error states
	if (isLoading) {
		return <div className="p-6 text-gray-500">Loading order...</div>;
	}
	if (isError || !order) {
		return <div className="p-6 text-red-500">Failed to load order.</div>;
	}

	// Filter order items to show only those from the current vendor
	const vendorItems =
		order.order_items || [];

	// Handle shipment update
	const handleUpdateShipment = async () => {
		try {
			// Assuming a shipment update endpoint exists
			await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/shipments/${order.id}`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "shipped" }), // Example: update to "shipped"
			});
			toast.success("Shipment status updated successfully!");
		} catch (error) {
			console.error("Error updating shipment:", error);
			toast.error("Failed to update shipment status.");
		}
	};

	// Handle order cancellation
	const handleCancelOrder = async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}/cancel`, {
				method: "PATCH",
				headers: {
					Authorization: `Bearer ${user?.token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ status: "cancelled" }),
			});
			toast.success("Order cancelled successfully!");
			router.push("/vendor/manage-orders");
		} catch (error) {
			console.error("Error cancelling order:", error);
			toast.error("Failed to cancel order.");
		}
	};

	return (
		<div className="p-6 bg-white rounded shadow-sm max-w-4xl mx-auto">
			{/* Header */}
			<div className="flex justify-between items-center mb-4">
				<div className="flex items-center gap-2">
					<button
						onClick={() => router.push("/vendor/manage-orders")}
						className="text-gray-600 hover:text-gray-800"
					>
						<ArrowLeft className="w-5 h-5" />
					</button>
					<h2 className="text-xl font-semibold">Order #{order.id}</h2>
				</div>
				<div className="flex gap-2">
					<button
						onClick={handleUpdateShipment}
						className="flex items-center bg-[#9AE144] text-white px-3 py-2 rounded gap-2 text-sm"
						disabled={order.status === "cancelled" || order.status === "delivered"}
					>
						<Truck className="w-4 h-4" />
						Update Shipment
					</button>
					<button
						onClick={handleCancelOrder}
						className="flex items-center bg-red-500 text-white px-3 py-2 rounded gap-2 text-sm"
						disabled={order.status === "cancelled" || order.status === "delivered"}
					>
						<XCircle className="w-4 h-4" />
						Cancel Order
					</button>
				</div>
			</div>

			<hr className="mb-4" />

			{/* Order Details */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Customer Information */}
				<div>
					<h3 className="text-lg font-medium mb-2">Customer Details</h3>
					<div className="text-sm text-gray-700 space-y-2">
						<p>
							<strong>Name:</strong>{" "}
							{order.user?.profiles?.full_name || order.user?.email || "N/A"}
						</p>
						<p>
							<strong>Email:</strong> {order.user?.email || "N/A"}
						</p>
					</div>
				</div>

				{/* Order Information */}
				<div>
					<h3 className="text-lg font-medium mb-2">Order Information</h3>
					<div className="text-sm text-gray-700 space-y-2">
						<p>
							<strong>Order Date:</strong>{" "}
							{new Date(order.created_at).toLocaleDateString()}
						</p>
						<p>
							<strong>Status:</strong>{" "}
							<span
								className={`capitalize ${
									order.status === "delivered"
										? "text-green-600"
										: order.status === "cancelled"
										? "text-red-600"
										: "text-yellow-600"
								}`}
							>
								{order.status}
							</span>
						</p>
						<p>
							<strong>Payment Status:</strong>{" "}
							<span
								className={`capitalize ${
									order.payment_status === "completed"
										? "text-green-600"
										: "text-yellow-600"
								}`}
							>
								{order.payment_status}
							</span>
						</p>
						<p>
							<strong>Total Amount:</strong> ₹{order.total_amount.toLocaleString()}
						</p>
						<p>
							<strong>Discount:</strong>{" "}
							{order.discount_amount > 0
								? `₹${order.discount_amount.toLocaleString()}`
								: "-"}
						</p>
						<p>
							<strong>Final Amount:</strong> ₹{order.final_amount.toLocaleString()}
						</p>
					</div>
				</div>
			</div>

			{/* Shipping Address */}
			<div className="mt-6">
				<h3 className="text-lg font-medium mb-2">Shipping Address</h3>
				{order.shipping_address ? (
					<div className="text-sm text-gray-700 space-y-2">
						<p>{order.shipping_address.label || "Shipping Address"}</p>
						<p>{order.shipping_address.address_line1}</p>
						{order.shipping_address.address_line2 && (
							<p>{order.shipping_address.address_line2}</p>
						)}
						<p>
							{order.shipping_address.city}, {order.shipping_address.state},{" "}
							{order.shipping_address.zip}, {order.shipping_address.country}
						</p>
					</div>
				) : (
					<p className="text-sm text-gray-500">No shipping address provided.</p>
				)}
			</div>

			{/* Order Items */}
			<div className="mt-6">
				<h3 className="text-lg font-medium mb-2">Order Items (Vendor Parts)</h3>
				{vendorItems.length > 0 ? (
					<div className="border rounded">
						<table className="w-full text-sm text-left text-gray-700">
							<thead className="font-medium bg-gray-100">
								<tr>
									<th className="px-4 py-2">Part</th>
									<th className="px-4 py-2">Quantity</th>
									<th className="px-4 py-2">Price</th>
									<th className="px-4 py-2">Subtotal</th>
								</tr>
							</thead>
							<tbody>
								{vendorItems.map((item: any) => (
									<tr key={item.id} className="hover:bg-[#9AE144]/20">
										<td className="px-4 py-2">
											<div className="flex items-center gap-2">
												<img
													src={
														item.part?.image_urls?.[0] ||
														"/placeholder.png"
													}
													alt={item.part?.part_number}
													className="size-8 rounded-full object-cover"
												/>
												<div>
													<span className="font-semibold">
														{item.part?.part_number}
													</span>
													<p className="text-xs">
														{item.part?.description}
													</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-2">{item.quantity}</td>
										<td className="px-4 py-2">
											₹{item.price.toLocaleString()}
										</td>
										<td className="px-4 py-2">
											₹{item.subtotal.toLocaleString()}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				) : (
					<p className="text-sm text-gray-500">
						No items from this vendor in this order.
					</p>
				)}
			</div>
		</div>
	);
}
