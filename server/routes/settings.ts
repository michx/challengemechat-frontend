import { RequestHandler } from "express";

export interface APIKeys {
  openaiKey?: string;
  geminiKey?: string;
  claudeKey?: string;
  huggingfaceKey?: string;
  customEndpoint?: string;
  ollamaEndpoint?: string;
  customHeaders?: string;
  prismaAirsKey?: string;
  prismaAirsProfileName?: string;
  prismaAirsProfileId?: string;
  prismaAirsEndpoint?: string;
  enableSecurityCheck?: boolean;
}

interface ModelSelection {
  openaiModel?: string;
  geminiModel?: string;
  claudeModel?: string;
  ollamaModel?: string;
}

// In-memory storage for API keys (in production, use a secure database)
const apiKeysStore: Record<string, APIKeys> = {};
const modelsStore: Record<string, ModelSelection> = {};

export const saveAPIKeys: RequestHandler = async (req, res) => {
  try {
    const { keys, models } = req.body as {
      keys: APIKeys;
      models: ModelSelection;
    };

    if (!keys || !models) {
      res.status(400).json({ error: "Keys and models are required" });
      return;
    }

    // Store in memory (in production, use a proper database)
    const userId = "default";
    apiKeysStore[userId] = keys;
    modelsStore[userId] = models;

    // In production, set these as environment variables securely
    if (keys.openaiKey) {
      process.env.OPENAI_API_KEY = keys.openaiKey;
    }
    if (keys.geminiKey) {
      process.env.GEMINI_API_KEY = keys.geminiKey;
    }
    if (keys.huggingfaceKey) {
      process.env.HUGGINGFACE_API_KEY = keys.huggingfaceKey;
    }
    if (keys.claudeKey) {
      process.env.CLAUDE_API_KEY = keys.claudeKey;
    }
    if (keys.ollamaEndpoint) {
      process.env.OLLAMA_ENDPOINT = keys.ollamaEndpoint;
    }
    if (keys.customEndpoint) {
      process.env.CUSTOM_API_ENDPOINT = keys.customEndpoint;
    }
    if (keys.customHeaders) {
      process.env.CUSTOM_API_HEADERS = keys.customHeaders;
    }

    res.json({
      success: true,
      message: "API keys saved successfully",
    });
  } catch (error) {
    console.error("Error saving API keys:", error);
    res.status(500).json({ error: "Failed to save API keys" });
  }
};

export const getAPIKeys: RequestHandler = async (req, res) => {
  try {
    const userId = "default";
    const keys = apiKeysStore[userId] || {};
    const models = modelsStore[userId] || {};

    res.json({
      keys: {
        openaiKey: keys.openaiKey ? "***configured***" : "",
        geminiKey: keys.geminiKey ? "***configured***" : "",
        claudeKey: keys.claudeKey ? "***configured***" : "",
        customEndpoint: keys.customEndpoint || "",
        ollamaEndpoint: keys.ollamaEndpoint || "",
      },
      models,
    });
  } catch (error) {
    console.error("Error retrieving API keys:", error);
    res.status(500).json({ error: "Failed to retrieve API keys" });
  }
};

export const getStoredKeys = () => {
  const keys = apiKeysStore["default"] || {};
  return {
    // Prioritize environment variables over keys from the in-memory store
    openaiKey: process.env.OPENAI_API_KEY || keys.openaiKey,
    geminiKey: process.env.GEMINI_API_KEY,
    claudeKey: process.env.CLAUDE_API_KEY || keys.claudeKey,
    huggingfaceKey: process.env.HUGGINGFACE_API_KEY || keys.huggingfaceKey,
    ollamaEndpoint: process.env.OLLAMA_ENDPOINT || keys.ollamaEndpoint || "http://localhost:11434",
    customEndpoint: process.env.CUSTOM_API_ENDPOINT || keys.customEndpoint,
    customHeaders: process.env.CUSTOM_API_HEADERS || keys.customHeaders,
    prismaAirsKey: process.env.PRISMA_AIRS_KEY?.trim(),
    prismaAirsProfileName: process.env.PRISMA_AIRS_PROFILE_NAME,
    prismaAirsProfileId: process.env.PRISMA_AIRS_PROFILE_ID,
    prismaAirsEndpoint: process.env.PRISMA_AIRS_ENDPOINT,
    // For boolean, give precedence to a stored value, then fallback to env
    enableSecurityCheck: keys.enableSecurityCheck ?? (process.env.ENABLE_SECURITY_CHECK !== "false"),
  };
};
export const getStoredModels = () => modelsStore["default"] || {};
