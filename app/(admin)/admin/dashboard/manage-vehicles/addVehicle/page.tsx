"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
// import { useCreateVehicleMutation } from "@/lib/redux/api/vehicleApi"; // ✅ Update API import
// import { vehicleSchema } from "@/lib/schema/vehicleSchema"; // ✅ Create schema accordingly

interface FormData {
  brand: string;
  model: string;
  year: string;
  variant: string;
}

const AddVehicle: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    brand: "",
    model: "",
    year: "",
    variant: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
//   const [addVehicle, { isLoading }] = useCreateVehicleMutation();

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [variantDropdownOpen, setVariantDropdownOpen] = useState(false);

  // Example data
  const brands = ["Honda", "Yamaha", "Suzuki", "Bajaj", "TVS", "KTM"];
  const variants = ["Standard", "ABS", "Deluxe", "Pro"];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

//   const handleSubmit = async () => {
//     try {
//       setErrors({});
//       const parsedData = vehicleSchema.parse(formData);
//       console.log("✅ Valid Data:", parsedData);

//       const result = await addVehicle(parsedData).unwrap();
//       console.log("✅ API Response:", result);

//       if (result?.success) {
//         toast.success("Vehicle added successfully!");
//         window.location.href = "/dashboard/superAdmin";
//       } else {
//         toast.error("Vehicle addition failed. Please try again.");
//       }
//     } catch (err: any) {
//       if (err instanceof z.ZodError) {
//         const formattedErrors: { [key: string]: string } = {};
//         err.errors.forEach((e) => {
//           formattedErrors[e.path[0]] = e.message;
//         });
//         setErrors(formattedErrors);
//         toast.error("Validation failed!");
//         console.log("❌ Validation Errors:", formattedErrors);
//       } else {
//         console.error("❌ Error:", err);
//         toast.error(err?.data?.message || "Something went wrong!");
//       }
//     }
//   };

  return (
    <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-9">
          {/* Brand & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Brand Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
              >
                <span
                  className={formData.brand ? "text-gray-700" : "text-gray-400"}
                >
                  {formData.brand || "Brand"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${
                    brandDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {brandDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {brands.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => {
                        handleSelectChange("brand", brand);
                        setBrandDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Model Input */}
            <div>
              <input
                type="text"
                name="model"
                placeholder="Model"
                value={formData.model}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Year & Variant */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year */}
            <div>
              <input
                type="text"
                name="year"
                placeholder="Year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Variant Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setVariantDropdownOpen(!variantDropdownOpen)}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
              >
                <span
                  className={
                    formData.variant ? "text-gray-700" : "text-gray-400"
                  }
                >
                  {formData.variant || "Variant"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${
                    variantDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {variantDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {variants.map((variant) => (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => {
                        handleSelectChange("variant", variant);
                        setVariantDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                    >
                      {variant}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="button"
            //   onClick={handleSubmit}
            //   disabled={isLoading}
              className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
            >
              {/* {isLoading ? "Adding..." : "Add Vehicle"} */}
              Add Vehicle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;
