"use client";

import { useRouter, usePathname } from "next/navigation";
import {   useMemo } from "react";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/SuperDashboard/Sidebar";
import Loading from "@/components/custom/Loading";
import { MoveLeft } from "lucide-react";

interface DashboardLayoutProps {
	children: React.ReactNode;
}

export default function VendorLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn, loading, role } = useAuth();

	// Authentication and role check
	const allowed = useMemo(() => {
		if (loading) return false;
		if (!isLoggedIn) {
			router.replace("/auth/login");
			return false;
		}
		if (role !== ROLES.VENDOR) {
			router.replace("/");
			return false;
		}
		return true;
	}, [loading, isLoggedIn, role, router]);

	// Derive active menu from pathname
	const currentMenu = useMemo(() => {
		const segment = pathname?.split("/")[2];
		if (!segment) return "Dashboard";

		const menuMap: { [key: string]: string } = {
			dashboard: "Dashboard",
			"manage-vendors": "Manage Vendors",
			"manage-parts": "Manage Parts",
			"coupons-discounts": "Coupons & Discounts",
			orders: "Orders",
			"service-request": "Service Request",
			"manage-mechanics": "Manage Mechanics",
			"manage-vehicles": "Manage Vehicles",
			"manage-car-make": "Manage Car Make",
			"manage-model-line": "Manage Model Line",
			"manage-engine-type": "Manage Engine Type",
			"financial-management": "Financial Management",
			"analytics-and-reporting": "Analytics and Reporting",
			"customer-support": "Customer Support",
			"manage-categories": "Manage Categories",
			"manage-subcategories": "Manage Subcategories",
			"manage-part-brands": "Manage Part Brands",
			"manage-shipments": "Manage Shipments",
		};

		return menuMap[segment] || "Dashboard";
	}, [pathname]);

	const handleBack = () => {
		router.back();
	};

	// Loading or not allowed states
	if (loading) {
		return <Loading />;
	}

	if (!allowed) {
		return null;
	}

	return (
		<div className="bg-gray-50">
			{/* Fixed Top Navbar */}
			<Navbar />

			<div className="mt-[40px] md:mt-[50px] lg:mt-[56px]">
				<Sidebar activeMenu={currentMenu} setActiveMenu={() => {}} />

				{/* Main Content Area */}
				<main className="ml-63 p-2 h-[calc(100vh-100px)]">
					<div className="flex items-center gap-4 my-2 ml-2">
						<button onClick={handleBack}>
							<MoveLeft className="text-[#9AE144] size-9" />
						</button>
						<h1 className="text-3xl font-dm-sans font-bold">{currentMenu}</h1>
					</div>
					<div className="p-2">{children}</div>
				</main>
			</div>
		</div>
	);
}
