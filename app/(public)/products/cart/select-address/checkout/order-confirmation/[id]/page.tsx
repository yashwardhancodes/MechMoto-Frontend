// src/app/products/cart/select-address/checkout/order-confirmation/[id]/page.tsx (Updated OrderConfirmation with integration)
"use client";

import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { useGetOrderQuery } from "@/lib/redux/api/partApi";

interface Part {
	id: number;
	subcategory?: { name: string };
	image_urls: string[];
}

interface OrderItem {
	id: number;
	quantity: number;
	price: number;
	part: Part;
}

interface Order {
	id: string;
	status: string;
	created_at: string;
	order_items: OrderItem[];
}




export default function OrderConfirmation() {
	const { id } = useParams();
	const router = useRouter();
	const { data: orderData, isLoading, error } = useGetOrderQuery(id);

	if (isLoading) return <div className="p-6">Loading order...</div>;
	if (error || !orderData) return <div className="p-6 text-red-600">Failed to load order.</div>;

	const order: Order = orderData.data;

	return (
		<div className="mx-auto px-4 py-10">
			<div className="bg-white shadow-sm rounded-2xl p-6 text-center">
				<div className="flex justify-between items-center">
					<div className="flex flex-col items-start">
						<h2 className="text-xl font-semibold text-gray-800">Order Placed</h2>
						<p className="text-gray-500 mt-2">
							Order ID: {order.id} | {new Date(order.created_at).toLocaleString()}
						</p>
					</div>
					<span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
						{order.status}
					</span>
				</div>

				<div className="my-6">
					<Image
						src="/assets/success.png"
						alt="Success"
						className="mx-auto size-44"
						width={176}
						height={176}
					/>
					<h3 className="text-lg font-medium mt-2">Order is Placed</h3>
				</div>

				<div className="flex items-center justify-center space-x-6 mt-6">
					<div className="flex flex-col items-center">
						<span className="w-6 h-6 rounded-full bg-[#9AE144] flex items-center justify-center text-white">
							✓
						</span>
						<p className="text-xs mt-2">Placed</p>
					</div>
					<div className="w-20 h-1 bg-gray-200"></div>
					<div className="flex flex-col items-center">
						<span className="w-6 h-6 rounded-full border border-gray-300"></span>
						<p className="text-xs mt-2">Shipped</p>
					</div>
					<div className="w-20 h-1 bg-gray-200"></div>
					<div className="flex flex-col items-center">
						<span className="w-6 h-6 rounded-full border border-gray-300"></span>
						<p className="text-xs mt-2">Delivered</p>
					</div>
				</div>
			</div>

			<div className="bg-white shadow rounded-2xl p-6 mt-8">
				<h3 className="text-lg font-semibold mb-4">Items</h3>
				<div className="divide-y">
					{order.order_items.map((item: OrderItem) => (
						<div key={item.id} className="flex justify-between py-3">
							<div className="flex items-center space-x-3">
								<Image
									src={
										item.part.image_urls[0] || "https://via.placeholder.com/150"
									}
									alt={item.part.subcategory?.name || "Part Image"}
									className="w-12 h-12 rounded-lg object-cover"
									width={100}
									height={100}
								/>
								<div>
									<p className="font-medium text-gray-800">
										{item.part.subcategory?.name}
									</p>
									<p className="text-gray-500 text-sm">
										Rs.{item.price.toFixed(2)}
									</p>
								</div>
							</div>
							<p className="text-gray-600">{item.quantity}x</p>
						</div>
					))}
				</div>
			</div>

			<div className="flex justify-center gap-4 mt-8">
				<button
					onClick={() => router.push("/orders")}
					className="px-6 py-2 bg-[#9AE144] text-black rounded-full hover:bg-[#89CC33] transition"
				>
					Track Order
				</button>
				<button
					onClick={() => router.push("/")}
					className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition"
				>
					Continue Shopping
				</button>
			</div>
		</div>
	);
}
