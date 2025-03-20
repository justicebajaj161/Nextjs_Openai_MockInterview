"use client";

export default function Question({ question, idx, userAnswers, setUserAnswers }) {
  const handleAnswerChange = (option) => {
    setUserAnswers((prev) => ({ ...prev, [idx]: option }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">
        Question {idx + 1}: {question.mcqs}
      </h3>
      {Object.entries(question.options).map(([key, value]) => (
        <div key={key} className="flex items-center">
          <input
            type="radio"
            id={`question-${idx}-${key}`}
            name={`question-${idx}`}
            value={key}
            checked={userAnswers[idx] === key}
            onChange={() => handleAnswerChange(key)}
            className="mr-2"
          />
          <label htmlFor={`question-${idx}-${key}`} className="text-gray-700">
            {value}
          </label>
        </div>
      ))}
    </div>
  );
}