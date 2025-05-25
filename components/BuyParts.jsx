import React from 'react';
import { FaSearch } from "react-icons/fa";

const BuyParts = () => {
  return (
    <div className="w-full  hidden md:flex justify-center    ">
      <div className="flex items-center bg-white rounded-full border border-black  pl-6 px-1 lg:px-2 py-1 text-sm lg:text-base   lg:py-2 space-x-8 lg:space-x-16 w-full max-w-xl lg:max-w-4xl">
        {["Brand", "Model", "Year", "Varient"].map((placeholder, idx) => (
          <div
            key={placeholder}
            className="flex items-center space-x-1 border-r last:border-r-0 pr-3 last:pr-0"
          >
            <select className="bg-transparent focus:outline-none text-black font-medium">
              <option>{placeholder}</option>
            </select>
           </div>
        ))} 

    <button className="ml-auto flex items-center bg-[rgba(154,225,68,0.61)] hover:bg-[rgba(154,225,68,0.75)] text-[rgba(0,0,0,0.64)] font-semibold px-8 py-2 rounded-full transition">
  <FaSearch className="mr-4" />
  Search
</button>

      </div>
    </div>
  );
};

export default BuyParts;
