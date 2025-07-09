'use client';

import { useState } from "react";
import Image from "next/image";

const categories = [
  { name: "Engine & Powertrain", icon: "/assets/categories/Car-Battery.png" },
  { name: "Transmission", icon: "/assets/categories/Car-Battery.png" },
  { name: "Braking System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Exhaust System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Suspension System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Wheel and Tyre", icon: "/assets/categories/Car-Battery.png" },
  { name: "Fuel System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Ignition", icon: "/assets/categories/Car-Battery.png" },
  { name: "Electrical System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Sensors", icon: "/assets/categories/Car-Battery.png" },
  { name: "Wheel and Tyre", icon: "/assets/categories/Car-Battery.png" },
  { name: "Fuel System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Ignition", icon: "/assets/categories/Car-Battery.png" },
  { name: "Electrical System", icon: "/assets/categories/Car-Battery.png" },
  { name: "Sensors", icon: "/assets/categories/Car-Battery.png" },
];

const CategoryGrid = () => {
  const [showAll, setShowAll] = useState(false);
  const categoriesToShow = showAll ? categories : categories.slice(0, 12); // 6 cols * 2 rows = 12

  return (
    <section className="py-8 md:px-6 lg:px-12">
      <h1 className=" text-2xl md:text-4xl font-sans text-center mb-6 font-bold">
        Shop by{" "}
        <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
          Categories
        </span>
      </h1>

      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10 w-full">
          {categoriesToShow.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-4 bg-[#F7F7F7] rounded-lg hover:shadow-md transition"
            >
              <div className="w-24 h-24 relative mb-3">
                <Image
                  src={category.icon}
                  alt={category.name}
                  fill
                  className="object-contain"
                />
              </div>
              <p className="text-center text-sm font-medium text-gray-800">
                {category.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {categories.length > 12 && !showAll && (
    <div className="flex justify-center   items-center">
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="text-base font-medium text-[#0A0A24] hover:underline flex items-center justify-center gap-2"
          >
            View More
            <span className="bg-[#9AE144] rounded-full p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-[#0A0A24]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        </div></div>
      )}
    </section>
  );
};

export default CategoryGrid;
