import React, { JSX, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { FiFilter } from "react-icons/fi";
import { IoIosArrowDown } from "react-icons/io";
import Image from "next/image";
import searchIcon from "../../public/assets/search.png";
import { useRouter } from "next/navigation"; // ✅ ADDED

// Props Interface
interface PartCategorySearchModalProps {
  onClose: () => void;
}

// Category/Subcategory Item Type
interface PartCategory {
  name: string;
  icon: JSX.Element;
}

// Sample Categories
const categories: PartCategory[] = [
  { name: "Maintenance Service Part", icon: <img src="/assets/categories/Transmission.png" alt="" className="h-10 w-auto" /> },
  { name: "Transmission", icon: <img src="/assets/categories/Transmission.png" alt="" className="h-10 w-auto" /> },
  { name: "Braking System", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Exhaust System", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Oil Filter", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Battery", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Brake Pads", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Oil Filter", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Battery", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Brake Pads", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Brake Pads", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Brake Pads", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Brake Pads", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
];

// Sample Subcategories
const subcategories: PartCategory[] = [
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Air Filter", icon: <img src="/assets/categories/Transmission.png" alt="" className="h-10 w-auto" /> },
  { name: "Spark Plugs", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Coolant", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Air Filter", icon: <img src="/assets/categories/Transmission.png" alt="" className="h-10 w-auto" /> },
  { name: "Spark Plugs", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Coolant", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
  { name: "Engine Oil", icon: <img src="/assets/categories/Oil-Filter.png" alt="" className="h-10 w-auto" /> },
  { name: "Air Filter", icon: <img src="/assets/categories/Transmission.png" alt="" className="h-10 w-auto" /> },
  { name: "Spark Plugs", icon: <img src="/assets/categories/Exhaust-System.png" alt="" className="h-10 w-auto" /> },
  { name: "Coolant", icon: <img src="/assets/categories/Car-Battery.png" alt="" className="h-10 w-auto" /> },
];

const PartCategorySearchModal: React.FC<PartCategorySearchModalProps> = ({ onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<PartCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<PartCategory | null>(null);
  const router = useRouter(); // ✅ ADDED

  const currentList = selectedCategory ? subcategories : categories;
  const title = selectedCategory
    ? `Select a subcategory for "${selectedCategory.name}"`
    : "Select a part category to get started";

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.2)] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-lg p-6 px-8 relative max-h-[90vh] ">
        <button onClick={onClose} className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-black">
          <IoMdClose />
        </button>

        <div className="flex items-center mt-4 space-x-4">
          <h1 className="text-2xl font-bold text-black">Search</h1>
          <div className="relative flex-2 w-full">
            <input
              type="text"
              placeholder="Type Your Query"
              className="w-full px-4 py-1.5 rounded-full bg-[#F7F7F7] text-sm"
            />
            <Image src={searchIcon} className="absolute right-2 size-6 top-1.5" alt="search" />
          </div>
        </div>

        <div className="mt-6 flex items-center flex-wrap">
          <span className="bg-[rgba(154,225,68,0.3)] text-green-800 font-medium px-3 py-1 rounded-full text-sm flex items-center mr-4 mb-2">
            FORD ECOSPORT 1.0L / PETROL 2013–2017
            <IoMdClose className="ml-2 cursor-pointer" />
          </span>

          <div className="ml-auto text-sm flex items-center gap-1 text-gray-700">
            Selected filter (1)
            <FiFilter className="ml-1" />
          </div>
        </div>

        <div className="mt-0 flex flex-col items-start justify-between">
          <h2 className="font-semibold text-lg mb-2">{title}</h2>

          {selectedCategory && (
            <div className="text-sm cursor-pointer">
              <div className="mb-2 text-sm font-medium flex flex-wrap items-center gap-1">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedSubCategory(null);
                  }}
                  className="text-gray-700 no-underline"
                >
                  All Categories
                </button>

                {selectedCategory && (
                  <>
                    <span>{">"}</span>

                    {selectedSubCategory ? (
                      <button
                        onClick={() => {
                          setSelectedSubCategory(null);
                        }}
                        className="text-gray-700 no-underline"
                      >
                        {selectedCategory.name}
                      </button>
                    ) : (
                      <span className="text-green-600">{selectedCategory.name}</span>
                    )}
                  </>
                )}

                {selectedSubCategory && (
                  <>
                    <span>{">"}</span>
                    <span className="text-green-600">{selectedSubCategory.name}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 mt-3 sm:grid-cols-4 gap-4 max-h-[250px] overflow-y-auto scrollbar-black">
          {currentList.map((item, index) => {
            const isSelected =
              (!selectedCategory && item.name === selectedCategory?.name) ||
              (selectedCategory && item.name === selectedSubCategory?.name);

            return (
              <div
                key={index}
                onClick={() => {
                  if (!selectedCategory) {
                    setSelectedCategory(item);
                  } else {
                    setSelectedSubCategory(item);

                    // ✅ Redirect to product page
                    const formattedName = item.name.toLowerCase().replace(/\s+/g, "-");
                    router.push(`/products/${formattedName}`);
                  }
                }}
                className={`
                  flex flex-col items-center justify-center p-4 h-28 rounded-md cursor-pointer
                  ${isSelected ? "bg-[#E8F9DB]" : "bg-gray-100"}
                  hover:bg-[#E8F9DB] transition
                `}
              >
                {item.icon}
                <span className="mt-2 text-center px-4 text-[13px] font-medium text-gray-800">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-center text-black text-sm font-medium cursor-pointer hover:underline group">
          View More
          <IoIosArrowDown className="ml-1 text-[#9AE144] transform transition-transform duration-300 group-hover:rotate-180" />
        </div>
      </div>
    </div>
  );
};

export default PartCategorySearchModal;
