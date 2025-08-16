'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut, ShoppingCart, Wrench, Car, DollarSign, BarChart2, Layers, List, Tag } from 'lucide-react';
import { LuLayoutDashboard } from "react-icons/lu";
import { IoPeopleOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { CiDiscount1 } from "react-icons/ci";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiSupport } from "react-icons/bi";

type Props = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const menuItems = [
  { label: 'Dashboard', icon: <LuLayoutDashboard size={16} /> },
  { label: 'Manage Vendors', icon: <IoPeopleOutline size={18} /> },
  {
    label: 'Parts',
    icon: <HiOutlineShoppingBag size={18} />,
    subItems: [
      { label: 'Manage Categories', path: '/admin/manage-categories', icon: <Layers size={16} /> },
      { label: 'Manage Subcategories', path: '/admin/manage-subcategories', icon: <List size={16} /> },
      { label: 'Manage Part Brands', path: '/admin/manage-part-brands', icon: <Tag size={16} /> },
    ]
  },
  { label: 'Coupons & Discounts', icon: <CiDiscount1 size={18} /> },
  { label: 'Orders', icon: <ShoppingCart size={16} /> },
  { label: 'Service Request', icon: <MdMiscellaneousServices size={18} /> },
  { label: 'Manage Mechanics', icon: <Wrench size={16} /> },
  {
    label: 'Manage Vehicles',
    icon: <Car size={16} />,
    subItems: [
      { label: 'Manage Car Make', path: '/admin/manage-car-make', icon: <Layers size={16} /> },
      { label: 'Manage Model Line', path: '/admin/manage-model-line', icon: <List size={16} /> },
      { label: 'Manage Engine Type', path: '/admin/manage-engine-type', icon: <Tag size={16} /> },
    ]
  },
  { label: 'Financial Management', icon: <DollarSign size={16} /> },
  { label: 'Analytics and Reporting', icon: <BarChart2 size={16} /> },
  { label: 'Customer Support', icon: <BiSupport size={16} /> },
];

export default function Sidebar({ activeMenu, setActiveMenu }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize expandedMenu based on whether the current pathname matches any subitem path
  const [expandedMenu, setExpandedMenu] = useState<string | null>(() => {
    const vehicleMenu = menuItems.find(item => item.label === 'Manage Vehicles');
    const partsMenu = menuItems.find(item => item.label === 'Parts');
    
    if (vehicleMenu?.subItems) {
      const isVehicleSubItemActive = vehicleMenu.subItems.some(subItem => pathname === subItem.path);
      if (isVehicleSubItemActive) return 'Manage Vehicles';
    }
    
    if (partsMenu?.subItems) {
      const isPartsSubItemActive = partsMenu.subItems.some(subItem => pathname === subItem.path);
      if (isPartsSubItemActive) return 'Parts';
    }
    
    return null;
  });

  const handleClick = (item: any) => {
    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.label ? null : item.label);
      // Redirect to the main item's path for menus with subitems
      if (item.label === 'Manage Vehicles') {
        router.push('/admin/manage-vehicles');
      } else if (item.label === 'Parts') {
        router.push('/admin/parts');
      }
    } else {
      const slug = item.label.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
      router.push(`/admin/${slug}`);
    }
  };

  return (
    <aside className="bg-white h-[calc(100vh-56px)] w-63 shadow-md flex flex-col justify-between fixed">
      <div>
        <ul className="pt-6 space-y-2 px-4 text-sm font-medium text-[#5F6165]">
          {menuItems.map((item) => {
            const slug = item.label.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
            const isActive = pathname.startsWith(`/admin/${slug}`);
            const isExpanded = expandedMenu === item.label;

            return (
              <div key={item.label}>
                <li
                  onClick={() => handleClick(item)}
                  className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${isActive ? 'bg-[#DCF4BE]' : 'hover:bg-gray-100'}`}
                >
                  {item.icon}
                  {item.label}
                </li>

                {/* Submenu */}
                {item.subItems && isExpanded && (
                  <ul className="pl-8 mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <li
                        key={sub.label}
                        onClick={() => router.push(sub.path)}
                        className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${pathname === sub.path ? 'bg-[#DCF4BE]' : 'hover:bg-gray-100'}`}
                      >
                        {sub.icon}
                        {sub.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </ul>
      </div>

      <div className="mb-8 px-4">
        <button className="flex items-center gap-2 text-red-600">
          <LogOut size={16} /> Log out
        </button>
      </div>
    </aside>
  );
}