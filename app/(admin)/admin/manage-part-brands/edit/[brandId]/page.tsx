'use client';

import React, { useState, useEffect } from "react";
import { z, ZodError } from "zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useGetPartBrandQuery, useUpdatePartBrandMutation } from "@/lib/redux/api/partBrandApi";

// Validation Schema
const partBrandSchema = z.object({
    name: z.string().min(1, "Part brand name is required"),
});

interface FormData {
    name: string;
}

const UpdatePartBrand: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const brandId = params?.brandId as string;
    console.log("Part Brand ID from params:", brandId);

    const { data, isLoading: isFetching, error } = useGetPartBrandQuery(brandId, { skip: !brandId });
    console.log("Fetched Part Brand Data:", data);
    const [updatePartBrand, { isLoading: isUpdating }] = useUpdatePartBrandMutation();

    const [formData, setFormData] = useState<FormData>({ name: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (data?.success && data?.data) {
            setFormData({ name: data.data.name ?? "" }); // Fallback to empty string
        }
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!brandId) {
            toast.error("Part Brand ID is missing!");
            return;
        }

        try {
            setErrors({});
            const parsedData = partBrandSchema.parse(formData);

            const result = await updatePartBrand({ id: brandId, data: parsedData }).unwrap();
            if (result?.success) {
                toast.success("Part Brand updated successfully!");
                router.push("/admin/manage-part-brands/");
            } else {
                toast.error("Failed to update Part Brand.");
            }
        } catch (err: unknown) {
            if (err instanceof ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0] as string] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
            } else if (typeof err === "object" && err !== null && "data" in err) {
                const e = err as { data?: { message?: string } };
                toast.error(e.data?.message || "Something went wrong!");
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    if (isFetching) {
        return <div className="p-6">Loading part brand details...</div>;
    }

    if (error || !data?.success || !data?.data) {
        return <div className="p-6">Error: Part Brand data not found</div>;
    }

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Update Part Brand</h2>
                <div className="flex gap-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Part Brand Name (e.g., Bosch)"
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
                            disabled={isUpdating}
                            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cd63d] transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none disabled:opacity-50"
                        >
                            {isUpdating ? "Updating..." : "Update Part Brand"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdatePartBrand;
