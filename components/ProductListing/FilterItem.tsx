import { MdArrowDropDown } from "react-icons/md";

interface FilterItemProps {
  options: string[];
}

const FilterItem: React.FC<FilterItemProps> = ({ options }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Filter changed:', e.target.value);
  };

  return (
  <div className="relative w-full">
  <select
    onChange={handleChange}
    className="w-full p-2 px-4 pr-10 border font-semibold border-[#939398] text-black rounded-full mb-2 text-[12px] appearance-none"
  >
    {options.map((option, index) => (
      <option key={index} value={option}>
        {option}
      </option>
    ))}
  </select>

  {/* Custom arrow */}
  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
    <MdArrowDropDown className="text-black size-6" />
  </div>
</div>

  );
};

export default FilterItem;