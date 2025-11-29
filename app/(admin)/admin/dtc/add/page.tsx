"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCreateDtcMutation } from "@/lib/redux/api/dtcApi";
import { useGetDtcSystemsQuery } from "@/lib/redux/api/dtcApi";

const dtcSchema = z.object({
	code: z.string().regex(/^[PBCU]\d{4}$/, "Format: P0301, C1234, etc."),
	systemId: z.number().int().positive(),
	title: z.string().min(5),
	description: z.string().min(20),
	severity: z.enum(["low", "moderate", "high", "critical"]),
	commonSymptoms: z.array(z.string()).default([]),
	possibleCauses: z.array(z.string()).default([]),
	affectedComponents: z.array(z.string()).default([]),
	diagnosticSteps: z.string().optional(),
	repairGuide: z.string().optional(),
	isObd2Standard: z.boolean().default(true),
});

type FormData = {
	code: string;
	systemId: number | null;
	title: string;
	description: string;
	severity: "low" | "moderate" | "high" | "critical";
	commonSymptoms: string;
	possibleCauses: string;
	affectedComponents: string;
	diagnosticSteps: string;
	repairGuide: string;
	isObd2Standard: boolean;
};

export default function AddDtc() {
	const router = useRouter();
	const [createDtc, { isLoading }] = useCreateDtcMutation();
	const { data: systemsData, isLoading: systemsLoading } = useGetDtcSystemsQuery();

	const [formData, setFormData] = useState<FormData>({
		code: "",
		systemId: null,
		title: "",
		description: "",
		severity: "moderate",
		commonSymptoms: "",
		possibleCauses: "",
		affectedComponents: "",
		diagnosticSteps: "",
		repairGuide: "",
		isObd2Standard: true,
	});

	const [errors, setErrors] = useState<Record<string, string>>({});
	const [systemDropdownOpen, setSystemDropdownOpen] = useState(false);

	const systems = systemsData?.data || [];

	const handleSubmit = async () => {
		try {
			setErrors({});

			const payload = {
				...formData,
				commonSymptoms: formData.commonSymptoms
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean),
				possibleCauses: formData.possibleCauses
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean),
				affectedComponents: formData.affectedComponents
					.split("\n")
					.map((s) => s.trim())
					.filter(Boolean),
			};

			dtcSchema.parse(payload);
			await createDtc(payload).unwrap();

			toast.success("DTC added successfully!");
			router.push("/admin/dtc");
		} catch (err: any) {
			if (err instanceof z.ZodError) {
				const formatted = err.errors.reduce((acc, e) => {
					acc[e.path[0] as string] = e.message;
					return acc;
				}, {} as Record<string, string>);
				setErrors(formatted);
				Object.values(formatted).forEach((msg) => toast.error(msg));
			} else {
				toast.error(err?.data?.message || "Failed to create DTC");
			}
		}
	};

	return (
		<div className="h-[calc(100vh-170px)] overflow-y-auto bg-white shadow-sm py-16 px-4">
			<div className="max-w-5xl mx-auto">
				<h1 className="text-3xl font-bold mb-8">Add New DTC Code</h1>

				<div className="space-y-8">
					{/* Code & System */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<input
								type="text"
								placeholder="DTC Code (e.g. P0301)"
								value={formData.code}
								onChange={(e) =>
									setFormData({ ...formData, code: e.target.value.toUpperCase() })
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg"
							/>
							{errors.code && (
								<p className="text-red-500 text-sm mt-1">{errors.code}</p>
							)}
						</div>

						<div className="relative">
							<button
								type="button"
								onClick={() => setSystemDropdownOpen(!systemDropdownOpen)}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg flex justify-between items-center"
								disabled={systemsLoading}
							>
								<span>
									{formData.systemId
										? systems.find((s) => s.id === formData.systemId)?.name ||
										  "Select System"
										: "Select System"}
								</span>
								<ChevronDown className="w-5 h-5 text-[#9AE144]" />
							</button>
							{systemDropdownOpen && (
								<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
									{systems.map((sys) => (
										<button
											key={sys.id}
											onClick={() => {
												setFormData({ ...formData, systemId: sys.id });
												setSystemDropdownOpen(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50"
										>
											{sys.code} - {sys.name}
										</button>
									))}
								</div>
							)}
							{errors.systemId && (
								<p className="text-red-500 text-sm mt-1">{errors.systemId}</p>
							)}
						</div>
					</div>

					{/* Title & Severity */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<input
							type="text"
							placeholder="Title (e.g. Cylinder 1 Misfire Detected)"
							value={formData.title}
							onChange={(e) => setFormData({ ...formData, title: e.target.value })}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						/>
						<select
							value={formData.severity}
							onChange={(e) =>
								setFormData({ ...formData, severity: e.target.value as any })
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						>
							<option value="low">Low</option>
							<option value="moderate">Moderate</option>
							<option value="high">High</option>
							<option value="critical">Critical</option>
						</select>
					</div>

					{/* Description */}
					<textarea
						placeholder="Detailed description..."
						rows={4}
						value={formData.description}
						onChange={(e) => setFormData({ ...formData, description: e.target.value })}
						className="w-full px-4 py-3 border border-[#808080] rounded-lg"
					/>

					{/* Lists (one per line) */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div>
							<p className="text-sm font-medium mb-2">
								Common Symptoms (one per line)
							</p>
							<textarea
								rows={6}
								value={formData.commonSymptoms}
								onChange={(e) =>
									setFormData({ ...formData, commonSymptoms: e.target.value })
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg text-sm"
								placeholder="Check Engine Light&#10;Rough idle&#10;Loss of power"
							/>
						</div>
						<div>
							<p className="text-sm font-medium mb-2">Possible Causes</p>
							<textarea
								rows={6}
								value={formData.possibleCauses}
								onChange={(e) =>
									setFormData({ ...formData, possibleCauses: e.target.value })
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg text-sm"
							/>
						</div>
						<div>
							<p className="text-sm font-medium mb-2">Affected Components</p>
							<textarea
								rows={6}
								value={formData.affectedComponents}
								onChange={(e) =>
									setFormData({ ...formData, affectedComponents: e.target.value })
								}
								className="w-full px-4 py-3 border border-[#808080] rounded-lg text-sm"
							/>
						</div>
					</div>

					{/* Diagnostic Steps & Repair Guide */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<textarea
							placeholder="Diagnostic Steps (optional)"
							rows={5}
							value={formData.diagnosticSteps}
							onChange={(e) =>
								setFormData({ ...formData, diagnosticSteps: e.target.value })
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						/>
						<textarea
							placeholder="Repair Guide (optional)"
							rows={5}
							value={formData.repairGuide}
							onChange={(e) =>
								setFormData({ ...formData, repairGuide: e.target.value })
							}
							className="w-full px-4 py-3 border border-[#808080] rounded-lg"
						/>
					</div>

					{/* Submit */}
					<div className="flex justify-end pt-6">
						<button
							onClick={handleSubmit}
							disabled={isLoading || systemsLoading}
							className="px-10 py-3 bg-[#9AE144] text-black font-medium rounded-lg disabled:opacity-50"
						>
							{isLoading ? "Adding..." : "Add DTC"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
