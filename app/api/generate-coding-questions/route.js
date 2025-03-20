import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { role, skill } = await request.json();

  const RESPONSE_JSON = {
    codingQuestions: Array.from({ length: 5 }, (_, i) => ({
      question: `coding question ${i + 1}`,
      solution: `/* solution code for problem */`,
      testCases: [
        {
          input: `input for test case ${i + 1}`,
          expectedOutput: `expected output for test case ${i + 1}`,
        },
        {
          input: `input for test case ${i + 1} - 2`,
          expectedOutput: `expected output for test case ${i + 1} - 2`,
        },
      ],
    })),
  };

  const PROMPT_TEMPLATE = `
    Text: ${role}
    Generate 5 coding questions for a ${role} interview focusing on ${skill}.
    For each question, provide:
    - A question prompt
    - A sample solution (in the form of code snippets or pseudocode)
    - At least two test cases or expected behaviors that can be used to test the solution
    Make sure the questions gradually increase in difficulty.
    Ensure that the coding questions are related to ${role} and ${skill}, meaning they can be web-based or DSA-based depending on the role and skill.
    Format the response like the following RESPONSE_JSON:
    ${JSON.stringify(RESPONSE_JSON, null, 4)}
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: PROMPT_TEMPLATE },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const questions = JSON.parse(response.choices[0].message.content.trim());
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error generating coding questions:", error);
    return NextResponse.json(
      { error: "Failed to generate coding questions" },
      { status: 500 }
    );
  }
}