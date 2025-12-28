"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import navLogo from "@/public/assets/translogo.png";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useGetAllSubscriptionsQuery } from "@/lib/redux/api/subscriptionApi";
import NotificationDropdown from "./notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";
import { ROLES } from "@/constants/roles";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";

interface Subscription {
	id: number;
	razorpay_subscription_id: string;
	plan: { id: number; name: string };
}

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const { isLoggedIn, user, signOut } = useAuth();
	const router = useRouter();

	const { unreadNotifications, unreadCount, isLoading: unreadLoading } = useNotifications();

	const { data: subscriptions } = useGetAllSubscriptionsQuery({});
	const particularSubscription = subscriptions?.find(
		(s: Subscription) => s.razorpay_subscription_id === user?.razorpaySubscriptionId,
	);

	// close desktop dropdown on outside click
	useEffect(() => {
		const handleClickOutside = (e: any) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<>
			{/* DESKTOP NAVBAR */}
			<div className="hidden md:flex fixed top-0 w-full h-[56px] px-6 bg-[#050B20] text-white z-50 justify-between items-center border-b border-white/10 backdrop-blur-sm">
				<Link href="/">
					<Image
						src={navLogo}
						alt="logo"
						className="h-[50px] w-auto hover:scale-105 transition duration-300"
					/>
				</Link>

				<div className="flex items-center gap-6 text-sm">
					{(!isLoggedIn || user?.role.name === ROLES.USER) && (
						<>
							<Link href="/" className="hover:text-[#9AE144] transition">
								Home
							</Link>
							<Link href="/dtc" className="hover:text-[#9AE144] transition">
								DTC
							</Link>
							{/* <Link href="/about" className="hover:text-[#9AE144] transition">
								About Us
							</Link>
							<Link href="/contact" className="hover:text-[#9AE144] transition">
								Contact
							</Link> */}
						</>
					)}

					{isLoggedIn && (
						<NotificationDropdown
							unreadNotifications={unreadNotifications}
							unreadCount={unreadCount}
							isLoading={unreadLoading}
						/>
					)}
					{/* FULLSCREEN TOGGLE */}
					{
						isLoggedIn && user.role.name !== ROLES.USER &&
						<button
							onClick={() => {
								if (!document.fullscreenElement) {
									document.documentElement.requestFullscreen();
								} else {
									document.exitFullscreen();
								}
							}}
							className="p-2 rounded hover:bg-white/10 transition"
						>
							<FontAwesomeIcon
								icon={document.fullscreenElement ? faCompress : faExpand}
								className="text-lg"
							/>
						</button>
					}

					{/* DESKTOP DROPDOWN */}
					<div className="relative hidden md:block" ref={dropdownRef}>
						{!isLoggedIn ? (
							<Link
								href="/auth/login"
								className="flex items-center gap-2 hover:text-[#9AE144]"
							>
								<FontAwesomeIcon icon={faUser} />
								Sign in
							</Link>
						) : (
							<div
								onClick={() => setDropdownOpen(!dropdownOpen)}
								className="bg-green-500 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-bold hover:scale-105 transition"
							>
								{user.email[0].toUpperCase()}
							</div>
						)}

						<AnimatePresence>
							{dropdownOpen && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.18 }}
									className="absolute right-0 mt-4 bg-white text-gray-700 w-44 rounded shadow-md z-50"
								>
									<ul className="py-2 text-sm">
										<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
											My Profile
										</li>
										<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
											<Link href="/orders">My Orders</Link>
										</li>
										<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
											<Link href="/wishlist">My Wishlist</Link>
										</li>
										{particularSubscription && (
											<li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
												Plan: {particularSubscription.plan.name}
											</li>
										)}
										<li
											className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
											onClick={() => {
												signOut();
												router.push("/auth/login");
											}}
										>
											Sign Out
										</li>
									</ul>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{isLoggedIn && user.role.name === ROLES.USER && (
						<Link
							href="/products/cart"
							className="px-4 py-2 rounded-3xl bg-gradient-to-r from-[#1F5B05] to-[#9AE144] text-black flex items-center gap-2 hover:opacity-90 transition"
						>
							My Cart
							<FontAwesomeIcon icon={faCartShopping} />
						</Link>
					)}
				</div>
			</div>

			{/* MOBILE NAVBAR */}
			<div className="md:hidden fixed top-0 w-full h-[48px] bg-[#050B20] text-white px-3 flex items-center justify-between z-50 border-b border-white/10 backdrop-blur">
				<button
					onClick={() => setSidebarOpen(true)}
					className="w-9 h-9 bg-[#9AE144] rounded flex items-center justify-center active:scale-95 transition"
				>
					<Menu className="text-black w-5 h-5" />
				</button>

				<Link href="/">
					<Image
						src={navLogo}
						alt="logo"
						className="h-[38px] w-auto hover:scale-105 transition"
					/>
				</Link>

				<div className="flex items-center gap-3">
					{isLoggedIn && (
						<button
							onClick={() => router.push("/notifications")}
							className="active:scale-90 transition"
						>
							<FontAwesomeIcon icon={faBell} className="text-sm" />
						</button>
					)}

					{isLoggedIn ? (
						<button
							onClick={() => router.push("/profile")}
							className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center font-bold active:scale-95 transition"
						>
							{user.email[0].toUpperCase()}
						</button>
					) : (
						<button
							onClick={() => router.push("/auth/login")}
							className="active:scale-90 transition"
						>
							<FontAwesomeIcon icon={faUser} className="text-sm" />
						</button>
					)}

					{isLoggedIn && user.role.name === ROLES.USER && (
						<button
							onClick={() => router.push("/products/cart")}
							className="w-9 h-9 rounded-full bg-gradient-to-r from-[#1F5B05] to-[#9AE144] flex items-center justify-center active:scale-90 transition"
						>
							<FontAwesomeIcon icon={faCartShopping} className="text-xs text-black" />
						</button>
					)}
				</div>
			</div>

			{/* MOBILE SIDEBAR */}
			<AnimatePresence>
				{sidebarOpen && (
					<>
						{/* OVERLAY */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 0.5 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="fixed inset-0 bg-black/50 z-40"
							onClick={() => setSidebarOpen(false)}
						/>

						{/* SIDEBAR */}
						<motion.div
							initial={{ x: -300 }}
							animate={{ x: 0 }}
							exit={{ x: -300 }}
							transition={{ type: "tween", duration: 0.25 }}
							className="fixed top-0 left-0 h-full w-64 bg-[#050B20] text-white z-50 pt-16 px-5 shadow-xl"
						>
							<button
								onClick={() => setSidebarOpen(false)}
								className="absolute top-4 left-4 w-9 h-9 bg-[#9AE144] rounded flex items-center justify-center active:scale-95 transition"
							>
								<X className="text-black w-5 h-5" />
							</button>

							<div className="flex flex-col space-y-4 text-base mt-2">
								<Link href="/" onClick={() => setSidebarOpen(false)}>
									Home
								</Link>
								<Link href="/dtc" onClick={() => setSidebarOpen(false)}>
									DTC
								</Link>
								{/* <Link href="/about" onClick={() => setSidebarOpen(false)}>
									About Us
								</Link>
								<Link href="/contact" onClick={() => setSidebarOpen(false)}>
									Contact
								</Link> */}

								{isLoggedIn && (
									<>
										<Link href="/profile" onClick={() => setSidebarOpen(false)}>
											My Profile
										</Link>
										<Link href="/orders" onClick={() => setSidebarOpen(false)}>
											My Orders
										</Link>
										<Link
											href="/wishlist"
											onClick={() => setSidebarOpen(false)}
										>
											My Wishlist
										</Link>
										<Link
											href="/notifications"
											onClick={() => setSidebarOpen(false)}
										>
											Notifications
										</Link>

										<button
											onClick={() => {
												signOut();
												router.push("/auth/login");
											}}
											className="text-red-300 text-left mt-2"
										>
											Sign Out
										</button>
									</>
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
};

export default Navbar;
