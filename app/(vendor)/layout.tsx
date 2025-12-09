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

export default function VendorLayout({ children }: DashboardLayoutProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn, loading, role } = useAuth();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [allowed, setAllowed] = useState(false);
	const [activeMenu, setActiveMenu] = useState("");

	useEffect(() => {
		if (!loading) {
			if (!isLoggedIn) {
				router.replace("/auth/login");
			} else if (role !== ROLES.VENDOR) {
				router.replace("/");
			} else {
				setAllowed(true);
			}
		}
	}, [loading, isLoggedIn, role, router]);

	const currentMenu = useMemo(() => {
		const segment = pathname?.split("/")[2] || "";
		const menuMap: { [key: string]: string } = {
			dashboard: "Dashboard",
			"manage-parts": "Manage Parts",
			orders: "Orders",
			"manage-shipments": "Manage Shipments",
			"coupons-discounts": "Coupons & Discounts",
			"financial-management": "Financial Management",
			"analytics-and-reporting": "Analytics",
		};
		return menuMap[segment] || "Dashboard";
	}, [pathname]);

	useEffect(() => {
		setActiveMenu(currentMenu);
	}, [currentMenu]);

	const handleBack = () => router.back();

	if (loading) return <Loading />;
	if (!allowed) return null;

	return (
		<div className="bg-gray-50 min-h-screen">
			<Navbar />

			<button
				className="md:hidden fixed top-3 left-3 z-[60] bg-white p-2 rounded"
				onClick={() => setSidebarOpen(!sidebarOpen)}
			>
				<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M4 6h16M4 12h16M4 18h16"
					/>
				</svg>
			</button>

			<div className="mt-[40px] md:mt-[50px] lg:mt-[56px] flex">
				<Sidebar
					activeMenu={activeMenu}
					setActiveMenu={setActiveMenu}
					isOpen={sidebarOpen}
					setIsOpen={setSidebarOpen}
				/>

				<main className="w-full md:ml-63 p-2 h-[calc(100vh-100px)]">
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
