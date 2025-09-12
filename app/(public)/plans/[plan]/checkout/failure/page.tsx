"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import crossImg from "@/public/assets/cross.png"; // <- replace with your red cross image

export default function FailurePage() {
  const router = useRouter();

  // Auto redirect after 3s
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mx-auto bg-[rgba(255,0,0,0.03)] py-16 px-6 md:px-32">
      {/* Failure Section */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-b from-[#000000] to-[#FFECEC] p-[2px] shadow-lg">
        <div className="bg-white rounded-2xl p-12 text-center">
          {/* Title */}
          <h2 className="text-3xl font-bold text-red-600">
            Payment Failed ❌
          </h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Something went wrong with your payment. You’ll be redirected to the
            homepage shortly. Please try again.
          </p>

          {/* Cross Image */}
          <div className="mt-10 flex justify-center">
            <Image
              src={crossImg}
              alt="failure cross"
              width={180}
              height={180}
              className="drop-shadow-md"
            />
          </div>

          {/* Buttons */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-red-500 hover:bg-red-600 transition-colors px-6 py-3 rounded-full font-semibold text-white shadow-md"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
