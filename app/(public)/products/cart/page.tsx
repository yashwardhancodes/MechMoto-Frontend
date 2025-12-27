"use client";
import React, { useState } from "react";
import { ShoppingCart, Plus, Minus, Trash } from "lucide-react";
import { FaCheck } from "react-icons/fa";
import TrendingProducts from "@/components/TrendingProducts";
import { useRouter } from "next/navigation";
import CheckoutPopup from "@/components/PopUp/CheckoutPopup";
import Image from "next/image";
import {
	useGetCartItemsQuery,
	useUpdateCartItemMutation,
	useRemoveFromCartMutation,
} from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";

interface Discount {
	discount_value: number;
}

interface Subcategory {
	name: string;
}

interface Part {
	id: number;
	price: number;
	image_urls: string[];
	subcategory?: Subcategory;
	discount?: Discount;
}

interface CartItem {
	id: number;
	quantity: number;
	part: Part;
}


const Page: React.FC = () => {
	const router = useRouter();
	const { isLoggedIn } = useAuth();
	const [toggle, setToggle] = useState(false);

	// Fetch cart items
	const {
		data: cartItemsData,
		isLoading,
		error,
	} = useGetCartItemsQuery(undefined, {
		skip: !isLoggedIn,
	});
	const [updateCartItem] = useUpdateCartItemMutation();
	const [removeFromCart] = useRemoveFromCartMutation();

	const cartItems: CartItem[] = cartItemsData?.data || [];

	const updateQuantity = async (id: number, change: number) => {
		const cartItem = cartItems.find((item) => item.id === id);
		if (!cartItem) return;

		const newQuantity = Math.max(0, cartItem.quantity + change);
		if (newQuantity === 0) {
			await removeFromCart(id.toString());

		} else {
			await updateCartItem({ id: id.toString(), quantity: newQuantity });
		}
	};

	const removeItem = async (id: number) => {
		await removeFromCart(id.toString());
	};

	const itemsTotal = cartItems.reduce(
		(sum: number, item: CartItem) => sum + item.part.price * item.quantity,
		0,
	);
	const deliveryFee = 5.78;
	const subtotal = itemsTotal + deliveryFee;

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (error) {
		return <div className="p-6 text-red-600">Failed to load cart items.</div>;
	}

	return (
		<div className="">
			{/* Free Delivery Banner */}
			<div className="flex items-center gap-2 mb-4 ml-6 text-[#9AE144] font-medium text-sm">
				<div className="bg-[#9AE144] rounded p-1 flex items-center justify-center">
					<FaCheck className="text-black text-xs" />
				</div>
				<p>
					Free Delivery Unlocked,
					<span className="font-semibold"> apply coupon to avail</span>
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
				{/* Cart Section */}
				<div className="lg:col-span-2">
					<div className="bg-white rounded-xl border border-[rgba(0,0,0,0.14)] p-6 mb-6">
						<div className="space-y-4">
							<div className="text-sm font-medium text-gray-600 mb-4">Cart Items</div>
							{cartItems.map((item: CartItem) => (
								<div
									key={item.id}
									className="flex items-center justify-between py-4 border-b border-[rgba(0,0,0,0.14)] last:border-b-0"
								>
									{/* Mobile Layout */}
									<div className="flex items-center justify-between w-full sm:hidden">
										<div className="flex items-center">
											<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3 text-2xl">
												<Image
													src={
														item.part.image_urls[0] ||
														"https://via.placeholder.com/150"
													}
													alt={item.part.subcategory?.name || "Part Image"}
													width={100}
													height={100}
													className="w-full h-full object-contain"
												/>
											</div>
											<div>
												<h3 className="font-medium text-xs text-gray-900">
													{item.part.subcategory?.name || "Unknown Part"}
												</h3>
												<div className="flex items-center space-x-1 mt-1">
													<span className="text-[#9AE144] font-semibold text-sm">
														Rs.{item.part.price.toFixed(2)}
													</span>
													{item.part.discount && (
														<span className="text-gray-400 line-through text-xs">
															Rs.
															{(
																item.part.price /
																(1 -
																	item.part.discount
																		.discount_value)
															).toFixed(2)}
														</span>
													)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-2 justify-center space-y-2">
											<div className="flex items-center bg-[rgba(248,247,248,1)] rounded-full px-1 py-1 space-x-1">
												<button
													onClick={() => updateQuantity(item.id, -1)}
													className="size-4 md:size-7 rounded-full bg-white flex items-center justify-center shadow-sm"
												>
													<Minus className="size-3 text-black" />
												</button>
												<span className="w-8 text-center font-medium text-black text-sm">
													{item.quantity}
												</span>
												<button
													onClick={() => updateQuantity(item.id, 1)}
													className="size-4 md:size-7 rounded-full bg-[#9AE144] flex items-center justify-center text-white"
												>
													<Plus className="size-3" />
												</button>
											</div>
											<button
												onClick={() => removeItem(item.id)}
												className="text-gray-700"
											>
												<Trash className="size-4" />
											</button>
										</div>
									</div>

									{/* Desktop/Tablet Layout */}
									<div className="hidden sm:flex items-center flex-1">
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4 text-2xl">
											<Image
												src={
													item.part.image_urls[0] ||
													"https://via.placeholder.com/150"
												}
												alt={item.part.subcategory?.name || "Part Image"}
												width={100}
												height={100}
												className="w-full h-full object-contain"
											/>
										</div>
										<div className="flex-1">
											<h3 className="font-medium text-gray-900 mb-1">
												{item.part.subcategory?.name || "Unknown Part"}
											</h3>
											<div className="flex items-center space-x-2">
												<span className="text-[#9AE144] font-semibold">
													Rs.{item.part.price.toFixed(2)}
												</span>
												{item.part.discount && (
													<span className="text-gray-400 line-through text-sm">
														Rs.
														{(
															item.part.price /
															(1 - item.part.discount.discount_value)
														).toFixed(2)}
													</span>
												)}
											</div>
										</div>
									</div>
									<div className="hidden sm:flex items-center space-x-4">
										<div className="flex items-center bg-[rgba(248,247,248,1)] rounded-full px-2 py-1 space-x-4">
											<button
												onClick={() => updateQuantity(item.id, -1)}
												className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:bg-gray-100"
											>
												<Minus className="size-4 text-black" />
											</button>
											<span className="w-6 text-center font-medium text-black">
												{item.quantity}
											</span>
											<button
												onClick={() => updateQuantity(item.id, 1)}
												className="w-10 h-10 rounded-full bg-[#9AE144] flex items-center justify-center text-white hover:bg-[#89CC33] shadow-sm"
											>
												<Plus className="size-4" />
											</button>
										</div>
										<button
											onClick={() => removeItem(item.id)}
											className="bg-[#E9F8CF] text-[#9AE144] px-3 py-1 rounded-full text-xs font-medium"
										>
											Remove
										</button>
										<div className="text-right min-w-16">
											<div className="font-semibold">
												Rs.{(item.part.price * item.quantity).toFixed(2)}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Footer Buttons */}
						<div className="flex border-t pt-3 border-[rgba(0,0,0,0.14)] justify-between items-center mt-6">
							<h1 className="text-black text-xs md:text-base pl-6 font-semibold">
								Missed Something?
							</h1>
							<button
								onClick={() => router.push("/")}
								className="bg-[#9AE144] flex gap-2 md:text-base text-xs items-center px-4 md:px-6 py-1.5 md:py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
							>
								<Plus className="text-black size-3 md:size-4" />
								Add More Items
							</button>
						</div>
					</div>
				</div>

				{/* Order Summary */}
				<div className="lg:col-span-1">
					<div className="bg-white rounded-xl border border-[rgba(0,0,0,0.14)] p-6 px-8 sticky top-4">
						<div className="w-full h-1 bg-gray-100 rounded-full mb-3">
							<div className="h-1 bg-[#9AE144] rounded-full w-1/3"></div>
						</div>
						<p className="text-sm text-gray-600 mb-4">
							Free delivery + saving <span className="font-medium">$3.00</span> on
							this order
						</p>
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
						<div className="space-y-3 mb-6">
							<div className="flex justify-between text-gray-600">
								<span>Items total</span>
								<span className="text-black">Rs.{itemsTotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-gray-600">
								<span>Delivery fee</span>
								<span className="text-black">Rs.{deliveryFee.toFixed(2)}</span>
							</div>
							<div className="border-t border-[rgba(0,0,0,0.14)] pt-3">
								<div className="flex justify-between">
									<span className="font-semibold">Subtotal</span>
									<span className="font-semibold">Rs.{subtotal.toFixed(2)}</span>
								</div>
							</div>
						</div>
						<button
							onClick={() => setToggle(true)}
							className="w-full bg-[#9AE144] hover:bg-[#89CC33] text-black font-medium py-3 rounded-full transition flex items-center justify-between px-6"
						>
							<div className="flex items-center">
								<ShoppingCart className="w-5 h-5 mr-2" />
								Checkout
							</div>
							<span className="font-semibold">Rs.{subtotal.toFixed(2)}</span>
						</button>
					</div>
				</div>

				<div className="lg:col-span-3">
					<TrendingProducts />
				</div>
			</div>

			{toggle && <CheckoutPopup onClose={() => setToggle(false)} />}
		</div>
	);
};

export default Page;
