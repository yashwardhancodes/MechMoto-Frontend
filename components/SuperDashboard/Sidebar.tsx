"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { LogOut, Layers, List, Tag } from "lucide-react";
import { LuLayoutDashboard } from "react-icons/lu";
import { IoPeopleOutline } from "react-icons/io5";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { CiDiscount1 } from "react-icons/ci";
import { MdMiscellaneousServices } from "react-icons/md";
import { BiSupport } from "react-icons/bi";
import { hasPermission, Role, UserPermission } from "@/lib/auth";
import { ROLES } from "@/constants/roles";
import { User } from "@/lib/redux/slices/authSlice";

type MenuItem = {
	label: string;
	icon: React.ReactNode;
	basePath: string;
	permission: string;
	subItems?: { label: string; basePath: string; icon: React.ReactNode; permission: string }[];
	path?: string;
};

type Props = {
	activeMenu?: string;
	setActiveMenu: (menu: string) => void;
	isOpen: boolean; // NEW
	setIsOpen: (open: boolean) => void; // NEW
};

const menuItems: MenuItem[] = [
	{
		label: "Dashboard",
		icon: <LuLayoutDashboard size={16} />,
		basePath: "dashboard",
		permission: "read:dashboard",
	},
	{
		label: "Live Calls",
		icon: <BiSupport size={16} />,
		basePath: "manage-live-calls",
		permission: "read:expert_help",
	},
	{
		label: "Manage Users",
		icon: <IoPeopleOutline size={18} />,
		basePath: "manage-users",
		permission: "read:user_management",
	},
	{
		label: "Manage Vendors",
		icon: <IoPeopleOutline size={18} />,
		basePath: "manage-vendors",
		permission: "read:vendor",
	},
	{
		label: "Manage Parts",
		icon: <HiOutlineShoppingBag size={18} />,
		basePath: "manage-parts",
		permission: "read:part",
		subItems: [
			{
				label: "Manage Categories",
				basePath: "manage-categories",
				icon: <Layers size={16} />,
				permission: "read:category",
			},
			{
				label: "Manage Subcategories",
				basePath: "manage-subcategories",
				icon: <List size={16} />,
				permission: "read:subcategory",
			},
			{
				label: "Manage Part Brands",
				basePath: "manage-part-brands",
				icon: <Tag size={16} />,
				permission: "read:part_brand",
			},
		],
	},
	{
		label: "Manage Plans",
		icon: <Tag size={16} />,
		basePath: "manage-plans",
		permission: "read:plan",
	},
	{
		label: "Coupons & Discounts",
		icon: <CiDiscount1 size={18} />,
		basePath: "coupons-and-discounts",
		permission: "read:coupon",
	},
	{ label: "Orders", icon: <Tag size={16} />, basePath: "orders", permission: "read:order" },
	{
		label: "Shipments",
		icon: <Tag size={16} />,
		basePath: "manage-shipments",
		permission: "read:shipment",
	},
	{
		label: "Service Request",
		icon: <MdMiscellaneousServices size={18} />,
		basePath: "manage-service-requests",
		permission: "read:service_request",
	},
	{
		label: "Roles and Permissions",
		icon: <MdMiscellaneousServices size={18} />,
		basePath: "manage-roles",
		permission: "read:role",
	},
	{
		label: "Manage Mechanics",
		icon: <Tag size={16} />,
		basePath: "manage-mechanics",
		permission: "read:mechanic",
	},
	{
		label: "Manage Vehicles",
		icon: <Tag size={16} />,
		basePath: "manage-vehicles",
		permission: "read:vehicle",
		subItems: [
			{
				label: "Manage Car Make",
				basePath: "manage-car-make",
				icon: <Layers size={16} />,
				permission: "read:car_make",
			},
			{
				label: "Manage Model Line",
				basePath: "manage-model-line",
				icon: <List size={16} />,
				permission: "read:model_line",
			},
			{
				label: "Manage Generations",
				basePath: "manage-model",
				icon: <List size={16} />,
				permission: "read:vehicle", // ← Now safe to use
			},
			{
				label: "Manage Modification",
				basePath: "manage-modifications",
				icon: <List size={16} />,
				permission: "read:modification",
			},
			{
				label: "Manage Engine Type",
				basePath: "manage-engine-type",
				icon: <Tag size={16} />,
				permission: "read:engine_type",
			},
		],
	},
	{
		label: "Manage Service Center",
		icon: <MdMiscellaneousServices size={18} />,
		basePath: "manage-service-center",
		permission: "read:service_center",
	},
	{
		label: "Manage DTC codes",
		icon: <MdMiscellaneousServices size={18} />,
		basePath: "dtc",
		permission: "read:dtc",
	},
	// {
	// 	label: "Financial Management",
	// 	icon: <Tag size={16} />,
	// 	basePath: "financial-management",
	// 	permission: "read:financials",
	// },
	// {
	// 	label: "Analytics and Reporting",
	// 	icon: <Tag size={16} />,
	// 	basePath: "analytics-and-reporting",
	// 	permission: "read:analytics",
	// },
	// {
	// 	label: "Customer Support",
	// 	icon: <BiSupport size={16} />,
	// 	basePath: "customer-support",
	// 	permission: "read:support",
	// },
];

