export interface APIKeys {
  openaiKey: string;
  geminiKey: string;
  claudeKey: string;
  huggingfaceKey: string;
  prismaAirsKey: string;
  ollamaEndpoint: string;
  prismaAirsProfileName: string;
  prismaAirsProfileId: string;
  customEndpoint: string;
  customHeaders: string;
  enableSecurityCheck: boolean;
  prismaAirsEndpoint: string;
}

export const apiSettings: APIKeys = {
  openaiKey: "", // Enter your OpenAI API Key here
  geminiKey: "", // Enter your Gemini API Key here
  claudeKey: "", // Enter your Claude API Key here
  ollamaEndpoint: "http://localhost:11434",
  huggingfaceKey: "", // Enter your Hugging Face API Key here
  customEndpoint: "",
  customHeaders: "",
  prismaAirsKey: "", // Enter your Prisma Cloud API Key here
  prismaAirsProfileName: "",
  prismaAirsProfileId: "",
  enableSecurityCheck: true,
  prismaAirsEndpoint: "http://localhost:5001",
};