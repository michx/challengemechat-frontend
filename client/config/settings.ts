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
  openaiKey: "",
  geminiKey: "",
  claudeKey: "",
  ollamaEndpoint: "http://localhost:11434",
  huggingfaceKey: "",
  customEndpoint: "",
  customHeaders: "",
  prismaAirsKey: "",
  prismaAirsProfileName: "",
  prismaAirsProfileId: "",
  enableSecurityCheck: true,
  prismaAirsEndpoint: "http://localhost:5001",
};