import { IoIosArrowBack } from "react-icons/io";


const Breadcrumb: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center font-roboto font-medium mb-8 text-xs md:text-sm">
      <IoIosArrowBack className=" size-4 md:size-6 mr-3" />
      <a href="#" className="text-[#4B4B4B]">All Categories</a>
      <span className="mx-1">&gt;</span>
      <a href="#" className="text-[#4B4B4B]">Maintenance service Part</a>
      <span className="mx-1">&gt;</span>
      <a href="#" className="text-[#4B4B4B]">Belt</a>
      <span className="mx-1">&gt;</span>
      <span className="text-[#9AE144]">Toyota Nexus Belt</span>
    </div>

  );
};

export default Breadcrumb;