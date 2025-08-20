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

export const processVoiceInput = async (
  transcript: string, 
  apiKey: string, 
  existingReminder?: { title: string; description: string; date: string; time: string }
): Promise<Omit<Reminder, 'id'>> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in the settings.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const today = new Date();
    // Use consistent Italian local date format
    const todayFormatted = today.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const isUpdate = !!existingReminder;
    const baseInstruction = `You are an intelligent assistant that ${isUpdate ? 'updates existing reminders by integrating new information' : 'creates reminders from voice transcripts'}.
- The user's current language is ${navigator.language}.
- Today's date is ${todayFormatted}.
- User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}.`;

    const updateInstructions = isUpdate ? `
INTEGRATION MODE - UPDATE EXISTING REMINDER:
- You are UPDATING an existing reminder with NEW information from the transcript
- PRESERVE all existing information that is still relevant
- INTEGRATE the new information with the existing content
- DO NOT delete or replace existing information unless explicitly contradicted
- If new information adds details, COMBINE them with existing details
- If new information specifies a time and the existing reminder had no time, ADD the time
- If new information specifies a date and the existing reminder had no date, ADD the date
- If new information contradicts existing info, use the NEW information

EXISTING REMINDER TO UPDATE:
Title: ${existingReminder?.title}
Description: ${existingReminder?.description}  
Date: ${existingReminder?.date}
Time: ${existingReminder?.time}

INTEGRATION EXAMPLES:
- Existing: "Fare i compiti" + New: "alle dieci" → Keep subject, add time
- Existing: "Compiti di matematica" + New: "anche storia e inglese" → Combine all subjects
- Existing: "Domani" + New: "alle 15:30" → Keep date, add specific time
` : `
CREATION MODE - NEW REMINDER:
- Analyze the transcript to extract a title, description, date, and time.
- The title should be a short summary of the main action (e.g., "Buy milk and bread", not "Shopping").
`;

    const systemInstruction = baseInstruction + updateInstructions + `
- If a relative date is given (e.g., "tomorrow", "next Friday"), calculate the absolute date based on today's date.
- Format the final date as 'Day, Month DD, YYYY' (e.g., 'Tuesday, July 16, 2024').
- Format the time as 'HH:MM AM/PM'.

TIME INTERPRETATION RULES:
- When time is ambiguous (no AM/PM specified), apply these logic rules:
  * Times 1:00-11:59 without specification → assume AM (morning)
  * Times like "cinque e mezza", "dieci e un quarto" → assume AM unless context suggests otherwise
  * If user says "pomeriggio", "sera", "tonight", "evening" → use PM
  * If user says "mattina", "mattino", "morning" → use AM
  * Times 12:00-12:59 → assume PM (noon/lunch time)
  * For 24-hour format (e.g., "diciassette e trenta", "15:30") → use as specified
  * If context mentions meals: breakfast/colazione → AM, lunch/pranzo → PM, dinner/cena → PM

EXAMPLES:
- "oggi alle cinque e mezza" → 5:30 AM
- "domani alle dieci" → 10:00 AM  
- "alle tre del pomeriggio" → 3:00 PM
- "alle diciassette e trenta" → 5:30 PM
- "alle dodici" → 12:00 PM
- "stanotte alle due" → 2:00 AM

- If any piece of information is not present, use "N/A".
- Be precise and ${isUpdate ? 'integrate information intelligently' : 'do not add any information that is not in the transcript'}.`;

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

