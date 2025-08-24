// app/add-address/page.tsx (Next.js 13+ App Router)
"use client";

import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";

export default function AddAddress() {
  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    email: "",
    house: "",
    area: "",
    state: "",
    landmark: "",
    pincode: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="  bg-white   px-3 md:px-16 lg:px-24  font-sans">
       

      {/* Form */}
      <h3 className="text-xl font-semibold mb-4">Add Address</h3>

      <form className="space-y-4">
        <input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={form.fullName}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="mobile"
          placeholder="Mobile Number"
          value={form.mobile}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="house"
          placeholder="Flat No/ House"
          value={form.house}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="area"
          placeholder="Area"
          value={form.area}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="landmark"
          placeholder="Landmark"
          value={form.landmark}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />
        <input
          type="text"
          name="pincode"
          placeholder="Pincode"
          value={form.pincode}
          onChange={handleChange}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#9AE144]"
        />

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#9AE144] text-black font-semibold px-10 py-3 rounded-full hover:bg-[#3A7813] transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
