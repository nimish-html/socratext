import { GoogleGenerativeAI } from "@google/generative-ai";

// Check for API key in both browser and server environments
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("Warning: NEXT_PUBLIC_GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Initialize model only if API key is available
const model = GEMINI_API_KEY ? genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
}) : null;

// Helper function to clean markdown and extract JSON
function extractJsonFromResponse(response: string): string {
  // Remove markdown code blocks and any language specifiers
  const cleanResponse = response.replace(/```(json)?\n?/g, '').trim();
  console.log("Cleaned response:", cleanResponse);
  return cleanResponse;
}

// Helper function to sanitize text for database storage
function sanitizeForDatabase(text: string): string {
  // Remove any null characters, control characters, and excessive whitespace
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ')                  // Replace multiple spaces with single space
    .trim();                               // Remove leading/trailing whitespace
}

interface BookDetails {
  title: string;
  author: string;
}

interface NoteContent {
  note: string;
}

export async function getBookDetailsFromImage(base64Image: string): Promise<BookDetails> {
  if (!model || !GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
  }

  console.log(`Processing image data of length: ${base64Image.length} characters`);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  try {
    console.log("Starting chat session with Gemini...");
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    console.log("Sending image to Gemini...");
    const result = await chatSession.sendMessageStream([
      "Identify the book shown in the picture. Give the title and author of the book in JSON format with keys 'Book Title' and 'Book Author'.",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    console.log("Receiving stream response from Gemini...");
    let response = "";
    for await (const chunk of result.stream) {
      response += chunk.text();
      console.log("Received chunk:", chunk.text());
    }

    console.log("Full response:", response);

    try {
      // Clean the response and parse JSON
      const cleanedResponse = extractJsonFromResponse(response);
      const parsedResponse = JSON.parse(cleanedResponse);
      console.log("Parsed response:", parsedResponse);

      if (!parsedResponse["Book Title"] || !parsedResponse["Book Author"]) {
        throw new Error("Response missing required fields");
      }

      // Sanitize the data before returning
      return {
        title: sanitizeForDatabase(parsedResponse["Book Title"]),
        author: sanitizeForDatabase(parsedResponse["Book Author"])
      };
    } catch (parseError) {
      console.error("JSON parsing error:", parseError);
      console.error("Raw response that failed to parse:", response);
      throw new Error("Failed to parse Gemini response as JSON");
    }
  } catch (error) {
    console.error("Detailed error:", error);
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    throw new Error(`Failed to extract book details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getNoteFromImage(base64Image: string): Promise<NoteContent> {
  if (!model || !GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.");
  }

  console.log(`Processing note image data of length: ${base64Image.length} characters`);

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  };

  try {
    console.log("Starting chat session for note extraction...");
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    console.log("Sending note image to Gemini...");
    const result = await chatSession.sendMessageStream([
      "Based on the attached picture, identify the relevant phrase that the reader wants to take a note of. Keep the formatting, language, tone, spellings exactly like they are in the image. Return in JSON format with a 'note' key.",
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      }
    ]);

    console.log("Receiving stream response for note...");
    let response = "";
    for await (const chunk of result.stream) {
      response += chunk.text();
      console.log("Received note chunk:", chunk.text());
    }

    console.log("Full note response:", response);

    try {
      // Clean the response and parse JSON
      const cleanedResponse = extractJsonFromResponse(response);
      const parsedResponse = JSON.parse(cleanedResponse);
      console.log("Parsed note response:", parsedResponse);

      if (!parsedResponse.note) {
        throw new Error("Response missing note field");
      }

      // Sanitize the note before returning
      return {
        note: sanitizeForDatabase(parsedResponse.note)
      };
    } catch (parseError) {
      console.error("Note JSON parsing error:", parseError);
      console.error("Raw note response that failed to parse:", response);
      throw new Error("Failed to parse note from Gemini response");
    }
  } catch (error) {
    console.error("Detailed note error:", error);
    if (error instanceof Error) {
      console.error("Note error name:", error.name);
      console.error("Note error message:", error.message);
      console.error("Note error stack:", error.stack);
    }
    throw new Error(`Failed to extract note: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 