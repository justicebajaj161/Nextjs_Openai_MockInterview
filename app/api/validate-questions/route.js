import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { questions, skill } = await request.json();

  try {
    // Create a prompt that forces JSON output
    const validationPrompt = `
    You are an expert validator that determines if technical interview questions are relevant to a specific skill.
    For each question, respond with a JSON object containing:
    - question: The question text
    - verdict: "Relevant", "Not Relevant"
    - reason: A brief explanation of your verdict

    Skill to validate against: ${skill}
    
    Questions to validate:
    ${JSON.stringify(questions.map(q => q.mcqs))}

    Return your response as a valid JSON object with this structure:
    {
      "results": [
        {
          "question": "question text",
          "verdict": "Relevant/Not Relevant",
          "reason": "explanation"
        },
        ...
      ]
    }
    `;

    const validationResponse = await openai.chat.completions.create({
      model: "gpt-4-1106-preview", 
      messages: [
        { role: "system", content: "You always respond with valid JSON." },
        { role: "user", content: validationPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" } 
    });

    let validationData;
    try {
      validationData = JSON.parse(validationResponse.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse validation response:", parseError);
      throw new Error("Invalid validation response format");
    }

    const validationResults = validationData.results || [];

    // Verify we got results for all questions
    if (validationResults.length !== questions.length) {
      throw new Error("Validation results count doesn't match questions count");
    }

    // Calculate summary statistics
    const relevantCount = validationResults.filter(r => r.verdict === "Relevant").length;
    const notRelevantCount = validationResults.filter(r => r.verdict === "Not Relevant").length;
    const uncertainCount = validationResults.filter(r => r.verdict === "Uncertain").length;
    const totalQuestions = validationResults.length;
    const relevanceScore = Math.round((relevantCount / totalQuestions) * 100);

    return NextResponse.json({
      relevanceScore,
      summary: {
        relevantCount,
        notRelevantCount,
        uncertainCount,
        totalQuestions
      },
      validationResults
    });
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to validate questions",
        details: error.message 
      },
      { status: 500 }
    );
  }
}