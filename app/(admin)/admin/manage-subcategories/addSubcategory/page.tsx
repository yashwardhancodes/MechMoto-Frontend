"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCreateSubcategoryMutation } from "@/lib/redux/api/subCategoriesApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";
import { createSubcategorySchema } from "@/lib/schema/subcategorySchema";
import { useGetAllCategoriesQuery } from "@/lib/redux/api/categoriesApi";
import { ChevronDown } from "lucide-react";

interface FormData {
  name: string;
  description: string;
  imgSrc: string;
  categoryId: string;
}

interface FormErrors {
  [key: string]: string;
}

interface Category {
  id: number;
  name: string;
}

const AddSubcategory: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    imgSrc: "",
    categoryId: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false); // ✅ Added state
  const [createSubcategory, { isLoading }] = useCreateSubcategoryMutation();
  const token = useSelector((state: any) => state.auth.token);
  const {
    data: categories,
    isLoading: isCategoriesLoading,
    error: categoriesError,
  } = useGetAllCategoriesQuery({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ✅ Custom select handler
  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value.toString(),
    }));
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      let imgSrc = formData.imgSrc;
      if (file) {
        imgSrc = await uploadImageToBackend(file, token);
        setFormData((prev) => ({ ...prev, imgSrc }));
      }
      const parsedData = createSubcategorySchema.parse({
        ...formData,
        imgSrc,
        categoryId: formData.categoryId
          ? parseInt(formData.categoryId)
          : undefined,
      });
      console.log("✅ Valid Data:", parsedData);

      const result = await createSubcategory(parsedData).unwrap();
      console.log("✅ API Response:", result);

      if (result?.success) {
        toast.success("Subcategory added successfully! Redirecting...");
        window.location.href = "/admin/manage-subcategories";
      } else {
        toast.error("Subcategory addition failed. Please try again.");
      }
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const formattedErrors: { [key: string]: string } = {};
        err.errors.forEach((e) => {
          formattedErrors[e.path[0]] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
        console.log("❌ Validation Errors:", formattedErrors);
      } else {
        console.error("❌ Error:", err);
        toast.error(err?.data?.message || "Something went wrong!");
      }
    }
  };

  return (
    <div className="h-[calc(100vh-150px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-9">
          {/* Name Field */}
          <div>
            <input
              type="text"
              name="name"
              placeholder="Subcategory Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
            />
            {errors["name"] && (
              <p className="text-red-500 text-sm mt-1">{errors["name"]}</p>
            )}
          </div>

          {/* Description Field */}
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
              <p className="text-red-500 text-sm mt-1">
                {errors["description"]}
              </p>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
              disabled={isCategoriesLoading || !!categoriesError}
            >
              <span
                className={
                  formData.categoryId && Array.isArray(categories?.data)
                    ? "text-gray-700"
                    : "text-gray-400"
                }
              >
                {isCategoriesLoading
                  ? "Loading categories..."
                  : categoriesError
                  ? "Error loading categories"
                  : formData.categoryId && Array.isArray(categories?.data)
                  ? categories.data.find(
                      (c: Category) => c.id === Number(formData.categoryId)
                    )?.name || "Select a Category"
                  : "Select a Category"}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-[#9AE144] ${
                  categoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {categoryDropdownOpen &&
              !isCategoriesLoading &&
              !categoriesError &&
              Array.isArray(categories?.data) &&
              categories.data.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {categories.data.map((category: Category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleSelectChange("categoryId", category.id);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}

            {errors["categoryId"] && (
              <p className="text-red-500 text-sm mt-1">
                {errors["categoryId"]}
              </p>
            )}
          </div>

          {/* Image Upload Field */}
          <div className="flex justify-between items-center">
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
              {previewUrl ? (
                <div
                  className="relative h-44 w-auto cursor-pointer group"
                  onClick={handleImageClick}
                  title="Click to update image"
                >
                  <img
                    src={previewUrl}
                    alt="Subcategory preview"
                    className="w-full h-full p-4 object-cover rounded-lg border border-[#808080] group-hover:opacity-80 transition-opacity duration-200"
                  />
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-[#9AE144] bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-black font-medium text-sm">
                      Update Image
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleImageClick}
                  className="w-full px-4 py-3 border border-[#808080] rounded-md text-gray-700 text-left hover:bg-gray-100 transition-colors duration-200"
                >
                  Choose Image
                </button>
              )}
              {errors["imgSrc"] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors["imgSrc"]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
              >
                {isLoading ? "Adding..." : "Add Subcategory"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSubcategory;
