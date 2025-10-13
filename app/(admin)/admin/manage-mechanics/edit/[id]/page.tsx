'use client';

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useUpdateMechanicMutation, useGetMechanicQuery } from "@/lib/redux/api/mechanicApi";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";
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

const UpdateMechanic: React.FC = () => {
    const router = useRouter();
    const searchParams = useParams();
    const mechanicId = searchParams.id;

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
    const { data: mechanic, isLoading: isMechanicLoading } = useGetMechanicQuery(mechanicId || "");
    const [updateMechanic, { isLoading: isUpdating }] = useUpdateMechanicMutation();
    const { data: serviceCentersData, isLoading: scLoading } = useGetAllServiceCentersQuery({page: 1, limit: 999999});

    // Typed service centers array
    const serviceCenters: ServiceCenter[] = serviceCentersData?.data?.serviceCenters ?? [];

    // Populate form with mechanic data on load
    useEffect(() => {
        if (mechanic?.data) {
            setFormData({
                email: mechanic.data.user.email || "",
                full_name: mechanic.data.full_name || "",
                phone: mechanic.data.phone || "",
                city: mechanic.data.city || "",
                is_available: mechanic.data.is_available ?? true,
                rating: mechanic.data.rating || "",
                service_centerId: mechanic.data.service_centerId?.toString() || "",
            });
        }
    }, [mechanic]);

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
                id: mechanicId,
                email: parsedData.email,
                full_name: parsedData.full_name,
                phone: parsedData.phone || null,
                city: parsedData.city || null,
                latitude: undefined,
                longitude: undefined,
                is_available: parsedData.is_available,
                service_centerId: Number(parsedData.service_centerId),
            };

            const result = await updateMechanic(payload).unwrap();
            if (result?.data.id) {
                toast.success("Mechanic updated successfully!");
                router.push("/admin/manage-mechanics/?refresh=true");
            } else {
                toast.error("Failed to update mechanic.");
            }
        } catch (err: unknown) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0]] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!");
            } else if (typeof err === "object" && err !== null && "data" in err) {
                const apiError = err as { data?: { message?: string } };
                toast.error(apiError.data?.message || "Something went wrong!");
            } else {
                toast.error("Something went wrong!");
            }
        }

    };

    if (isMechanicLoading) {
        return <div>Loading mechanic data...</div>;
    }

    if (!mechanicId) {
        return <div>Error: Mechanic ID is missing</div>;
    }

    return (
        <div className="h-[calc(100vh-140px)] overflow-y-auto bg-white shadow-sm py-16 px-12">
            <div className="mx-auto space-y-6">
                <h2 className="text-xl font-semibold">Update Mechanic</h2>
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

                    {/* Service Center (Dropdown) + Availability */}
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
                            disabled={isUpdating}
                            className="px-8 py-3 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#8cd63d] transition-colors duration-200"
                        >
                            {isUpdating ? "Updating..." : "Update Mechanic"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default UpdateMechanic;
