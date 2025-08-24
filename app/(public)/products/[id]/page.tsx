"use client";

import React, { useState, useEffect } from "react";
import { Star, Eye, MapPin, Heart } from "lucide-react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { useGetPartQuery } from "@/lib/redux/api/partApi";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setBreadcrumbs } from "@/lib/redux/slices/breadcrumbSlice";

export default function ToyotaNexusBelt() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();

  const { data: response, isLoading, error } = useGetPartQuery(id);
  const part = response?.data;

  const images =
    part?.image_urls?.length
      ? part.image_urls
      : [
          "https://png.pngtree.com/png-clipart/20240927/original/pngtree-car-engine-against-transparent-background-png-image_16100504.png",
        ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // 🔹 Dispatch breadcrumb trail when product data is ready
  useEffect(() => {
    if (part) {
      // Construct a breadcrumb trail dynamically
      const breadcrumbs = [
        { label: "All Categories", href: "/categories" }, // Starting point
        {
          label: part.category?.name || "Category",
          href: `/products?category_id=${part.category?.id}&vehicle_id=${part.vehicle?.id}`,
        },
        {
          label: part.subcategory?.name || "Subcategory",
          href: `/products?sub_category_id=${part.subcategory?.id}&vehicle_id=${part.vehicle?.id}`,
        },
        { label: part.part_number || "Product Detail", href: `/products/${id}` }, // Current product
      ];

      console.log("🚀 Adding breadcrumbs:", breadcrumbs);
      dispatch(setBreadcrumbs(breadcrumbs));
    }
  }, [part, id, dispatch]);

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error || !part) {
    return <div className="p-6 text-red-600">Failed to load part details.</div>;
  }

  return (
    <div>
      <div className="flex font-[var(--font-poppins)] md:p-3 lg:p-6 bg-white">
        <div className="w-full">
          <div className="grid lg:grid-cols-[1fr_2fr] md:grid-cols-1 gap-4 lg:gap-2">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-5 order-2 lg:order-1">
              {/* Title */}
              <h1 className="text-4xl font-sans text-[#17183B]">
                {part.subcategory?.name || "Unknown Part"}
              </h1>

              {/* Delivery Info */}
              <p className="text-sm text-[#9AE144] font-medium">
                {part.availability_status === "Unavailable"
                  ? "Currently Unavailable"
                  : "Delivery within 15 days"}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 font-[var(--font-poppins)]">
                <span className="text-3xl font-semibold text-[#17183B]">
                  Rs.{part.price}
                </span>
                <span className="text-sm font-semibold text-black">
                  include in all taxes
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-4 h-4 fill-orange-400 text-orange-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  4.6 / 5.0
                </span>
                <span className="text-sm text-gray-400">(556)</span>
              </div>

              {/* Specifications */}
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
                      <span className="text-sm text-gray-800">{part.origin}</span>
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

              {/* Actions */}
              <div className="flex flex-col md:flex-row gap-3 pt-2 w-full">
                <button className="md:w-auto bg-[#050B20] text-white font-sans px-4 md:px-8 text-base md:text-xl py-3 rounded-md font-medium">
                  Add to Cart
                </button>
                <button
                  onClick={() => router.push("/products/cart")}
                  className="md:w-auto bg-[#9AE144] text-black font-sans px-6 md:px-10 text-base md:text-xl py-3 rounded-md font-bold hover:bg-green-600 transition-colors"
                >
                  Buy Now
                </button>
              </div>

              {/* Features */}
              <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-[#17183B] pt-1">
                <span>Free 3-5 day shipping</span>
                <span>Tool-free assembly</span>
                <span>30-day trial</span>
              </div>

              {/* Delivery Location */}
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
              <div className="bg-[#F5F5F5] h-72 md:h-full w-full md:p-4 lg:p-8 relative flex flex-col items-center justify-center overflow-hidden">
                <img
                  src={images[currentIndex]}
                  alt="Product"
                  className="max-h-48 sm:max-h-64 lg:max-h-72 object-contain mb-4 transition-all duration-500"
                />
                <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 text-left w-full px-2 sm:px-4">
                  <p className="text-xs sm:text-sm text-gray-600">
                    {part.description}
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {part.part_brand?.name}
                  </p>
                </div>
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-gray-200"
                >
                  <IoIosArrowBack className="text-gray-800 text-xl" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full shadow-md p-2 hover:bg-gray-200"
                >
                  <IoIosArrowForward className="text-gray-800 text-xl" />
                </button>
              </div>
              <div className="border-gray-200 flex  mt-2 md:mt-0 md:flex-col md:pl-2 sm:pl-3 space-y-2 sm:space-y-3">
                {images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`size-20 md:size-28 lg:size-32 rounded bg-[#F5F5F5] flex items-center justify-center cursor-pointer border-2 ${
                      currentIndex === index
                        ? "border-[#9AE144]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index}`}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wishlist */}
      <div className="flex text-left justify-center sm:justify-end pr-0 sm:pr-12 items-center gap-2 text-black cursor-pointer pt-4 sm:pt-0">
        <Heart className="size-5 sm:size-6 text-black" />
        <h1 className="text-lg sm:text-xl font-bold">Add to wishlist</h1>
      </div>
    </div>
  );
}