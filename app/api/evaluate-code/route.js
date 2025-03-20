import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { code, expectedOutput } = await request.json();

  try {
    // Create a prompt for OpenAI to evaluate the code
    const prompt = `
      You are a code evaluation assistant. Your task is to evaluate the following React component code and determine if it matches the expected output.

      **Code:**
      ${code}

      **Expected Output:**
      ${expectedOutput}

      Instructions:
      1. Analyze the code and determine if it produces the expected output.
      2. Respond with a JSON object that includes:
         - "isCorrect": true if the code is correct, false otherwise.
         - "feedback": A string explaining why the code is correct or incorrect.

      Your response should be in the following format:
      {
        "isCorrect": true,
        "feedback": "The code is correct because..."
      } 
    `;

    // Call OpenAI to evaluate the code
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Use GPT-4 for better accuracy
      messages: [
        { role: "system", content: "You are a helpful code evaluation assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Lower temperature for more deterministic responses
      max_tokens: 200,
    });

    const evaluationResult = response.choices[0].message.content.trim();
    const evaluationData = JSON.parse(evaluationResult);

    return NextResponse.json({
      isCorrect: evaluationData.isCorrect,
      feedback: evaluationData.feedback,
    });
  } catch (error) {
    console.error("Error evaluating code:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code. Please try again." },
      { status: 500 }
    );
  }
}