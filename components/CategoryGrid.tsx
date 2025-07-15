'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { IoIosArrowDown } from "react-icons/io";

// Sample categories
const categories = [
  { name: "Engine & Powertrain", icon: "/assets/categories/Car-Battery.png" },
  { name: "Transmission", icon: "/assets/categories/Transmission.png" },
  { name: "Braking System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Exhaust System", icon: "/assets/categories/Exhaust-System.png" },
  { name: "Suspension System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Wheel and Tyre", icon: "/assets/categories/Car-Battery.png" },
  { name: "Fuel System", icon: "/assets/categories/Oil-Filter.png" },
  { name: "Ignition", icon: "/assets/categories/Car-Battery.png" },
  { name: "Electrical System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Sensors", icon: "/assets/categories/Car-Battery.png" },
  { name: "Wheel and Tyre", icon: "/assets/categories/Car-Battery.png" },
  { name: "Fuel System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Ignition", icon: "/assets/categories/Car-Battery.png" },
  { name: "Electrical System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Sensors", icon: "/assets/categories/Car-Battery.png" },
];

// ✅ Hook to detect screen size
function useScreenWidth() {
  const [width, setWidth] = useState<number>(0); // Always start from 0 (safe on SSR)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    handleResize(); // set actual width after mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}


const CategoryGrid = () => {
  const screenWidth = useScreenWidth();
  const isMd = screenWidth < 1024;
  const shouldShowToggle = isMd ? categories.length > 8 : categories.length > 12;

  const [showAll, setShowAll] = useState(false);
  const categoriesToShow = showAll
    ? categories
    : categories.slice(0, isMd ? 8 : 12);

  return (
    <section className="lg:min-h-[calc(100vh-80px)] xl:h-auto md:py-12 lg:py-8 py-8 md:px-0 lg:px-16 flex flex-col lg:justify-center lg:items-center">
      <h1 className="text-2xl md:text-4xl font-sans text-center mb-10 font-bold">
        Shop by{" "}
        <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
          Categories
        </span>
      </h1>

      <div className="hidden md:block w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 lg:gap-12 w-full">
          {categoriesToShow.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 rounded-lg cursor-pointer transition"
            >
              <div className="w-24 h-24 relative mb-3">
                <Image
                  src={category.icon}
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-center text-xs lg:text-sm font-medium text-gray-800">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>

   

      {shouldShowToggle && (
        <div className="hidden md:flex justify-center items-center">
          <div className="text-center mt-6">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-base font-medium text-[#0A0A24] flex items-center justify-center gap-2"
            >
              {showAll ? (
                <>
                  View Less{" "}
                  <IoIosArrowDown className="rotate-180 transition-transform duration-300 text-[#9AE144]" />
                </>
              ) : (
                <>
                  View More{" "}
                  <IoIosArrowDown className="transition-transform duration-300 text-[#9AE144]" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoryGrid;
