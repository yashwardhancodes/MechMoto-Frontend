'use client';

import React, { useState } from "react";
import { z } from "zod";
import { useCreateCarMakeMutation } from "@/lib/redux/api/caeMakeApi"; // You'll need to create this API slice
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

// Validation Schema
const carMakeSchema = z.object({
    name: z.string().min(1, "Car make name is required"),
});

interface FormData {
    name: string;
}

const AddCarMake: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({ name: "" });   
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [addCarMake, { isLoading }] = useCreateCarMakeMutation();
    const router = useRouter();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            const parsedData = carMakeSchema.parse(formData);

            const result = await addCarMake(parsedData).unwrap();
            if (result?.success) {
                toast.success("Car Make added successfully!");
                setFormData({ name: "" });
                router.push("/admin/manage-car-make?refresh=true");
            } else {
                toast.error("Failed to add Car Make.");
            }
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0] as string] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
            } else if (
                typeof err === "object" &&
                err !== null &&
                "data" in err &&
                typeof (err as { data?: unknown }).data === "object" &&
                (err as { data?: { message?: string } }).data?.message
            ) {
                toast.error((err as { data: { message: string } }).data.message);
            } else {
                toast.error("Something went wrong!");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Add Car Make</h2>
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
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cd63d] transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none disabled:opacity-50"
                        >
                            {isLoading ? "Adding..." : "Add Car Make"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddCarMake;
