"use client";

import React, { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { planSchema } from "@/lib/schema/planSchema";
import { useCreatePlanMutation } from "@/lib/redux/api/planApi";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { useRouter } from "next/navigation";

interface FormData {
    name: string;
    amount: number | string; // Allow string to handle empty state for placeholder
    period: string;
    interval: number | string; // Allow string to handle empty state for placeholder
    modules: { moduleName: string; limit: number }[];
}

const AddPlan: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        amount: "", // Initialize as empty string for placeholder
        period: "",
        interval: "", // Initialize as empty string for placeholder
        modules: [],
    });

    const router = useRouter();
    const [errors, setErrors] = useState({});
    const [addPlan, { isLoading }] = useCreatePlanMutation();
    const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);

    const periods = ["monthly", "yearly"];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "amount" || name === "interval" ? (value === "" ? "" : Number(value)) : value,
        }));
    };

    const handleModuleChange = (index: number, field: string, value: string | number) => {
        setFormData((prev) => {
            const updatedModules = [...prev.modules];
            updatedModules[index] = { ...updatedModules[index], [field]: value };
            return { ...prev, modules: updatedModules };
        });
    };

    const addModule = () => {
        setFormData((prev) => ({
            ...prev,
            modules: [...prev.modules, { moduleName: "", limit: 0 }],
        }));
    };

    const removeModule = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            modules: prev.modules.filter((_, i) => i !== index),
        }));
    };

    const handleSelectChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSubmit = async () => {
        try {
            setErrors({});
            // Convert amount and interval to numbers for validation
            const submitData = {
                ...formData,
                amount: formData.amount === "" ? 0 : Number(formData.amount),
                interval: formData.interval === "" ? 1 : Number(formData.interval),
            };
            const parsedData = planSchema.parse(submitData);
            console.log("✅ Valid Data:", parsedData);

            const result = await addPlan(parsedData).unwrap();
            console.log("✅ API Response:", result);

            if (result?.success) {
                toast.success("Plan added successfully!");
                router.push("/admin/manage-plans?refresh=true");
            } else {
                toast.error("Plan addition failed. Please try again.");
            }
        } catch (err: any) {
            if (err instanceof z.ZodError) {
                const formattedErrors: { [key: string]: string } = {};
                err.errors.forEach((e) => {
                    formattedErrors[e.path[0]] = e.message;
                });
                setErrors(formattedErrors);
                toast.error("Validation failed!", formattedErrors);
                console.log("❌ Validation Errors:", formattedErrors);
            } else {
                console.error("❌ Error:", err);
                toast.error(err?.data?.message || "Something went wrong!");
            }
        }
    };

    return (
        <div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="space-y-9">
                    {/* Plan Name and Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <input
                                type="text"
                                name="name"
                                placeholder="Plan Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <input
                                type="number"
                                name="amount"
                                placeholder="Amount (₹)"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Period and Interval */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-left text-gray-700 bg-white flex items-center justify-between"
                            >
                                <span
                                    className={formData.period ? "text-gray-700" : "text-gray-400"}
                                >
                                    {formData.period || "Billing Period"}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-[#9AE144] transition-transform duration-200 ${periodDropdownOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>
                            {periodDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#808080] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                                    {periods.map((period) => (
                                        <button
                                            key={period}
                                            type="button"
                                            onClick={() => {
                                                handleSelectChange("period", period);
                                                setPeriodDropdownOpen(false);
                                            }}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 text-gray-700"
                                        >
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <input
                                type="number"
                                name="interval"
                                placeholder="Interval"
                                value={formData.interval}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {/* Modules Section */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Modules</h3>
                            <button
                                type="button"
                                onClick={addModule}
                                className="flex items-center px-4 py-2 bg-[#9AE144] text-black font-medium rounded-lg hover:bg-[#9AE144]/80 transition-colors duration-200"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add Module
                            </button>
                        </div>
                        {formData.modules.length === 0 && (
                            <p className="text-gray-500">No modules added yet.</p>
                        )}
                        {formData.modules.map((module, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                                <input
                                    type="text"
                                    placeholder="Module Name"
                                    value={module.moduleName}
                                    onChange={(e) => handleModuleChange(index, "moduleName", e.target.value)}
                                    className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                                />
                                <input
                                    type="number"
                                    placeholder="Limit"
                                    value={module.limit}
                                    onChange={(e) => handleModuleChange(index, "limit", Number(e.target.value))}
                                    className="w-full px-4 py-3 border border-[#808080] rounded-lg focus:ring-2 focus:ring-[#9AE144] focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeModule(index)}
                                    className="flex items-center justify-center px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end pt-3">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-[#9AE144] hover:bg-[#9AE144] text-black font-medium rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-[#9AE144] focus:ring-offset-2 outline-none"
                        >
                            Add Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddPlan;