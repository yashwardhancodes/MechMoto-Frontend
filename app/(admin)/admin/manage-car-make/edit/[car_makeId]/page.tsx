'use client';

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { useGetCarMakeQuery, useUpdateCarMakeMutation } from "@/lib/redux/api/caeMakeApi"; // You'll need these endpoints in your API slice

// Validation Schema
const carMakeSchema = z.object({
    name: z.string().min(1, "Car make name is required"),
});

interface FormData {
    name: string;
}

const UpdateCarMake: React.FC = () => {
    const router = useRouter();
    const params = useParams(); 
    const id = params?.car_makeId as string;
    console.log("Car Make ID from params:", id);

    const { data, isLoading: isFetching } = useGetCarMakeQuery(id, { skip: !id });
    console.log("Fetched Car Make Data:", data);
    const [updateCarMake, { isLoading: isUpdating }] = useUpdateCarMakeMutation();

    const [formData, setFormData] = useState<FormData>({ name: "" });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        if (data?.success && data?.data) {
            setFormData({ name: data.data.name });
        }
    }, [data]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            const parsedData = carMakeSchema.parse(formData);

            const result = await updateCarMake({ id, ...parsedData }).unwrap();
            if (result?.success) {
                toast.success("Car Make updated successfully!");
                router.push("/admin/manage-car-make/");
            } else {
                toast.error("Failed to update Car Make.");
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

    if (isFetching) {
        return <div className="p-6">Loading car make details...</div>;
    }

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Update Car Make</h2>
                <div className="flex gap-4">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Car Make Name (e.g., Tata Motors)"
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
                            {isUpdating ? "Updating..." : "Update Car Make"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateCarMake;
