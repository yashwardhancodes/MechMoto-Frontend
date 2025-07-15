import React, { useState } from 'react';
import { FaSearch } from "react-icons/fa";
import CategoryGrid from './CategoryGrid';
import PartCategorySearchModal from './SearchModels/PartCategorySearchModal';

const BuyParts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="md:w-full flex flex-col items-center">
      
      {/* Search Box */}
      <div className="flex items-center bg-white rounded-full border border-black md:pl-6 px-1 lg:px-2 py-1 text-[10px] md:text-sm lg:text-base lg:py-2 space-x-1 md:space-x-8 lg:space-x-16 w-full max-w-xl lg:max-w-3xl">
        {["Brand", "Model", "Year", "Varient"].map((placeholder, idx:number) => (
          <div
            key={placeholder}
            className="flex items-center space-x-1 md:border-r last:border-r-0 pr-1 md:pr-3 last:pr-0"
          >
            <select className="bg-transparent focus:outline-none text-black font-medium">
              <option>{placeholder}</option>
            </select>
          </div>
        ))}

        <button
          className="ml-auto flex items-center bg-[rgba(154,225,68,0.61)] hover:bg-[rgba(154,225,68,0.75)] text-[rgba(0,0,0,0.64)] font-semibold px-4 md:px-8 py-2 rounded-full transition"
          onClick={() => setIsModalOpen(true)}
        >
          <FaSearch className="mr-2 md:mr-4" />
          Search
        </button>
      </div>

      <h1 className='my-1 md:my-4 text-xs md:text-base'>Or</h1>

      {/* Number Plate Search */}
      <div className="flex items-center text-[10px] md:text-base justify-between bg-[#D7F3B4] rounded-full px-4 py-3 md:w-full md:max-w-md">
        <span className="font-semibold mr-2 border-r pr-2 whitespace-nowrap w-1/2 text-black">
          Search By Number Plate
        </span>
        <span className="text-black mr-2">🔍</span>
        <input
          type="text"
          placeholder="IND: MH19 AD 7755"
          className="bg-transparent outline-none text-gray-700 placeholder-gray-500"
        />
      </div>

      {/* Category Grid */}
      <CategoryGrid />

      {/* Modal */}
      {isModalOpen && (
        <PartCategorySearchModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default BuyParts;
