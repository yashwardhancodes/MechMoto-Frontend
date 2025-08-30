"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { setRedirect } from "@/lib/redux/slices/redirectSlice";
import { useDispatch } from "react-redux";





const plansData: Record<string, any> = {
  basic: {
    title: "Basic Plan",
    description: "Perfect for short-term roadside assistance.",
    features: ["Quick roadside assistance", "Certified expert mechanics"],
  },
  premium: {
    title: "Premium",
    description:
      "Unlock the full potential of your ride with our Premium Plan — designed for car lovers, mechanics, and professionals who demand quality and speed. Enjoy priority shipping, early access to exclusive parts, extended return periods, personalized customer support, and special member-only offers. With added benefits like expert installation guidance and service reminders, the Premium Plan ensures a smooth, reliable, and upgraded experience every time you shop. Drive smarter, stay ahead — go premium today.",
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
    features: ["Quick roadside assistance", "Certified expert mechanics"],
  },
};

export default function PlanPage() {
  const params = useParams();
  const plan = params.plan as string;
  const data = plansData[plan];
  const [checked, setChecked] = useState(false);
  const dispatch = useDispatch();



  const router = useRouter();

  const handleRedirect = () => {
    const isLoggedIn = localStorage.getItem("auth");

    if (isLoggedIn) {
      router.push(`/plans/${plan}/checkout`);       
    } else {
      router.push("/auth/login");   
      dispatch(setRedirect(`/plans/${plan}/checkout`));
    }
  };

  if (!data) {
    return <div className="p-10 text-center text-red-500">Plan not found</div>;
  }

  return (
    <div className="mx-auto bg-[rgba(154,225,68,0.023)] py-16 px-6 md:px-32">
      {/* Plan Section */}
      <div className="max-w-6xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#ECFFFB] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-10">
          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-12">
            You’ve selected the <br />
            <span className="text-[#6BDE23]">{data.title}</span>{" "}
            <span className="text-4xl font-bold">Plan</span>
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

      {/* Terms and Conditions */}
      <div className="bg-white shadow-md p-6 mt-24 rounded-xl">
        <h3 className="text-lg font-bold text-[#6BDE23] mb-3">
          Terms and Conditions
        </h3>
        <div className="h-52 overflow-y-auto rounded-md p-3 text-sm text-gray-600 leading-relaxed scrollbar-green scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full ">
          {/* terms content here */}
          <p>
            <strong>Last Revised:</strong> December 16, 2013
          </p>
          <p className="mt-2">
            Welcome to www.lorem-ipsum.info. This site is provided as a service
            to our visitors and may be used for informational purposes only.
          </p>
          <p className="mt-2 font-bold">1. YOUR AGREEMENT</p>
          <p>
            By using this Site, you agree to be bound by, and to comply with,
            these Terms and Conditions...
          </p>
          <p className="mt-2 font-bold">2. PRIVACY</p>
          <p>
            Please review our Privacy Policy, which also governs your visit to
            this Site, to understand our practices.
          </p>
          <p className="mt-2 font-bold">3. LINKED SITES</p>
          <p>
            This Site may contain links to other independent third-party Web
            sites...
          </p>
        </div>

        {/* Checkbox */}
        <label className="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-4 h-4 accent-[#6BDE23]"
          />
          <span className="text-sm text-gray-700">
            I confirm that I have read and accept the terms and conditions and
            privacy policy.
          </span>
        </label>

        {/* Action Buttons */}

      </div>

      {/* Buy Now */}
      <div className="flex justify-end items-center">
        <button
          disabled={!checked}
          onClick={() => handleRedirect()          }
          className={`mt-6  px-8 py-2 rounded-full  text-lg font-semibold transition ${checked
            ? "bg-[#6BDE23] text-black"
            : "bg-gray-300 text-black cursor-not-allowed"
            }`}
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}
