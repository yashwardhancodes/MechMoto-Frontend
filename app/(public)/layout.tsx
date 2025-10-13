"use client";

import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { ROLES } from "@/constants/roles";
import { useRouter, usePathname } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, role } = useAuth();
  const currentPath = usePathname();

  useEffect(() => {
    const publicPaths = ["/", "/products/[subcategory]"];

    if (user) {
      if (publicPaths.includes(currentPath)) {
        let redirectPath = "/";
        if (role != undefined) {
          if (role === ROLES.USER) {
            redirectPath = "/";
          } else if (role === ROLES.VENDOR) {
            redirectPath = "/vendor/dashboard";
          } else if (role === ROLES.SERVICE_CENTER) {
            redirectPath = "/service-center/dashboard";
          } else if (role === ROLES.MECHANIC) {
            redirectPath = "/mechanic/dashboard";
          }else {
            redirectPath = "/admin/";
          } 
        }
        router.push(redirectPath);
      }
    }
  }, [user, router, role, currentPath]);

  return (
    <>
      <Navbar />
      <div className="mt-[40px] md:mt-[50px] lg:mt-[56px]">
        {children}
      </div>
    </>
  );
}
