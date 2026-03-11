import { Request, Response } from "express";
import { getStoredKeys, APIKeys } from "./settings";

export const handleChat = async (req: Request, res: Response) => {
  const { messages, provider, model, endpoint, prompt, response: aiResponse } = req.body;
  const storedKeys = getStoredKeys();
  let apiKey;

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
  console.log("Test apiKey:", apiKey);
  if (!apiKey && provider !== "ollama" && provider !== "prisma-airs") {
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
  const contents = messages.map((m: any) => ({
    role: m.role === "ai" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || `Gemini Error: ${response.statusText}`);
  }

  const data = await response.json();
  return { message: data.candidates?.[0]?.content?.parts?.[0]?.text || "No response" };
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

  const { prismaAirsKey, prismaAirsProfileName, prismaAirsProfileId, prismaAirsEndpoint } = keys;

  if (!prismaAirsKey || (!prismaAirsProfileName && !prismaAirsProfileId) || !prismaAirsEndpoint) {
    console.warn("Prisma AIRS credentials or endpoint missing on server. Skipping security scan.");
    return null;
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

  const scanResponse = await fetch(
    `${prismaAirsEndpoint}/chat`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-pan-token" : prismaAirsKey,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!scanResponse.ok) {
    throw new Error(`Prisma AIRS Scan Failed: ${scanResponse.statusText}`);
  }

  return await scanResponse.json();
}