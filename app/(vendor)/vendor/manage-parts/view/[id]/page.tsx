"use client";

import React, { useState, useEffect } from "react";
import { Star, Package, MapPin, Zap, TrendingUp, AlertCircle } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useGetPartQuery } from "@/lib/redux/api/partApi";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice";
import Image from "next/image";

export default function VendorPartDetails() {
	const { id } = useParams();
	const dispatch = useDispatch();
	const [currentIndex, setCurrentIndex] = useState(0);
	const { data: response, isLoading, error } = useGetPartQuery(id);
	const part = response?.data;

	const images = part?.image_urls?.length
		? part.image_urls
		: [
				"https://png.pngtree.com/png-clipart/20240927/original/pngtree-car-engine-against-transparent-background-png-image_16100504.png",
		  ];

	const prevSlide = () => {
		setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const nextSlide = () => {
		setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	useEffect(() => {
		if (part) {
			const breadcrumbs = [
				{ label: "Dashboard", href: "/vendor/dashboard" },
				{ label: "Inventory", href: "/vendor/inventory" },
				{
					label: part.subcategory?.name || "Product",
					href: `/vendor/products/${id}`,
				},
			];
			dispatch(setBreadcrumbs(breadcrumbs));
		}
	}, [part, id, dispatch]);

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading product details...</p>
				</div>
			</div>
		);
	}

	if (error || !part) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
				<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full border-l-4 border-red-500">
					<AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
					<p className="text-center text-red-600 font-semibold">
						Failed to load product details.
					</p>
				</div>
			</div>
		);
	}

	const stockStatus = part.quantity > 0 ? "In Stock" : "Out of Stock";
	const stockColor =
		part.quantity > 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200";
	const stockTextColor = part.quantity > 0 ? "text-green-700" : "text-red-700";

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
			{/* Main Container */}
			<div className="max-w-7xl mx-auto p-4 md:p-8">
				{/* Header Section */}
				<div className="mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
						{part.subcategory?.name || "Product Details"}
					</h1>
					<p className="text-slate-600">
						Part Number:{" "}
						<span className="font-semibold text-slate-900">{part.part_number}</span>
					</p>
				</div>

				{/* Main Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
					{/* Left: Image Gallery */}
					<div className="lg:col-span-2">
						<div className="bg-white rounded-xl shadow-md overflow-hidden">
							{/* Main Image */}
							<div className="bg-slate-100 aspect-square flex items-center justify-center relative overflow-hidden group">
								<Image
									src={images[currentIndex]}
									alt="Product"
									className="max-h-96 max-w-96 object-contain transition-transform duration-300 group-hover:scale-105"
									width={400}
									height={400}
								/>

								{/* Navigation Buttons */}
								{images.length > 1 && (
									<>
										<button
											onClick={prevSlide}
											className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hover:bg-slate-50 transition-all hover:shadow-xl z-10"
										>
											<IoIosArrowBack className="text-slate-700 text-lg" />
										</button>
										<button
											onClick={nextSlide}
											className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-lg p-2 hover:bg-slate-50 transition-all hover:shadow-xl z-10"
										>
											<IoIosArrowForward className="text-slate-700 text-lg" />
										</button>
									</>
								)}

								{/* Image Counter */}
								<div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm font-medium">
									{currentIndex + 1} / {images.length}
								</div>
							</div>

							{/* Thumbnail Gallery */}
							{images.length > 1 && (
								<div className="bg-white p-4 border-t border-slate-200">
									<div className="flex gap-3 overflow-x-auto pb-2">
										{images.map((img, index) => (
											<button
												key={index}
												onClick={() => setCurrentIndex(index)}
												className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
													currentIndex === index
														? "border-blue-500 shadow-md"
														: "border-slate-200 hover:border-slate-300"
												}`}
											>
												<Image
													src={img}
													alt={`Thumbnail ${index}`}
													className="w-full h-full object-contain bg-slate-50"
													width={80}
													height={80}
												/>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Right: Key Information */}
					<div className="space-y-4">
						{/* Price Card */}
						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
							<p className="text-slate-600 text-sm font-medium mb-2">Price</p>
							<p className="text-4xl font-bold text-slate-900">
								₹{part.price.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
							</p>
							<p className="text-xs text-slate-500 mt-2">Includes all taxes</p>
						</div>

						{/* Stock Status Card */}
						<div
							className={`rounded-xl shadow-md p-6 border-l-4 ${stockColor} bg-white`}
						>
							<p className="text-slate-600 text-sm font-medium mb-2">Stock Status</p>
							<div className="flex items-center justify-between">
								<div>
									<p className={`text-2xl font-bold ${stockTextColor}`}>
										{part.quantity}
									</p>
									<p className={`text-sm font-semibold ${stockTextColor}`}>
										{stockStatus}
									</p>
								</div>
								<Package className={`w-8 h-8 ${stockTextColor}`} />
							</div>
						</div>

						{/* Availability Card */}
						<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
							<p className="text-slate-600 text-sm font-medium mb-2">Availability</p>
							<p
								className={`text-lg font-semibold ${
									part.availability_status === "Available"
										? "text-emerald-700"
										: "text-amber-700"
								}`}
							>
								{part.availability_status}
							</p>
							{part.availability_status === "Available" && (
								<p className="text-xs text-emerald-600 mt-2">
									Delivery within 15 days
								</p>
							)}
						</div>

						{/* Rating Card */}
						{part.reviews && part.reviews.length > 0 && (
							<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-amber-500">
								<p className="text-slate-600 text-sm font-medium mb-3">
									Customer Rating
								</p>
								<div className="flex items-center gap-2">
									<div className="flex gap-1">
										{[1, 2, 3, 4, 5].map((star) => (
											<Star
												key={star}
												className="w-4 h-4 fill-amber-400 text-amber-400"
											/>
										))}
									</div>
									<span className="text-lg font-semibold text-slate-900">
										4.6/5.0
									</span>
								</div>
								<p className="text-xs text-slate-500 mt-2">
									Based on {part.reviews.length} reviews
								</p>
							</div>
						)}

						{/* Wishlist Card */}
						{part.wishlists && part.wishlists.length > 0 && (
							<div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-rose-500">
								<p className="text-slate-600 text-sm font-medium mb-2">
									Added to Wishlist
								</p>
								<p className="text-2xl font-bold text-rose-600">
									{part.wishlists.length}
								</p>
								<p className="text-xs text-slate-500 mt-2">times by customers</p>
							</div>
						)}
					</div>
				</div>

				{/* Details Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{/* Part Specifications */}
					<div className="bg-white rounded-xl shadow-md p-6">
						<h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
							<Zap className="w-5 h-5 text-blue-500" />
							Specifications
						</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Part Number
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1 bg-blue-50 px-3 py-2 rounded">
									{part.part_number}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Brand
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.part_brand?.name || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Part Class
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.subcategory?.name || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Origin
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.origin || "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Vehicle Compatibility */}
					<div className="bg-white rounded-xl shadow-md p-6">
						<h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-emerald-500" />
							Vehicle Info
						</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Model Line
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vehicle?.model_line || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Production Year
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vehicle?.production_year || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Modification
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vehicle?.modification || "N/A"}
								</p>
							</div>
						</div>
					</div>

					{/* Vendor Information */}
					<div className="bg-white rounded-xl shadow-md p-6">
						<h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
							<MapPin className="w-5 h-5 text-rose-500" />
							Vendor Info
						</h3>
						<div className="space-y-3">
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Shop Name
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vendor?.shop_name || "N/A"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Location
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vendor?.city}, {part.vendor?.state}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
									Phone
								</p>
								<p className="text-sm font-medium text-slate-900 mt-1">
									{part.vendor?.phone || "N/A"}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Description Section */}
				{part.description && (
					<div className="bg-white rounded-xl shadow-md p-6 mb-8">
						<h3 className="text-lg font-bold text-slate-900 mb-4">Description</h3>
						<p className="text-slate-700 leading-relaxed">{part.description}</p>
					</div>
				)}

				{/* Sales Performance */}
				{part.order_items && part.order_items.length > 0 && (
					<div className="bg-white rounded-xl shadow-md p-6">
						<h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
							<TrendingUp className="w-5 h-5 text-blue-500" />
							Sales Performance
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
								<p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
									Total Orders
								</p>
								<p className="text-3xl font-bold text-blue-900">
									{part.order_items.length}
								</p>
							</div>
							<div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4">
								<p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">
									Units Sold
								</p>
								<p className="text-3xl font-bold text-emerald-900">
									{part.order_items.reduce((sum, item) => sum + item.quantity, 0)}
								</p>
							</div>
							<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
								<p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
									Revenue
								</p>
								<p className="text-3xl font-bold text-purple-900">
									₹
									{part.order_items
										.reduce((sum, item) => sum + item.subtotal, 0)
										.toLocaleString("en-IN")}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
