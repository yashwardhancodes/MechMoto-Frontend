"use client";

import Navbar from "@/components/Navbar";
import Breadcrumb from "@/components/ProductListing/Breadcrumb";
 

export default function PublicLayout({ children }: { children: React.ReactNode }) {
 

  

  return (
    <>
      <Navbar />
         <div className="md:px-6 lg:px-12 mx-auto p-5 text-gray-800 mt-[40px] md:mt-[50px] lg:mt-[56px]">
        <Breadcrumb />
        {children}
      </div>
    
    </>
  );
}
