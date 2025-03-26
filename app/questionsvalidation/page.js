// app/questionsvalidation/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuestionsValidation() {
  const [questions, setQuestions] = useState(null);
  const [skill, setSkill] = useState("");
  const [validationResults, setValidationResults] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleValidate = async () => {
    if (!questions || !skill) {
      alert("Please paste questions and select a skill");
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch("/api/validate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questions: JSON.parse(questions),
          skill
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate questions");
      }

      const data = await response.json();
      setValidationResults(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to validate questions. Please try again.");
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Questions Validation
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Paste MCQ Questions (JSON format):
            </label>
            <textarea
              className="w-full p-2 border rounded-md h-40"
              value={questions || ""}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={`Paste questions in this format:\n\n[{\n  "mcqs": "question text",\n  "options": {\n    "a": "option 1",\n    "b": "option 2",\n    "c": "option 3",\n    "d": "option 4"\n  },\n  "correct": "a"\n}]`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Skill to Validate Against:
            </label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              placeholder="Enter the skill (e.g., React, Python, etc.)"
            />
          </div>

          <button
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            onClick={handleValidate}
            disabled={isValidating || !questions || !skill}
          >
            {isValidating ? "Validating..." : "Validate Questions"}
          </button>

          {validationResults && (
            <div className="mt-8 p-4 border rounded-lg">
              <h3 className="text-xl font-bold mb-2">Validation Results</h3>
              <p className="mb-4">
                Relevance Score: {validationResults.relevanceScore}% (
                {validationResults.summary.relevantCount} relevant, 
                {validationResults.summary.notRelevantCount} not relevant, 
                {validationResults.summary.uncertainCount} uncertain)
              </p>
              
              <div className="space-y-4">
                {validationResults.validationResults.map((result, idx) => (
                  <div key={idx} className={`p-3 rounded ${
                    result.verdict === "Relevant" ? "bg-green-100" :
                    result.verdict === "Not Relevant" ? "bg-red-100" : "bg-yellow-100"
                  }`}>
                    <p><strong>Question {idx + 1}:</strong> {result.question}</p>
                    <p><strong>Verdict:</strong> {result.verdict}</p>
                    <p><strong>Reason:</strong> {result.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}