import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Book Details Model Configuration
const bookDetailsModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction:
    "Identify the book shown in the picture. Give the title and author of the book in JSON format.",
});

const bookDetailsConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      "Book Title": {
        type: "string",
      },
      "Book Author": {
        type: "string",
      },
    },
    required: ["Book Title", "Book Author"],
  },
};

// Note Taking Model Configuration
const noteTakingModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
  systemInstruction:
    "You take notes for the user. Based on the attached picture, identify the relevant phrase that the reader wants to take a note of.\n\nPlease keep the formatting, language, tone, spellings exactly like they are in the image.\n\n",
});

const noteTakingConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
  responseSchema: {
    type: "object",
    properties: {
      note: {
        type: "string",
      },
    },
    required: ["note"],
  },
};

export interface BookDetails {
  title: string;
  author: string;
}

export async function getBookDetailsFromImage(imageData: string): Promise<BookDetails> {
  const chatSession = bookDetailsModel.startChat({
    generationConfig: bookDetailsConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(imageData);
  const response = JSON.parse(result.response.text());
  
  return {
    title: response["Book Title"],
    author: response["Book Author"],
  };
}

export async function getNoteFromImage(imageData: string): Promise<string> {
  const chatSession = noteTakingModel.startChat({
    generationConfig: noteTakingConfig,
    history: [],
  });

  const result = await chatSession.sendMessage(imageData);
  const response = JSON.parse(result.response.text());
  
  return response.note;
} 