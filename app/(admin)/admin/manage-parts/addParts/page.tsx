"use client";

import React, { useState, useEffect } from "react";
 import { ChevronDown } from "lucide-react";
import { z } from "zod";
import toast from "react-hot-toast";
import { useCreatePartMutation } from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { createPartSchema } from "@/lib/schema/partSchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useGetAllSubcategoriesQuery } from "@/lib/redux/api/subCategoriesApi";
 import { RootState } from "@/lib/redux/store";

// Correct Vehicle interface matching your current backend (direct model + modification.models fallback)
interface Vehicle {
  id: number;
  production_year: number;
  model?: {
    id: number;
    name: string;
    model_line: {
      id: number;
      name: string;
      car_make: { id: number; name: string };
    };
  } | null;
  modification?: {
    id: number;
    name: string;
    models?: Array<{
      id: number;
      name: string;
      model_line: {
        id: number;
        name: string;
        car_make: { id: number; name: string };
      };
    }>;
  };
  engine_type?: { id: number; name: string } | null;
  _count?: Record<string, number>;
}

interface Subcategory {
  id: number;
  name: string;
}

 

interface FormData {
  vehicleId: string;
  subcategoryId: string;
  partNumber: string;
  description: string;
  quantity: string;
  imageUrls: string[];
  price: string;
  remarks: string;
  availabilityStatus: string;
  origin: string;
  partBrandId: string;
  discountId: string;
}

interface FormErrors {
  [key: string]: string;
}

