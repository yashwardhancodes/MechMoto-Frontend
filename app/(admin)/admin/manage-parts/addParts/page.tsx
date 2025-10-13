"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCreatePartMutation } from "@/lib/redux/api/partApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createPartSchema } from "@/lib/schema/partSchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { useGetAllVehiclesQuery } from "@/lib/redux/api/vehicleApi";
import { useGetAllSubcategoriesQuery } from "@/lib/redux/api/subCategoriesApi";
import { useGetAllPartBrandsQuery } from "@/lib/redux/api/partBrandApi";
 import { ChevronDown } from "lucide-react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { RootState } from "@/lib/redux/store";


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

interface Vehicle {
  modification?: string;
  engine_type?: { name: string };
  production_year?: string | number;
  model_line?: string;
  car_make?: { name: string };
  id: number;
  name: string;
}

interface Subcategory {
  id: number;
  name: string;
}

interface PartBrand {
  id: string;
  name: string;
}

interface Discount {
  id: number;
  name: string;
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

  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls] = useState<string[]>([]);
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

  // ✅ Hooks must always be called
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: vehicles, isLoading: isVehiclesLoading, error: vehiclesError } =
    useGetAllVehiclesQuery({});
  const { data: subcategories, isLoading: isSubcategoriesLoading, error: subcategoriesError } =
    useGetAllSubcategoriesQuery({});
  const { data: partBrands, isLoading: isPartBrandsLoading, error: partBrandsError } =
    useGetAllPartBrandsQuery({page: 1, limit: 999999});
  const { data: discounts, isLoading: isDiscountsLoading, error: discountsError } =
    useGetAllVehiclesQuery({}); // ⚠️ looks like this should be useGetAllDiscountsQuery?

  // ✅ Safe conditional side effect
  useEffect(() => {
    if (!token) {
      toast.error("You are not logged in!");
    }
  }, [token]);

  // ✅ Redirect or block rendering safely
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value.toString(),
    }));
    setDropdownOpen((prev) => ({
      ...prev,
      [name === "vehicleId" ? "vehicle" : name === "subcategoryId" ? "subcategory" : name === "partBrandId" ? "partBrand" : name === "discountId" ? "discount" : name === "availabilityStatus" ? "availabilityStatus" : "origin"]: false,
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      let imageUrls = formData.imageUrls;
      if (files.length > 0) {
        imageUrls = await Promise.all(files.map((file) => uploadImageToBackend(file, token)));
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
      console.log("✅ Valid Data:", parsedData);

      const result = await createPart(parsedData).unwrap();
      console.log("✅ API Response:", result);

      if (result?.success) {
        toast.success("Part added successfully! Redirecting...");
        window.location.href = "/admin/manage-parts";
      } else {
        toast.error("Part addition failed. Please try again.");
      }
    } // inside handleSubmit
    catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
        console.log("❌ Validation Errors:", formattedErrors);
      } else {
        const error = err as FetchBaseQueryError | SerializedError;

        if ("data" in error && error.data && typeof error.data === "object") {
          const apiError = error.data as { message?: string };
          toast.error(apiError.message || "Something went wrong!");
        } else {
          toast.error("Something went wrong!");
        }

        console.error("❌ Error:", error);
      }
    }

  };

  const availabilityOptions = ["Available", "Unavailable", "On Backorder"];
  const originOptions = ["OEM", "Aftermarket", "Refurbished"];

  return (
    <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-9">
          {/* Row 1: Part Number, Quantity, Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                name="partNumber"
                placeholder="Part Number"
                value={formData.partNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              {errors["partNumber"] && (
                <p className="text-red-500 text-sm mt-1">{errors["partNumber"]}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              {errors["quantity"] && (
                <p className="text-red-500 text-sm mt-1">{errors["quantity"]}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                step="0.01"
              />
              {errors["price"] && (
                <p className="text-red-500 text-sm mt-1">{errors["price"]}</p>
              )}
            </div>
          </div>

          {/* Row 2: Description, Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <textarea
                name="description"
                placeholder="Description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
              />
              {errors["description"] && (
                <p className="text-red-500 text-sm mt-1">{errors["description"]}</p>
              )}
            </div>
            <div>
              <textarea
                name="remarks"
                placeholder="Remarks"
                rows={4}
                value={formData.remarks}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 resize-none"
              />
              {errors["remarks"] && (
                <p className="text-red-500 text-sm mt-1">{errors["remarks"]}</p>
              )}
            </div>
          </div>

          {/* Row 3: Vehicle, Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setDropdownOpen((prev) => ({ ...prev, vehicle: !prev.vehicle }))
                }
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={isVehiclesLoading || !!vehiclesError}
              >
                <span
                  className={
                    formData.vehicleId && Array.isArray(vehicles?.data)
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {isVehiclesLoading
                    ? "Loading vehicles..."
                    : vehiclesError
                      ? "Error loading vehicles"
                      : formData.vehicleId && Array.isArray(vehicles?.data)
                        ? (() => {
                          const selected = vehicles.data.find(
                            (v: Vehicle) => v.id === Number(formData.vehicleId)
                          );
                          return selected
                            ? `${selected.car_make?.name || ""} ${selected.model_line || ""} ${selected.modification ? `(${selected.modification})` : ""
                            } ${selected.engine_type?.name ? `- ${selected.engine_type.name}` : ""} [${selected.production_year}]`
                            : "Select a Vehicle";
                        })()
                        : "Select a Vehicle"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.vehicle ? "rotate-180" : ""
                    }`}
                />
              </button>

              {dropdownOpen.vehicle &&
                !isVehiclesLoading &&
                !vehiclesError &&
                Array.isArray(vehicles?.data) &&
                vehicles.data.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {vehicles.data.map((vehicle: Vehicle) => (
                      <button
                        key={vehicle.id}
                        type="button"
                        onClick={() => handleSelectChange("vehicleId", vehicle.id)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50"
                      >
                        {vehicle.car_make?.name} {vehicle.model_line}{" "}
                        {vehicle.modification ? `(${vehicle.modification})` : ""}{" "}
                        {vehicle.engine_type?.name ? `- ${vehicle.engine_type.name}` : ""}{" "}
                        [{vehicle.production_year}]
                      </button>
                    ))}
                  </div>
                )}

              {errors["vehicleId"] && (
                <p className="text-red-500 text-sm mt-1">{errors["vehicleId"]}</p>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, subcategory: !prev.subcategory }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={isSubcategoriesLoading || !!subcategoriesError}
              >
                <span
                  className={
                    formData.subcategoryId && Array.isArray(subcategories?.data)
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {isSubcategoriesLoading
                    ? "Loading subcategories..."
                    : subcategoriesError
                      ? "Error loading subcategories"
                      : formData.subcategoryId && Array.isArray(subcategories?.data)
                        ? subcategories.data.find((s: Subcategory) => s.id === Number(formData.subcategoryId))?.name || "Select a Subcategory"
                        : "Select a Subcategory"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.subcategory ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen.subcategory && !isSubcategoriesLoading && !subcategoriesError && Array.isArray(subcategories?.data) && subcategories.data.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {subcategories.data.map((subcategory: Subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      onClick={() => handleSelectChange("subcategoryId", subcategory.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {subcategory.name}
                    </button>
                  ))}
                </div>
              )}
              {errors["subcategoryId"] && (
                <p className="text-red-500 text-sm mt-1">{errors["subcategoryId"]}</p>
              )}
            </div>
          </div>

          {/* Row 4: Part Brand, Discount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, partBrand: !prev.partBrand }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={isPartBrandsLoading || !!partBrandsError}
              >
                <span
                  className={
                    formData.partBrandId && Array.isArray(partBrands?.data)
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {isPartBrandsLoading
                    ? "Loading part brands..."
                    : partBrandsError
                      ? "Error loading part brands"
                      : formData.partBrandId && Array.isArray(partBrands?.data)
                        ? partBrands.data.find((pb: PartBrand) => pb.id === formData.partBrandId)?.name || "Select a Part Brand"
                        : "Select a Part Brand"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.partBrand ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen.partBrand && !isPartBrandsLoading && !partBrandsError && Array.isArray(partBrands?.data) && partBrands.data.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {partBrands.data.map((partBrand: PartBrand) => (
                    <button
                      key={partBrand.id}
                      type="button"
                      onClick={() => handleSelectChange("partBrandId", partBrand.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {partBrand.name}
                    </button>
                  ))}
                </div>
              )}
              {errors["partBrandId"] && (
                <p className="text-red-500 text-sm mt-1">{errors["partBrandId"]}</p>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, discount: !prev.discount }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
                disabled={isDiscountsLoading || !!discountsError}
              >
                <span
                  className={
                    formData.discountId && Array.isArray(discounts?.data)
                      ? "text-gray-700"
                      : "text-gray-400"
                  }
                >
                  {isDiscountsLoading
                    ? "Loading discounts..."
                    : discountsError
                      ? "Error loading discounts"
                      : formData.discountId && Array.isArray(discounts?.data)
                        ? discounts.data.find((d: Discount) => d.id === Number(formData.discountId))?.name || "Select a Discount"
                        : "Select a Discount"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.discount ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen.discount && !isDiscountsLoading && !discountsError && Array.isArray(discounts?.data) && discounts.data.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {discounts.data.map((discount: Discount) => (
                    <button
                      key={discount.id}
                      type="button"
                      onClick={() => handleSelectChange("discountId", discount.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {discount.name}
                    </button>
                  ))}
                </div>
              )}
              {errors["discountId"] && (
                <p className="text-red-500 text-sm mt-1">{errors["discountId"]}</p>
              )}
            </div>
          </div>

          {/* Row 5: Availability Status, Origin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, availabilityStatus: !prev.availabilityStatus }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
              >
                <span className={formData.availabilityStatus ? "text-gray-700" : "text-gray-400"}>
                  {formData.availabilityStatus || "Select Availability Status"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.availabilityStatus ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen.availabilityStatus && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {availabilityOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleSelectChange("availabilityStatus", status)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
              {errors["availabilityStatus"] && (
                <p className="text-red-500 text-sm mt-1">{errors["availabilityStatus"]}</p>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => ({ ...prev, origin: !prev.origin }))}
                className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
              >
                <span className={formData.origin ? "text-gray-700" : "text-gray-400"}>
                  {formData.origin || "Select Origin"}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-[#9AE144] ${dropdownOpen.origin ? "rotate-180" : ""}`}
                />
              </button>
              {dropdownOpen.origin && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {originOptions.map((origin) => (
                    <button
                      key={origin}
                      type="button"
                      onClick={() => handleSelectChange("origin", origin)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {origin}
                    </button>
                  ))}
                </div>
              )}
              {errors["origin"] && (
                <p className="text-red-500 text-sm mt-1">{errors["origin"]}</p>
              )}
            </div>
          </div>

          {/* Row 6: Image Upload, Submit Button */}
          <div className="flex justify-between items-start">
            <div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              {previewUrls.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {previewUrls.map((url, index) => (
                    <div
                      key={index}
                      className="relative h-44 w-44 cursor-pointer group"
                      onClick={handleImageClick}
                      title="Click to update images"
                    >
                      <Image
                        src={url}
                        alt={`Part preview ${index + 1}`}
                        className="w-full h-full p-4 object-cover rounded-lg border border-[#808080] group-hover:opacity-80 transition-opacity duration-200"
                        width={100}
                        height={100}
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#9AE144] bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-black font-medium text-sm">Update Images</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full px-4 py-3 border border-[#808080] rounded-md text-gray-700 text-left hover:bg-gray-100 transition-colors duration-200"
                >
                  Choose Images
                </button>
              )}
              {errors["imageUrls"] && (
                <p className="text-red-500 text-sm mt-1">{errors["imageUrls"]}</p>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
              >
                {isLoading ? "Adding..." : "Add Part"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPart;