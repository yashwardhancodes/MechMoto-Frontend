"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import serviceImg from "@/public/assets/service.png";
import helplineImg from "@/public/assets/helpline.png";
import customerServiceImg from "@/public/assets/customerService.png";
import { useHasModule } from "@/hooks/useSubscription";
import { useCreateLiveCallRequestMutation } from "@/lib/redux/api/liveCallApi";
import { useCreateServiceRequestMutation } from "@/lib/redux/api/serviceRequestApi";
import { toast } from "react-hot-toast";
import LiveCallRequests from "@/components/Service/LiveCallRequestTable";
import ServiceRequestTable from "@/components/Service/ServiceRequestTable";

interface Issue {
	id: number;
	title: string;
	description: string;
	status: string;
	createdAt: string;
}

export default function Service() {
	const [activeTab, setActiveTab] = useState("requests");
	const [showExpertForm, setShowExpertForm] = useState(false);
	const [showCallForm, setShowCallForm] = useState(false);
	const [selectedProblem, setSelectedProblem] = useState("");
	const [customProblem, setCustomProblem] = useState("");
	const [selectedCallProblem, setSelectedCallProblem] = useState("");
	const [customCallProblem, setCustomCallProblem] = useState("");
	const [issues, setIssues] = useState<Issue[]>([]);
	const [selectedIssueId, setSelectedIssueId] = useState<number | null>(null);
	const [carMake, setCarMake] = useState("");
	const [carModel, setCarModel] = useState("");
	const [carYear, setCarYear] = useState("");
	const [regNumber, setRegNumber] = useState("");
	const [userLat, setUserLat] = useState<number | null>(null);
	const [userLng, setUserLng] = useState<number | null>(null);
	const [locationError, setLocationError] = useState("");

	const [createLiveCallRequest] = useCreateLiveCallRequestMutation();
	const [createServiceRequest] = useCreateServiceRequestMutation();

	const commonProblems = [
		"Engine won't start",
		"Flat tire",
		"Battery issue",
		"Brake problem",
		"Overheating",
	];

	const statusSteps = ["submitted", "in_progress", "assigned", "resolved"];

	const hasExpertHelp = useHasModule("expert_help");
	const hasLiveCall = useHasModule("service_request");

	// Get user location
	useEffect(() => {
		if (showExpertForm && !userLat) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserLat(position.coords.latitude);
					setUserLng(position.coords.longitude);
					setLocationError("");
				},
				(error) => {
					setLocationError(
						"Unable to get your location. Please enter manually or try again.",
					);
					console.log("Error: ", error);
					toast.error("Location access denied. Please enable location services.");
				},
				{ enableHighAccuracy: true },
			);
		}
	}, [showExpertForm, userLat]);

	const handleExpertHelp = () => {
		if (!hasExpertHelp) return toast.error("This feature is not in your plan");
		setShowExpertForm((prev) => !prev);
		setShowCallForm(false);
	};

	const handleLiveCall = () => {
		if (!hasLiveCall) return toast.error("This feature is not in your plan");
		setShowCallForm((prev) => !prev);
		setShowExpertForm(false);
	};

	const handleExpertSubmit = async () => {
		if (!selectedProblem) return toast.error("Please select a problem");
		if (selectedProblem === "Other" && !customProblem.trim())
			return toast.error("Please describe your other issue");
		if (!carMake || !carModel || !carYear || !regNumber)
			return toast.error("Please fill all vehicle details");
		if (!userLat || !userLng) return toast.error("Location is required");

		const issueDescription =
			selectedProblem === "Other" ? customProblem.trim() : selectedProblem;
		try {
			await createServiceRequest({
				issue_description: issueDescription,
				car_make: carMake,
				car_model: carModel,
				car_year: carYear,
				reg_number: regNumber,
				latitude: userLat,
				longitude: userLng,
			}).unwrap();
			toast.success("Service request sent! Nearest centers notified.");
			setSelectedProblem("");
			setCustomProblem("");
			setCarMake("");
			setCarModel("");
			setCarYear("");
			setRegNumber("");
			setShowExpertForm(false);
		} catch (error: any) {
			toast.error(error?.data?.message || "Failed to submit service request.");
		}
	};

	const handleCallSubmit = async () => {
		if (!selectedCallProblem) return toast.error("Please select a problem");
		if (selectedCallProblem === "Other" && !customCallProblem.trim())
			return toast.error("Please describe your other issue");
		const issueDescription =
			selectedCallProblem === "Other" ? customCallProblem.trim() : selectedCallProblem;
		try {
			await createLiveCallRequest({ issue_description: issueDescription }).unwrap();
			toast.success("Our team will call you shortly!");
			setSelectedCallProblem("");
			setCustomCallProblem("");
			setShowCallForm(false);
		} catch (error: any) {
			toast.error(
				error?.data?.message || "Failed to submit live call request. Please try again.",
			);
		}
	};

	const updateStatus = (issueId: number) => {
		setIssues((prev) =>
			prev.map((issue) => {
				if (issue.id === issueId) {
					const currentIndex = statusSteps.indexOf(issue.status);
					const nextStatus =
						currentIndex < statusSteps.length - 1
							? statusSteps[currentIndex + 1]
							: issue.status;
					setSelectedIssueId(issueId);
					return { ...issue, status: nextStatus };
				}
				return issue;
			}),
		);
	};

	const selectedIssue = selectedIssueId ? issues.find((i) => i.id === selectedIssueId) : null;
	const currentStatus = selectedIssue?.status || null;

	const renderTabContent = () => {
		switch (activeTab) {
			case "requests":
				return (
					<>
						{/* Banner - Responsive */}
						<div className="relative rounded-2xl overflow-hidden mb-6 sm:mb-8 lg:mb-10">
							<div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px]">
								<Image
									src={serviceImg}
									alt="service Image"
									fill
									className="object-cover"
									priority
								/>
								<div className="absolute inset-0 bg-black/20" />
								<div className="absolute top-4 left-4 sm:top-8 sm:left-8 lg:top-12 lg:left-16 max-w-[85%] sm:max-w-[70%] lg:max-w-2xl">
									<h2 className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight">
										Thanks for{" "}
										<span className="text-[#9AE144]">subscribing!</span>{" "}
										We&apos;re here to support you. What do{" "}
										<span className="text-[#9AE144]">you need help with?</span>
									</h2>
								</div>
								<button className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 bg-[#9AE144] text-black text-xs sm:text-sm md:text-base font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-green-500 transition-colors">
									Subscribed
								</button>
							</div>
						</div>

						{/* Cards - Responsive Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
							{/* Expert Help */}
							{hasExpertHelp && (
								<div
									onClick={handleExpertHelp}
									className="cursor-pointer p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black hover:shadow-lg transition-shadow"
								>
									<div className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 bg-white h-full">
										<div className="flex-shrink-0">
											<Image
												src={helplineImg}
												alt="helpline"
												width={60}
												height={60}
												className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20"
											/>
										</div>
										<div>
											<h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1">
												Need Expert help?
											</h3>
											<p className="text-xs sm:text-sm text-gray-600">
												Get a certified mechanic to your location.
											</p>
										</div>
									</div>
								</div>
							)}

							{/* Live Call Support */}
							{hasLiveCall && (
								<div
									onClick={handleLiveCall}
									className="cursor-pointer p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black hover:shadow-lg transition-shadow"
								>
									<div className="flex items-center gap-3 sm:gap-4 rounded-2xl px-4 sm:px-6 py-4 sm:py-5 bg-white h-full">
										<div className="flex-shrink-0">
											<Image
												src={customerServiceImg}
												alt="customer service"
												width={60}
												height={60}
												className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
											/>
										</div>
										<div>
											<h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-1">
												Live Call Support
											</h3>
											<p className="text-xs sm:text-sm text-gray-600">
												Talk to a car expert in real-time for quick fixes
											</p>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Expert Help Form */}
						{showExpertForm && hasExpertHelp && (
							<div className="mt-6 sm:mt-8 bg-white border rounded-xl shadow-lg p-4 sm:p-6 max-w-md">
								<h3 className="text-base sm:text-lg font-bold mb-4">
									Request Expert Help
								</h3>
								<div className="space-y-3 mb-4">
									{commonProblems.map((problem) => (
										<label
											key={problem}
											className="flex items-center cursor-pointer"
										>
											<input
												type="radio"
												value={problem}
												checked={selectedProblem === problem}
												onChange={(e) => {
													setSelectedProblem(e.target.value);
													setCustomProblem("");
												}}
												className="mr-2 h-4 w-4 text-[#9AE144] focus:ring-[#9AE144] border-gray-300"
											/>
											<span className="text-sm text-gray-700">{problem}</span>
										</label>
									))}
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											value="Other"
											checked={selectedProblem === "Other"}
											onChange={(e) => {
												setSelectedProblem(e.target.value);
											}}
											className="mr-2 h-4 w-4 text-[#9AE144] focus:ring-[#9AE144] border-gray-300"
										/>
										<span className="text-sm text-gray-700">Other</span>
									</label>
								</div>
								{selectedProblem === "Other" && (
									<div className="mb-4">
										<textarea
											value={customProblem}
											onChange={(e) => setCustomProblem(e.target.value)}
											placeholder="Please describe your issue..."
											className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent resize-none"
											rows={3}
										/>
									</div>
								)}
								{/* Vehicle Details */}
								<div className="space-y-3 mt-4">
									<h4 className="text-sm font-semibold text-gray-900">
										Vehicle Details
									</h4>
									<input
										type="text"
										value={carMake}
										onChange={(e) => setCarMake(e.target.value)}
										placeholder="Car Make (e.g., Toyota)"
										className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent"
									/>
									<input
										type="text"
										value={carModel}
										onChange={(e) => setCarModel(e.target.value)}
										placeholder="Car Model (e.g., Camry)"
										className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent"
									/>
									<input
										type="text"
										value={carYear}
										onChange={(e) => setCarYear(e.target.value)}
										placeholder="Car Year (e.g., 2020)"
										className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent"
									/>
									<input
										type="text"
										value={regNumber}
										onChange={(e) => setRegNumber(e.target.value)}
										placeholder="Registration Number"
										className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent"
									/>
								</div>
								{locationError && (
									<p className="text-red-500 text-sm mt-2">{locationError}</p>
								)}
								<button
									onClick={handleExpertSubmit}
									className="w-full sm:w-auto bg-[#9AE144] text-black px-6 py-2 sm:py-3 rounded-full hover:bg-green-500 font-semibold transition-colors text-sm sm:text-base mt-4"
								>
									Submit Request
								</button>
							</div>
						)}

						{/* Live Call Support Form */}
						{showCallForm && hasLiveCall && (
							<div className="mt-6 sm:mt-8 bg-white border rounded-xl shadow-lg p-4 sm:p-6 max-w-md">
								<h3 className="text-base sm:text-lg font-bold mb-4">
									Request a Live Call
								</h3>
								<div className="space-y-3 mb-4">
									{commonProblems.map((problem) => (
										<label
											key={problem}
											className="flex items-center cursor-pointer"
										>
											<input
												type="radio"
												value={problem}
												checked={selectedCallProblem === problem}
												onChange={(e) => {
													setSelectedCallProblem(e.target.value);
													setCustomCallProblem("");
												}}
												className="mr-2 h-4 w-4 text-[#9AE144] focus:ring-[#9AE144] border-gray-300"
											/>
											<span className="text-sm text-gray-700">{problem}</span>
										</label>
									))}
									<label className="flex items-center cursor-pointer">
										<input
											type="radio"
											value="Other"
											checked={selectedCallProblem === "Other"}
											onChange={(e) => {
												setSelectedCallProblem(e.target.value);
											}}
											className="mr-2 h-4 w-4 text-[#9AE144] focus:ring-[#9AE144] border-gray-300"
										/>
										<span className="text-sm text-gray-700">Other</span>
									</label>
								</div>
								{selectedCallProblem === "Other" && (
									<div className="mb-4">
										<textarea
											value={customCallProblem}
											onChange={(e) => setCustomCallProblem(e.target.value)}
											placeholder="Please describe your issue..."
											className="w-full border border-gray-300 p-2 sm:p-3 rounded-md text-sm sm:text-base focus:ring-2 focus:ring-[#9AE144] focus:border-transparent resize-none"
											rows={3}
										/>
									</div>
								)}
								<button
									onClick={handleCallSubmit}
									className="w-full sm:w-auto bg-[#9AE144] text-black px-6 py-2 sm:py-3 rounded-full hover:bg-green-500 font-semibold transition-colors text-sm sm:text-base"
								>
									Request Call
								</button>
							</div>
						)}
					</>
				);
			case "expert_history":
				return (
					<div className="bg-white border rounded-xl shadow-lg p-4 sm:p-6">
						<h3 className="text-base sm:text-lg font-bold mb-4 sm:mb-6">
							Expert Help History
						</h3>
						{issues.length === 0 ? (
							<p className="text-sm text-gray-500 p-4 text-center">
								No expert requests found.
							</p>
						) : (
							<>
								{/* Status Tracker */}
								{selectedIssue && (
									<div className="mb-6 bg-blue-50 p-4 sm:p-6 rounded-lg">
										<h4 className="text-sm sm:text-base font-semibold mb-4">
											Tracking: {selectedIssue.title}
										</h4>
										<div className="flex flex-wrap justify-between items-start gap-4 sm:gap-2">
											{statusSteps.map((step, index) => (
												<div
													key={index}
													className="flex flex-col items-center flex-1 min-w-[60px]"
												>
													<div
														className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-sm sm:text-base ${
															currentStatus === step
																? "bg-[#9AE144] text-black"
																: statusSteps.indexOf(
																		currentStatus,
																  ) > index
																? "bg-green-200 text-green-800"
																: "bg-gray-200 text-gray-600"
														}`}
													>
														{index + 1}
													</div>
													<p className="text-xs sm:text-sm mt-2 text-center capitalize">
														{step.replace("_", " ")}
													</p>
													{index < statusSteps.length - 1 && (
														<div
															className={`hidden sm:block h-1 w-full mt-4 ${
																statusSteps.indexOf(currentStatus) >
																index
																	? "bg-[#9AE144]"
																	: "bg-gray-200"
															}`}
														></div>
													)}
												</div>
											))}
										</div>
										<button
											onClick={() => updateStatus(selectedIssue.id)}
											className="mt-6 w-full sm:w-auto bg-[#9AE144] text-black px-6 py-2 sm:py-3 rounded-full hover:bg-green-500 font-semibold transition-colors text-sm sm:text-base"
											disabled={currentStatus === "resolved"}
										>
											{currentStatus === "resolved"
												? "Completed"
												: "Update Status (Demo)"}
										</button>
									</div>
								)}
								{/* Issue History Table */}
								<div className="overflow-x-auto -mx-4 sm:mx-0">
									<div className="inline-block min-w-full align-middle">
										<table className="min-w-full border-collapse">
											<thead>
												<tr className="bg-gray-100 text-gray-700 text-xs sm:text-sm">
													<th className="p-2 sm:p-3 text-left font-semibold">
														Issue
													</th>
													<th className="p-2 sm:p-3 text-left font-semibold hidden md:table-cell">
														Description
													</th>
													<th className="p-2 sm:p-3 text-left font-semibold hidden lg:table-cell">
														Created
													</th>
													<th className="p-2 sm:p-3 text-left font-semibold">
														Status
													</th>
													<th className="p-2 sm:p-3 text-left font-semibold">
														Actions
													</th>
												</tr>
											</thead>
											<tbody>
												{issues.map((issue, index) => (
													<tr
														key={issue.id}
														className={`text-xs sm:text-sm ${
															index % 2 === 0
																? "bg-white"
																: "bg-gray-50"
														} hover:bg-gray-100 transition`}
													>
														<td className="p-2 sm:p-3 font-medium text-gray-900">
															{issue.title}
														</td>
														<td className="p-2 sm:p-3 text-gray-700 hidden md:table-cell">
															{issue.description}
														</td>
														<td className="p-2 sm:p-3 text-gray-500 hidden lg:table-cell whitespace-nowrap">
															{issue.createdAt}
														</td>
														<td className="p-2 sm:p-3">
															<span
																className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
																	issue.status === "resolved"
																		? "bg-green-100 text-green-700"
																		: issue.status ===
																				"in_progress" ||
																		  issue.status ===
																				"assigned"
																		? "bg-yellow-100 text-yellow-700"
																		: "bg-gray-200 text-gray-700"
																}`}
															>
																{issue.status.replace("_", " ")}
															</span>
														</td>
														<td className="p-2 sm:p-3">
															<button
																onClick={() =>
																	setSelectedIssueId(issue.id)
																}
																className="text-blue-600 hover:underline text-xs sm:text-sm font-medium"
															>
																Track
															</button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</>
						)}
					</div>
				);
			case "service_history":
				return <ServiceRequestTable />;
			case "live_history":
				return <LiveCallRequests />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-24">
			<div className="max-w-7xl mx-auto">
				{/* Tabs */}
				<div className="mb-6 sm:mb-8">
					<div className="flex border-b border-gray-200 overflow-x-auto">
						<button
							onClick={() => setActiveTab("requests")}
							className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
								activeTab === "requests"
									? "border-b-2 border-[#9AE144] text-[#9AE144]"
									: "text-gray-500 hover:text-gray-700"
							}`}
						>
							Requests
						</button>
						{hasExpertHelp && (
							<button
								onClick={() => setActiveTab("service_history")}
								className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
									activeTab === "service_history"
										? "border-b-2 border-[#9AE144] text-[#9AE144]"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Service History
							</button>
						)}
						{hasLiveCall && (
							<button
								onClick={() => setActiveTab("live_history")}
								className={`py-3 px-4 sm:px-6 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
									activeTab === "live_history"
										? "border-b-2 border-[#9AE144] text-[#9AE144]"
										: "text-gray-500 hover:text-gray-700"
								}`}
							>
								Live Call History
							</button>
						)}
					</div>
				</div>

				{/* Tab Content */}
				{renderTabContent()}
			</div>
		</div>
	);
}
