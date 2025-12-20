import React from "react";
import {
  ShieldCheck,
  Truck,
  RefreshCcw,
  Users
} from "lucide-react";
import Image from "next/image";

type TrustCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: boolean;
  children?: React.ReactNode;
};

const TrustCard: React.FC<TrustCardProps> = ({
  title,
  description,
  icon,
  highlight = false,
  children
}) => {
  return (
    <div
      className={`rounded-2xl border p-6 transition-all duration-300
      hover:shadow-xl hover:-translate-y-1
      ${highlight
          ? "bg-gradient-to-br from-lime-50 to-white border-[#9AE144]"
          : "bg-gray-50"
        }`}
    >
      {/* Icon Badge */}
      <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-lime-100 text-[#9AE144] mb-5">
        {icon}
      </div>

      <h3 className="text-lg font-semibold mb-2">
        {title}
      </h3>

      <p className="text-gray-600 text-sm leading-relaxed">
        {description}
      </p>

      {children && (
        <div className="mt-5">
          {children}
        </div>
      )}
    </div>
  );
};

const TrustSection: React.FC = () => {
  return (
    <section className="pt-5 pb-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4">

        {/* Heading */}
        <h1 className="text-2xl md:text-4xl font-sans text-center mt-12 font-bold">
          Why choose{" "}
          <span className="bg-gradient-to-r from-[#9AE144] to-[#547B25] bg-clip-text text-transparent">
            Mech-Moto?
          </span>
        </h1>

        <p className="text-gray-800 text-center max-w-4xl mx-auto mt-5 mb-16">
          A trusted online marketplace for genuine spare parts and on-demand roadside
          assistance for subscribed users — delivering faster, starting from Maharashtra
          and expanding across India.
        </p>


        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          <TrustCard
            title="Pan-India Delivery"
            description="Genuine spare parts delivered safely to your doorstep anywhere in India."
            icon={<Truck className="w-6 h-6" />}
          />

          <TrustCard
            title="Easy Returns & Refunds"
            description="No complicated process. Simple returns and fast refunds you can rely on."
            icon={<RefreshCcw className="w-6 h-6" />}
          />

          <TrustCard
            title="Trusted by 100+ Mechanics"
            description="Mechanics across Maharashtra rely on Mech-Moto for daily operations."
            icon={<Users className="w-6 h-6" />}
            highlight
          />

          <TrustCard
            title="Secure Payments"
            description="Your transactions are protected with industry-leading payment security."
            icon={<ShieldCheck className="w-6 h-6" />}
          >
            <p className="text-xs text-gray-500 mb-2">
              Powered by
            </p>

            <div className="flex items-center gap-4">
              <Image
                src="/assets/trustsection/razorpay.svg"
                alt="Razorpay"
                width={80}
                height={24}
                className="h-6 w-auto object-contain"
              />

              <Image
                src="/assets/trustsection/phonepe.svg"
                alt="PhonePe"
                width={80}
                height={24}
                className="h-6 w-auto object-contain"
              />
            </div>
          </TrustCard>

        </div>

        {/* Bottom Trust Note */}


      </div>
    </section>
  );
};

export default TrustSection;  