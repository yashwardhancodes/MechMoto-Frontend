'use client';

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { vendorSchema } from "@/lib/schema/vendorSchema";
import { useUpdateVendorMutation, useGetVendorQuery } from "@/lib/redux/api/vendorApi";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";

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

const EditVendor: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const vendorId = params?.vendorId;
    console.log("Vendor ID:", vendorId);

    const { data: vendorData, isLoading: isVendorLoading } = useGetVendorQuery(vendorId);
    const [updateVendor] = useUpdateVendorMutation();

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

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
    const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

    const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Gujarat", "West Bengal"];
    const cities = ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur"];
    const countries = ["India"];

    // Populate form when vendor data is fetched
    useEffect(() => {
        if (vendorData?.data) {
            const vendor = vendorData.data;
            setFormData({
                name: vendor.name || "",
                shop_name: vendor.shop_name || "",
                email: vendor.user?.email || "",
                phone: vendor.phone || "",
                address: vendor.address || "",
                state: vendor.state || "",
                city: vendor.city || "",
                zip: vendor.zip || "",
                country: vendor.country || "",
            });
        }
    }, [vendorData]);


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

            const result = await updateVendor({ id: vendorId, ...parsedData }).unwrap();
            console.log("✅ API Response:", result);

            if (result?.success) {
                toast.success("Vendor updated successfully! Redirecting...");
                router.push("/admin/dashboard/manage-vendors");
            } else {
                toast.error("Vendor update failed. Please try again.");
            }
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const formattedErrors: Record<string, string> = {};
                err.errors.forEach((e) => {
                    formattedErrors[String(e.path[0])] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
                console.log("❌ Validation Errors:", formattedErrors);
            } else {
                console.error("❌ Error:", err);
                const apiError = err as { data?: { message?: string } };
                toast.error(apiError?.data?.message || "Something went wrong!");
            }
        }
    };

    if (isVendorLoading) {
        return <div className="p-4 text-center">Loading vendor details...</div>;
    }

    return (
        <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
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
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

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
                                    <span className={formData.country ? "text-gray-700" : "text-gray-400"}>
                                        {formData.country || "Country"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${countryDropdownOpen ? "rotate-180" : ""}`}
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
                                    <span className={formData.city ? "text-gray-700" : "text-gray-400"}>
                                        {formData.city || "City"}
                                    </span>
                                    <ChevronDown
                                        className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${cityDropdownOpen ? "rotate-180" : ""}`}
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
                                <span className={formData.state ? "text-gray-700" : "text-gray-400"}>
                                    {formData.state || "State"}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${stateDropdownOpen ? "rotate-180" : ""}`}
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
                            Update Vendor
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditVendor;
