'use client';
import { useState } from "react";
import Sidebar from "@/components/SuperDashboard/Sidebar";
import Mvendor from "@/components/SuperDashboard/Mvendor";
import AddVendor from "@/components/SuperDashboard/AddVendor";
import { MoveLeft } from 'lucide-react';
import { useRouter } from "next/navigation"; 

export default function Dashboard() {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [subView, setSubView] = useState(""); // "" | "addVendor"
    const router = useRouter(); 

    
  const handleBack = () => {
    if (subView) {
      setSubView(""); // go back from subView like addVendor
    } else {
      router.back(); // go to previous route if no subView
    }
  };

  const renderContent = () => {
    if (activeMenu === "Manage Vendors") {
      if (subView === "addVendor") {
        return <AddVendor goBack={() => setSubView("")} />;
      }
      return <Mvendor onAddVendor={() => setSubView("addVendor")} />;
    }

    if (activeMenu === "Products") {
      return (
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-2">Product Management</h2>
          <p className="text-sm text-gray-600">Here you can manage your products.</p>
        </div>
      );
    }

    if (activeMenu === "Dashboard") {
      return (
        <section className="grid grid-cols-3 gap-4 mb-6">
          {/* Dashboard cards */}
        </section>
      );
    }

    return (
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold">Coming Soon</h2>
        <p className="text-sm text-gray-500">This section is under development.</p>
      </div>
    );
  };

  return (
    <main className="flex mt-[40px] md:mt-[50px] lg:mt-[56px]">
      <Sidebar activeMenu={activeMenu} setActiveMenu={menu => {
        setActiveMenu(menu);
        setSubView(""); // reset on menu change
      }} />
      <div className="ml-60 p-6 w-full h-[calc(100vh-56px)] bg-gray-50">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack}>
            <MoveLeft className="text-[#9AE144] size-9" />
          </button>
          
          <h1 className="text-3xl font-dm-sans font-bold mb-1">  {subView === "addVendor" ? "Add Vendor" : activeMenu}
</h1>
        </div>
        {renderContent()}
      </div>
    </main>
  );
}
