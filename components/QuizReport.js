export default function QuizReport({ report, totalQuestions, correctAnswers, score }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Quiz Report</h2>
      {report.map((line, idx) => (
        <p key={idx} className="text-gray-700">
          {line}
        </p>
      ))}
      <p className="text-gray-700">Total Questions: {totalQuestions}</p>
      <p className="text-gray-700">Correct Answers: {correctAnswers}</p>
      <p className="text-gray-700">Incorrect Answers: {totalQuestions - correctAnswers}</p>
      <p className="text-gray-700">Score: {score.toFixed(2)}%</p>
    </div>
  );
}