export const generateTaskSuggestions = async (reminder: { title: string; description: string; date: string; time: string }, apiKey: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in the settings.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const today = new Date();
    const currentDate = today.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const systemInstruction = `You are an expert productivity and task management consultant. Your goal is to provide comprehensive, actionable advice for completing tasks efficiently and effectively.

CURRENT CONTEXT:
- Today's date is: ${currentDate}
- Current time is: ${today.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })} (24-hour format, local time)
- User's timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
- Timezone offset: UTC${today.getTimezoneOffset() > 0 ? '-' : '+'}${Math.abs(today.getTimezoneOffset() / 60)}

TASK: Analyze the given task and provide detailed suggestions for optimal execution.

RESPONSE STRUCTURE:
1. **Preparazione** - Cosa preparare prima di iniziare
2. **Strategia** - Approccio migliore per svolgere l'attività  
3. **Consigli Pratici** - Suggerimenti specifici e actionable
4. **Tempistica** - Quanto tempo dedicare e quando farlo
5. **Possibili Ostacoli** - Cosa potrebbe andare storto e come evitarlo
6. **Risorse Utili** - Strumenti, app, o materiali che potrebbero aiutare
7. **Sintesi Finale** - Riassunto dei punti chiave in 2-3 frasi

GUIDELINES:
- Fornisci consigli pratici e specifici, non generici
- Considera SEMPRE il contesto temporale: confronta la data del task con la data odierna
- Se il task è per domani, trattalo come urgente e imminente
- Se il task è per oggi, sottolinea l'urgenza immediata
- Usa un tono professionale ma accessibile
- Include dettagli che fanno la differenza nell'esecuzione
- Fornisci alternative quando possibile
- Concentrati su efficienza e qualità del risultato

LANGUAGE: Rispondi sempre in italiano, indipendentemente dalla lingua del task.`;

    // Calculate relative timing (aligned with timeUtils.ts logic)
    const getRelativeTiming = (dateStr: string) => {
      if (dateStr === 'N/A') return 'Data non specificata';
      
      try {
        const parts = dateStr.split(', ');
        if (parts.length < 2) return dateStr;
        
        const dateOnly = parts.slice(1).join(', ');
        const taskDate = new Date(dateOnly);
        
        // Use same logic as timeUtils.ts for consistency
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const taskDateOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
        
        const diffTime = taskDateOnly.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'OGGI';
        if (diffDays === 1) return 'DOMANI';
        if (diffDays === -1) return 'IERI';
        if (diffDays > 1) return `fra ${diffDays} giorni`;
        if (diffDays < -1) return `${Math.abs(diffDays)} giorni fa`;
        
        return dateStr;
      } catch {
        return dateStr;
      }
    };

    const taskContext = `
Titolo: ${reminder.title}
Descrizione: ${reminder.description}
Data programmata: ${reminder.date} (${getRelativeTiming(reminder.date)})
Ora programmata: ${reminder.time}

IMPORTANTE: Il task è programmato per ${getRelativeTiming(reminder.date).toLowerCase()}. Considera questo nella tempistica dei suggerimenti.
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analizza questo task e fornisci suggerimenti dettagliati:\n\n${taskContext}`,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const suggestions = response.text.trim();
    if (!suggestions) {
      throw new Error("Received empty response from AI.");
    }
    
    return suggestions;

  } catch (error) {
    console.error("Error generating suggestions with Gemini:", error);
    throw new Error("Failed to generate task suggestions with AI.");
  }
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const sendChatMessage = async (
  message: string, 
  apiKey: string, 
  reminder: { title: string; description: string; date: string; time: string },
  chatHistory: ChatMessage[]
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please add it in the settings.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });

    const today = new Date();
    const currentDate = today.toLocaleDateString('it-IT', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const systemInstruction = `You are an AI assistant specialized in helping users with their tasks and projects. You are having a conversation about a specific reminder/task.

CURRENT CONTEXT:
- Today's date: ${currentDate}
- Current time: ${today.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })}
- User timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

TASK BEING DISCUSSED:
- Title: ${reminder.title}
- Description: ${reminder.description}
- Scheduled date: ${reminder.date}
- Scheduled time: ${reminder.time}

CONVERSATION GUIDELINES:
- Provide helpful, contextual advice about this specific task
- Reference the task details when relevant
- Be conversational and supportive
- Offer practical suggestions and solutions
- Help with planning, execution, troubleshooting, or any questions about the task
- Keep responses concise but informative
- Always respond in Italian

CONVERSATION HISTORY:
${chatHistory.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n')}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const responseText = response.text.trim();
    if (!responseText) {
      throw new Error("Received empty response from AI.");
    }
    
    return responseText;

  } catch (error) {
    console.error("Error in chat with Gemini:", error);
    throw new Error("Failed to send chat message to AI.");
  }
};