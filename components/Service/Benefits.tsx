"use client";

import { Wrench, PhoneCall, MapPin, Truck } from "lucide-react";

export default function Benefits() {
	const benefits = [
		{
			icon: <Wrench className="w-8 h-8 sm:w-10 sm:h-10" />,
			title: "Roadside Help",
			description: "Get quick help anywhere in Maharashtra.",
		},
		{
			icon: <PhoneCall className="w-8 h-8 sm:w-10 sm:h-10" />,
			title: "Call or Dispatch",
			description: "Talk to us or get a mechanic sent to you.",
		},
		{
			icon: <MapPin className="w-8 h-8 sm:w-10 sm:h-10" />,
			title: "Trusted Mechanics",
			description: "We connect you with trusted, nearby mechanics for quality repairs.",
		},
		{
			icon: <Truck className="w-8 h-8 sm:w-10 sm:h-10" />,
			title: "Lower rates on spare parts",
			description: "Get quality parts at lower prices.",
		},
	];

	return (
		<div className="px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24 mt-12 sm:mt-16 lg:mt-20">
			<div className="max-w-7xl mx-auto">
				{/* Section Title */}
				<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-6 sm:mb-8 lg:mb-10">
					Benefits
				</h2>

				{/* Benefits Cards */}
				<section className="bg-[rgba(154,225,68,0.13)] rounded-2xl py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
						{benefits.map((item, index) => (
							<div
								key={index}
								className="flex flex-col items-start space-y-3 p-4 sm:p-0 hover:scale-105 transition-transform duration-300"
							>
								<div className="text-black bg-white/50 p-3 rounded-lg">
									{item.icon}
								</div>
								<h3 className="text-base sm:text-lg font-semibold text-black">
									{item.title}
								</h3>
								<p className="text-sm text-gray-700 leading-relaxed">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
