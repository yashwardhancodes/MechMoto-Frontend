import React from "react";
import Image from "next/image";
import serviceImg from "@/public/assets/service.png";
import helplineImg from "@/public/assets/helpline.png";
import customerServiceImg from "@/public/assets/customerService.png";
import Pricing from "./Plans";
import Benefits from "./Benefits";
import FAQs from "./Faq";

const Service = () => {
	return (
		<div className="min-h-screen pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
			<div className="max-w-7xl mx-auto">
				{/* Banner Section - Responsive */}
				<div className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8 lg:mb-10">
					<div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
						<Image
							src={serviceImg}
							alt="service Image"
							fill
							className="object-cover"
							priority
						/>

						{/* Overlay for better text readability */}
						<div className="absolute inset-0 bg-black/20" />

						{/* Overlay Content */}
						<div className="absolute top-4 left-4 sm:top-8 sm:left-8 lg:top-12 lg:left-16 max-w-[85%] sm:max-w-[70%] lg:max-w-2xl">
							<h2 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
								Need Help Fast?{" "}
								<span className="text-[#9AE144]">Get Premium Support</span> and Get
								Back on the Road!
							</h2>
						</div>

						{/* Subscribe Button */}
						<button className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-[#9AE144] text-black text-xs sm:text-sm md:text-base font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-green-500 transition-colors">
							Subscribe Now
						</button>
					</div>
				</div>

				{/* Cards Section - Responsive Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
					{/* Card 1 - Expert Help */}
					<div className="p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 bg-white h-full">
							<div className="flex-shrink-0">
								<Image
									src={helplineImg}
									alt="helpline"
									width={80}
									height={80}
									className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
								/>
							</div>
							<div>
								<h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1">
									Need Expert help?
								</h3>
								<p className="text-xs sm:text-sm text-gray-600">
									Get a certified mechanic to your location.
								</p>
							</div>
						</div>
					</div>

					{/* Card 2 - Live Call Support */}
					<div className="p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black hover:shadow-lg transition-shadow">
						<div className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 bg-white h-full">
							<div className="flex-shrink-0">
								<Image
									src={customerServiceImg}
									alt="customer service"
									width={60}
									height={80}
									className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
								/>
							</div>
							<div>
								<h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1">
									Live Call Support
								</h3>
								<p className="text-xs sm:text-sm text-gray-600">
									Talk to a car expert in real-time for quick fixes
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Additional Components */}
				<Pricing />
				<Benefits />
				<FAQs />
			</div>
		</div>
	);
};

export default Service;
