"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Loading from "@/components/custom/Loading";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn, loading } = useAuth();

	useEffect(() => {
		if (!loading && !isLoggedIn) {
			router.replace("/auth/login");
		}
	}, [loading, isLoggedIn, pathname, router]);

	if (loading || !isLoggedIn) {
		return <Loading />;
	}

	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
