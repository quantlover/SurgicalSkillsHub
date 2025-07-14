import OpenAI from "openai";
import fs from "fs";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export async function speechToText(audioFilePath: string): Promise<string> {
  try {
    // Check if file exists
    if (!fs.existsSync(audioFilePath)) {
      throw new Error("Audio file not found");
    }

    const audioReadStream = fs.createReadStream(audioFilePath);

    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      response_format: "text",
      language: "en", // Assuming English for medical education
    });

    return transcription;
  } catch (error) {
    console.error("Error transcribing audio:", error);
    
    // Fallback to browser-based speech recognition error message
    throw new Error("Speech-to-text service temporarily unavailable. Please try using your browser's speech recognition or type your feedback manually.");
  }
}
