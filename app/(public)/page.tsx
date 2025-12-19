"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Carousel from "@/components/Carousel";
import BuyParts from "@/components/BuyParts";
import Testimonials from "@/components/Testimonials";
import TrendingProducts from "@/components/TrendingProducts";
import { Footer } from "@/components/Footer";
import Service from "@/components/Service/Service";
import TrustSection from "@/components/TrustSection";

export default function UsersPage() {
  const [selectedTab, setSelectedTab] = useState("buy");
  const router = useRouter();

  const storageKey = "auth";

  // ✅ Check localStorage first (persistent)
  let auth = localStorage.getItem(storageKey);
  if (!auth) {
		// Fallback to sessionStorage (current session)
		auth = sessionStorage.getItem(storageKey);
  }
  let razorpaySubscriptionId = null;
  try {
    const authObj = auth ? JSON.parse(auth) : null;
    razorpaySubscriptionId = authObj?.user?.razorpaySubscriptionId ?? null;
  } catch  {
    razorpaySubscriptionId = null;
  }
  console.log("auth", razorpaySubscriptionId);

   const subId = razorpaySubscriptionId;  

  // Redirect if planId exists and user clicks "Repair my car"
  useEffect(() => {
    if (selectedTab === "repair" && subId) {
      router.push("/repair");
    }
  }, [selectedTab, subId, router]);

  return (
    <div className="mt-[40px] md:mt-[50px] lg:mt-[56px]">
      <Carousel />

      {/* Toggle Buttons */}
      <div className="container mx-auto w-full flex justify-center mb-6">
        <div className="inline-flex items-center text-xs md:text-sm lg:text-base bg-[#050B20] rounded-full p-1 md:p-1.5">
          <button
            className={`px-4 py-1.5 font-sans font-semibold rounded-full ${
              selectedTab === "buy"
                ? "bg-[#9AE144] text-black"
                : "text-white"
            }`}
            onClick={() => setSelectedTab("buy")}
          >
            Buy Parts
          </button>
          <button
            className={`px-4 py-1.5 font-sans font-semibold rounded-full ${
              selectedTab === "repair"
                ? "bg-[#9AE144] text-black"
                : "text-white"
            }`}
            onClick={() => setSelectedTab("repair")}
          >
            Repair my carff
          </button>
        </div>
      </div>

      {/* Conditional Content */}
      <div className="w-full">
        {selectedTab === "buy" ? (
          <div>
            <BuyParts />
            <TrustSection />
            <Testimonials />
            <TrendingProducts />
            <Footer />
          </div>
        ) : !subId ? ( // only show if no plan
          <div className="text-center text-gray-500 py-20">
           <Service/>
          </div>
        ) : null}
      </div>
    </div>
  );
}
