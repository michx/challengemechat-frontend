import { Request, Response } from "express";
import { getStoredKeys, APIKeys } from "./settings";
import * as fs from "fs";
import * as path from "path";

export const handleChat = async (req: Request, res: Response) => {
  const { messages, provider, model, endpoint, prompt, response: aiResponse } = req.body;
  const storedKeys = getStoredKeys();
  let apiKey: string | undefined;

  switch (provider) {
    case "openai":
      apiKey = storedKeys.openaiKey;
      break;
    case "claude":
      apiKey = storedKeys.claudeKey;
      break;
    case "gemini":
      apiKey = storedKeys.geminiKey;
      break;
    case "custom":
      if (model === "huggingface-malicious") {
        apiKey = storedKeys.huggingfaceKey;
      }
      break;
    case "prisma-airs":
      apiKey = storedKeys.prismaAirsKey;
      break;
  }

  if (!apiKey && provider !== "ollama") {
    return res.status(400).json({ error: `API Key for provider '${provider}' is missing. Please configure it in Settings.` });
  }
 
  try {
    let result;

    switch (provider) {
      case "openai":
        result = await handleOpenAI(messages, model, apiKey!);
        break;
      case "claude":
        result = await handleClaude(messages, model, apiKey!);
        break;
      case "gemini":
        result = await handleGemini(messages, model, apiKey!);
        break;
      case "ollama":
        result = await handleOllama(messages, model, endpoint || storedKeys.ollamaEndpoint);
        break;
      case "custom":
        if (model === "huggingface-malicious") {
          // Using a standard uncensored/instruct model as a proxy for the "malicious" intent test
          result = await handleHuggingFace(messages, "mistralai/Mistral-7B-Instruct-v0.2", apiKey!);
        } else {
          return res.status(501).json({ error: "Custom provider logic not fully implemented" });
        }
        break;
      case "prisma-airs":
        result = await handlePrismaAIRS(prompt, aiResponse, model, storedKeys);
        break;
      default:
        return res.status(400).json({ error: `Provider ${provider} not supported` });
    }

    res.json(result);

  } catch (error: any) {
    console.error("Chat API Error:", error);
    res.status(500).json({ 
      error: error.message || "Internal Server Error",
      details: error.toString()
    });
  }
};

async function handleOpenAI(messages: any[], model: string, apiKey: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `OpenAI Error: ${response.statusText}`);
  }

  const data = await response.json();
  return { message: data.choices[0].message.content };
}

async function handleClaude(messages: any[], model: string, apiKey: string) {
  const systemMessage = messages.find((m: any) => m.role === "system")?.content;
  const conversationMessages = messages
    .filter((m: any) => m.role !== "system")
    .map((m: any) => ({
      role: m.role === "ai" ? "assistant" : m.role,
      content: m.content,
    }));

  const body: any = {
    model,
    messages: conversationMessages,
    max_tokens: 1024,
  };

  if (systemMessage) {
    body.system = systemMessage;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Claude Error: ${response.statusText}`);
  }

  const data = await response.json();
  return { message: data.content[0].text };
}

async function handleGemini(messages: any[], model: string, apiKey: string) {
  const logPath = path.join(process.cwd(), "gemini_debug.log");
  const contents = messages.map((m: any) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const payload = { contents };

  try {
    const logEntryRequest = `\n[${new Date().toISOString()}]\nREQUEST to https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent\nPayload:\n${JSON.stringify(payload, null, 2)}\n`;
    fs.appendFileSync(logPath, logEntryRequest);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await response.text();
    const logEntryResponse = `RESPONSE (${response.status} ${response.statusText}):\n${responseText}\n----------------------------------------\n`;
    fs.appendFileSync(logPath, logEntryResponse);

    if (!response.ok) {
      const errorData = JSON.parse(responseText);
      throw new Error(errorData.error?.message || `Gemini Error: ${response.statusText}`);
    }

    const data = JSON.parse(responseText);
    return { message: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" };
  } catch (error: any) {
    try {
      fs.appendFileSync(logPath, `\nEXCEPTION: ${error.message}\n----------------------------------------\n`);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
    throw error;
  }
}

async function handleOllama(messages: any[], model: string, endpoint: string) {
  const url = endpoint || "http://localhost:11434";
  
  // Map messages to ensure correct roles for OpenAI compatibility
  const formattedMessages = messages.map((m: any) => ({
    role: m.role === "ai" ? "assistant" : m.role,
    content: m.content,
  }));

  const response = await fetch(`${url}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama Error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return { message: data.choices[0].message.content };
}

async function handleHuggingFace(messages: any[], model: string, apiKey: string) {
  const lastMessage = messages[messages.length - 1].content;
  
  const response = await fetch(
    `https://api-inference.huggingface.co/models/${model}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ 
        inputs: lastMessage,
        parameters: { max_new_tokens: 512, return_full_text: false }
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `HuggingFace Error: ${response.statusText}`);
  }

  const data = await response.json();
  const generatedText = Array.isArray(data) ? data[0].generated_text : data.generated_text;
  return { message: generatedText };
}

async function handlePrismaAIRS(prompt: string, response: string, model: string, keys: APIKeys) {
  if (keys.enableSecurityCheck === false) {
    return null;
  }

  const logPath = path.join(process.cwd(), "prisma_airs_debug.log");
  const { prismaAirsKey, prismaAirsProfileName, prismaAirsProfileId, prismaAirsEndpoint } = keys;

  if (!prismaAirsKey || (!prismaAirsProfileName && !prismaAirsProfileId) || !prismaAirsEndpoint) {
    const missing = [];
    if (!prismaAirsKey) missing.push("Key");
    if (!prismaAirsProfileName && !prismaAirsProfileId) missing.push("Profile Name/ID");
    if (!prismaAirsEndpoint) missing.push("Endpoint");

    const errorMsg = `Prisma AIRS configuration missing: ${missing.join(", ")}`;
    try {
      fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] CONFIG ERROR: ${errorMsg}\n`);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
    throw new Error(errorMsg);
  }

  const payload = {
    ai_profile: {
      profile_name: prismaAirsProfileName || undefined,
      profile_id: prismaAirsProfileId || undefined,
    },
    contents: [{
      prompt: prompt,
      response: response,
    }],
    metadata: {
      app_name: "CMC - Challenge Me Chat",
      model: model,
    },
  };

  try {
    const logEntryRequest = `\n[${new Date().toISOString()}]\nREQUEST to ${prismaAirsEndpoint}/chat\nPayload:\n${JSON.stringify(payload, null, 2)}\n`;
    fs.appendFileSync(logPath, logEntryRequest);

    const scanResponse = await fetch(
      `${prismaAirsEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pan-token": prismaAirsKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const responseText = await scanResponse.text();
    const logEntryResponse = `RESPONSE (${scanResponse.status} ${scanResponse.statusText}):\n${responseText}\n----------------------------------------\n`;
    fs.appendFileSync(logPath, logEntryResponse);

    if (!scanResponse.ok) {
      throw new Error(`Prisma AIRS Scan Failed: ${scanResponse.statusText} - ${responseText}`);
    }

    try {
      return JSON.parse(responseText);
    } catch (e) {
      return { raw: responseText };
    }
  } catch (error: any) {
    try {
      fs.appendFileSync(logPath, `\nEXCEPTION: ${error.message}\n----------------------------------------\n`);
    } catch (e) {
      console.error("Failed to write to log file:", e);
    }
    throw error;
  }
}