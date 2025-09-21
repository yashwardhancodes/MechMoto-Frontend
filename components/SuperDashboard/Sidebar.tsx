'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { LuLayoutDashboard } from 'react-icons/lu';
import { IoPeopleOutline } from 'react-icons/io5';
import { HiOutlineShoppingBag } from 'react-icons/hi2';
import { CiDiscount1 } from 'react-icons/ci';
import { MdMiscellaneousServices } from 'react-icons/md';
import { BiSupport } from 'react-icons/bi';
import { Layers, List, Tag } from 'lucide-react';
import { hasPermission, Role, Permission } from '@/lib/auth';

type MenuItem = {
  label: string;
  icon: React.ReactNode;
  basePath: string;
  permission: string;
  subItems?: { label: string; basePath: string; icon: React.ReactNode; permission: string }[];
  path?: string
};

type Props = {
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
};

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: <LuLayoutDashboard size={16} />, basePath: 'dashboard', permission: 'view:dashboard' },
  { label: 'Manage Vendors', icon: <IoPeopleOutline size={18} />, basePath: 'manage-vendors', permission: 'view:vendors' },
  {
    label: 'Manage Parts',
    icon: <HiOutlineShoppingBag size={18} />,
    basePath: 'manage-parts',
    permission: 'view:parts',
    subItems: [
      { label: 'Manage Categories', basePath: 'manage-categories', icon: <Layers size={16} />, permission: 'manage:categories' },
      { label: 'Manage Subcategories', basePath: 'manage-subcategories', icon: <List size={16} />, permission: 'manage:subcategories' },
      { label: 'Manage Part Brands', basePath: 'manage-part-brands', icon: <Tag size={16} />, permission: 'manage:part-brands' },
    ],
  },
  {
    label: 'Manage Plans',
    icon: <Tag size={16} />,
    basePath: 'manage-plans',
    permission: 'view:plans',
    subItems: [
      { label: 'Manage Plan Types', basePath: 'manage-plan-types', icon: <Layers size={16} />, permission: 'manage:plan-types' },
      { label: 'Manage Plan Features', basePath: 'manage-plan-features', icon: <List size={16} />, permission: 'manage:plan-features' },
      { label: 'Manage Plan Pricing', basePath: 'manage-plan-pricing', icon: <Tag size={16} />, permission: 'manage:plan-pricing' },
    ],
  },
  { label: 'Coupons & Discounts', icon: <CiDiscount1 size={18} />, basePath: 'coupons-and-discounts', permission: 'view:coupons' },
  { label: 'Orders', icon: <Tag size={16} />, basePath: 'orders', permission: 'view:orders' },
  { label: 'Service Request', icon: <MdMiscellaneousServices size={18} />, basePath: 'service-request', permission: 'view:service-request' },
  { label: 'Manage Mechanics', icon: <Tag size={16} />, basePath: 'manage-mechanics', permission: 'view:mechanics' },
  {
    label: 'Manage Vehicles',
    icon: <Tag size={16} />,
    basePath: 'manage-vehicles',
    permission: 'view:vehicles',
    subItems: [
      { label: 'Manage Car Make', basePath: 'manage-car-make', icon: <Layers size={16} />, permission: 'manage:car-make' },
      { label: 'Manage Model Line', basePath: 'manage-model-line', icon: <List size={16} />, permission: 'manage:model-line' },
      { label: 'Manage Engine Type', basePath: 'manage-engine-type', icon: <Tag size={16} />, permission: 'manage:engine-type' },
    ],
  },
  {
    label: 'Manage Service Center', icon: <MdMiscellaneousServices size={18} />, basePath: 'manage-service-center', permission: 'manage:service-center'
  },

  { label: 'Financial Management', icon: <Tag size={16} />, basePath: 'financial-management', permission: 'view:financials' },
  { label: 'Analytics and Reporting', icon: <Tag size={16} />, basePath: 'analytics-and-reporting', permission: 'view:analytics' },
  { label: 'Customer Support', icon: <BiSupport size={16} />, basePath: 'customer-support', permission: 'view:support' },
];

