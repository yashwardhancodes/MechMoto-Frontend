"use client";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import {ROLES} from "@/constants/roles";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const {user, role} = useAuth();
	const publicPaths = ["/", "/products/[subcategory]"];
	const currentPath = usePathname();

	useEffect(() => {
		if (user) {
		  if (publicPaths.includes(currentPath)) {
			let redirectPath = "/";
			if (role != undefined) {
				if (role === ROLES.SUPER_ADMIN) {
					redirectPath = "/admin/dashboard/dashboard";
				} else if (role === ROLES.VENDOR) {
					redirectPath = "/vendor/dashboard";
				}
			}
			router.push(redirectPath);
		  }
		}
	  }, [user, router]);
	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
