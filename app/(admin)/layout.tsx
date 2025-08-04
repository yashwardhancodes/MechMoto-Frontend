"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { ROLES } from "@/constants/roles";
import Navbar from "@/components/Navbar";
import Loading from "@/components/custom/Loading";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isLoggedIn, loading, role } = useAuth();

	const [allowed, setAllowed] = useState(false);

	useEffect(() => {
		if (!loading) {
			if (!isLoggedIn) {
				router.replace("/auth/login");
			} else if (role !== ROLES.SUPER_ADMIN) {
				router.replace("/");
			} else {
				setAllowed(true);
			}
		}
	}, [loading, isLoggedIn, role, router]);

	if (loading) {
		return <Loading />;
	}

	if (!allowed) {
		return null;
	}

	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
