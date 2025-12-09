"use client";

import React, { useState, useEffect } from "react";
import {
	Search,
	AlertCircle,
	Wrench,
	Car,
	Loader2,
	CheckCircle,
	AlertTriangle,
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

import {
	useSearchDtcQuery,
	useGetDtcSystemsQuery,
	useGetAllDtcsQuery,
} from "@/lib/redux/api/dtcApi";
import { useRouter } from "next/navigation";

export default function DtcSearchPage() {
	const [code, setCode] = useState("");
	const [inputValue, setInputValue] = useState("");
	const [selectedSystem, setSelectedSystem] = useState(null);
	const [currentPage, setCurrentPage] = useState(1);
	const router = useRouter();

	const {
		data: dtcData,
		isFetching: isFetchingDtc,
		isError,
	} = useSearchDtcQuery(code, {
		skip: code.length !== 5,
	});

	const { data: systemsResp, isFetching: isFetchingSystems } = useGetDtcSystemsQuery();

	const systems = systemsResp?.data;

	const { data: dtcListResp, isFetching: isFetchingList } = useGetAllDtcsQuery(
		{ system: selectedSystem?.code, page: currentPage, limit: 20 },
		{ skip: !selectedSystem },
	);

	const dtcList = dtcListResp?.data;

	const dtc = dtcData?.data;

	useEffect(() => {
		const trimmed = inputValue.trim().toUpperCase();
		if (/^[PBCU]\d{4}$/.test(trimmed)) {
			setCode(trimmed);
		} else {
			setCode("");
		}
	}, [inputValue]);

	const handleSearch = () => {
		const trimmed = inputValue.trim().toUpperCase();
		if (/^[PBCU]\d{4}$/.test(trimmed)) {
			setCode(trimmed);
			setSelectedSystem(null);
			setCurrentPage(1);
			router.push(`?code=${trimmed}`);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	// Read from URL on mount
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlCode = params.get("code")?.toUpperCase();
		if (urlCode && /^[PBCUX]\d{4}$/.test(urlCode)) {
			setInputValue(urlCode);
			setCode(urlCode);
			setSelectedSystem(null);
		}
	}, []);

	const getSeverityConfig = (severity) => {
		const configs = {
			critical: {
				bg: "bg-red-50",
				border: "border-red-200",
				text: "text-red-700",
				badge: "bg-red-100 text-red-800",
			},
			high: {
				bg: "bg-orange-50",
				border: "border-orange-200",
				text: "text-orange-700",
				badge: "bg-orange-100 text-orange-800",
			},
			moderate: {
				bg: "bg-yellow-50",
				border: "border-yellow-200",
				text: "text-yellow-700",
				badge: "bg-yellow-100 text-yellow-800",
			},
			low: {
				bg: "bg-green-50",
				border: "border-green-200",
				text: "text-green-700",
				badge: "bg-green-100 text-green-800",
			},
		};
		return configs[severity] || configs.moderate;
	};

	const getSystemColor = (systemCode) => {
		const colors = {
			P: "bg-blue-500",
			C: "bg-purple-500",
			B: "bg-orange-500",
			U: "bg-green-500",
		};
		return colors[systemCode] || "bg-gray-500";
	};

	const handleSystemClick = (system) => {
		setSelectedSystem(system);
		setCurrentPage(1);
		setInputValue("");
		setCode("");
		router.push("");
	};

	const handleCodeClick = (dtcCode) => {
		setInputValue(dtcCode);
		handleSearch();
	};

	const handleBackToSystems = () => {
		setSelectedSystem(null);
		setCurrentPage(1);
	};

	const totalPages = dtcList ? Math.ceil(dtcList.total / 20) : 0;

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-6 py-6">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
							<Car className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-semibold text-gray-900">
								DTC Diagnostic Center
							</h1>
							<p className="text-sm text-gray-500">
								Professional trouble code analysis
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Search Section */}
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-4xl mx-auto px-6 py-12">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900 mb-3">
							Diagnostic Trouble Code Lookup
						</h2>
						<p className="text-gray-600 text-lg">
							Enter your OBD-II code to get detailed diagnostic information
						</p>
					</div>

					<div className="max-w-2xl mx-auto">
						<div className="relative">
							<input
								type="text"
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Enter code (e.g., P0420, C1241, B1350)"
								className="w-full px-6 py-4 pr-16 text-lg rounded-xl border-2 border-gray-300 focus:border-emerald-500 focus:outline-none transition-colors bg-white text-gray-900 placeholder-gray-400"
								autoFocus
							/>
							<button
								onClick={handleSearch}
								className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-500 text-white p-3 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								disabled={!inputValue.trim()}
							>
								<Search className="w-5 h-5" />
							</button>
						</div>

						{inputValue && !/^([PBCU]\d{4})$/.test(inputValue.toUpperCase()) && (
							<div className="mt-3 flex items-start gap-2 text-sm text-amber-700 bg-amber-50 px-4 py-3 rounded-lg border border-amber-200">
								<AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
								<span>
									Invalid format. Please use: P####, C####, B####, or U#### (e.g.,
									P0420)
								</span>
							</div>
						)}
					</div>

					<div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500 flex-wrap">
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-blue-500 rounded-full"></span>
							<span>P - Powertrain</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-purple-500 rounded-full"></span>
							<span>C - Chassis</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-orange-500 rounded-full"></span>
							<span>B - Body</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="w-2 h-2 bg-green-500 rounded-full"></span>
							<span>U - Network</span>
						</div>
					</div>
				</div>
			</div>

			{/* Results Section */}
			<div className="max-w-7xl mx-auto px-6 py-12">
				{(isFetchingDtc || isFetchingList || isFetchingSystems) && (
					<div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
						<Loader2 className="w-12 h-12 animate-spin mx-auto text-emerald-500 mb-4" />
						<p className="text-lg text-gray-600">Loading...</p>
					</div>
				)}

				{code && isError && !isFetchingDtc && (
					<div className="bg-white rounded-xl border border-red-200 p-12 text-center">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<AlertCircle className="w-8 h-8 text-red-600" />
						</div>
						<h3 className="text-2xl font-semibold text-gray-900 mb-2">
							Code Not Found
						</h3>
						<p className="text-gray-600 mb-1">
							The code <span className="font-mono font-semibold">{code}</span> is not
							in our database
						</p>
						<p className="text-sm text-gray-500">
							Try P0420 as an example or verify your code format
						</p>
					</div>
				)}

				{dtc && !isFetchingDtc && !isError && (
					<div className="space-y-6">
						{/* Back Button */}
						<button
							onClick={() => {
								setCode("");
								setInputValue("");
								router.push("");
							}}
							className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
						>
							<ArrowLeft className="w-5 h-5" />
							Back to Search
						</button>

						{/* Code Header Card */}
						<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
							<div className="p-8">
								<div className="flex items-start justify-between mb-6">
									<div className="flex-1">
										<div className="flex items-center gap-4 mb-3">
											<span className="text-4xl font-bold font-mono text-gray-900">
												{dtc.code}
											</span>
											<span
												className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
													getSeverityConfig(dtc.severity).badge
												}`}
											>
												{dtc.severity}
											</span>
										</div>
										<h2 className="text-2xl font-semibold text-gray-900 mb-3">
											{dtc.title}
										</h2>
										<div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700">
											<span className="font-semibold">{dtc.system.code}</span>
											<span className="text-gray-400">•</span>
											<span>{dtc.system.name}</span>
										</div>
									</div>
								</div>

								<div className="prose prose-gray max-w-none">
									<p className="text-gray-700 leading-relaxed">
										{dtc.description}
									</p>
								</div>
							</div>
						</div>

						{/* Two Column Layout */}
						<div className="grid lg:grid-cols-2 gap-6">
							{/* Symptoms */}
							<div className="bg-white rounded-xl border border-gray-200 p-8">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
										<Car className="w-5 h-5 text-blue-600" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900">
										Common Symptoms
									</h3>
								</div>
								<ul className="space-y-3">
									{dtc.common_symptoms.map((symptom, i) => (
										<li
											key={i}
											className="flex items-start gap-3 text-gray-700"
										>
											<CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
											<span>{symptom}</span>
										</li>
									))}
								</ul>
							</div>

							{/* Possible Causes */}
							<div className="bg-white rounded-xl border border-gray-200 p-8">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
										<AlertCircle className="w-5 h-5 text-amber-600" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900">
										Possible Causes
									</h3>
								</div>
								<ul className="space-y-3">
									{dtc.possible_causes.map((cause, i) => (
										<li
											key={i}
											className="flex items-start gap-3 text-gray-700"
										>
											<span className="w-5 h-5 flex items-center justify-center text-amber-600 font-bold flex-shrink-0">
												→
											</span>
											<span>{cause}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Affected Components */}
						{dtc.affected_components.length > 0 && (
							<div className="bg-white rounded-xl border border-gray-200 p-8">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">
									Affected Components
								</h3>
								<div className="flex flex-wrap gap-2">
									{dtc.affected_components.map((comp, i) => (
										<span
											key={i}
											className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
										>
											{comp}
										</span>
									))}
								</div>
							</div>
						)}

						{/* Diagnostic Steps */}
						{dtc.diagnostic_steps && (
							<div className="bg-white rounded-xl border border-gray-200 p-8">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
										<Wrench className="w-5 h-5 text-purple-600" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900">
										Diagnostic Procedure
									</h3>
								</div>
								<div className="prose prose-gray max-w-none">
									<pre className="whitespace-pre-line font-sans text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg border border-gray-200">
										{dtc.diagnostic_steps}
									</pre>
								</div>
							</div>
						)}

						{/* Repair Guide */}
						{dtc.repair_guide && (
							<div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200 p-8">
								<div className="flex items-center gap-3 mb-6">
									<div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
										<Wrench className="w-5 h-5 text-white" />
									</div>
									<h3 className="text-xl font-semibold text-gray-900">
										Repair Guide
									</h3>
								</div>
								<div className="prose prose-gray max-w-none">
									<pre className="whitespace-pre-line font-sans text-gray-700 leading-relaxed">
										{dtc.repair_guide}
									</pre>
								</div>
							</div>
						)}
					</div>
				)}

				{!code && selectedSystem && dtcList && !isFetchingList && (
					<div className="space-y-6">
						<div className="flex items-center gap-4">
							<button
								onClick={handleBackToSystems}
								className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
							>
								<ArrowLeft className="w-5 h-5" />
								Back to Categories
							</button>
						</div>
						<h2 className="text-3xl font-bold text-gray-900">
							{selectedSystem.name} Codes
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
							{dtcList.dtcs.map((d) => (
								<div
									key={d.code}
									onClick={() => handleCodeClick(d.code)}
									className="cursor-pointer bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-500 hover:shadow-md transition-all"
								>
									<div className="flex items-center gap-3 mb-2">
										<span className="text-2xl font-bold font-mono text-gray-900">
											{d.code}
										</span>
										<span
											className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${
												getSeverityConfig(d.severity).badge
											}`}
										>
											{d.severity}
										</span>
									</div>
									<p className="text-gray-700 line-clamp-2">{d.title}</p>
								</div>
							))}
						</div>
						{totalPages > 1 && (
							<div className="flex items-center justify-center gap-4 mt-8">
								<button
									onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
									disabled={currentPage === 1}
									className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								>
									<ChevronLeft className="w-5 h-5" />
									Prev
								</button>
								<span className="text-gray-600">
									Page {currentPage} of {totalPages}
								</span>
								<button
									onClick={() =>
										setCurrentPage((p) => Math.min(totalPages, p + 1))
									}
									disabled={currentPage === totalPages}
									className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
								>
									Next
									<ChevronRight className="w-5 h-5" />
								</button>
							</div>
						)}
					</div>
				)}

				{!code && !selectedSystem && systems && !isFetchingSystems && (
					<div className="space-y-6">
						<h2 className="text-2xl font-bold text-gray-900 text-center">
							Browse by Category
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
							{systems.map((system) => (
								<div
									key={system.code}
									onClick={() => handleSystemClick(system)}
									className="cursor-pointer bg-white rounded-xl border border-gray-200 hover:border-emerald-500 hover:shadow-md transition-all"
								>
									<div className="p-6">
										<div className="flex items-center gap-3 mb-3">
											<span
												className={`w-3 h-3 rounded-full ${getSystemColor(
													system.code,
												)}`}
											></span>
											<h3 className="text-xl font-semibold text-gray-900">
												{system.name}
											</h3>
										</div>
										<p className="text-gray-600 text-sm">
											{system.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
