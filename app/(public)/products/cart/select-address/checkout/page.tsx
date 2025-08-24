// app/checkout/page.tsx
"use client";


import { FiInfo } from "react-icons/fi";
import { HiOutlineLocationMarker } from "react-icons/hi";
import { MdCreditCard } from "react-icons/md";
import { useRouter } from "next/navigation";

export default function Checkout() {
  const router = useRouter();
  return (
    <div className="bg-white   sm:px-6 md:px-12 py-6 md:py-8 font-sans text-sm md:text-base">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-semibold flex items-center gap-1 md:gap-2">
              <span className="p-2 rounded-full bg-[#FAFAFA]">
                <MdCreditCard className="text-[#9AE144] size-5 md:size-6" />
              </span>
              Checkout
            </h2>
            <p className="ml-auto font-semibold text-[10px] md:text-sm text-black flex items-center gap-1">
              <HiOutlineLocationMarker className="w-4 h-4" />
              Deliver Tomorrow, Sep 17, 8am–10am
            </p>
          </div>

          {/* Delivery Info */}
          <div
            onClick={() => {
              router.push("/products/cart/select-address");
            }}
            className="bg-white hover:border-black border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center cursor-pointer"
          >
            <div>
              <h3 className="font-semibold flex items-center gap-1 text-sm md:text-base">
                Delivery info <FiInfo className="text-gray-500 size-3 md:size-4" />
              </h3>
              <p className="text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                Deliver to{" "}
                <span className="text-[#9AE144] flex items-center gap-1">
                  <HiOutlineLocationMarker className="w-3 h-3 md:w-4 md:h-4" />
                  2118 Thornridge Cir. Syracuse, Connecticut 35624
                </span>
              </p>
            </div>
            <span className="text-gray-400 text-xl md:text-2xl">›</span>
          </div>

          {/* Payment Method */}
          <div
            onClick={() => {
              router.push("/products/cart/payment-method");
            }}
            className="bg-white hover:border-black border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center cursor-pointer"
          >
            <div>
              <h3 className="font-semibold flex items-center gap-1 text-sm md:text-base">
                Payment Method <FiInfo className="text-gray-500 size-3 md:size-4" />
              </h3>
              <p className="text-gray-400 text-xs md:text-sm mt-1 flex items-center gap-1">
                Pay With{" "}
                <span className="text-[#9AE144] flex items-center gap-1">
                  <MdCreditCard className="w-3 h-3 md:w-4 md:h-4" />
                  Mastercard *** 3434
                </span>
              </p>
            </div>
            <span className="text-gray-400 text-xl md:text-2xl">›</span>
          </div>

          {/* Review Order */}
          <div className="bg-white border hover:border-black border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex justify-between items-center cursor-pointer">
            <div>
              <h3 className="font-semibold flex items-center gap-1 text-sm md:text-base">
                Review Order <FiInfo className="text-gray-500 size-3 md:size-4" />
              </h3>
              <div className="flex w-full items-center gap-2 bg-[#fafafa] rounded-xl md:rounded-2xl p-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center"
                    >
                      <img
                        src="https://png.pngtree.com/png-vector/20240603/ourlarge/pngtree-orange-isolated-on-transparent-background-png-image_12605546.png"
                        alt="fruit"
                        className="w-6 h-6 md:w-8 md:h-8"
                      />
                    </div>
                  ))}
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-xs md:text-sm font-medium text-gray-500">
                  +12
                </div>
              </div>
            </div>
            <span className="text-gray-400 text-xl md:text-2xl">›</span>
          </div>
        </div>

        {/* Right Section - Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-4 md:p-6 mt-6 lg:mt-0">
          <h3 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Order Summary</h3>

          <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>$4.78</span>
            </div>
            <div className="flex justify-between">
              <span>Service fee</span>
              <span>$128.78</span>
            </div>
            <div className="flex justify-between">
              <span>Items total</span>
              <span>$128.78</span>
            </div>
          </div>

          <hr className="my-3 md:my-4 text-[rgba(128,118,129,1)]" />

          {/* Coupon */}
          <div className="flex justify-between items-center mt-3 md:mt-4 text-xs md:text-sm">
            <span>Coupon</span>
            <button className="text-[#9AE144] font-medium">+ Add Coupon</button>
          </div>

          <hr className="my-3 md:my-4 text-[rgba(128,118,129,1)]" />

          {/* Total */}
          <div className="flex justify-between items-center mb-2 text-sm md:text-lg font-semibold">
            <span>Total</span>
            <span>$20</span>
          </div>

          <p className="text-[10px] md:text-xs text-gray-400 mb-3 md:mb-4">
            By placing this order, you are agreeing to Terms and Conditions.
          </p>

          {/* Place Order Button */}
          <button
          onClick={() => router.push("/products/cart/select-address/checkout/OrderConfirmation")}
          className="w-full bg-[#9AE144] text-black text-sm md:text-base font-semibold py-2.5 md:py-3 rounded-full hover:bg-[#89CC33] transition-colors">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
