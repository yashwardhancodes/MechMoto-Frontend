"use client";

import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function SelectAddress() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const addresses = [
    { label: "Home", address: "2972 Westheimer Rd. Santa Ana, Illinois 85486" },
    {
      label: "My Grandparent's House",
      address: "2972 Westheimer Rd. Santa Ana, Illinois 85486",
    },
    { label: "Office", address: "2972 Westheimer Rd. Santa Ana, Illinois 85486" },
  ];

  return (
    <div className="font-sans bg-white md:px-6 text-[#1E1E1E]">
      {/* Back + Header */}
      <div className="flex items-center md:pb-6 gap-2 mb-2">
        <h2 className="text-[20px] md:text-[28px] lg:text-[30px] font-semibold">
          Select an Address
        </h2>
      </div>
      <p className="text-[#9AE144] mb-6 text-xs md:text-base">
        Select to get fast delivery
      </p>

      {/* My Addresses */}
      <h3 className="text-lg sm:text-xl font-semibold mb-4">My Addresses</h3>

      <div className="space-y-4">
        {addresses.map((item) => (
          <div
            key={item.label}
            onClick={() => setSelected(item.label)}
            className="flex items-center justify-between border border-gray-200 rounded-xl p-2 md:p-4 cursor-pointer hover:shadow-sm transition"
          >
            <div className="flex items-center gap-3">
              {/* Custom radio button */}
              <div
                className={`size-4 md:size-6 rounded-full border-2 flex items-center justify-center 
                ${selected === item.label ? "border-[#9AE144]" : "border-gray-300"}`}
              >
                {selected === item.label && (
                  <div className="size-1 md:size-3 rounded-full bg-[#9AE144]" />
                )}
              </div>

              <div>
                <p className="font-semibold text-sm md:text-base">
                  {item.label}
                </p>
                <p className="text-gray-500 text-xs md:text-base">
                  {item.address}
                </p>
              </div>
            </div>

            <button className="flex items-center gap-1 text-[#9AE144] text-xs sm:text-sm font-medium">
              <FiEdit className="w-4 h-4" /> Edit
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-between">
        {/* Add address */}
        <button
          onClick={() => router.push("/products/cart/select-address/add-address")}
          className="flex items-center gap-1   text-[#9AE144] font-medium text-sm sm:text-base"
        >
          <span className="text-lg sm:text-xl">+</span> Add address
        </button>

        <button
          disabled={!selected}
          onClick={() => router.push("/products/cart/select-address/checkout")}
          className={` px-2 md:px-4 text-xs md:text-base  py-2 rounded-full text-black font-semibold transition 
            ${selected
              ? "bg-[#9AE144] hover:bg-[#89CC33]"
              : "bg-[#89CC33] cursor-not-allowed"
            }`}
        >
          Proceed to Checkout
        </button>

        {/* Proceed to Checkout */}


      </div>
    </div>
  );
}
