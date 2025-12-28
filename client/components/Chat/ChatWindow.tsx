import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ShieldCheck, ShieldAlert, Bot, User, ChevronDown, MessageCircle, Sparkles, Brain, Zap } from "lucide-react";
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
  onStateChange?: (state: { isLoading: boolean; isScanning: boolean }) => void;
  onScanComplete?: (result: any) => void;
  onModelSelect: (provider: string, model: string) => void;
}

const PROVIDERS = [
  { name: "ChatGPT", id: "openai", icon: MessageCircle },
  { name: "Gemini", id: "gemini", icon: Sparkles },
  { name: "Claude", id: "claude", icon: Brain },
  { name: "Custom", id: "custom", icon: Zap },
];

const PROVIDER_MODELS: Record<
  string,
  Array<{ label: string; value: string }>
> = {
  openai: [
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
    { label: "GPT-4", value: "gpt-4" },
    { label: "GPT-3.5 Turbo", value: "gpt-3.5-turbo" },
  ],
  gemini: [
    { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
    { label: "Gemini 1.5 Pro", value: "gemini-1.5-pro" },
    { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  ],
  claude: [
    { label: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
    { label: "Claude 3 Opus", value: "claude-3-opus-20240229" },
    { label: "Claude 3 Sonnet", value: "claude-3-sonnet-20240229" },
    { label: "Claude 3 Haiku", value: "claude-3-haiku-20240307" },
  ],
  custom: [{ label: "Custom Endpoint", value: "custom" }],
};

export function ChatWindow({
  selectedModel,
  selectedProvider,
  selectedCategory,
  fontSize,
  onClearChat,
  onStateChange,
  onScanComplete, 
  onModelSelect,
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
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);

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

  useEffect(() => {
    onStateChange?.({ isLoading, isScanning });
  }, [isLoading, isScanning, onStateChange]);

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
        "http://localhost:5001/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-pan-token" : prismaAirsKey,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await scanResponse.json();
      console.log("Security Scan Result:", data);
      
      return data;
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
    setIsScanning(false);
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
      setIsLoading(false);
      setIsScanning(true);

      // Perform Security Scan
      const scanResult = await performSecurityScan(userMessage.content, aiResponse.content);
      if (scanResult && scanResult !== "error") {
        onScanComplete?.(scanResult);
        const status = scanResult.action && scanResult.action === "allow" ? "safe" : "threat";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id ? { ...msg, securityStatus: status } : msg
          )
        );
      }
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
      setIsScanning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
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
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
          >
           {message.role === "ai" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
                <Bot size={24} className="text-blue-600" />
              </div>
            )}            
            <div
              className={`${
                message.role === "user"
                  ? "chat-message-user"
                  : "chat-message-ai"
                } max-w-[80%]`}
            >
              <div className={`text-${fontSize} leading-relaxed whitespace-pre-wrap break-words`}>
                {message.content}
              </div>
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
            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mt-1">
                <User size={24} className="text-indigo-600" />
              </div>
            )}            
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mt-1">
            <Bot size={24} className="text-blue-600" />
          </div>
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
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full pr-40"
            />
            <button
              onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-full border border-gray-200 font-medium select-none flex items-center gap-1.5 max-w-[180px] transition-colors"
            >
              <Bot size={12} className="flex-shrink-0" />
              <span className="truncate">{selectedModel}</span>
              <ChevronDown size={12} className="flex-shrink-0 opacity-50" />
            </button>

            {/* Model Selection Menu */}
            {isModelMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsModelMenuOpen(false)} />
                <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 flex flex-col max-h-[400px]">
                  <div className="p-2 bg-gray-50 border-b border-gray-100 font-semibold text-xs text-gray-500 uppercase tracking-wider">
                    Select Model
                  </div>
                  <div className="overflow-y-auto p-1">
                    {PROVIDERS.map(({ name, id, icon: IconComponent }) => (
                      <div key={id} className="mb-1">
                        <button
                          onClick={() => setExpandedProvider(expandedProvider === id ? null : id)}
                          className={`w-full px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${selectedProvider === id ? "bg-blue-50 text-blue-700" : "hover:bg-gray-100 text-gray-700"}`}
                        >
                          <IconComponent size={16} />
                          <span>{name}</span>
                          <ChevronDown size={14} className={`ml-auto transition-transform ${expandedProvider === id ? "rotate-180" : ""}`} />
                        </button>
                        {expandedProvider === id && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                            {PROVIDER_MODELS[id].map((model) => (
                              <button
                                key={model.value}
                                onClick={() => {
                                  onModelSelect(id, model.value);
                                  setIsModelMenuOpen(false);
                                }}
                                className={`block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${selectedModel === model.value ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                              >
                                {model.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
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
