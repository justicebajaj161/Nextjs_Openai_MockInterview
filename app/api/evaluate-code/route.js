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
      2. If the code is correct, respond with "Correct".
      3. If the code is incorrect, respond with "Incorrect" and explain why.

      Your response:
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

    // Determine if the code is correct
    const isCorrect = evaluationResult.toLowerCase().includes("correct");

    return NextResponse.json({
      isCorrect,
      evaluationResult,
    });
  } catch (error) {
    console.error("Error evaluating code:", error);
    return NextResponse.json(
      { error: "Failed to evaluate code. Please try again." },
      { status: 500 }
    );
  }
}