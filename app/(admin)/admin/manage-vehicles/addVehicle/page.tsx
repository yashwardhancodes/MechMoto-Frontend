'use client';

import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useCreateVehicleMutation } from "@/lib/redux/api/vehicleApi";
import { useGetAllCarMakesQuery } from "@/lib/redux/api/caeMakeApi";
import { useGetAllEngineTypesQuery } from "@/lib/redux/api/engineTypeApi";
import { vehicleSchema } from "@/lib/schema/vehicleSchema";
import { useRouter } from "next/navigation";

interface FormData {
  carMakeId: number | null;
  modelLine: string;
  productionYear: string;
  modification: string;
  engineTypeId: number | null;
}

const AddVehicle: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    carMakeId: null,
    modelLine: "",
    productionYear: "",
    modification: "",
    engineTypeId: null,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [addVehicle, { isLoading }] = useCreateVehicleMutation();
  const { data: carMakesResponse, isLoading: carMakesLoading, error: carMakesError } = useGetAllCarMakesQuery({});
  const { data: engineTypesResponse, isLoading: engineTypesLoading, error: engineTypesError } = useGetAllEngineTypesQuery({});

  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [engineDropdownOpen, setEngineDropdownOpen] = useState(false);

  // Extract the data array from the API response with strict type checking
  const carMakes = Array.isArray(carMakesResponse?.data) ? carMakesResponse.data : [];
  const engineTypes = Array.isArray(engineTypesResponse?.data) ? engineTypesResponse.data : [];

  // Debug API response and form data
  useEffect(() => {
    console.log("carMakesResponse:", carMakesResponse);
    console.log("engineTypesResponse:", engineTypesResponse);
    console.log("carMakes:", carMakes);
    console.log("engineTypes:", engineTypes);
    console.log("formData:", formData);
  }, [carMakesResponse, engineTypesResponse, carMakes, engineTypes, formData]);

  // Handle API errors with toast notifications
  useEffect(() => {
    if (carMakesError) {
      toast.error("Failed to load car makes. Please try again.");
    }
    if (engineTypesError) {
      toast.error("Failed to load engine types. Please try again.");
    }
  }, [carMakesError, engineTypesError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value ?? "", // Ensure no undefined values
    }));
    // Clear error for the field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (
    field: keyof FormData,
    value: string | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for the field when user selects an option
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Validate form before enabling submit button
  const isFormValid = () => {
    return (
      formData.carMakeId !== null &&
      formData.modelLine.trim() !== "" &&
      !isNaN(Number(formData.productionYear)) &&
      Number(formData.productionYear) > 0
    );
  };

  const handleSubmit = async () => {
    try {
      setErrors({});

      const payload = {
        carMakeId: formData.carMakeId,
        modelLine: formData.modelLine ?? "", // Ensure no undefined
        productionYear: Number(formData.productionYear) || 0, // Ensure valid number
        modification: formData.modification ?? "", // Ensure no undefined
        engineTypeId: formData.engineTypeId,
      };

      console.log("Submitting payload:", payload);

      const parsedData = vehicleSchema.parse(payload);
      console.log("✅ Valid Data:", parsedData);

      const result = await addVehicle(parsedData).unwrap();
      console.log("✅ API Response:", result);

      if (result?.success) {
        toast.success("Vehicle added successfully!");
        router.push("/admin/manage-vehicles?refresh=true");
      }
      else {
        toast.error("Vehicle addition failed. Please try again.");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        // Show individual error messages in toast
        Object.values(formattedErrors).forEach((error) => {
          toast.error(error);
        });
      } else {
        console.error("❌ Error:", err);
        toast.error(err?.data?.message || "Something went wrong!");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-9">
          {/* Brand & Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Car Make Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setBrandDropdownOpen(!brandDropdownOpen)}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={carMakesLoading || !!carMakesError}
              >
                <span
                  className={
                    formData.carMakeId && Array.isArray(carMakes) ? "text-gray-700" : "text-gray-400"
                  }
                >
                  {carMakesLoading
                    ? "Loading..."
                    : carMakesError
                      ? "Error loading makes"
                      : formData.carMakeId && Array.isArray(carMakes)
                        ? carMakes.find((b) => b.id === formData.carMakeId)?.name || "Select Car Make"
                        : "Select Car Make"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${brandDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {brandDropdownOpen && !carMakesLoading && !carMakesError && Array.isArray(carMakes) && carMakes.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {carMakes.map((brand) => (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("carMakeId", brand.id);
                        setBrandDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.carMakeId && (
                <p className="text-red-500 text-sm mt-1">{errors.carMakeId}</p>
              )}
            </div>

            {/* Model Input */}
            <div>
              <input
                type="text"
                name="modelLine"
                placeholder="Model Line"
                value={formData.modelLine ?? ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg"
              />
              {errors.modelLine && (
                <p className="text-red-500 text-sm mt-1">{errors.modelLine}</p>
              )}
            </div>
          </div>

          {/* Year & Engine */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Year */}
            <div>
              <input
                type="text"
                name="productionYear"
                placeholder="Year"
                value={formData.productionYear ?? ""}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg"
              />
              {errors.productionYear && (
                <p className="text-red-500 text-sm mt-1">{errors.productionYear}</p>
              )}
            </div>

            {/* Engine Type Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setEngineDropdownOpen(!engineDropdownOpen)}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={engineTypesLoading || !!engineTypesError}
              >
                <span
                  className={
                    formData.engineTypeId && Array.isArray(engineTypes) ? "text-gray-700" : "text-gray-400"
                  }
                >
                  {engineTypesLoading
                    ? "Loading..."
                    : engineTypesError
                      ? "Error loading engines"
                      : formData.engineTypeId && Array.isArray(engineTypes)
                        ? engineTypes.find((e) => e.id === formData.engineTypeId)?.name || "Select Engine Type"
                        : "Select Engine Type"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${engineDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {engineDropdownOpen && !engineTypesLoading && !engineTypesError && Array.isArray(engineTypes) && engineTypes.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {engineTypes.map((engine) => (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("engineTypeId", engine.id);
                        setEngineDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {engine.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.engineTypeId && (
                <p className="text-red-500 text-sm mt-1">{errors.engineTypeId}</p>
              )}
            </div>
          </div>

          {/* Modification */}
          <div>
            <input
              type="text"
              name="modification"
              placeholder="Modification"
              value={formData.modification ?? ""}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[#808080] rounded-lg"
            />
            {errors.modification && (
              <p className="text-red-500 text-sm mt-1">{errors.modification}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || carMakesLoading || engineTypesLoading || !!carMakesError || !!engineTypesError || !isFormValid()}
              className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg disabled:opacity-50"
            >
              {isLoading ? "Adding..." : "Add Vehicle"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;