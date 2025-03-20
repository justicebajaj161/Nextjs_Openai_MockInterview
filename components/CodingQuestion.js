import { useState } from "react";
import CodingEditor from "@/components/CodingEditor";

export default function CodingQuestion({
  question,
  onSubmit,
  onNext,
  isLastQuestion,
  hasSubmitted,
}) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    try {
      // Call the evaluation API
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          expectedOutput: question.testCases[0].expectedOutput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to evaluate code");
      }

      const data = await response.json();

      // Set the result
      setResult(data);

      // Notify parent component
      onSubmit(code, data.isCorrect, data.feedback);
    } catch (error) {
      console.error("Error evaluating code:", error);
      setResult({
        isCorrect: false,
        feedback: "Failed to evaluate code. Please check your syntax.",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setResult(null); // Reset the result when moving to the next question
    onNext(); // Call the parent's onNext function
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">{question.question}</h3>
      <CodingEditor
        initialCode={code}
        onCodeChange={setCode}
        clearEditor={!hasSubmitted} // Clear the editor when moving to the next question
      />
      <div className="flex justify-between">
        <button
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={handleSubmit}
          disabled={isEvaluating}
        >
          {isEvaluating ? "Evaluating..." : "Submit Code"}
        </button>
        {result && !isEvaluating && (
          <button
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={handleNext}
            disabled={!hasSubmitted} // Disable if not submitted
          >
            {isLastQuestion ? "Finish Round 2" : "Next Question"}
          </button>
        )}
      </div>

      {/* Display Result */}
      {result && (
        <div className="mt-4 p-4 border rounded-lg">
          <p className="text-lg font-semibold">
            {result.isCorrect ? "✅ Correct!" : "❌ Incorrect!"}
          </p>
          <div className="mt-4">
            <p>
              <strong>Feedback:</strong> {result.feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}