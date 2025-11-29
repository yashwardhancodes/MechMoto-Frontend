"use client";

import React, { useState, useEffect } from "react";
import { Search, AlertCircle, Wrench, Car, Loader2 } from "lucide-react";
import { useSearchDtcQuery } from "@/lib/redux/api/dtcApi";
import { useRouter } from "next/navigation";

export default function DtcSearchPage() {
	const [code, setCode] = useState("");
	const [inputValue, setInputValue] = useState("");
	const router = useRouter();

	// Auto-trigger search when code is valid (5 chars: P0301, etc.)
	const {
		data: dtcData,
		isFetching,
		isError
	} = useSearchDtcQuery(code, {
		skip: code.length !== 5,
	});

    const dtc = dtcData?.data;

	// Debounce + auto-search
	useEffect(() => {
		const trimmed = inputValue.trim().toUpperCase();
		if (/^[PBCU]\d{4}$/.test(trimmed)) {
			setCode(trimmed);
		} else {
			setCode(""); // invalid → no query
		}
	}, [inputValue]);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = inputValue.trim().toUpperCase();
		if (/^[PBCU]\d{4}$/.test(trimmed)) {
			setCode(trimmed);
			router.push(`?code=${trimmed}`);
		}
	};

	// Read from URL on mount
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlCode = params.get("code")?.toUpperCase();
		if (urlCode && /^[PBCU]\d{4}$/.test(urlCode)) {
			setInputValue(urlCode);
			setCode(urlCode);
		}
	}, []);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
			{/* Hero Search */}
			<div className="pt-20 pb-32 px-4">
				<div className="max-w-4xl mx-auto text-center">
					<h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#9AE144] to-green-400">
						DTC Code Lookup
					</h1>
					<p className="text-xl text-gray-300 mb-10">
						Enter your Diagnostic Trouble Code (e.g. P0301, C1241, B1350)
					</p>

					<form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
						<input
							type="text"
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Enter DTC Code (e.g. P0420)"
							className="w-full px-6 py-5 text-2xl rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#9AE144] transition-all"
							autoFocus
						/>
						<button
							type="submit"
							className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#9AE144] text-black p-4 rounded-full hover:bg-green-400 transition-all"
						>
							<Search className="w-7 h-7" />
						</button>
					</form>

					{inputValue && !/^([PBCU]\d{4})$/.test(inputValue.toUpperCase()) && (
						<p className="mt-4 text-red-400 text-sm">
							Invalid format. Use: Pxxxx, Cxxxx, Bxxxx, Uxxxx
						</p>
					)}
				</div>
			</div>

			{/* Results */}
			<div className="relative -mt-20 pb-20">
				<div className="max-w-5xl mx-auto px-4">
					{isFetching && (
						<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-16 text-center">
							<Loader2 className="w-16 h-16 animate-spin mx-auto text-[#9AE144]" />
							<p className="mt-4 text-xl">Searching for {code}...</p>
						</div>
					)}

					{isError && !isFetching && (
						<div className="bg-red-500/20 backdrop-blur-lg border border-red-500/50 rounded-2xl p-12 text-center">
							<AlertCircle className="w-20 h-20 mx-auto text-red-400" />
							<h2 className="text-3xl font-bold mt-6">{code}</h2>
							<p className="text-xl mt-4">DTC Code Not Found</p>
							<p className="text-gray-300 mt-2">
								This code may not be in our database yet. Try another or contact
								support.
							</p>
						</div>
					)}

					{dtc && !isFetching && !isError && (
						<div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
							{/* Header */}
							<div className="bg-gradient-to-r from-red-600 to-orange-700 text-white p-10">
								<div className="flex items-center gap-6">
									<AlertCircle className="w-16 h-16" />
									<div>
										<h1 className="text-5xl font-bold">{dtc.code}</h1>
										<p className="text-2xl mt-2 opacity-95">{dtc.title}</p>
									</div>
								</div>
								<div className="flex gap-4 mt-6 flex-wrap">
									<span className="bg-white/20 px-5 py-3 rounded-full text-lg">
										{dtc.system.code} - {dtc.system.name}
									</span>
									<span
										className={`px-6 py-3 rounded-full text-lg font-semibold ${
											dtc.severity === "critical"
												? "bg-red-700"
												: dtc.severity === "high"
												? "bg-orange-600"
												: dtc.severity === "moderate"
												? "bg-yellow-600"
												: "bg-green-600"
										}`}
									>
										{dtc.severity.toUpperCase()} SEVERITY
									</span>
								</div>
							</div>

							<div className="p-10 space-y-10 text-gray-800">
								{/* Description */}
								<section>
									<h2 className="text-3xl font-bold mb-4 text-gray-900">
										Description
									</h2>
									<p className="text-lg leading-relaxed">{dtc.description}</p>
								</section>

								<div className="grid md:grid-cols-2 gap-10">
									{/* Common Symptoms */}
									<section>
										<h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
											<Car className="w-7 h-7 text-blue-600" />
											Common Symptoms
										</h3>
										<ul className="space-y-3">
											{dtc.common_symptoms.map(
												(symptom: string, i: number) => (
													<li key={i} className="flex items-start gap-3">
														<span className="text-blue-600 mt-1">
															•
														</span>
														<span className="text-lg">{symptom}</span>
													</li>
												),
											)}
										</ul>
									</section>

									{/* Possible Causes */}
									<section>
										<h3 className="text-2xl font-bold mb-4">Possible Causes</h3>
										<ul className="space-y-3">
											{dtc.possible_causes.map((cause: string, i: number) => (
												<li key={i} className="flex items-start gap-3">
													<span className="text-red-600 mt-1">→</span>
													<span className="text-lg">{cause}</span>
												</li>
											))}
										</ul>
									</section>
								</div>

								{/* Affected Components */}
								{dtc.affected_components.length > 0 && (
									<section>
										<h3 className="text-2xl font-bold mb-4">
											Affected Components
										</h3>
										<div className="flex flex-wrap gap-3">
											{dtc.affected_components.map(
												(comp: string, i: number) => (
													<span
														key={i}
														className="bg-gray-100 text-gray-700 px-5 py-3 rounded-full text-lg font-medium"
													>
														{comp}
													</span>
												),
											)}
										</div>
									</section>
								)}

								{/* Diagnostic Steps */}
								{dtc.diagnostic_steps && (
									<section className="bg-blue-50 p-8 rounded-2xl">
										<h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
											<Wrench className="w-7 h-7 text-blue-700" />
											Diagnostic Steps
										</h3>
										<div className="prose prose-lg max-w-none whitespace-pre-line text-gray-700">
											{dtc.diagnostic_steps}
										</div>
									</section>
								)}

								{/* Repair Guide */}
								{dtc.repair_guide && (
									<section className="bg-green-50 p-8 rounded-2xl">
										<h3 className="text-2xl font-bold mb-4 text-green-800">
											Repair Guide
										</h3>
										<div className="prose prose-lg max-w-none whitespace-pre-line text-gray-700">
											{dtc.repair_guide}
										</div>
									</section>
								)}

								{/* Footer */}
								<div className="text-center pt-8 border-t border-gray-200">
									<p className="text-gray-500">
										Found an error or missing code?{" "}
										<a
											href="/contact"
											className="text-[#9AE144] font-semibold hover:underline"
										>
											Let us know
										</a>
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
