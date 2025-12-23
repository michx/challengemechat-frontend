import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ShieldCheck, ShieldAlert } from "lucide-react";
import { CATEGORY_GROUPS } from "@/config/categories";

interface Message {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: Date;
  securityStatus?: "safe" | "threat" | "error";
}

interface ChatWindowProps {
  selectedModel: string;
  selectedProvider: string;
  selectedCategory?: string;
  fontSize: "sm" | "base" | "lg" | "xl";
  onClearChat?: number;
}

export function ChatWindow({
  selectedModel,
  selectedProvider,
  selectedCategory,
  fontSize,
  onClearChat,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi! I'm using ${selectedModel}. How can I help you today?`,
      role: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory) {
      const selectedItem = CATEGORY_GROUPS.flatMap((g) => g.items).find(
        (i) => i.name === selectedCategory,
      );
      const textToInsert = selectedItem ? selectedItem.text : selectedCategory;
      setInput((prev) => {
        return textToInsert;
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    setMessages([
      {
        id: "1",
        content: `Hi! I'm using ${selectedModel}. How can I help you today?`,
        role: "ai",
        timestamp: new Date(),
      },
    ]);
    setInput("");
    setError("");
  }, [onClearChat, selectedModel]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  const performSecurityScan = async (prompt: string, response: string) => {
    try {
      const savedKeys = localStorage.getItem("apiKeys");
      if (!savedKeys) return;
      
      const { prismaAirsKey, prismaAirsProfileName, prismaAirsProfileId } = JSON.parse(savedKeys);
      
      if (!prismaAirsKey || (!prismaAirsProfileName && !prismaAirsProfileId)) {
        console.warn("Prisma AIRS credentials missing. Skipping security scan.");
        return;
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
          app_name: "AI Chat Hub",
          model: selectedModel,
        },
      };

      const scanResponse = await fetch(
        "https://service.api.aisecurity.paloaltonetworks.com/v1/scan/sync/request",
        {
          method: "POST",
          mode: 'same-origin',
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin":"*"
            "x-pan-token": prismaAirsKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await scanResponse.json();
      console.log("Security Scan Result:", data);
      
      // Return status based on response (simplified check)
      // Assuming a non-empty 'threats' array or specific verdict indicates a threat
      return data.action && data.action=="allow" ? "safe" : "threat";
    } catch (error) {
      console.error("Security scan failed:", error);
      return "error";
    }
  };


  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      // Prepare messages for API
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      apiMessages.push({
        role: "user",
        content: userMessage.content,
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          provider: selectedProvider,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = (await response.json()) as {
        message: string;
        provider: string;
      };
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);

      // Perform Security Scan
      performSecurityScan(userMessage.content, aiResponse.content).then((status) => {
        if (status) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiResponse.id ? { ...msg, securityStatus: status as any } : msg
            )
          );
        }
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to get response";
      setError(errorMessage);
      console.error("Chat error:", err);

      // Add error message to chat
      const errorMessage_final: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${errorMessage}. Please check your API keys in Settings.`,
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage_final]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">
          Chat with {selectedModel}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provider:{" "}
          {selectedProvider.charAt(0).toUpperCase() + selectedProvider.slice(1)}
          {selectedCategory && ` • Category: ${selectedCategory}`}
        </p>
      </div>

      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`${
                message.role === "user"
                  ? "chat-message-user"
                  : "chat-message-ai"
              }`}
            >
              <p className={`text-${fontSize} leading-relaxed`}>
                {message.content}
              </p>
              {message.securityStatus && (
                <div className={`mt-2 flex items-center gap-1 text-xs ${
                  message.securityStatus === "threat" ? "text-red-500" : "text-green-500"
                }`}>
                  {message.securityStatus === "threat" ? <ShieldAlert size={12} /> : <ShieldCheck size={12} />}
                  <span className="uppercase font-bold">
                    {message.securityStatus === "threat" ? "Threat Detected" : "Verified Safe"}
                  </span>
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="chat-message-ai">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-secondary-foreground animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-6 bg-background">
        <div className="flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center w-12 h-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
