'use client';
import { LogOut, ShoppingCart, Wrench, Car, DollarSign, BarChart2 } from 'lucide-react';
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
  { label: 'Products', icon: <HiOutlineShoppingBag size={18} /> },
  { label: 'Coupons & Discounts', icon: <CiDiscount1 size={18} /> },
  { label: 'Orders', icon: <ShoppingCart size={16} /> },
  { label: 'Service Request', icon: <MdMiscellaneousServices size={18} /> },
  { label: 'Manage Mechanics', icon: <Wrench size={16} /> },
  { label: 'Manage Vehicle', icon: <Car size={16} /> },
  { label: 'Financial Management', icon: <DollarSign size={16} /> },
  { label: 'Analytics and Reporting', icon: <BarChart2 size={16} /> },
  { label: 'Customer Support', icon: <BiSupport size={16} /> },
];

export default function Sidebar({ activeMenu, setActiveMenu }: Props) {
  return (
    <aside className="bg-white h-[calc(100vh-56px)] w-60 shadow-md flex flex-col justify-between fixed">
      <div>
        <ul className="pt-6 space-y-2 px-4 text-sm font-medium text-[#5F6165]">
          {menuItems.map((item) => (
            <li
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${
                activeMenu === item.label
                  ? 'bg-[#DCF4BE]  '
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-8 px-4">
        <button className="flex items-center gap-2 text-red-600"><LogOut size={16} /> Log out</button>
      </div>
    </aside>
  );
}
