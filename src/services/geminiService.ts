import { GoogleGenAI, Type } from "@google/genai";
import type { Reminder } from '../types';

const reminderSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, clear title for the reminder, summarizing the main task. (e.g., 'Team Meeting', 'Buy milk and bread'). Avoid generic titles like 'Reminder' or 'Shopping'."
    },
    description: {
      type: Type.STRING,
      description: "A more detailed description of the reminder. Include all relevant details mentioned by the user. If no specific details are provided beyond the title, this can be brief."
    },
    date: {
      type: Type.STRING,
      description: "The absolute date of the event, calculated from the transcript. It must be in 'Day, Month DD, YYYY' format (e.g., 'Tuesday, July 16, 2024'). If no date is mentioned, respond with 'N/A'."
    },
    time: {
      type: Type.STRING,
      description: "The time of the event in 'HH:MM AM/PM' format (e.g., '10:30 AM'). If no time is mentioned, respond with 'N/A'."
    },
  },
  required: ["title", "description", "date", "time"]
};

export const processVoiceInput = async (transcript: string, apiKey: string): Promise<Omit<Reminder, 'id'>> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in the settings.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const today = new Date();
    const systemInstruction = `You are an intelligent assistant that creates reminders from voice transcripts.
- The user's current language is ${navigator.language}.
- Today's date is ${today.toDateString()}.
- Analyze the transcript to extract a title, description, date, and time.
- The title should be a short summary of the main action (e.g., "Buy milk and bread", not "Shopping").
- If a relative date is given (e.g., "tomorrow", "next Friday"), calculate the absolute date based on today's date.
- Format the final date as 'Day, Month DD, YYYY' (e.g., 'Tuesday, July 16, 2024').
- Format the time as 'HH:MM AM/PM'.
- If any piece of information is not present, use "N/A".
- Be precise and do not add any information that is not in the transcript.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Here is the transcript: "${transcript}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: reminderSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Received empty response from AI.");
    }
    
    const structuredData = JSON.parse(jsonText);

    return {
      title: structuredData.title || 'Untitled Reminder',
      description: structuredData.description || 'No description provided.',
      date: structuredData.date || 'N/A',
      time: structuredData.time || 'N/A',
    };

  } catch (error) {
    console.error("Error processing with Gemini:", error);
    throw new Error("Failed to process the voice input with AI.");
  }
};