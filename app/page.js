"use client";

import { useState, useEffect } from "react";
import Question from "@/components/Question";
import QuizReport from "@/components/QuizReport";
import CodingQuestion from "@/components/CodingQuestion";
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
  const [currentStage, setCurrentStage] = useState("roleSelection"); // 'roleSelection', 'mcq', 'summary', 'coding'
  const [codingQuestions, setCodingQuestions] = useState(null);
  const [currentCodingQuestionIndex, setCurrentCodingQuestionIndex] = useState(0);
  const [codingResults, setCodingResults] = useState([]);
  const [showCodingSummary, setShowCodingSummary] = useState(false);

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
      setCurrentStage("mcq"); // Move to MCQ round
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
          isCorrect ? "✅ Correct" : "❌ Incorrect"
        }. Your answer: ${userAnswer}, Correct answer: ${correctAnswer}`
      );
    });

    setQuizReport({
      report,
      totalQuestions: questions.mcqs.length,
      correctAnswers,
      incorrectAnswers: questions.mcqs.length - correctAnswers,
      score: (correctAnswers / questions.mcqs.length) * 100,
    });
    setCurrentStage("summary"); // Move to summary stage
  };

  const handleStartCodingRound = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-coding-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, skill }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate coding questions");
      }

      const data = await response.json();
      setCodingQuestions(data);
      setCurrentStage("coding"); // Move to coding round
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to generate coding questions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitCode = (code, isCorrect, evaluationResult) => {
    // Save the result for the current question
    setCodingResults((prev) => [
      ...prev,
      { code, isCorrect, evaluationResult },
    ]);

    // Display results in the UI (no alert)
    console.log("Submitted code:", code);
    console.log("Is correct?", isCorrect);
    console.log("Evaluation Result:", evaluationResult);
  };

  const handleNextCodingQuestion = () => {
    if (currentCodingQuestionIndex < codingQuestions.codingQuestions.length - 1) {
      setCurrentCodingQuestionIndex((prev) => prev + 1);
    } else {
      // Show summary if it's the last question
      setShowCodingSummary(true);
    }
  };

  const calculateCodingSummary = () => {
    const totalQuestions = codingQuestions.codingQuestions.length;
    const correctAnswers = codingResults.filter((result) => result.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = ((correctAnswers / totalQuestions) * 100).toFixed(2);

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
    };
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          Interviewer
        </h1>

        {/* Role and Skill Selection */}
        {currentStage === "roleSelection" && (
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
              {isGenerating ? "Generating Questions..." : "Start Round 1 (MCQ)"}
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isGenerating && (
          <div className="mt-8 text-center">
            <div className="animate-spin h-8 w-8 mx-auto border-4 rounded-full border-t-transparent"></div>
            <p className="mt-2">Questions are being generated...</p>
          </div>
        )}

        {/* MCQ Round */}
        {currentStage === "mcq" && questions && !isGenerating && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Round 1: MCQ</h2>
            <Question
              question={questions.mcqs[currentQuestionIndex]}
              idx={currentQuestionIndex}
              userAnswers={userAnswers}
              setUserAnswers={setUserAnswers}
            />

            <div className="mt-6 flex justify-between">
              {currentQuestionIndex > 0 && (
                <button
                  className="py-2 px-4 rounded-md hover:bg-secondary bg-primary"
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
                  Submit Round 1
                </button>
              )}
            </div>
          </div>
        )}

        {/* MCQ Summary */}
        {currentStage === "summary" && quizReport && (
          <div className="mt-8">
            <QuizReport {...quizReport} />
            <button
              className="mt-4 py-2 px-4 rounded-md hover:bg-secondary bg-primary"
              onClick={handleStartCodingRound}
            >
              Start Round 2 (Coding)
            </button>
          </div>
        )}

        {/* Coding Round */}
        {currentStage === "coding" && codingQuestions && !isGenerating && !showCodingSummary && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Round 2: Coding</h2>
            <CodingQuestion
              question={codingQuestions.codingQuestions[currentCodingQuestionIndex]}
              onSubmit={handleSubmitCode}
              onNext={handleNextCodingQuestion}
              isLastQuestion={currentCodingQuestionIndex === codingQuestions.codingQuestions.length - 1}
            />
          </div>
        )}

        {/* Coding Summary */}
        {showCodingSummary && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold">Round 2 Summary</h2>
            <p>Total Questions: {calculateCodingSummary().totalQuestions}</p>
            <p>✅ Correct Answers: {calculateCodingSummary().correctAnswers}</p>
            <p>❌ Incorrect Answers: {calculateCodingSummary().incorrectAnswers}</p>
            <p>Score: {calculateCodingSummary().score}%</p>
          </div>
        )}
      </div>
    </div>
  );
}