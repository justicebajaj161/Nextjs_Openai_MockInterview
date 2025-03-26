export default function ValidationResults({ results }) {
    return (
      <div className="mt-8 p-4 border rounded-lg">
        <h3 className="text-xl font-bold mb-2">Validation Results</h3>
        <p className="mb-4">
          Relevance Score: {results.relevanceScore}% (
          {results.summary.relevantCount} relevant, 
          {results.summary.notRelevantCount} not relevant, 
          {results.summary.uncertainCount} uncertain)
        </p>
        
        <div className="space-y-4">
          {results.validationResults.map((result, idx) => (
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
    );
  }