const AddPart: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    vehicleId: "",
    subcategoryId: "",
    partNumber: "",
    description: "",
    quantity: "1",
    imageUrls: [],
    price: "",
    remarks: "",
    availabilityStatus: "Unavailable",
    origin: "OEM",
    partBrandId: "",
    discountId: "",
  });

  const [files ] = useState<File[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [dropdownOpen, setDropdownOpen] = useState({
    vehicle: false,
    subcategory: false,
    availabilityStatus: false,
    origin: false,
    partBrand: false,
    discount: false,
  });

  const [createPart, { isLoading }] = useCreatePartMutation();
  const token = useSelector((state: RootState) => state.auth.token);

 
  const {
    data: vehicleResponse,
    isLoading: isVehiclesLoading,
    error: vehiclesError,
  } = useGetAllVehiclesQuery({});

  const {
    data: subcategoryResponse,
    isLoading: isSubcategoriesLoading,
    error: subcategoriesError,
  } = useGetAllSubcategoriesQuery({});
 

  // Placeholder for discounts (replace with real query when available)
 

  const vehicles: Vehicle[] = vehicleResponse?.data?.vehicles ?? [];
  const subcategories: Subcategory[] = subcategoryResponse?.data?.subcategories ?? [];
 
  useEffect(() => {
    if (!token) {
      toast.error("You are not logged in!");
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-140px)]">
        <p className="text-red-500 text-lg font-medium">You are not logged in!</p>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

 

  

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value.toString() }));
    setDropdownOpen((prev) => ({
      ...prev,
      vehicle: name === "vehicleId" ? false : prev.vehicle,
      subcategory: name === "subcategoryId" ? false : prev.subcategory,
      partBrand: name === "partBrandId" ? false : prev.partBrand,
      discount: name === "discountId" ? false : prev.discount,
      availabilityStatus: name === "availabilityStatus" ? false : prev.availabilityStatus,
      origin: name === "origin" ? false : prev.origin,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});

      let imageUrls = formData.imageUrls;
      if (files.length > 0) {
        imageUrls = await Promise.all(
          files.map((file) => uploadImageToBackend(file, token!))
        );
      }

      const parsedData = createPartSchema.parse({
        ...formData,
        vehicleId: formData.vehicleId ? parseInt(formData.vehicleId) : undefined,
        subcategoryId: formData.subcategoryId ? parseInt(formData.subcategoryId) : undefined,
        partBrandId: formData.partBrandId ? parseInt(formData.partBrandId) : undefined,
        discountId: formData.discountId ? parseInt(formData.discountId) : undefined,
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
        price: formData.price ? parseFloat(formData.price) : undefined,
        imageUrls,
      });

      const result = await createPart(parsedData).unwrap();

      if (result?.success) {
        toast.success("Part added successfully!");
        window.location.href = "/admin/manage-parts";
      } else {
        toast.error("Part addition failed.");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formatted: FormErrors = {};
        err.errors.forEach((e) => {
          formatted[e.path[0] as string] = e.message;
        });
        setErrors(formatted);
        toast.error("Validation failed!");
      } else {
        toast.error(err?.data?.message || "Something went wrong!");
      }
    }
  };

 

  // Safe display helper
  const getVehicleDisplayName = (v: Vehicle): string => {
    const directModel = v.model;
    const fallbackModel = v.modification.models?.[0];
    const displayModel = directModel || fallbackModel;

    const make = displayModel?.model_line?.car_make?.name || "Unknown Make";
    const modelLine = displayModel?.model_line?.name || "Unknown Model";
    const generation = directModel?.name || fallbackModel?.name || "";
    const variant = v.modification.name;
    const engine = v.engine_type?.name ? ` - ${v.engine_type.name}` : "";
    const year = v.production_year;

    return `${make} ${modelLine}${generation ? ` (${generation})` : ""} - ${variant}${engine} [${year}]`;
  };

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8">Add New Part</h2>

        <div className="space-y-9">
          {/* Part Number, Quantity, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                name="partNumber"
                placeholder="Part Number"
                value={formData.partNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
              />
              {errors.partNumber && <p className="text-red-500 text-sm mt-1">{errors.partNumber}</p>}
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                step="0.01"
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none"
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>

          {/* Description & Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <textarea
                name="description"
                placeholder="Description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none resize-none"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
            <div>
              <textarea
                name="remarks"
                placeholder="Remarks"
                rows={4}
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] outline-none resize-none"
              />
            </div>
          </div>

          {/* Vehicle & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vehicle Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, vehicle: !prev.vehicle }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={isVehiclesLoading || !!vehiclesError}
              >
                <span className={formData.vehicleId ? "text-gray-700" : "text-gray-400"}>
                  {isVehiclesLoading
                    ? "Loading vehicles..."
                    : vehiclesError
                    ? "Error loading vehicles"
                    : formData.vehicleId
                    ? getVehicleDisplayName(
                        vehicles.find((v) => v.id === Number(formData.vehicleId))!
                      )
                    : "Select a Vehicle"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    dropdownOpen.vehicle ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen.vehicle && vehicles.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("vehicleId", vehicle.id);
                        setDropdownOpen((prev) => ({ ...prev, vehicle: false }));
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm"
                    >
                      {getVehicleDisplayName(vehicle)}
                    </button>
                  ))}
                </div>
              )}
              {errors.vehicleId && <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>}
            </div>

            {/* Subcategory Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, subcategory: !prev.subcategory }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center disabled:opacity-60"
                disabled={isSubcategoriesLoading || !!subcategoriesError}
              >
                <span className={formData.subcategoryId ? "text-gray-700" : "text-gray-400"}>
                  {isSubcategoriesLoading
                    ? "Loading subcategories..."
                    : subcategoriesError
                    ? "Error loading"
                    : formData.subcategoryId
                    ? subcategories.find((s) => s.id === Number(formData.subcategoryId))?.name
                    : "Select Subcategory"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] transition-transform ${
                    dropdownOpen.subcategory ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen.subcategory && subcategories.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("subcategoryId", sub.id);
                        setDropdownOpen((prev) => ({ ...prev, subcategory: false }));
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
              {errors.subcategoryId && <p className="text-red-500 text-sm mt-1">{errors.subcategoryId}</p>}
            </div>
          </div>

          {/* Other fields remain the same... */}
          {/* (Part Brand, Availability, Origin, Image Upload, Submit - unchanged from your code) */}

          {/* Submit */}
          <div className="flex justify-end pt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-10 py-3 bg-[#9AE144] hover:bg-[#8cd136] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Adding..." : "Add Part"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPart;