"use client";

import { useState } from "react";
import Carousel from "../components/Carousel";
import BuyParts from "../components/BuyParts";
import Testimonials from "../components/Testimonials";
import TrendingProducts from "../components/TrendingProducts";
import { Footer } from "../components/Footer";

export default function UsersPage() {
	const [selectedTab, setSelectedTab] = useState("buy"); // removed TypeScript union type

	return (
		<div className=" mt-[40px] md:mt-[50px] lg:mt-[56px]">
			<Carousel />

			{/* Toggle Buttons */}
			<div className="container mx-auto w-full flex justify-center mb-6">
				<div className="inline-flex items-center text-xs md:text-sm lg:text-base bg-[#050B20] rounded-full p-1  md:p-1.5">
					<button
						className={`px-4 py-1.5 font-sans font-semibold rounded-full ${
							selectedTab === "buy" ? "bg-[#9AE144] text-black" : "text-white"
						}`}
						onClick={() => setSelectedTab("buy")}
					>
						Buy Parts
					</button>
					<button
						className={`px-4 py-1.5 font-sans font-semibold rounded-full ${
							selectedTab === "repair" ? "bg-[#9AE144] text-black" : "text-white"
						}`}
						onClick={() => setSelectedTab("repair")}
					>
						Repair my car
					</button>
				</div>
			</div>

			{/* Conditional Content */}
			<div className="container mx-auto w-full px-4">
				{selectedTab === "buy" ? (
					<div>
						<BuyParts />
					</div>
				) : (
					<div className="text-black">
						<h2 className="text-lg font-bold mb-2">Car Repair Services</h2>
					</div>
				)}
			</div>

			<div>
				<Testimonials />
				<TrendingProducts />
				<Footer />
			</div>
		</div>
	);
}
