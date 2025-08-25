"use client";

import { useParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

const plansData: Record<string, any> = {
  basic: {
    title: "Basic Plan",
    description: "Perfect for short-term roadside assistance.",
    features: [
      "Quick roadside assistance",
      "Certified expert mechanics",
    ],
  },
  premium: {
    title: "Premium ",
    description: "Unlock the full potential of your ride with our Premium Plan — designed for car lovers, mechanics, and professionals who demand quality and speed. Enjoy priority shipping, early access to exclusive parts, extended return periods, personalized customer support, and special member-only offers. With added benefits like expert installation guidance and service reminders, the Premium Plan ensures a smooth, reliable, and upgraded experience every time you shop. Drive smarter, stay ahead — go premium today.",
    features: [
      "Your orders are fast-tracked",
      "Access to rare and high-demand car parts",
      "Extended return periods",
      "Personalized customer support",
    ],
  },
  medium: {
    title: "Medium Plan",
    description: "A balanced plan for 6 months.",
    features: [
      "Quick roadside assistance",
      "Certified expert mechanics",
    ],
  },
};

export default function PlanPage() {
  const params = useParams();
  const plan = params.plan as string;

  const data = plansData[plan];

  if (!data) {
    return <div className="p-10 text-center text-red-500">Plan not found</div>;
  }

  return (
    <div className="  mx-auto py-16 px-32">
   <div className="max-w-6xl mx-auto py-0.2 px-0.2 rounded-2xl bg-gradient-to-b from-[#000000]  to-[#ECFFFB] p-[2px] shadow-lg">
  {/* Inner white box */}
  <div className="bg-white rounded-2xl p-10">
    {/* Title */}
    <h1 className="text-4xl font-bold text-center mb-12">
      You’ve selected the{" "} <br />
      <span className="text-[#6BDE23]">{data.title}</span> <span className="text-4xl font-bold text-center mb-12">
        
        Plan
      </span>
    </h1>

    {/* Two Column Layout */}
    <div className="grid md:grid-cols-2 gap-12 items-start">
      {/* Left - Features */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          What you <span className="text-[#6BDE23]">get?</span>
        </h2>
        <ul className="space-y-5">
          {data.features.map((feature: string, idx: number) => (
            <li key={idx} className="flex items-center text-lg text-black">
              <CheckCircle2 className="text-[#6BDE23] w-6 h-6 mr-3" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Right - Description */}
      <div>
        <p className="text-gray-600 leading-relaxed">{data.description}</p>
      </div>
    </div>
  </div>
</div>


      {/* Example Terms Section */}
      <div className="bg-white shadow-md p-6 mt-24 rounded-xl">
        <h3 className="text-lg font-bold text-green-700 mb-3">
          Terms and Conditions
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          By using this plan, you agree to our terms and conditions...
        </p>
        <label className="flex items-center space-x-2">
          <input type="checkbox" className="w-4 h-4" />
          <span className="text-sm text-gray-700">
            I confirm that I have read and accept the terms.
          </span>
        </label>
      </div>

      <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-lg font-semibold">
        Buy Now
      </button>
    </div>
  );
}
