"use client";

import React, { useState, useEffect } from "react";
import {
	Star,
	Eye,
	MapPin,
	Heart,
	Truck,
	ShieldCheck,
	RefreshCw,
	Wrench,
	Package,
} from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useAddToWishlistMutation, useGetPartQuery } from "@/lib/redux/api/partApi";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice";
import { useAddToCartMutation } from "@/lib/redux/api/partApi";
import useAuth from "@/hooks/useAuth";
import toast from "react-hot-toast";
import Image from "next/image";
import { RootState } from "@/lib/redux/store";

interface WishlistItem {
	partId: number;
}

export default function ToyotaNexusBelt() {
	const { id } = useParams();
	const router = useRouter();
	const dispatch = useDispatch();
	const { isLoggedIn } = useAuth();
	const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
	const [addToWishlist] = useAddToWishlistMutation();
	const { data: response, isLoading, error } = useGetPartQuery(id);
	const part = response?.data;
	const { token } = useSelector((state: RootState) => state.auth);
	const [showAllVehicles, setShowAllVehicles] = useState(false);
	const images = part?.image_urls?.length
		? part.image_urls
		: [
				"https://png.pngtree.com/png-clipart/20240927/original/pngtree-car-engine-against-transparent-background-png-image_16100504.png",
		  ];

	const [currentIndex, setCurrentIndex] = useState(0);
	const [isInWishlist, setIsInWishlist] = useState(false);

	// ==== UPDATED: Pull ALL compatible vehicles from API (including cross-compatible ones) ====
	const compatibleVehicles = React.useMemo(() => {
		if (!part) return [];

		const vehicles = [];

		// 1. Add the primary vehicle the part was listed under
		if (part.vehicle) {
			vehicles.push({
				make: part.vehicle.modification?.model_line?.car_make?.name || "Unknown Make",
				model: part.vehicle.modification?.model_line?.name || "Unknown Model",
				variant: part.vehicle.modification?.name || "",
				year: part.vehicle.production_year?.toString() || "N/A",
				fuelType: part.vehicle.engine_type?.name || "Unknown",
			});
		}

		// 2. Add all vehicles from the compatibility array
		if (Array.isArray(part.compatibility)) {
			part.compatibility.forEach((comp: any) => {
				const v = comp.vehicle;
				if (v) {
					vehicles.push({
						make: v.modification?.model_line?.car_make?.name || "Unknown Make",
						model: v.modification?.model_line?.name || "Unknown Model",
						variant: v.modification?.name || "",
						year: v.production_year?.toString() || "N/A",
						fuelType: v.engine_type?.name || "Unknown",
					});
				}
			});
		}

		return vehicles;
	}, [part]);

	const prevSlide = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const nextSlide = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	const handleAddToCart = async () => {
		if (!isLoggedIn) {
			router.push("/login");
			return;
		}
		try {
			await addToCart({ partId: parseInt(id as string), quantity: 1 }).unwrap();
			toast.success("Item added to cart!");
		} catch (error) {
			console.error("Failed to add item to cart:", error);
			toast.error("Failed to add item to cart.");
		}
	};

	const handleToggleWishlist = async () => {
		if (!isLoggedIn) {
			router.push("/login");
			return;
		}
		const previousState = isInWishlist;
		setIsInWishlist(!isInWishlist);
		try {
			await addToWishlist({ partId: parseInt(id as string) }).unwrap();
		} catch (error) {
			setIsInWishlist(previousState);
			toast.error("Failed to toggle wishlist item.");
			console.error("Failed to toggle wishlist item:", error);
		}
	};

	useEffect(() => {
		if (part) {
			const breadcrumbs = [
				{ label: "All Categories", href: "/categories" },
				{
					label: part.category?.name || "Category",
					href: `/products?category_id=${part.category?.id}&vehicle_id=${part.vehicle?.id}`,
				},
				{
					label: part.subcategory?.name || "Subcategory",
					href: `/products?sub_category_id=${part.subcategory?.id}&vehicle_id=${part.vehicle?.id}`,
				},
				{ label: part.part_number || "Product Detail", href: `/products/${id}` },
			];
			dispatch(setBreadcrumbs(breadcrumbs));

			const checkWishlist = async () => {
				try {
					const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}wishlist`, {
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					});
					const wishlists: { success: boolean; data?: WishlistItem[] } =
						await response.json();
					const isWishlisted = wishlists.data?.some(
						(item) => item.partId === parseInt(id as string),
					);
					setIsInWishlist(isWishlisted);
				} catch (error: unknown) {
					console.error("Failed to check wishlist status:", error);
					toast.error("Failed to check wishlist status");
				}
			};

			if (isLoggedIn) {
				checkWishlist();
			}
		}
	}, [part, id, dispatch, isLoggedIn, token]);

	if (isLoading) {
		return <div className="p-6">Loading...</div>;
	}

	if (error || !part) {
		return <div className="p-6 text-red-600">Failed to load part details.</div>;
	}

	return (
		<div className="bg-white">
			<div className="flex font-[var(--font-poppins)] md:p-3 lg:p-6">
				<div className="w-full">
					<div className="grid lg:grid-cols-[1fr_2fr] md:grid-cols-1 gap-4 lg:gap-2">
						{/* Left Column */}
						<div className="space-y-4 lg:space-y-5 order-2 lg:order-1">
							<h1 className="text-4xl font-sans text-[#17183B]">
								{part.subcategory?.name || "Unknown Part"}
							</h1>
							<p className="text-sm text-[#9AE144] font-medium">
								{part.availability_status === "Unavailable"
									? "Currently Unavailable"
									: "Delivery within 15 days"}
							</p>
							<div className="flex items-baseline gap-2 font-[var(--font-poppins)]">
								<span className="text-3xl font-semibold text-[#17183B]">
									Rs.{part.price}
								</span>
								<span className="text-sm font-semibold text-black">
									include in all taxes
								</span>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex">
									{[1, 2, 3, 4, 5].map((star) => (
										<Star
											key={star}
											className="w-4 h-4 fill-orange-400 text-orange-400"
										/>
									))}
								</div>
								<span className="text-sm font-medium text-gray-700">4.6 / 5.0</span>
								<span className="text-sm text-gray-400">(556)</span>
							</div>
							<div className="space-y-4 font-[var(--font-poppins)]">
								<h3 className="text-lg font-bold text-[#050B20]">
									Part Specifications
								</h3>
								<div className="space-y-2">
									<div className="flex">
										<div className="w-24 text-sm font-semibold text-black py-2">
											Part Number
										</div>
										<div className="w-44 md:w-52 bg-[#E1F6C7] px-3 py-2 rounded flex items-center justify-between">
											<span className="text-sm text-black">
												{part.part_number}
											</span>
											<Eye className="w-4 h-4 text-gray-600" />
										</div>
									</div>
									<div className="flex">
										<div className="w-24 text-sm font-semibold text-black py-2">
											Part Origin
										</div>
										<div className="w-44 md:w-52 bg-[#E1F6C7] px-3 py-2 rounded flex items-center justify-between">
											<span className="text-sm text-gray-800">
												{part.origin}
											</span>
										</div>
									</div>
									<div className="flex">
										<div className="w-24 text-sm font-semibold text-black py-2">
											Part Class
										</div>
										<div className="w-44 md:w-52 bg-[#E1F6C7] px-3 py-2 rounded flex items-center justify-between">
											<span className="text-sm text-gray-800">
												{part.subcategory?.name}
											</span>
										</div>
									</div>
								</div>
							</div>

							{/* USP Banner */}
							<div className="  bg-opacity-20 border-l-4 border-[#9AE144] p-3 rounded">
								<div className="flex items-center gap-2">
									<Wrench className="w-5 h-5 text-[#050B20]" />
									<p className="text-sm font-semibold text-[#050B20]">
										Get free technical support for installation
									</p>
								</div>
							</div>

							<div className="flex  gap-3 pt-2 w-full">
								<button
									onClick={handleAddToCart}
									className="md:w-auto bg-[#050B20] text-white font-sans px-8 md:px-8 text-base md:text-xl py-3 rounded-md font-medium hover:bg-[#17183B] transition-colors"
									disabled={isAddingToCart}
								>
									{isAddingToCart ? "Adding..." : "Add to Cart"}
								</button>
								<button
									onClick={() => router.push("/products/cart")}
									className="md:w-auto bg-[#9AE144] text-[#050B20] font-sans px-8 md:px-10 text-base md:text-xl py-3 rounded-md font-bold hover:bg-[#8BD133] transition-colors"
								>
									Buy Now
								</button>
							</div>
							<div className="flex gap-4 md:gap-6 text-xs md:text-sm text-[#17183B] pt-1">
								<span>Free 3-5 day shipping</span>
								<span>Tool-free assembly</span>
								<span>30-day trial</span>
							</div>
							<div className="flex items-center gap-2 text-[12px] md:text-sm text-gray-700 pt-1">
								<MapPin className="md:size-4 text-[#9AE144]" />
								<span className="font-bold text-[#050B20]">
									Deliver to {part.vendor?.city}, {part.vendor?.state}{" "}
									{part.vendor?.zip}
								</span>
							</div>
						</div>
						{/* Right Column */}
						<div className="flex flex-col md:flex-row order-1 lg:order-2">
							<div className="bg-[#F5F5F5] h-72 md:h-full w-full md:p-4 lg:p-8 lg:ml-12 relative flex flex-col items-center justify-center overflow-hidden">
								<div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
									<Image
										src="/assets/translogo.png"
										alt="MechMoto Logo"
										width={160}
										height={80}
										className="w-20 sm:w-24 lg:w-36 object-contain drop-shadow-md"
										priority
									/>
								</div>
								<Image
									src={images[currentIndex]}
									alt="Product"
									className="max-h-58 sm:max-h-64 lg:max-h-full object-contain mb-4 transition-all duration-500"
									height={500}
									width={500}
								/>
								<div className="absolute bottom-8 md:bottom-16 left-1/2 transform -translate-x-1/2 w-full px-4 z-10">
									<p className="text-xs sm:text-sm text-gray-600">
										{part.description}
									</p>
									<p className="text-xs sm:text-sm font-semibold text-gray-800">
										{part.part_brand?.name}
									</p>
								</div>
								<div className="absolute bottom-2 md:bottom-4 left-0 right-0 z-10">
									<Image
										src="/assets/branding.png"
										alt="Powered by MechMoto"
										width={1920}
										height={300}
										className="w-full h-auto object-cover object-bottom"
										priority
									/>
								</div>
								<button
									onClick={prevSlide}
									className="absolute hidden md:block left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-gray-200 z-20"
								>
									<IoIosArrowBack className="text-gray-800 text-xl" />
								</button>
								<button
									onClick={nextSlide}
									className="absolute hidden md:block right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-gray-200 z-20"
								>
									<IoIosArrowForward className="text-gray-800 text-xl" />
								</button>
							</div>
							<div className="border-gray-200 flex mt-2 md:mt-0 md:flex-col md:pl-8 sm:pl-3 space-y-2 sm:space-y-3">
								{images.map((img: string, index: number) => (
									<div
										key={index}
										onClick={() => setCurrentIndex(index)}
										className={`size-20 md:size-28 lg:size-32 rounded bg-[#F5F5F5] flex items-center mr-2 md:mr-0 justify-center cursor-pointer border-2 ${
											currentIndex === index
												? "border-[#9AE144]"
												: "border-transparent"
										}`}
									>
										<Image
											src={img}
											alt={`Thumbnail ${index}`}
											className="w-16 h-16 object-contain"
											width={100}
											height={100}
										/>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Additional Information Section */}
			<div className="font-[var(--font-poppins)] px-3 lg:px-6 pb-6 bg-gray-50">
				<div className="w-full mt-4 max-w-7xl mx-auto space-y-6">
					{/* Key Features Grid */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 ">
						<div className="bg-white p-4 rounded-lg border-l-4 border-[#9AE144] shadow-sm">
							<div className="flex items-center gap-3">
								<Truck className="w-6 h-6 text-[#9AE144]" />
								<div>
									<p className="text-xs text-gray-600">Delivery</p>
									<p className="text-sm font-bold text-[#050B20]">2-5 Days</p>
								</div>
							</div>
						</div>
						<div className="bg-white p-4 rounded-lg border-l-4 border-[#9AE144] shadow-sm">
							<div className="flex items-center gap-3">
								<ShieldCheck className="w-6 h-6 text-[#9AE144]" />
								<div>
									<p className="text-xs text-gray-600">Warranty</p>
									<p className="text-sm font-bold text-[#050B20]">6 Months</p>
								</div>
							</div>
						</div>
						<div className="bg-white p-4 rounded-lg border-l-4 border-[#9AE144] shadow-sm">
							<div className="flex items-center gap-3">
								<RefreshCw className="w-6 h-6 text-[#9AE144]" />
								<div>
									<p className="text-xs text-gray-600">Return Policy</p>
									<p className="text-sm font-bold text-[#050B20]">7 Days</p>
								</div>
							</div>
						</div>
						<div className="bg-white p-4 rounded-lg border-l-4 border-[#9AE144] shadow-sm">
							<div className="flex items-center gap-3">
								<Package className="w-6 h-6 text-[#9AE144]" />
								<div>
									<p className="text-xs text-gray-600">Part Type</p>
									<p className="text-sm font-bold text-[#050B20]">
										{part.origin}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Vehicle Compatibility Section - NOW SHOWS ALL COMPATIBLE CARS */}
					{/* Vehicle Compatibility Section - Mobile: 3 only | Desktop: Show All */}
					<div className="bg-white p-6 rounded-lg shadow-sm">
						<h3 className="text-xl font-bold text-[#050B20] mb-4 flex items-center gap-2">
							<div className="w-1 h-6 bg-[#9AE144] rounded"></div>
							Compatible Vehicles
						</h3>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
							{compatibleVehicles
								.slice(
									0,
									// On mobile: limit to 3 unless "View All" is clicked
									// On desktop/tablet: show all always
									window.innerWidth >= 768 || showAllVehicles ? undefined : 3,
								)
								.map((vehicle, index) => (
									<div
										key={index}
										className="border-2 border-[#E1F6C7] rounded-lg p-4 hover:border-[#9AE144] transition-colors"
									>
										<div className="space-y-2">
											<div className="flex justify-between items-start">
												<div>
													<p className="font-bold text-[#050B20] text-base">
														{vehicle.make} {vehicle.model}
													</p>
													<p className="text-xs text-gray-600 mt-1">
														{vehicle.variant}
													</p>
												</div>
												<span className="bg-[#E1F6C7] text-[#050B20] text-xs font-semibold px-2 py-1 rounded">
													{vehicle.year}
												</span>
											</div>
											<div className="pt-2 border-t border-gray-200">
												<p className="text-xs text-gray-600">
													Fuel:{" "}
													<span className="font-semibold text-[#050B20]">
														{vehicle.fuelType}
													</span>
												</p>
											</div>
										</div>
									</div>
								))}
						</div>

						{/* View All Button - Visible ONLY on Mobile AND when there are more than 3 */}
						{compatibleVehicles.length > 3 &&
							window.innerWidth < 768 &&
							!showAllVehicles && (
								<div className="mt-5 text-center">
									<button
										onClick={() => setShowAllVehicles(true)}
										className="text-[#050B20] font-semibold text-sm underline underline-offset-4 hover:text-[#9AE144] transition-colors"
									>
										View All Compatible Vehicles (+
										{compatibleVehicles.length - 3} more)
									</button>
								</div>
							)}

						{/* Show Less Button - Only on mobile after expanding */}
						{showAllVehicles && window.innerWidth < 768 && (
							<div className="mt-4 text-center">
								<button
									onClick={() => setShowAllVehicles(false)}
									className="text-gray-600 text-sm underline underline-offset-4 hover:text-[#050B20]"
								>
									Show Less
								</button>
							</div>
						)}

						{compatibleVehicles.length === 0 && (
							<p className="text-sm text-gray-500 italic mt-4">
								No compatibility data available yet.
							</p>
						)}

						<p className="text-xs text-gray-600 mt-4 italic">
							* Please verify compatibility with your vehicle&apos;s VIN or consult
							with our technical support team
						</p>
					</div>

					{/* Product Details Grid */}
					<div className="grid md:grid-cols-2 gap-6">
						{/* Brand & Quantity */}
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="text-lg font-bold text-[#050B20] mb-4 flex items-center gap-2">
								<div className="w-1 h-6 bg-[#9AE144] rounded"></div>
								Product Information
							</h3>
							<div className="space-y-3">
								<div className="flex justify-between items-center py-2 border-b border-gray-200">
									<span className="text-sm text-gray-600">Brand</span>
									<span className="text-sm font-semibold text-[#050B20]">
										{part.part_brand?.name}
									</span>
								</div>
								<div className="flex justify-between items-center py-2 border-b border-gray-200">
									<span className="text-sm text-gray-600">Quantity</span>
									<span className="text-sm font-semibold text-[#050B20]">
										{part.quantity} Available
									</span>
								</div>
								<div className="flex justify-between items-center py-2">
									<span className="text-sm text-gray-600">Part Origin</span>
									<span className="text-sm font-semibold text-[#9AE144]">
										{part.origin}
									</span>
								</div>
							</div>
						</div>

						{/* Vendor Information */}
						<div className="bg-white p-6 rounded-lg shadow-sm">
							<h3 className="text-lg font-bold text-[#050B20] mb-4 flex items-center gap-2">
								<div className="w-1 h-6 bg-[#9AE144] rounded"></div>
								Sold By
							</h3>
							<div className="space-y-2">
								<p className="text-base font-bold text-[#050B20]">
									{part.vendor?.shop_name}
								</p>
								<p className="text-sm text-gray-600">{part.vendor?.address}</p>
								<p className="text-sm text-gray-600">
									{part.vendor?.city}, {part.vendor?.state} - {part.vendor?.zip}
								</p>
								<div className="pt-3 mt-3 border-t border-gray-200">
									<p className="text-sm">
										<span className="text-gray-600">Contact:</span>{" "}
										<span className="font-semibold text-[#050B20]">
											{part.vendor?.phone}
										</span>
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Additional Notes */}
					{part.remarks && (
						<div className="bg-[#E1F6C7] bg-opacity-30 p-6 rounded-lg border-l-4 border-[#9AE144]">
							<h3 className="text-lg font-bold text-[#050B20] mb-3">
								Additional Notes
							</h3>
							<p className="text-sm text-gray-700">{part.remarks}</p>
						</div>
					)}
				</div>
			</div>

			{/* Wishlist Section */}
			<div className="flex text-left justify-center sm:justify-end pr-0 sm:pr-12 items-center gap-2 text-black cursor-pointer py-6 bg-white">
				<Heart
					onClick={handleToggleWishlist}
					className={`size-5 sm:size-6 ${
						isInWishlist ? "fill-red-500 text-red-500" : "text-black"
					}`}
				/>
				<h1 className="text-lg sm:text-xl font-bold">
					{isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
				</h1>
			</div>
		</div>
	);
}
