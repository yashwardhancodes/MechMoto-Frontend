"use client";

import { useGetDtcByIdQuery } from "@/lib/redux/api/dtcApi";
import { useParams } from "next/navigation";
import { AlertCircle, Wrench, Car } from "lucide-react";

export default function ViewDtc() {
	const { id } = useParams();
	const { data, isLoading, isError } = useGetDtcByIdQuery(id as string);

	if (isLoading) return <div className="p-10 text-center">Loading...</div>;
	if (isError || !data) return <div className="p-10 text-red-500">DTC not found</div>;

	const dtc = data?.data;

	return (
		<div className="min-h-screen bg-gray-50 py-10 px-4">
			<div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-8">
					<div className="flex items-center gap-4">
						<AlertCircle className="w-12 h-12" />
						<div>
							<h1 className="text-4xl font-bold">
								{dtc.code}
							</h1>
							<p className="text-xl opacity-90">{dtc.title}</p>
						</div>
					</div>
					<div className="mt-4 flex gap-4">
						<span className="bg-white/20 px-4 py-2 rounded-full text-sm">
							{dtc.system.code} - {dtc.system.name}
						</span>
						<span
							className={`px-4 py-2 rounded-full text-sm font-medium ${
								dtc.severity === "critical"
									? "bg-red-600"
									: dtc.severity === "high"
									? "bg-orange-500"
									: dtc.severity === "moderate"
									? "bg-yellow-500"
									: "bg-green-500"
							}`}
						>
							{dtc.severity.toUpperCase()} SEVERITY
						</span>
					</div>
				</div>

				<div className="p-8 space-y-8">
					<section>
						<h2 className="text-2xl font-semibold mb-4">Description</h2>
						<p className="text-gray-700 leading-relaxed">{dtc.description}</p>
					</section>

					<div className="grid md:grid-cols-2 gap-8">
						<section>
							<h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
								<Car className="w-5 h-5" /> Common Symptoms
							</h3>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								{dtc.common_symptoms.map((s: string, i: number) => (
									<li key={i}>{s}</li>
								))}
							</ul>
						</section>

						<section>
							<h3 className="text-xl font-semibold mb-3">Possible Causes</h3>
							<ul className="list-disc list-inside space-y-2 text-gray-700">
								{dtc.possible_causes.map((c: string, i: number) => (
									<li key={i}>{c}</li>
								))}
							</ul>
						</section>
					</div>

					{dtc.affected_components.length > 0 && (
						<section>
							<h3 className="text-xl font-semibold mb-3">Affected Components</h3>
							<div className="flex flex-wrap gap-3">
								{dtc.affected_components.map((c: string, i: number) => (
									<span
										key={i}
										className="bg-gray-100 px-4 py-2 rounded-full text-sm"
									>
										{c}
									</span>
								))}
							</div>
						</section>
					)}

					{dtc.diagnostic_steps && (
						<section>
							<h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
								<Wrench className="w-5 h-5" /> Diagnostic Steps
							</h3>
							<div className="bg-gray-50 p-6 rounded-lg whitespace-pre-line text-gray-700">
								{dtc.diagnostic_steps}
							</div>
						</section>
					)}

					{dtc.repair_guide && (
						<section>
							<h3 className="text-xl font-semibold mb-3">Repair Guide</h3>
							<div className="bg-blue-50 p-6 rounded-lg whitespace-pre-line text-gray-700">
								{dtc.repair_guide}
							</div>
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
