import { OpenAI } from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const { role, skill } = await request.json();

  const RESPONSE_JSON = {
    mcqs: Array.from({ length: 15 }, (_, i) => ({
      mcqs: `multiple choice question ${i + 1}`,
      options: {
        a: `choice here${1 + i}`,
        b: `choice here${2 + i}`,
        c: `choice here${3 + i}`,
        d: `choice here${4 + i}`,
      },
      correct: "a",
    })),
  };

  const PROMPT_TEMPLATE = `
    Text: ${role}
    Generate 15 MCQ questions for a ${role} interview focusing on ${skill}.
    Start with easy questions and gradually increase difficulty. Ensure that each question has 4 options (A, B, C, D).
    Make sure the questions are not repeating.
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
      max_tokens: 1500,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const questions = JSON.parse(response.choices[0].message.content.trim());
    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 500 }
    );
  }
}