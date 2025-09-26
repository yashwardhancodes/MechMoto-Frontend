
"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";



export default function PlanPage() {
  const [paymentMethod, setPaymentMethod] = useState("");
    const router = useRouter();
    const params = useParams();
  const plan = params.plan as string;

  return (
    <div className="mx-auto bg-[rgba(154,225,68,0.023)] py-16 px-6 md:px-32">
      {/* Plan Section */}
      <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#ECFFFB] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            {/* Left Section */}
            <div>
              <h2 className="text-3xl font-bold">
                <span className="text-[#9AE144]">Almost Done!</span> Choose
                <br /> Your Payment Option
              </h2>
              <p className="text-gray-500 mt-2">
                You can pay securely using your preferred method.
              </p>

              {/* Dropdown */}
              <div className="relative mt-6">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="appearance-none w-72 border-b border-gray-300 py-2 px-2 pr-8 text-gray-600 focus:outline-none focus:border-[#6BDE23]"
                >
                  <option value="">Select payment method</option>
                  <option value="upi">UPI</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="netbanking">Net Banking</option>
                  <option value="wallet">Wallet</option>
                </select>
                <ChevronDown className="absolute right-2 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Right Section */}
            <div className="text-right">
              <p className="text-gray-500 text-sm mb-1">
                this is your total cost
              </p>
              <p className="text-[#9AE144] text-3xl font-bold">
                Rs.1200.00
                <span className="text-gray-500 text-sm font-normal">/month</span>
              </p>
            </div>
          </div>

          {/* Button */}
          <div className="mt-10">
            <button
            onClick={() => { router.push(`/plans/${plan}/checkout/success`);}}
            className="bg-[#9AE144] hover:bg-[#6BDE23] transition-colors px-8 py-3 rounded-full font-semibold text-black shadow-md">
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