export default function Sidebar({ activeMenu, setActiveMenu }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [userRole, setUserRole] = useState<Role | null>(null);
  console.log("User role in Sidebar:", userRole);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  useEffect(() => {
    const storedUserData = localStorage.getItem('auth');
    if (storedUserData) {
      const user = JSON.parse(storedUserData);
      setUserRole(user.user.role?.name as Role);
    }
  }, []);

  const getBasePath = (role: Role | null) => {
    return role === 'Vendor' ? '/vendor' : '/admin';
  };

  const filteredMenuItems = userRole
    ? menuItems
      .filter((item) => hasPermission({ user: { id: '', role: userRole }, permission: item.permission as Permission }))
      .map((item) => ({
        ...item,
        path: `${getBasePath(userRole)}/${item.basePath}`,
        subItems: item.subItems
          ? item.subItems
            .filter((sub) => hasPermission({ user: { id: '', role: userRole }, permission: sub.permission as Permission }))
            .map((sub) => ({ ...sub, path: `${getBasePath(userRole)}/${sub.basePath}` }))
          : undefined,
      }))
    : [];

  useEffect(() => {
    if (userRole) {
      const vehicleMenu = filteredMenuItems.find((item) => item.label === 'Manage Vehicles');
      const partsMenu = filteredMenuItems.find((item) => item.label === 'Manage Parts');
      const plansMenu = filteredMenuItems.find((item) => item.label === 'Manage Plans');

      if (vehicleMenu?.subItems) {
        const isVehicleSubItemActive = vehicleMenu.subItems.some((subItem) => pathname === subItem.path);
        if (isVehicleSubItemActive) setExpandedMenu('Manage Vehicles');
      }

      if (partsMenu?.subItems) {
        const isPartsSubItemActive = partsMenu.subItems.some((subItem) => pathname === subItem.path);
        if (isPartsSubItemActive) setExpandedMenu('Manage Parts');
      }

      if (plansMenu?.subItems) {
        const isPlansSubItemActive = plansMenu.subItems.some((subItem) => pathname === subItem.path);
        if (isPlansSubItemActive) setExpandedMenu('Manage Plans');
      }
    }
  }, [userRole, pathname]);

  const handleClick = (item: MenuItem) => {
    if (!userRole || !hasPermission({ user: { id: '', role: userRole }, permission: item.permission as Permission })) {
      router.push('/admin/unauthorized');
      return;
    }

    if (item.subItems) {
      setExpandedMenu(expandedMenu === item.label ? null : item.label);
      router.push(item.path ?? "");
    } else {
      setActiveMenu(item.label);
      router.push(item.path ?? "");
    }
  };

  return (
    <aside className="bg-white h-[calc(100vh-56px)] w-63 shadow-md flex flex-col justify-between fixed">
      <div>
        <ul className="pt-6 space-y-2 px-4 text-sm font-medium text-[#5F6165]">
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.path || (item.subItems?.some((sub) => sub.path === pathname) ?? false);
            const isExpanded = expandedMenu === item.label;
            const subItems = item.subItems || [];

            return (
              <div key={item.label}>
                <li
                  onClick={() => handleClick(item)}
                  className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${isActive ? 'bg-[#DCF4BE]' : 'hover:bg-gray-100'}`}
                >
                  {item.icon}
                  {item.label}
                </li>

                {item.subItems && isExpanded && subItems.length > 0 && (
                  <ul className="pl-8 mt-1 space-y-1">
                    {subItems.map((sub) => (
                      <li
                        key={sub.label}
                        onClick={() => {
                          if (hasPermission({ user: { id: '', role: userRole! }, permission: sub.permission as Permission })) {
                            router.push(sub.path);
                          } else {
                            router.push('/admin/unauthorized');
                          }
                        }}
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