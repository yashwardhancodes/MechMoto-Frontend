"use client";

import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdCreditCard } from "react-icons/md";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/redux/store";
import Image from "next/image";
import {
	useGetAddressesQuery,
	useGetCartItemsQuery,
	useCreateOrderMutation,
} from "@/lib/redux/api/partApi";
import { resetCheckout } from "@/lib/redux/slices/checkoutSlice";
import toast, { Toaster } from "react-hot-toast";
import Script from "next/script";
import { RazorpayOptions } from "@/types";

interface Coupon {
	id: number;
	discount_type: "percentage" | "fixed";
	discount_value: number;
	max_discount?: number;
	min_order_amount?: number;
}

interface Address {
	id: number;
	fullName: string;
	email?: string;
	mobile?: string;
	address_line1: string;
	city: string;
	state: string;
	zip: string;
}

interface Part {
	id: number;
	subcategory?: { name: string };
	image_urls: string[];
	price: number;
}

interface CartItem {
	id: number;
	quantity: number;
	part: Part;
}


export default function Checkout() {
	const router = useRouter();
	const dispatch = useDispatch();
	const { token } = useSelector((state: RootState) => state.auth);
	const selectedAddressId = useSelector((state: RootState) => state.checkout.selectedAddressId);
	const selectedPaymentMethod = useSelector(
		(state: RootState) => state.checkout.selectedPaymentMethod,
	);
	const [couponCode, setCouponCode] = useState("");
	const [couponError, setCouponError] = useState<string | null>(null);
	const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

	const { data: addressesData } = useGetAddressesQuery(undefined);
	const { data: cartItemsData, isLoading: cartLoading } = useGetCartItemsQuery(undefined);
	const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();

	const selectedAddress: Address | undefined = addressesData?.data?.find(
		(addr: Address) => addr.id === selectedAddressId
	);
	const cartItems: CartItem[] = cartItemsData?.data || [];
	const itemsTotal = cartItems?.reduce(
		(sum: number, item: CartItem) => sum + item.part.price * item.quantity,
		0,
	);

	const deliveryFee = 5.78;
	const subtotal = itemsTotal + deliveryFee;

	// Calculate discount and final total
	let discount = 0;
	let finalTotal = subtotal;

	if (appliedCoupon) {
		const { discount_type, discount_value, max_discount, min_order_amount } = appliedCoupon;
		// Check if order meets minimum order amount requirement
		if (min_order_amount && subtotal < min_order_amount) {
			setCouponError(`Order must be at least ₹${min_order_amount} to apply this coupon`);
			setAppliedCoupon(null);
		} else {
			if (discount_type === "percentage") {
				discount = (subtotal * discount_value) / 100;
				if (max_discount && discount > max_discount) {
					discount = max_discount;
				}
			} else if (discount_type === "fixed") {
				discount = discount_value;
			}
			finalTotal = subtotal - discount;
			if (finalTotal < 0) finalTotal = 0; // Ensure total doesn't go negative
		}
	}

	const handleApplyCoupon = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}coupons/validate`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ code: couponCode }),
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.message || "Invalid coupon");
			setAppliedCoupon({
				id: result.data.id,
				discount_type: result.data.discount_type,
				discount_value: result.data.discount_value,
				max_discount: result.data.max_discount,
				min_order_amount: result.data.min_order_amount,
			});
			setCouponError(null);
			toast.success("Coupon applied successfully");
		}   catch (err: unknown) {
			if (err instanceof Error) {
				setCouponError(err.message || "Failed to apply coupon");
				toast.error(err.message || "Failed to apply coupon");
			} else {
				setCouponError("Failed to apply coupon");
				toast.error("Failed to apply coupon");
			}
			setAppliedCoupon(null);
		}

};

const handlePlaceOrder = async () => {
	if (!selectedAddressId || !selectedPaymentMethod) {
		toast.error("Please select an address and payment method");
		return;
	}
	try {
		const orderData = {
			shippingAddressId: selectedAddressId,
			billingAddressId: selectedAddressId,
			paymentMethod: selectedPaymentMethod,
			couponId: appliedCoupon?.id,
		};
		const newOrder = await createOrder(orderData).unwrap();

		if (selectedPaymentMethod !== "COD") {
			if (!newOrder.data.razorpayOrderId) {
				throw new Error("Razorpay order ID not provided");
			}
			const options: RazorpayOptions = {
				key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
				amount: Math.round(finalTotal * 100),
				currency: "INR",
				name: "Your App Name",
				description: `Order #${newOrder.data.id}`,
				order_id: newOrder.data.razorpayOrderId,
				handler: async function (response) {
					try {
						const verifyResponse = await fetch(
							`${process.env.NEXT_PUBLIC_BASE_URL}payments/verify`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${token}`,
								},
								body: JSON.stringify({
									razorpay_order_id: response.razorpay_order_id,
									razorpay_payment_id: response.razorpay_payment_id,
									razorpay_signature: response.razorpay_signature,
								}),
							},
						);
						const verifyResult = await verifyResponse.json();
						if (!verifyResponse.ok) {
							throw new Error(
								verifyResult.message || "Payment verification failed",
							);
						}
						toast.success("Payment verified successfully");
						dispatch(resetCheckout());
						router.push(
							`/products/cart/select-address/checkout/order-confirmation/${newOrder.data.id}`,
						);
					} catch (err) {
						if (err instanceof Error) {
							toast.error(err.message || "Payment verification failed");
						} else if (typeof err === "string") {
							toast.error(err);
						} else {
							toast.error("Payment verification failed");
						}
					}

				},
				prefill: {
					name: selectedAddress?.fullName || "",
					email: selectedAddress?.email || "",
					contact: selectedAddress?.mobile || "",
				},
				theme: { color: "#9AE144" },
			};
			const rzp = new window.Razorpay(options);
			rzp.on("payment.failed", () => {
				toast.error("Payment failed. Please try again.");
			});
			rzp.open();
		} else {
			dispatch(resetCheckout());
			toast.success("Order placed successfully");
			router.push(
				`/products/cart/select-address/checkout/order-confirmation/${newOrder.data.id}`,
			);
		}
	} catch (err: unknown) {
	if (err instanceof Error) toast.error(err.message || "Failed to place order");
	else toast.error("Failed to place order");
}

};

if (cartLoading) return <div className="p-6">Loading cart...</div>;

return (
	<>
		<Script src="https://checkout.razorpay.com/v1/checkout.js" />
		<div className="bg-white sm:px-6 md:px-12 py-6 md:py-8 font-sans text-sm md:text-base">
			<Toaster position="top-right" />
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
				<div className="lg:col-span-2 space-y-4">
					<div className="flex items-center gap-2 mb-4 md:mb-6">
						<h2 className="text-lg md:text-2xl font-semibold flex items-center gap-1 md:gap-2">
							<span className="p-2 rounded-full bg-[#FAFAFA]">
								<MdCreditCard className="text-[#9AE144] size-5 md:size-6" />
							</span>
							Checkout
						</h2>
						<p className="ml-auto font-semibold text-[10px] md:text-sm text-black flex items-center gap-1">
							<HiOutlineLocationMarker className="w-4 h-4" />
							Deliver Tomorrow, Sep 22, 8am–10am
						</p>
					</div>

					<div
						onClick={() => router.push("/products/cart/select-address")}
						className="bg-white hover:border-black border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center cursor-pointer"
					>
						<div>
							<h3 className="font-semibold flex items-center gap-1 text-sm md:text-base">
								Delivery info{" "}
								<FiInfo className="text-gray-500 size-3 md:size-4" />
							</h3>
							<p className="text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1">
								Deliver to{" "}
								<span className="text-[#9AE144] flex items-center gap-1">
									<HiOutlineLocationMarker className="w-3 h-3 md:w-4 md:h-4" />
									{selectedAddress
										? `${selectedAddress.address_line1}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.zip}`
										: "Select Address"}
								</span>
							</p>
						</div>
						<span className="text-gray-400 text-xl md:text-2xl">›</span>
					</div>

					<div
						onClick={() => router.push("/products/cart/payment-method")}
						className="bg-white hover:border-black border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center cursor-pointer"
					>
						<div>
							<h3 className="font-semibold flex items-center gap-1 text-sm md:text-base">
								Payment Method{" "}
								<FiInfo className="text-gray-500 size-3 md:size-4" />
							</h3>
							<p className="text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1">
								Pay With{" "}
								<span className="text-[#9AE144] flex items-center gap-1">
									<MdCreditCard className="w-3 h-3 md:w-4 md:h-4" />
									{selectedPaymentMethod || "Select Method"}
								</span>
							</p>
						</div>
						<span className="text-gray-400 text-xl md:text-2xl">›</span>
					</div>

					<div className="bg-white hover:border-black border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4">
						<h3 className="font-semibold flex items-center gap-1 text-sm md:text-base mb-4">
							Review Order <FiInfo className="text-gray-500 size-3 md:size-4" />
						</h3>
						<div className="flex w-full items-center gap-2 bg-[#fafafa] rounded-xl md:rounded-2xl p-2 overflow-x-auto">
							{cartItems.map((item: CartItem) => (
								<div
									key={item.id}
									className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center shrink-0"
								>
									<Image
										src={
											item.part.image_urls[0] ||
											"https://via.placeholder.com/150"
										}
										alt={item.part.subcategory?.name || "Product image"}
										className="w-6 h-6 md:w-8 md:h-8 object-contain"
									/>
								</div>
							))}
							{cartItems.length > 5 && (
								<div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-medium text-gray-500 shrink-0">
									+{cartItems.length - 5}
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 mt-6 lg:mt-0">
					<h3 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">
						Order Summary
					</h3>

					<div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
						<div className="flex justify-between">
							<span>Items total</span>
							<span>₹{itemsTotal.toFixed(2)}</span>
						</div>
						<div className="flex justify-between">
							<span>Delivery fee</span>
							<span>₹{deliveryFee.toFixed(2)}</span>
						</div>
						{appliedCoupon && discount > 0 && (
							<div className="flex justify-between text-[#9AE144]">
								<span>Coupon Discount ({couponCode})</span>
								<span>-₹{discount.toFixed(2)}</span>
							</div>
						)}
					</div>

					<hr className="my-3 md:my-4" />

					<div className="flex justify-between items-center mt-3 md:mt-4 text-xs md:text-sm">
						<input
							type="text"
							placeholder="Enter Coupon Code"
							value={couponCode}
							onChange={(e) => setCouponCode(e.target.value)}
							className="border border-gray-200 rounded-lg px-2 py-1"
						/>
						<button
							onClick={handleApplyCoupon}
							className="text-[#9AE144] font-medium"
						>
							Apply
						</button>
					</div>
					{couponError && <p className="text-red-600 text-xs mt-1">{couponError}</p>}

					<hr className="my-3 md:my-4" />

					<div className="flex justify-between items-center mb-2 text-sm md:text-lg font-semibold">
						<span>Total</span>
						<span>₹{finalTotal.toFixed(2)}</span>
					</div>

					<p className="text-[10px] md:text-xs text-gray-400 mb-3 md:mb-4">
						By placing this order, you are agreeing to Terms and Conditions.
					</p>

					<button
						onClick={handlePlaceOrder}
						disabled={isCreatingOrder}
						className="w-full bg-[#9AE144] text-black text-sm md:text-base font-semibold py-2.5 md:py-3 rounded-full hover:bg-[#89CC33] transition-colors"
					>
						{isCreatingOrder ? "Placing Order..." : "Place Order"}
					</button>
				</div>
			</div>
		</div>
	</>
);
}
