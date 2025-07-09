'use client'

import { usePathname } from 'next/navigation';
import Navbar from '../../components/Navbar';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const hideNavbarRoutes = ['/login', '/signup'];

  return (
    <>
      {!hideNavbarRoutes.includes(pathname) && <Navbar />}
      {children}
    </>
  );
}
