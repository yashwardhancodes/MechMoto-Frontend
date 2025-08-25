// src/app/products/cart/select-address/payment-method/page.tsx
"use client";

import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setSelectedPaymentMethod } from "@/lib/redux/slices/checkoutSlice";

export default function PaymentMethod() {
  const router = useRouter();
  const dispatch = useDispatch();

  const paymentOptions = [
		{
			value: "razorpay",
			name: "Online Payment (UPI, Card, Wallet, Net Banking)",
			icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Pay_Logo.svg", // Or a generic icon
		},
		{
			value: "COD",
			name: "Cash On Delivery",
			icon: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
		},
  ];

  const handleSelect = (value: string) => {
    dispatch(setSelectedPaymentMethod(value));
    router.push("/products/cart/select-address/checkout");
  };

  return (
    <div className="lg:col-span-2 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold">Payment Method</h2>
      </div>

      <div className="space-y-3">
        {paymentOptions.map((option, i) => (
          <div
            key={i}
            onClick={() => handleSelect(option.value)}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:border-[#9AE144] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <img src={option.icon} alt={option.name} className="w-6 h-6" />
              </div>
              <p className="font-medium">{option.name}</p>
            </div>
            <FiChevronRight className="text-gray-400" />
          </div>
        ))}
      </div>
    </div>
  );
}