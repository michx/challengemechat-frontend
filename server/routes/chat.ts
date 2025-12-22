import { RequestHandler } from "express";
import { getStoredKeys, getStoredModels } from "./settings";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  provider: "openai" | "gemini" | "claude" | "custom";
  model?: string;
}

async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };
  return data.choices[0].message.content;
}

async function callGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const lastMessage = messages[messages.length - 1];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: lastMessage.content,
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  return data.candidates[0].content.parts[0].text;
}

async function callClaude(
  apiKey: string,
  model: string,
  messages: ChatMessage[]
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    content: Array<{ text: string }>;
  };
  return data.content[0].text;
}

async function callCustomAPI(
  endpoint: string,
  headers: string,
  messages: ChatMessage[]
) {
  let parsedHeaders: Record<string, string> = {};

  if (headers) {
    try {
      parsedHeaders = JSON.parse(headers);
    } catch (e) {
      throw new Error("Invalid custom headers JSON");
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...parsedHeaders,
    },
    body: JSON.stringify({
      messages,
    }),
  });

  if (!response.ok) {
    throw new Error(`Custom API error: ${response.statusText}`);
  }

  const data = (await response.json()) as { message?: string; content?: string };
  return data.message || data.content || "No response from API";
}

export const handleChat: RequestHandler = async (req, res) => {
  try {
    const { messages, provider, model } = req.body as ChatRequest;

    if (!messages || !provider) {
      res.status(400).json({ error: "Messages and provider are required" });
      return;
    }

    const keys = getStoredKeys();
    const models = getStoredModels();

    let aiResponse: string;

    switch (provider) {
      case "openai":
        if (!keys.openaiKey) {
          res.status(400).json({ error: "OpenAI API key not configured" });
          return;
        }
        aiResponse = await callOpenAI(
          keys.openaiKey,
          model || models.openaiModel || "gpt-4o",
          messages
        );
        break;

      case "gemini":
        if (!keys.geminiKey) {
          res.status(400).json({ error: "Gemini API key not configured" });
          return;
        }
        aiResponse = await callGemini(
          keys.geminiKey,
          model || models.geminiModel || "gemini-2.0-flash",
          messages
        );
        break;

      case "claude":
        if (!keys.claudeKey) {
          res.status(400).json({ error: "Claude API key not configured" });
          return;
        }
        aiResponse = await callClaude(
          keys.claudeKey,
          model || models.claudeModel || "claude-3-5-sonnet-20241022",
          messages
        );
        break;

      case "custom":
        if (!keys.customEndpoint) {
          res.status(400).json({ error: "Custom API endpoint not configured" });
          return;
        }
        aiResponse = await callCustomAPI(
          keys.customEndpoint,
          keys.customHeaders || "",
          messages
        );
        break;

      default:
        res.status(400).json({ error: "Invalid provider" });
        return;
    }

    res.json({
      success: true,
      message: aiResponse,
      provider,
      model: model || models[`${provider}Model` as keyof typeof models],
    });
  } catch (error) {
    console.error("Error in chat:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process chat message";
    res.status(500).json({ error: errorMessage });
  }
};
