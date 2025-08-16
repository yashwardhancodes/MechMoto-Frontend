'use client';


import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { vendorSchema } from "@/lib/schema/vendorSchema";
import { useCreateVendorMutation } from "@/lib/redux/api/vendorApi";
import { toast } from "react-hot-toast";
import { z } from "zod";

interface FormData {
    name: string;
    shop_name: string;
    email: string;
    phone: string;
    address: string;
    state: string;
    city: string;
    country: string;
    zip: string;
}

const AddVendor: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        shop_name: "",
        email: "",
        phone: "",
        address: "",
        state: "",
        city: "",
        zip: "",
        country: "",
    });

    const [errors, setErrors] = useState({});
    const [addVendor, { isLoading }] = useCreateVendorMutation();

    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

    const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal"];
    const cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"];
    const countries = ["India"];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSelectChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            const parsedData = vendorSchema.parse(formData);
            console.log("✅ Valid Data:", parsedData);

            const result = await addVendor(parsedData).unwrap();
            console.log("✅ API Response:", result);

            if (result?.success) {
                toast.success("Vendor added successfully! Redirecting...");
                window.location.href = "/dashboard/superAdmin";
            } else {
                toast.error("Vendor addition failed. Please try again.");
            }
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0]] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!", formattedErrors);
                console.log("❌ Validation Errors:", formattedErrors);
            } else {
                console.error("❌ Error:", err);
                toast.error(err?.data?.message || "Something went wrong!");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16   px-4">
            <div className="max-w-5xl mx-auto">
                <div className="space-y-9">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="shop_name"
                                placeholder="Shop Name"
                                value={formData.shop_name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Email and Mobile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Mobile number +91"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <textarea
                                name="address"
                                placeholder="Address"
                                rows={4}
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
                            />
                        </div>
                        <div className="space-y-6">
                            {/* Country Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                                    className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
                                >
                                    <span
                                        className={
                                            formData.country ? "text-gray-700" : "text-gray-400"
                                        }
                                    >
                                        {formData.country || "Country"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${
                                            countryDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {countryDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {countries.map((country) => (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectChange("country", country);
                                                    setCountryDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                                            >
                                                {country}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* City Dropdown */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                                    className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
                                >
                                    <span
                                        className={
                                            formData.city ? "text-gray-700" : "text-gray-400"
                                        }
                                    >
                                        {formData.city || "City"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${
                                            cityDropdownOpen ? "rotate-180" : ""
                                        }`}
                                    />
                                </button>
                                {cityDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {cities.map((city) => (
                                            <button
                                                key={city}
                                                type="button"
                                                onClick={() => {
                                                    handleSelectChange("city", city);
                                                    setCityDropdownOpen(false);
                                                }}
                                                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* State and Pincode */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setStateDropdownOpen(!stateDropdownOpen)}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
                            >
                                <span
                                    className={formData.state ? "text-gray-700" : "text-gray-400"}
                                >
                                    {formData.state || "State"}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${
                                        stateDropdownOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>
                            {stateDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {states.map((state) => (
                                        <button
                                            key={state}
                                            type="button"
                                            onClick={() => {
                                                handleSelectChange("state", state);
                                                setStateDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                                        >
                                            {state}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                name="zip"
                                placeholder="Pincode"
                                value={formData.zip}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
                        >
                            Add Vendor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVendor;
