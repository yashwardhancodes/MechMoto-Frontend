// Updated Navbar component
"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import navLogo from "@/public/assets/navLogo.png";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faUser, faBell } from "@fortawesome/free-regular-svg-icons";
import { Menu, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useGetAllSubscriptionsQuery } from "@/lib/redux/api/subscriptionApi";
import NotificationDropdown from "./notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

// Define the Subscription interface based on the expected data structure
interface Subscription {
	id: number;
	razorpay_subscription_id: string;
	plan: {
		id: number;
		name: string;
		// Add other plan fields as needed
	};
	// Add other subscription fields as needed
}

const Navbar = () => {
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
	const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { isLoggedIn, user, loading, signOut } = useAuth();
	console.log(user?.razorpaySubscriptionId);

	const router = useRouter();

	const { data: subscriptions } = useGetAllSubscriptionsQuery({});

	const particularSubscription = subscriptions?.find(
		(subscription: Subscription) =>
			subscription.razorpay_subscription_id === user?.razorpaySubscriptionId,
	);

	console.log("particularSubscription", particularSubscription);

	const { unreadNotifications, unreadCount, isLoading: unreadLoading } = useNotifications();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<>
			{/* Desktop Navbar */}
			<div className="fixed top-0 w-full z-50 px-6 lg:px-12 hidden md:flex justify-between items-center md:h-[50px] lg:h-[56px] bg-[#050B20] font-sans text-white">
				<Link href={"/"} className="flex items-center">
					<Image src={navLogo} alt="logo" className="h-[45px] lg:h-[52px] w-auto" />
				</Link>
				<div className="flex items-center gap-4 lg:gap-8 text-xs lg:text-sm">
					<div className="flex items-center gap-4 lg:gap-8">
						<Link href={"/"}>Home</Link>
						<Link href={"/about"}>About Us</Link>
						<Link href={"/about"}>Contact</Link>
					</div>
					{/* Notification Dropdown */}
					{isLoggedIn && (
						<NotificationDropdown
							unreadNotifications={unreadNotifications}
							unreadCount={unreadCount}
							isLoading={unreadLoading}
						/>
					)}
					<div className="relative inline-block text-left" ref={dropdownRef}>
						{loading ? (
							"Loading"
						) : isLoggedIn ? (
							<div
								className="rounded-full bg-green-500 text-white font-bold w-8 h-8 flex justify-center items-center text-lg cursor-pointer"
								onClick={() => setDropdownOpen((prev) => !prev)}
							>
								{user?.email[0].toUpperCase()}
							</div>
						) : (
							<Link href={"/auth/login"}>
								<div className="flex space-x-2 items-center cursor-pointer justify-center">
									<FontAwesomeIcon icon={faUser} className="text-sm" />
									<span>Sign in</span>
								</div>
							</Link>
						)}
						{dropdownOpen && (
							<div className="absolute left-0 top-12 w-44 bg-white rounded-lg shadow-md z-50">
								<ul className="py-2 text-sm text-gray-700">
									{/* Check the role of the user */}
									{user?.role.name === "Admin" ? (
										<>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												Admin Dashboard
											</li>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												Manage Users
											</li>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												Settings
											</li>
										</>
									) : (
										<>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												My Profile
											</li>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												<Link href="/orders">My Orders</Link>
											</li>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												<Link href="/wishlist">My Wishlist</Link>
											</li>
											<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
												Settings
											</li>
										</>
									)}
									{/* Display Razorpay Subscription ID if present */}
									{particularSubscription && (
										<li className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
											Purchased Plan: {particularSubscription.plan.name}
										</li>
									)}
									{/* Sign out (common for all roles) */}
									<li
										className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
										onClick={() => {
											signOut();
											router.push("/auth/login");
										}}
									>
										Sign out
									</li>
								</ul>
							</div>
						)}
					</div>
					<Link
						href="/products/cart"
						className="flex items-center justify-between gap-1 lg:gap-2 px-3 lg:px-4 py-2 rounded-3xl bg-gradient-to-r from-[#1F5B05] to-[#9AE144] text-black font-medium shadow-md"
					>
						<span>My Cart</span>
						<FontAwesomeIcon icon={faCartShopping} className="text-sm" />
					</Link>
				</div>
			</div>

			{/* Mobile Navbar */}
			<div className="fixed top-0 w-full z-50 md:hidden flex justify-between items-center h-[40px] bg-[#050B20] font-sans text-white px-4">
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className="flex items-center justify-center rounded-full size-[25px] bg-[#9AE144] shrink-0"
				>
					{sidebarOpen ? (
						<X className="size-4 text-black" />
					) : (
						<Menu className="size-4 text-black" />
					)}
				</button>
				<div>
					<Link href={"/"}>
						<Image src={navLogo} alt="logo" className="h-[35px] w-auto" />
					</Link>
				</div>
				<div className="flex items-center justify-center gap-2">
					{isLoggedIn && <FontAwesomeIcon icon={faBell} className="text-sm" />}
					<Link href={"/auth/login"}>
						<FontAwesomeIcon icon={faUser} className="text-sm" />
					</Link>
					<button className="flex items-center justify-between rounded-3xl bg-gradient-to-r from-[#1F5B05] px-2 py-1.5 to-[#9AE144] text-black font-medium shadow-md">
						<FontAwesomeIcon icon={faCartShopping} className="text-xs" />
					</button>
				</div>
			</div>

			{/* Sidebar Menu */}
			{sidebarOpen && (
				<div className="md:hidden fixed top-[40px] flex flex-col left-0 w-2/3 sm:w-1/2 h-full bg-[#050B20] text-white z-50 p-4 space-y-4 transition-all duration-300 ease-in-out">
					<Link href="/" onClick={() => setSidebarOpen(false)}>
						Home
					</Link>
					<Link href="/about" onClick={() => setSidebarOpen(false)}>
						About Us
					</Link>
					<Link href="/about" onClick={() => setSidebarOpen(false)}>
						Contact
					</Link>
					{isLoggedIn && (
						<Link href="/notifications" onClick={() => setSidebarOpen(false)}>
							Notifications
						</Link>
					)}
				</div>
			)}
		</>
	);
};

export default Navbar;
