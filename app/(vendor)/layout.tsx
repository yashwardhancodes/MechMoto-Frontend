"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Navbar from "@/components/Navbar";
import Loading from "@/components/custom/Loading";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isLoggedIn, loading, role } = useAuth();

	useEffect(() => {
		if (!loading) {
			if (!isLoggedIn) {
				router.replace("/auth/login");
			} else if (role !== ROLES.VENDOR) {
				router.replace("/");
			}
		}
	}, [loading, isLoggedIn, role, router]);

	if (loading || !isLoggedIn || role !== ROLES.VENDOR) {
		return <Loading />;
	}

	return <><Navbar />{children}</>;
}
