'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCreateCategoryMutation } from "@/lib/redux/api/categoriesApi";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { createCategorySchema } from "@/lib/schema/categorySchema";
import { uploadImageToBackend } from "@/lib/utils/imageUpload";

interface FormData {
  name: string;
  description: string;
  img_src: string;
}

interface FormErrors {
  [key: string]: string;
}

interface RootState {
  auth: {
    token: string;
  };
}

const AddCategory: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    img_src: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [createCategory, { isLoading }] = useCreateCategoryMutation();
  const token = useSelector((state: RootState) => state.auth.token);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview when file changes
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    fileInputRef.current?.click();
  };

  const handleSubmit = async () => {
    try {
      setErrors({});
      let imgSrc = formData.img_src;
      if (file) {
        imgSrc = await uploadImageToBackend(file, token);
        setFormData((prev) => ({ ...prev, img_src: imgSrc }));
      }

      const parsedData = createCategorySchema.parse({ ...formData, img_src: imgSrc });
      console.log("✅ Valid Data:", parsedData);

      const result = await createCategory(parsedData).unwrap();
      console.log("✅ API Response:", result);

      if (result?.success) {
        toast.success("Category added successfully! Redirecting...");
        window.location.href = "/admin/manage-categories";
      } else {
        toast.error("Category addition failed. Please try again.");
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        const formattedErrors: FormErrors = {};
        err.errors.forEach((e) => {
          const key = e.path[0] as string;
          formattedErrors[key] = e.message;
        });
        setErrors(formattedErrors);
        toast.error("Validation failed!");
        console.log("❌ Validation Errors:", formattedErrors);
      } else {
        const errorMessage =
          typeof err === "object" &&
          err !== null &&
          "data" in err &&
          typeof (err as { data?: { message?: string } }).data?.message === "string"
            ? (err as { data?: { message?: string } }).data!.message!
            : "Something went wrong!";
        toast.error(errorMessage);
        console.error("❌ Error:", err);
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
							placeholder="Category Name"
							value={formData.name}
							onChange={handleInputChange}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
						/>
						{errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
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
						{errors.description && (
							<p className="text-red-500 text-sm mt-1">{errors.description}</p>
						)}
					</div>

					{/* Image Upload & Submit */}
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
									className="relative h-44 w-full cursor-pointer group"
									onClick={handleImageClick}
									title="Click to update image"
								>
									<Image
										src={previewUrl}
										alt="Category preview"
										className="w-full h-full p-4 object-cover rounded-lg border border-[#808080] group-hover:opacity-80 transition-opacity duration-200"
										width={100}
										height={100}
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
							{errors.img_src && (
								<p className="text-red-500 text-sm mt-1">{errors.img_src}</p>
							)}
						</div>

						<div className="flex justify-end pt-3">
							<button
								type="button"
								onClick={handleSubmit}
								disabled={isLoading}
								className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
							>
								{isLoading ? "Adding..." : "Add Category"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
  );
};

export default AddCategory;
