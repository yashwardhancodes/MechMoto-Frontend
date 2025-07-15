'use client';

import FilterItem from './FilterItem';
import { useState } from 'react';

const FilterSection: React.FC = () => {
  const [showMore, setShowMore] = useState(false);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Checkbox changed:', e.target.id, e.target.checked);
  };

  const handleShowMore = () => {
    setShowMore(!showMore);
  };

  return (
    <div className="bg-white   rounded-lg   ">
      <h2 className="text-3xl font-sans font-dm-sans text-black font-bold mb-5">Filters</h2>
      <div className='p-5 px-7 mt-20  '>
        <div className="mb-8">
          <h2 className=" text-2xl font-dm-sans text-black font-semibold mb-3 flex items-center justify-between">
            Vehicle
            <a href="#" className="text-[#9AE144] text-sm ">Reset</a>
          </h2>
          <FilterItem options={['Chevrolet', 'Toyota', 'Honda']} />
          <FilterItem options={['AVEO', 'Camry', 'Civic']} />
          <FilterItem options={['2006', '2007', '2008']} />
          <FilterItem options={['1.2L/Petrol', '1.4L/Petrol', '1.6L/Petrol']} />
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">Brand</h3>
          {['Bando', 'Bosch', 'Chevrolet'].map((brand) => (
            <div key={brand} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={brand.toLowerCase()}
                onChange={handleCheckboxChange}
                className="mr-3 w-5 h-5 rounded-xs  appearance-none border-1  border-[#9AE144] checked:bg-[#9AE144] checked:border-[#9AE144] checked:after:content-['✓'] checked:after:text-white checked:after:text-sm checked:after:font-bold checked:after:flex checked:after:items-center checked:after:justify-center"
              />
              <label htmlFor={brand.toLowerCase()} className="text-[14px] font-semibold  text-black">
                {brand}
              </label>
            </div>



          ))}
          <div
            onClick={handleShowMore}
            className="text-[#9AE144] text-sm cursor-pointer mt-2"
          >
            {showMore ? '- Show less' : '+ 7 more'}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-dm-sans text-black font-semibold mb-3">Category</h3>
          {['Maintenance service part', 'Air Conditioning', 'Tyre and wheels'].map((category) => (
            <div key={category} className="mb-2 text-[14px] font-semibold  text-black">{category}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;