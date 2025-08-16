'use client';

import React, { useState } from "react";
import { z } from "zod";
import { useCreateEngineTypeMutation } from "@/lib/redux/api/engineTypeApi"; // You'll need to create this API slice
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Validation Schema
const engineTypeSchema = z.object({
    name: z.string().min(1, "Engine type name is required"),
});

interface FormData {
    name: string;
}

const AddEngineType: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({ name: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [addEngineType, { isLoading }] = useCreateEngineTypeMutation();
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            const parsedData = engineTypeSchema.parse(formData);

            const result = await addEngineType(parsedData).unwrap();
            if (result?.success) {
                toast.success("Engine Type added successfully!");
                setFormData({ name: "" });
                router.push("/admin/manage-engine-type/");
            } else {
                toast.error("Failed to add Engine Type.");
            }
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0]] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
            } else {
                toast.error(err?.data?.message || "Something went wrong!");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Add Engine Type</h2>
                <div className="flex gap-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Engine Type (e.g., V7)"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-[800px] px-4 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                        />
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cd63d] transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none disabled:opacity-50"
                        >
                            {isLoading ? "Adding..." : "Add Engine Type"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEngineType;
