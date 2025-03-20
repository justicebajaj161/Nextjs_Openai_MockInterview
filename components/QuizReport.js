export default function QuizReport({ report, totalQuestions, correctAnswers, score }) {
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-2xl font-bold">Quiz Report</h2>
      {report.map((line, idx) => (
        <p key={idx}>
          {line}
        </p>
      ))}
      <p>Total Questions: {totalQuestions}</p>
      <p>Correct Answers: {correctAnswers}</p>
      <p>Incorrect Answers: {totalQuestions - correctAnswers}</p>
      <p>Score: {score.toFixed(2)}%</p>
    </div>
  );
}