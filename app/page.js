"use client";

import { useState, useEffect } from "react";
import Question from "@/components/Question";
import QuizReport from "@/components/QuizReport";
import data from "@/data.json";

export default function Home() {
  const [role, setRole] = useState("");
  const [skill, setSkill] = useState("");
  const [questions, setQuestions] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [quizReport, setQuizReport] = useState(null);
  const [skillsList, setSkillsList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Load roles from JSON
  const roles = data.roles.map((roleData) => roleData.role);

  // Update skills list when role changes
  useEffect(() => {
    if (role) {
      const selectedRole = data.roles.find((roleData) => roleData.role === role);
      setSkillsList(selectedRole ? selectedRole.skills : []);
      setSkill(""); // Reset skill when role changes
    } else {
      setSkillsList([]);
    }
  }, [role]);

  const handleGenerateQuestions = async () => {
    if (!role || !skill) {
      alert("Please select both role and skill.");
      return;
    }

    setIsGenerating(true);
    setQuestions(null);
    setUserAnswers({});
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skill }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.mcqs.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmitAnswers = () => {
    const report = [];
    let correctAnswers = 0;

    questions.mcqs.forEach((question, idx) => {
      const userAnswer = userAnswers[idx];
      const correctAnswer = question.correct;
      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) correctAnswers++;

      report.push(
        `Question ${idx + 1}: ${
          isCorrect ? "Correct" : "Incorrect"
        }. Your answer: ${userAnswer}, Correct answer: ${correctAnswer}`
      );
    });

    setQuizReport({
      report,
      totalQuestions: questions.mcqs.length,
      correctAnswers,
      score: (correctAnswers / questions.mcqs.length) * 100,
    });
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Mock Interview App
        </h1>

        {/* Role and Skill Selection */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Select Role:</label>
            <select
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select a role</option>
              {roles.map((role, idx) => (
                <option key={idx} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Select Skill:</label>
            <select
              className="mt-1 block w-full p-2 border rounded-md shadow-sm"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              disabled={!role}
            >
              <option value="">Select a skill</option>
              {skillsList.map((skill, idx) => (
                <option key={idx} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <button
            className="w-full py-2 px-4 rounded-md hover:bg-secondary disabled:bg-primary bg-primary"
            onClick={handleGenerateQuestions}
            disabled={isGenerating || !role || !skill}
          >
            {isGenerating ? "Generating Questions..." : "Generate Questions"}
          </button>
        </div>

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="mt-8 text-center">
            <div className="animate-spin h-8 w-8 mx-auto border-4 rounded-full border-t-transparent"></div>
            <p className="mt-2">Questions are being generated...</p>
          </div>
        )}

        {/* Question Display */}
        {questions && !isGenerating && (
          <div className="mt-8">
            <Question
              question={questions.mcqs[currentQuestionIndex]}
              idx={currentQuestionIndex}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
            />

            <div className="mt-6 flex justify-between">
              {currentQuestionIndex > 0 && (
                <button
                  className=" py-2 px-4 rounded-md hover:bg-secondary bg-primary "
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                >
                  Previous Question
                </button>
              )}

              {currentQuestionIndex < questions.mcqs.length - 1 ? (
                <button
                  className="py-2 px-4 rounded-md hover:bg-secondary bg-primary"
                  onClick={handleNextQuestion}
                >
                  Next Question
                </button>
              ) : (
                <button
                  className="py-2 px-4 rounded-md hover:bg-green-700"
                  onClick={handleSubmitAnswers}
                >
                  Submit Interview
                </button>
              )}
            </div>
          </div>
        )}

        {/* Quiz Report */}
        {quizReport && <QuizReport {...quizReport} />}
      </div>
    </div>
  );
}