"use client";
import { IoIosArrowBack } from "react-icons/io";
import { FiChevronRight } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function PaymentMethod() {
    const router = useRouter();
  const paymentOptions = [
    {
      name: "Other UPI Options",
      icon: "https://upload.wikimedia.org/wikipedia/commons/5/5a/Google_Pay_Logo.svg",
    },
    {
      name: "Credit / Debit Card",
      icon: "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg",
    },
    {
      name: "Wallet",
      icon: "https://upload.wikimedia.org/wikipedia/commons/3/39/PayPal_logo.svg",
    },
    {
      name: "Net Banking",
      icon: "https://cdn-icons-png.flaticon.com/512/3068/3068289.png",
    },
    {
      name: "Cash On Delivery",
      icon: "https://cdn-icons-png.flaticon.com/512/1170/1170678.png",
    },
  ];

  return (
    <div className="lg:col-span-2 max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
         <h2 className="text-lg font-semibold">Payment Method</h2>
      </div>

      {/* Payment Options */}
      <div className="space-y-3">
        {paymentOptions.map((option, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-2xl p-4 flex justify-between items-center cursor-pointer hover:border-[#9AE144] transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <img src={option.icon} alt={option.name} className="w-6 h-6" />
              </div>
              <p className="font-medium">{option.name}</p>
            </div>
            <FiChevronRight className="text-gray-400" />
          </div>
        ))}
      </div>

      {/* Proceed Button */}
      <div className="flex justify-end ">
      <button
      onClick={()=>{router.push("/products/cart/select-address/checkout")}}
      className=" px-6 bg-[#9AE144] text-black font-medium py-3 rounded-full   transition">
        Proceed 
      </button></div>
    </div>
  );
}
