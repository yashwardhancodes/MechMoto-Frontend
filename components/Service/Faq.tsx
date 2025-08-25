"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQs() {
  const faqs = [
    {
      question: "What factors affect the cost of web design?",
      answer:
        "The cost depends on project complexity, design requirements, number of pages, and additional features like e-commerce or integrations.",
    },
    {
      question: "Do you provide ongoing support?",
      answer:
        "Yes, we provide ongoing maintenance, updates, and support to ensure your website runs smoothly.",
    },
    {
      question: "How long does a web design project take?",
      answer:
        "The duration varies depending on the project scope. Typically, small projects take 2-4 weeks, while larger projects can take 6-8 weeks.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-12 px-6 md:px-36">
      <h2 className="text-3xl font-bold text-black mb-10">FAQS</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Side - Questions */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() =>
                setActiveIndex(activeIndex === index ? null : index)
              }
              className="w-full flex justify-between items-center px-5 py-4 text-left text-gray-800 border rounded-full hover:bg-gray-50 transition"
            >
              <span className="text-base font-medium">{faq.question}</span>
              {activeIndex === index ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          ))}
        </div>

        {/* Right Side - Answer */}
        {activeIndex !== null && (
          <div className="bg-[rgba(154,225,68,0.13)] border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#9AE144] mb-2">
              {faqs[activeIndex].question}
            </h3>
            <p className="text-gray-600">{faqs[activeIndex].answer}</p>
          </div>
        )}
      </div>
    </section>
  );
}
