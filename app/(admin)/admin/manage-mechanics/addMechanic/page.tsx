'use client';

import React, { useState } from "react";
import { z } from "zod";
import { useCreateMechanicMutation } from "@/lib/redux/api/mechanicApi";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useGetAllServiceCentersQuery } from "@/lib/redux/api/serviceCenterApi";

// ✅ Validation Schema
const mechanicSchema = z.object({
    email: z.string().email("Valid email is required"),
    full_name: z.string().min(1, "Full name is required"),
    phone: z.string().optional(),
    city: z.string().optional(),
    is_available: z.boolean().default(true),
    rating: z.string().optional(),
    service_centerId: z.string().min(1, "Service Center is required"),
});

type FormData = z.infer<typeof mechanicSchema>;

// Define Service Center type
interface ServiceCenter {
    id: number | string;
    name: string;
}

// Type for RTK Query error
interface ApiError {
    data?: {
        message?: string;
    };
}

const AddMechanic: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        email: "",
        full_name: "",
        phone: "",
        city: "",
        is_available: true,
        rating: "",
        service_centerId: "",
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [createMechanic, { isLoading }] = useCreateMechanicMutation();
    const { data: serviceCentersData, isLoading: scLoading } = useGetAllServiceCentersQuery({});
    const router = useRouter();

    const serviceCenters: ServiceCenter[] = serviceCentersData?.data ?? [];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox"
                ? (e.target as HTMLInputElement).checked
                : value,
        });
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            const parsedData = mechanicSchema.parse(formData);

            const payload = {
                email: parsedData.email,
                full_name: parsedData.full_name,
                phone: parsedData.phone || null,
                city: parsedData.city || null,
                latitude: undefined,
                longitude: undefined,
                is_available: parsedData.is_available,
                service_centerId: Number(parsedData.service_centerId),
            };

            const result = await createMechanic(payload).unwrap();
            if (result?.data?.id) {
                toast.success("Mechanic added successfully!");
                setFormData({
                    email: "",
                    full_name: "",
                    phone: "",
                    city: "",
                    is_available: true,
                    rating: "",
                    service_centerId: "",
                });
                router.push("/admin/manage-mechanics/?refresh=true");
            } else {
                toast.error("Failed to add mechanic.");
            }
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0] as string] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
            } else {
                const apiErr = err as ApiError;
                toast.error(apiErr.data?.message || "Something went wrong!");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Add Mechanic</h2>
                <div className="flex flex-col gap-6 w-[800px]">

                    {/* Email + Full Name */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div>
                            <input
                                type="text"
                                name="full_name"
                                placeholder="Full Name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg"
                            />
                            {errors.full_name && (
                                <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                            )}
                        </div>
                    </div>

                    {/* Phone + City */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <input
                                type="text"
                                name="phone"
                                placeholder="Phone"
                                value={formData.phone || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg"
                            />
                        </div>
                        <div>
                            <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={formData.city || ""}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Service Center + Availability */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <select
                                name="service_centerId"
                                value={formData.service_centerId}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-400 rounded-lg bg-white"
                            >
                                <option value="">Select Service Center</option>
                                {scLoading ? (
                                    <option disabled>Loading...</option>
                                ) : (
                                    serviceCenters.map((sc) => (
                                        <option key={sc.id} value={sc.id}>
                                            {sc.name}
                                        </option>
                                    ))
                                )}
                            </select>
                            {errors.service_centerId && (
                                <p className="text-red-500 text-sm mt-1">{errors.service_centerId}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="is_available"
                                checked={formData.is_available}
                                onChange={handleInputChange}
                                className="h-5 w-5"
                            />
                            <label className="text-gray-700">Available</label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cd63d] transition-colors duration-200"
                        >
                            {isLoading ? "Adding..." : "Add Mechanic"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AddMechanic;