export default function Sidebar({ setActiveMenu, isOpen, setIsOpen }: Props) {
	const router = useRouter();
	const pathname = usePathname();

	const [user, setUser] = useState<User | null>(null);
	const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

	useEffect(() => {
		const storageKey = "auth";

		// ✅ Check localStorage first (persistent)
		let storedUserData = localStorage.getItem(storageKey);
		if (!storedUserData) {
			// Fallback to sessionStorage (current session)
			console.log("user data not found");
			storedUserData = sessionStorage.getItem(storageKey);
		}
		if (storedUserData) {
			const user: { user: User } = JSON.parse(storedUserData);
			console.log("user", user);
			setUser(user.user);
		}
	}, []);

	const getBasePath = (role: Role | string | null) => {
		if (role == ROLES.VENDOR) {
			return "/vendor";
		} else if (role == ROLES.SERVICE_CENTER) {
			return "/service-center";
		} else if (role == ROLES.MECHANIC) {
			return "/mechanic";
		}
		return "/admin";
	};

	const filteredMenuItems = useMemo(() => {
		if (!user?.role?.name) return [];
		return menuItems
			.filter((item) =>
				hasPermission({ user, permission: item.permission as UserPermission }),
			)
			.map((item) => ({
				...item,
				path: `${getBasePath(user?.role?.name)}/${item.basePath}`,
				subItems: item.subItems
					? item.subItems
						.filter((sub) =>
							hasPermission({
								user,
								permission: sub.permission as UserPermission,
							}),
						)
						.map((sub) => ({
							...sub,
							path: `${getBasePath(user.role.name)}/${sub.basePath}`,
						}))
					: undefined,
			}));
	}, [user]);

	useEffect(() => {
		if (user?.role?.name) {
			const vehicleMenu = filteredMenuItems.find((item) => item.label === "Manage Vehicles");
			const partsMenu = filteredMenuItems.find((item) => item.label === "Manage Parts");
			const plansMenu = filteredMenuItems.find((item) => item.label === "Manage Plans");

			if (vehicleMenu?.subItems) {
				const isVehicleSubItemActive = vehicleMenu.subItems.some(
					(subItem) => pathname === subItem.path,
				);
				if (isVehicleSubItemActive) setExpandedMenu("Manage Vehicles");
			}

			if (partsMenu?.subItems) {
				const isPartsSubItemActive = partsMenu.subItems.some(
					(subItem) => pathname === subItem.path,
				);
				if (isPartsSubItemActive) setExpandedMenu("Manage Parts");
			}

			if (plansMenu?.subItems) {
				const isPlansSubItemActive = plansMenu.subItems.some(
					(subItem) => pathname === subItem.path,
				);
				if (isPlansSubItemActive) setExpandedMenu("Manage Plans");
			}
		}
	}, [user, pathname, filteredMenuItems, setExpandedMenu]);

	const handleClick = (item: MenuItem) => {
		if (
			!user?.role?.name ||
			!hasPermission({
				user,
				permission: item.permission as UserPermission,
			})
		) {
			router.push("/admin/unauthorized");
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

	const handleLogout = () => {
		localStorage.removeItem("auth");
		router.push("/login");
	};

	return (
		<>
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}
			<aside
				className={`
    bg-white shadow-md flex flex-col justify-between fixed top-[56px] left-0 h-[calc(100vh-56px)] w-63 z-50
    overflow-y-auto
    transform transition-transform duration-300
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0            /* always open on desktop */
  `}
			>
				<div>
					<ul className="pt-6 space-y-2 px-4 text-sm font-medium text-[#5F6165]">
						{filteredMenuItems.map((item) => {
							const isActive =
								pathname === item.path ||
								pathname.startsWith(item.path + "/") ||
								(item.subItems?.some(
									(sub) =>
										pathname === sub.path ||
										pathname.startsWith(sub.path + "/"),
								) ??
									false);
							const isExpanded = expandedMenu === item.label;
							const subItems = item.subItems || [];

							return (
								<div key={item.label}>
									<li
										onClick={() => handleClick(item)}
										className={`p-2 rounded-md flex items-center gap-2 cursor-pointer ${isActive ? "bg-[#DCF4BE]" : "hover:bg-gray-100"
											}`}
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
														if (
															user?.role?.name &&
															hasPermission({
																user,
																permission:
																	sub.permission as UserPermission,
															})
														) {
															router.push(sub.path);
														} else {
															router.push("/admin/unauthorized");
														}
													}}
													className={`p-2 rounded-md cursor-pointer flex items-center gap-2 ${pathname === sub.path ||
															pathname.startsWith(sub.path + "/")
															? "bg-[#DCF4BE]"
															: "hover:bg-gray-100"
														}`}
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

				<div className="mb-8 px-4 shrink-0">
					<button onClick={handleLogout} className="flex items-center gap-2 text-red-600">
						<LogOut size={16} /> Log out
					</button>
				</div>
			</aside>
		</>
	);
}
