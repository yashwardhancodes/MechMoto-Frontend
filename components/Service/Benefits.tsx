"use client";

import { Wrench, PhoneCall, MapPin, Truck } from "lucide-react";

export default function Benefits() {
  const benefits = [
    {
      icon: <Wrench className="w-10 h-10" />,
      title: "Roadside Help",
      description: "Get quick help anywhere in Maharashtra.",
    },
    {
      icon: <PhoneCall className="w-10 h-10" />,
      title: "Call or Dispatch",
      description: "Talk to us or get a mechanic sent to you.",
    },
    {
      icon: <MapPin className="w-10 h-10" />,
      title: "Trusted Mechanics",
      description:
        "We connect you with trusted, nearby mechanics for quality repairs.",
    },
    {
      icon: <Truck className="w-10 h-10" />,
      title: "Lower rates on spare parts",
      description: "Get quality parts at lower prices.",
    },
  ];

  return (
    <div>
              <h2 className="text-3xl font-bold px-36 mt-24 text-black mb-10">Benefits</h2>

    <section className="bg-[rgba(154,225,68,0.13)]  py-12 px-36  ">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {benefits.map((item, index) => (
          <div key={index} className="flex flex-col items-start space-y-3">
            <div className="text-black">{item.icon}</div>
            <h3 className="text-lg font-semibold text-black">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
    
    </div>
  );
}
