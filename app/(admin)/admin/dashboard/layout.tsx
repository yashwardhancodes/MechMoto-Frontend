'use client'
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/SuperDashboard/Sidebar";
import { MoveLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState("");

  // Derive active menu from pathname
  const currentMenu = useMemo(() => {
    const segment = pathname?.split("/")[3]; // Get the 3rd segment (index starts at 0)
if (!segment) return "Dashboard";


    // Map slug back to menu label (optional enhancement)
    const menuMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'manage-vendors': 'Manage Vendors',
      'products': 'Products',
      'coupons-discounts': 'Coupons & Discounts',
      'orders': 'Orders',
      'service-request': 'Service Request',
      'manage-mechanics': 'Manage Mechanics',
      'manage-vehicles': 'Manage Vehicles',
      'financial-management': 'Financial Management',
      'analytics-and-reporting': 'Analytics and Reporting',
      'customer-support': 'Customer Support',
    };

    return menuMap[segment] || 'Dashboard';
  }, [pathname]);

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen p-2 bg-gray-50">
      {/* Fixed Top Navbar */}
      <Navbar />

      <div className="mt-[40px]  md:mt-[50px] lg:mt-[56px]">
        <Sidebar activeMenu={currentMenu} setActiveMenu={setActiveMenu} />

        {/* Main Content Area */}
        <main className=" ml-60 p-2  h-[calc(100vh-100px)] ">
          <div className="flex items-center gap-4  my-2 ml-2">
            <button onClick={handleBack}>
              <MoveLeft className="text-[#9AE144] size-9" />
            </button>

            <h1 className="text-3xl font-dm-sans font-bold   ">
              {currentMenu}
            </h1>
          </div>
          <div className="p-2">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
