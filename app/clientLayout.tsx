'use client';

import { usePathname } from 'next/navigation';
import Navbar from '../components/Navbar';
import { Footer } from '@/components/Footer';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const hideNavbarRoutes = ["/login", "/signup"];
	const hideFooterRoutes = ["/login", "/signup"];

	return (
		<>
			{!hideNavbarRoutes.includes(pathname) && <Navbar />}
			{children}
			{!hideFooterRoutes.includes(pathname) && <Footer />}
		</>
	);
}
