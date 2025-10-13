"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/SuperDashboard/Sidebar";
import Loading from "@/components/custom/Loading";
import { MoveLeft } from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function AdminDashboardLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn, loading, role } = useAuth();

	const [allowed, setAllowed] = useState(false);
	const [activeMenu, setActiveMenu] = useState("");

	// Authentication and role check
	useEffect(() => {
		if (!loading) {
			if (!isLoggedIn) {
				router.replace("/auth/login");
			} else if (role === ROLES.VENDOR || role == ROLES.MECHANIC || role === ROLES.SERVICE_CENTER || role == ROLES.USER) {
				router.replace("/");
			} else {
				setAllowed(true);
			}
		}
	}, [loading, isLoggedIn, role, router]);

	// Derive active menu from pathname
	const currentMenu = useMemo(() => {
		const segment = pathname?.split("/")[2];
		if (!segment) return "Dashboard";

		const menuMap: { [key: string]: string } = {
			"dashboard": "Dashboard",
			"manage-vendors": "Manage Vendors",
			"manage-parts": "Manage Parts",
			"coupons-discounts": "Coupons & Discounts",
			"orders": "Orders",
			"service-request": "Service Request",
			"manage-mechanics": "Manage Mechanics",
			"manage-vehicles": "Manage Vehicles",
			"manage-car-make": "Manage Car Make",
			"manage-model-line": "Manage Model Line",
			"manage-engine-type": "Manage Engine Type",
			"manage-categories": "Manage Categories",
			"manage-subcategories": "Manage Subcategories",
			"manage-part-brands": "Manage Part Brands",
			"manage-plans": "Manage Plans",
			"add-plan": "Add Plan",
			"edit-plan": "Edit Plan",
			"financial-management": "Financial Management",
			"analytics-and-reporting": "Analytics and Reporting",
			"customer-support": "Customer Support",
		};

		return menuMap[segment] || "Dashboard";
	}, [pathname]);

	// Sync activeMenu with pathname changes
	useEffect(() => {
		setActiveMenu(currentMenu);
	}, [currentMenu]);

	const handleBack = () => {
		router.back();
	};

	// Loading or not allowed states
	if (loading) return <Loading />;
	if (!allowed) return null;

	return (
		<div className="bg-gray-50">
			{/* Fixed Top Navbar */}
			<Navbar />

			<div className="mt-[40px] md:mt-[50px] lg:mt-[56px] flex">
				{/* Sidebar with activeMenu control */}
				<Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

				{/* Main Content Area */}
				<main className="ml-63 p-2 h-[calc(100vh-100px)] w-full">
					<div className="flex items-center gap-4 my-2 ml-2">
						<button onClick={handleBack}>
							<MoveLeft className="text-[#9AE144] size-9" />
						</button>
						<h1 className="text-3xl font-dm-sans font-bold">{activeMenu}</h1>
					</div>
					<div className="p-2">{children}</div>
				</main>
			</div>
		</div>
	);
}
