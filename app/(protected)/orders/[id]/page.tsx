"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useGetOrderQuery } from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";
import { toast } from "react-hot-toast";
import {
	ArrowLeft,
	Package,
	MapPin,
	CreditCard,
	Calendar,
	Truck,
	CheckCircle,
	Clock,
	AlertCircle,
	Copy,
	Eye,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

export default function OrderDetails() {
	const { user } = useAuth();
	const router = useRouter();
	const params = useParams();
	const orderId = params.id as string;

	// Fetch order details
	const { data, isLoading, isError } = useGetOrderQuery(orderId);
	const order = data?.data;

	// Redirect to login if not authenticated
	if (!user) {
		router.push("/login");
		return null;
	}

	// Handle loading and error states
	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600">Loading order details...</p>
				</div>
			</div>
		);
	}

	if (isError || !order) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<p className="text-red-600 font-medium">Failed to load order details.</p>
					<button
						onClick={() => router.push("/orders")}
						className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
					>
						Back to Orders
					</button>
				</div>
			</div>
		);
	}

	const formatAddress = (address: any) =>
		address
			? `${address.address_line1}, ${
					address.address_line2 ? address.address_line2 + ", " : ""
			  }${address.city}, ${address.state} ${address.zip}, ${address.country}`
			: "N/A";

	const getStatusConfig = (status: any) => {
		const configs = {
			pending: {
				bg: "bg-amber-50",
				border: "border-amber-200",
				text: "text-amber-700",
				icon: Clock,
				label: "Pending",
			},
			confirmed: {
				bg: "bg-blue-50",
				border: "border-blue-200",
				text: "text-blue-700",
				icon: CheckCircle,
				label: "Confirmed",
			},
			shipped: {
				bg: "bg-purple-50",
				border: "border-purple-200",
				text: "text-purple-700",
				icon: Truck,
				label: "Shipped",
			},
			delivered: {
				bg: "bg-green-50",
				border: "border-green-200",
				text: "text-green-700",
				icon: CheckCircle,
				label: "Delivered",
			},
			cancelled: {
				bg: "bg-red-50",
				border: "border-red-200",
				text: "text-red-700",
				icon: AlertCircle,
				label: "Cancelled",
			},
			paid: {
				bg: "bg-green-50",
				border: "border-green-200",
				text: "text-green-700",
				icon: CheckCircle,
				label: "Paid",
			},
			in_transit: {
				bg: "bg-blue-50",
				border: "border-blue-200",
				text: "text-blue-700",
				icon: Truck,
				label: "In Transit",
			},
		};
		return configs[status as keyof typeof configs] || configs.pending;
	};

	const StatusBadge = ({ status, size = "md" }: {status: string, size?: "sm" | "md"}) => {
		const config = getStatusConfig(status);
		const Icon = config.icon;
		const sizeClasses = size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

		return (
			<div
				className={`inline-flex items-center gap-1.5 rounded-lg font-medium ${config.bg} ${config.border} ${config.text} border ${sizeClasses}`}
			>
				<Icon className="w-3.5 h-3.5" />
				{config.label}
			</div>
		);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Order ID copied to clipboard!");
	};

	return (
		<div className="mt-16">
			<Toaster position="top-right" />
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					{/* Header */}
					<div className="flex items-center gap-4 mb-8">
						<button
							onClick={() => router.push("/orders")}
							className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200"
						>
							<ArrowLeft className="w-5 h-5 text-slate-600" />
						</button>
						<div className="flex-1">
							<h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
								Order Details
							</h1>
							<p className="text-slate-600">Track and manage your order</p>
						</div>
					</div>

					{/* Order Header Card */}
					<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
						<div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
									<Package className="w-6 h-6 text-white" />
								</div>
								<div>
									<div className="flex items-center gap-2 mb-1">
										<h2 className="text-xl font-semibold text-slate-900">
											#{order.id}
										</h2>
										<button
											onClick={() => copyToClipboard(order.id)}
											className="p-1 hover:bg-slate-100 rounded transition-colors"
										>
											<Copy className="w-4 h-4 text-slate-400" />
										</button>
									</div>
									<p className="text-slate-600 text-sm">
										Placed on{" "}
										{new Date(order.created_at).toLocaleDateString("en-IN", {
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</p>
								</div>
							</div>
							<StatusBadge status={order.status} />
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Content */}
						<div className="lg:col-span-2 space-y-6">
							{/* Order Items */}
							<div className="bg-white rounded-2xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-100">
									<h3 className="text-lg font-semibold text-slate-900">
										Order Items
									</h3>
								</div>
								<div className="p-6">
									<div className="space-y-4">
										{order.order_items && order.order_items.length > 0 ? (
											order.order_items.map((item: any, index: any) => (
												<div
													key={item.id}
													className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
												>
													<img
														src={
															item.part?.image_urls?.[0] ||
															"https://via.placeholder.com/150"
														}
														alt={item.part?.subcategory?.name || "Item"}
														className="w-16 h-16 object-cover rounded-lg bg-white border border-slate-200"
													/>
													<div className="flex-1">
														<h4 className="font-medium text-slate-900 mb-1">
															{item.part?.subcategory?.name ||
																"Unknown Item"}
														</h4>
														<div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
															<span>Qty: {item.quantity}</span>
															<span>•</span>
															<span>
																₹
																{item.price.toLocaleString("en-IN")}
															</span>
														</div>
														{item.discount_amount > 0 && (
															<div className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md text-xs font-medium mb-2">
																<span>
																	You saved ₹
																	{item.discount_amount.toLocaleString(
																		"en-IN",
																	)}
																</span>
															</div>
														)}
														<div className="text-base font-semibold text-slate-900">
															₹{item.subtotal.toLocaleString("en-IN")}
														</div>
													</div>
												</div>
											))
										) : (
											<div className="text-center py-8 text-slate-500">
												<Package className="w-12 h-12 mx-auto mb-3 text-slate-300" />
												<p>No items found in this order.</p>
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Shipment Tracking */}
							{order.shipments && order.shipments.length > 0 && (
								<div className="bg-white rounded-2xl shadow-sm border border-slate-200">
									<div className="p-6 border-b border-slate-100">
										<h3 className="text-lg font-semibold text-slate-900">
											Shipment Tracking
										</h3>
									</div>
									<div className="p-6">
										{order.shipments.map((shipment: any) => (
											<div key={shipment.id} className="space-y-4">
												<div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
													<div className="flex items-center gap-3">
														<div className="p-2 bg-white rounded-lg">
															<Truck className="w-5 h-5 text-blue-600" />
														</div>
														<div>
															<p className="font-medium text-slate-900">
																{shipment.carrier || "N/A"}
															</p>
															<p className="text-sm text-slate-600">
																Tracking:{" "}
																{shipment.tracking_number || "N/A"}
															</p>
														</div>
													</div>
													<StatusBadge
														status={shipment.status}
														size="sm"
													/>
												</div>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
													{shipment.shipped_at && (
														<div className="flex items-center gap-2">
															<Calendar className="w-4 h-4 text-slate-400" />
															<span className="text-slate-600">
																Shipped:
															</span>
															<span className="font-medium">
																{new Date(
																	shipment.shipped_at,
																).toLocaleDateString("en-IN")}
															</span>
														</div>
													)}
													{shipment.estimated_delivery && (
														<div className="flex items-center gap-2">
															<Clock className="w-4 h-4 text-slate-400" />
															<span className="text-slate-600">
																Est. Delivery:
															</span>
															<span className="font-medium">
																{new Date(
																	shipment.estimated_delivery,
																).toLocaleDateString("en-IN")}
															</span>
														</div>
													)}
												</div>
												{shipment.tracking_number && (
													<button className="w-full p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-medium flex items-center justify-center gap-2">
														<Eye className="w-4 h-4" />
														Track Package
													</button>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							{/* Addresses */}
							<div className="bg-white rounded-2xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-100">
									<h3 className="text-lg font-semibold text-slate-900">
										Delivery Information
									</h3>
								</div>
								<div className="p-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-3">
											<div className="flex items-center gap-2 text-slate-900 font-medium">
												<MapPin className="w-4 h-4 text-blue-600" />
												Shipping Address
											</div>
											<div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
												<p className="text-slate-700 leading-relaxed">
													{formatAddress(order.shipping_address)}
												</p>
											</div>
										</div>
										<div className="space-y-3">
											<div className="flex items-center gap-2 text-slate-900 font-medium">
												<CreditCard className="w-4 h-4 text-green-600" />
												Billing Address
											</div>
											<div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
												<p className="text-slate-700 leading-relaxed">
													{formatAddress(order.billing_address)}
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Order Summary */}
							<div className="bg-white rounded-2xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-100">
									<h3 className="text-lg font-semibold text-slate-900">
										Order Summary
									</h3>
								</div>
								<div className="p-6 space-y-4">
									<div className="space-y-3">
										<div className="flex justify-between text-slate-600">
											<span>Subtotal</span>
											<span>
												₹{order.total_amount.toLocaleString("en-IN")}
											</span>
										</div>
										{order.discount_amount > 0 && (
											<div className="flex justify-between text-green-600">
												<span>Discount</span>
												<span>
													-₹
													{order.discount_amount.toLocaleString("en-IN")}
												</span>
											</div>
										)}
										<div className="border-t border-slate-100 pt-3">
											<div className="flex justify-between text-lg font-semibold text-slate-900">
												<span>Total</span>
												<span>
													₹{order.final_amount.toLocaleString("en-IN")}
												</span>
											</div>
										</div>
									</div>

									{order.coupon && (
										<div className="p-3 bg-green-50 rounded-lg border border-green-200">
											<div className="flex items-center gap-2 text-green-700 text-sm font-medium">
												<CheckCircle className="w-4 h-4" />
												Coupon Applied: {order.coupon.code}
											</div>
											<p className="text-green-600 text-xs mt-1">
												{order.coupon.discount_type === "percentage"
													? `${order.coupon.discount_value}% off`
													: `₹${order.coupon.discount_value} off`}
											</p>
										</div>
									)}
								</div>
							</div>

							{/* Payment Info */}
							<div className="bg-white rounded-2xl shadow-sm border border-slate-200">
								<div className="p-6 border-b border-slate-100">
									<h3 className="text-lg font-semibold text-slate-900">
										Payment Details
									</h3>
								</div>
								<div className="p-6 space-y-4">
									<div className="flex items-center justify-between">
										<span className="text-slate-600">Payment Status</span>
										<StatusBadge status={order.payment_status} size="sm" />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-slate-600">Method</span>
										<span className="font-medium text-slate-900">
											{order.payment_method || "N/A"}
										</span>
									</div>
									<div className="p-3 bg-slate-50 rounded-lg">
										<p className="text-xs text-slate-500">
											Your payment has been processed securely. You will
											receive a receipt via email.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
