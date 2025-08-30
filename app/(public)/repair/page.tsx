"use client";
import { useState } from "react";
import Image from "next/image";
import serviceImg from "@/public/assets/service.png";
import helplineImg from "@/public/assets/helpline.png";
import customerServiceImg from "@/public/assets/customerService.png";

export default function Service() {
  const [showExpertForm, setShowExpertForm] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState("");
  const [callIssue, setCallIssue] = useState("");
  const [issues, setIssues] = useState([]); // Store submitted issues
  const [currentStatus, setCurrentStatus] = useState(null); // Track current issue status

  const commonProblems = [
    "Engine won’t start",
    "Flat tire",
    "Battery issue",
    "Brake problem",
    "Overheating",
    "Other",
  ];

  const statusSteps = [
    "Submitted",
    "In Progress",
    "Technician Assigned",
    "Resolved",
  ];

  const handleExpertHelp = () => {
    setShowExpertForm((prev) => !prev);
    setShowCallForm(false); // Close other form
  };

  const handleLiveCall = () => {
    setShowCallForm((prev) => !prev);
    setShowExpertForm(false); // Close other form
  };

  const handleExpertSubmit = () => {
    if (!selectedProblem) return alert("Please select a problem");
    const newIssue = {
      id: Date.now(),
      title: selectedProblem,
      description: selectedProblem === "Other" ? "Custom issue" : selectedProblem,
      status: "Submitted",
      date: new Date().toLocaleDateString(),
    };
    setIssues([...issues, newIssue]);
    setCurrentStatus("Submitted");
    console.log("Expert help request submitted:", selectedProblem);
    alert("Your request has been sent! Our team will contact you.");
    setSelectedProblem("");
    setShowExpertForm(false);
  };

  const handleCallSubmit = () => {
    if (!callIssue) return alert("Please describe your issue");
    const newIssue = {
      id: Date.now(),
      title: "Live Call Issue",
      description: callIssue,
      status: "Submitted",
      date: new Date().toLocaleDateString(),
    };
    setIssues([...issues, newIssue]);
    setCurrentStatus("Submitted");
    console.log("Live call requested for issue:", callIssue);
    alert("Our team will call you shortly!");
    setCallIssue("");
    setShowCallForm(false);
  };

  // Simulate status progression for demo purposes
  const updateStatus = (issueId) => {
    setIssues((prevIssues) =>
      prevIssues.map((issue) => {
        if (issue.id === issueId) {
          const currentIndex = statusSteps.indexOf(issue.status);
          const nextStatus =
            currentIndex < statusSteps.length - 1
              ? statusSteps[currentIndex + 1]
              : issue.status;
          if (issue.id === issues[issues.length - 1].id) {
            setCurrentStatus(nextStatus);
          }
          return { ...issue, status: nextStatus };
        }
        return issue;
      })
    );
  };

  return (
    <div className="mt-28 pb-20">
      {/* Banner */}
      <div className="relative rounded-2xl flex justify-center overflow-hidden">
        <Image
          src={serviceImg}
          alt="service Image"
          className="w-[90%] md:w-auto md:h-[400px] lg:h-[650px] object-cover"
        />
        <div className="absolute top-5 md:top-10 left-10 md:left-25 lg:left-55">
          <h2 className="text-white text-xl md:text-3xl lg:text-5xl font-bold font-sans leading-snug max-w-[280px] md:max-w-[420px] lg:max-w-3xl">
            Thanks for <span className="text-[#9AE144]">subscribing!</span> We're
            here to support you. What do <br />{" "}
            <span className="text-[#9AE144]">you need help with?</span>
          </h2>
        </div>
        <button className="absolute bottom-5 md:bottom-10 right-10 md:right-20 lg:right-50 bg-[#9AE144] text-black text-xs md:text-base font-bold px-3 md:px-6 py-2 md:py-3 rounded-full hover:bg-green-500 w-fit">
          Subscribed
        </button>
      </div>

      {/* Cards */}
      <div className="mt-10 flex flex-col md:flex-row px-36 justify-between items-start gap-8">
        {/* Expert Help */}
        <div
          onClick={handleExpertHelp}
          className="cursor-pointer p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black w-[90%] md:w-[470px]"
        >
          <div className="flex items-center gap-4 rounded-2xl px-6 py-3 shadow-sm hover:shadow-md transition bg-white">
            <Image src={helplineImg} alt="helpline" width={80} height={80} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Need Expert help?</h3>
              <p className="text-sm text-gray-600">
                Get a certified mechanic to your location.
              </p>
            </div>
          </div>
        </div>

        {/* Live Call Support */}
        <div
          onClick={handleLiveCall}
          className="cursor-pointer p-[1.5px] rounded-2xl bg-gradient-to-l from-[#9AE144] via-green-700 to-black w-[90%] md:w-[470px]"
        >
          <div className="flex items-center gap-4 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition bg-white">
            <Image src={customerServiceImg} alt="helpline" width={60} height={80} />
            <div>
              <h3 className="text-xl font-bold text-gray-900">Live Call Support</h3>
              <p className="text-sm text-gray-600">
                Talk to a car expert in real-time for quick fixes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expert Help Form */}
      {showExpertForm && (
        <div className="mt-8 mx-36 bg-white border rounded-xl shadow-lg p-6 w-[90%] md:w-[470px]">
          <h3 className="text-lg font-bold mb-4">Select your problem</h3>
          <select
            value={selectedProblem}
            onChange={(e) => setSelectedProblem(e.target.value)}
            className="w-full border p-2 rounded-md"
          >
            <option value="">-- Select Problem --</option>
            {commonProblems.map((problem, i) => (
              <option key={i} value={problem}>
                {problem}
              </option>
            ))}
          </select>
          <button
            onClick={handleExpertSubmit}
            className="mt-4 bg-[#9AE144] text-black px-4 py-2 rounded-full hover:bg-green-500"
          >
            Submit Request
          </button>
        </div>
      )}

      {/* Live Call Support Form */}
      {showCallForm && (
        <div className="mt-8 mx-36 bg-white border rounded-xl shadow-lg p-6 w-[90%] md:w-[470px]">
          <h3 className="text-lg font-bold mb-4">Request a Live Call</h3>
          <textarea
            value={callIssue}
            onChange={(e) => setCallIssue(e.target.value)}
            placeholder="Briefly describe your issue..."
            className="w-full border p-2 rounded-md"
            rows={4}
          />
          <button
            onClick={handleCallSubmit}
            className="mt-4 bg-[#9AE144] text-black px-4 py-2 rounded-full hover:bg-green-500"
          >
            Request Call
          </button>
        </div>
      )}

      {/* Status Tracker */}
      {currentStatus && (
        <div className="mt-12 mx-36 bg-white border rounded-xl shadow-lg p-6 w-[90%] md:w-[970px]">
          <h3 className="text-lg font-bold mb-4">Issue Status</h3>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStatus === step
                      ? "bg-[#9AE144] text-black"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                <p className="text-sm mt-2">{step}</p>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`h-1 w-16 md:w-24 mt-2 ${
                      statusSteps.indexOf(currentStatus) > index
                        ? "bg-[#9AE144]"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          {/* Demo button to simulate status progression */}
          <button
            onClick={() => updateStatus(issues[issues.length - 1]?.id)}
            className="mt-4 bg-[#9AE144] text-black px-4 py-2 rounded-full hover:bg-green-500"
          >
            Update Status (Demo)
          </button>
        </div>
      )}

      {/* Issue History */}
      {issues.length > 0 && (
        <div className="mt-12 mx-36 bg-white border rounded-xl shadow-lg p-6 w-[90%] md:w-[970px]">
          <h3 className="text-lg font-bold mb-4">Issue History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="p-2">Issue Title</th>
                  <th className="p-2">Description</th>
                  <th className="p-2">Resolution Date</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.id} className="border-b">
                    <td className="p-2">{issue.title}</td>
                    <td className="p-2">{issue.description}</td>
                    <td className="p-2">{issue.date}</td>
                    <td className="p-2">{issue.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}