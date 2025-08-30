"use client";

import Image from "next/image";
import checkImg from "@/public/assets/check.png"; // <- replace with your green check image

export default function PlanPage() {
  return (
    <div className="mx-auto bg-[rgba(154,225,68,0.023)] py-16 px-6 md:px-32">
      {/* Plan Section */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#ECFFFB] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-12 text-center">
          {/* Title */}
          <h2 className="text-3xl font-bold">
            Your Plan is{" "}
            <span className="text-[#6BDE23]">Successfully Confirmed!</span>
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Thank you for choosing FreshSea Foods. Your storage is now active,
            and your seafood logistics are underway.
          </p>

          {/* Checkmark Image */}
          <div className="mt-10 flex justify-center">
            <Image
              src={checkImg}
              alt="success check"
              width={180}
              height={180}
              className="drop-shadow-md"
            />
          </div>

          {/* Buttons */}
          <div className="mt-10 flex justify-center gap-6">
            <button className="bg-[#6BDE23] hover:bg-[#5fc71f] transition-colors px-6 py-3 rounded-full font-semibold text-black shadow-md">
              Return to Dashboard
            </button>
            <button className="border border-[#6BDE23] text-[#6BDE23] hover:bg-[#f4fff0] transition-colors px-6 py-3 rounded-full font-semibold shadow-sm">
              Track My Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
