"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import successImg from "@/public/assets/success.png";

export default function OrderConfirmation() {
  const router = useRouter();

  return (
    <div className="mx-auto px-4 py-10">
      {/* Header */}
      <div className="bg-white shadow-sm rounded-2xl p-6 text-center">
        <div className="flex justify-between items-center">
            <div className="flex flex-col items-start">
          <h2 className="text-xl font-semibold text-gray-800">Order Placed</h2>
          <p className="text-gray-500 mt-2">Order will arrive at Apr 5, 2022, 10:07 AM</p>
          </div>
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">Done</span>
        </div>

        {/* Success icon */}
        <div className="my-6">
            <Image src={successImg} alt="Success" className="mx-auto size-44" />
          <h3 className="text-lg font-medium mt-2">Order is Placed</h3>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-center space-x-6 mt-6">
          <div className="flex flex-col items-center">
            <span className="w-6 h-6 rounded-full bg-[#9AE144] flex items-center justify-center text-white">✓</span>
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

      {/* Order items */}
      <div className="bg-white shadow rounded-2xl p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">Items</h3>
        <div className="divide-y">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex justify-between py-3">
              <div className="flex items-center space-x-3">
                <img
                  src="/orange.png"
                  alt="Product"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-gray-800">Sweet Green Seedless</p>
                  <p className="text-gray-500 text-sm">$99.99</p>
                </div>
              </div>
              <p className="text-gray-600">12x</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
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
