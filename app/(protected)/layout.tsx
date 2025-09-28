"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Loading from "@/components/custom/Loading";

// Move public paths outside so it's stable
const publicPaths = ["/auth/login", "/auth/register"]; 

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const pathname = usePathname();
	const { isLoggedIn, loading } = useAuth();

	useEffect(() => {
		if (!loading && !isLoggedIn && !publicPaths.includes(pathname)) {
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
