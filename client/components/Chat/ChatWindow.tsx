import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ShieldCheck, ShieldAlert, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { CategoryGroup } from "@/config/categories";

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
  categoryGroups: CategoryGroup[];
  selectedCategory?: string;
  fontSize: "sm" | "base" | "lg" | "xl";
  onClearChat?: number;
  onStateChange?: (state: { isLoading: boolean; isScanning: boolean }) => void;
  onScanComplete?: (result: any) => void;
  onTokenCountChange?: (count: number) => void;
}

export function ChatWindow({
  selectedModel,
  selectedProvider,
  categoryGroups,
  selectedCategory,
  fontSize,
  onClearChat,
  onStateChange,
  onScanComplete,
  onTokenCountChange,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: `Hi! My name is Zen and I'm your AI assistant. How can I help you today?`,
      role: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory) {
      const selectedItem = categoryGroups.flatMap((g) => g.items).find(
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

  useEffect(() => {
    const totalChars = messages.reduce((acc, msg) => acc + msg.content.length, 0);
    const estimatedTokens = Math.ceil(totalChars / 4); // 1 token ~ 4 chars
    onTokenCountChange?.(estimatedTokens);
  }, [messages, onTokenCountChange]);

  const performSecurityScan = async (prompt: string, response: string) => {
    try {
      toast.info("A security check has been sent to Prisma AIRS.");
      
      const scanResponse = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "prisma-airs",
          model: selectedModel,
          prompt: prompt,
          response: response
        }),
      });

      if (!scanResponse.ok) {
        const err = await scanResponse.json();
        throw new Error(err.error || "Scan failed");
      }

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

      let response;
      if (selectedModel === "vulnerable-agent") {
        response = await fetch("http://127.0.0.1:5001/ssh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: userMessage.content }),
        });
      } else {
        response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: apiMessages,
            provider: selectedProvider,
            model: selectedModel,
          }),
        });
      }

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message || data.response || JSON.stringify(data),
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
      setIsScanning(true);

      // Perform Security Scan
      const scanResult = await performSecurityScan(userMessage.content, aiResponse.content);
      if (scanResult === "error") {
        toast.warning("Could not contact Prisma AIRS backend.", {
          description: "Please check your endpoint in Settings and ensure the service is running.",
        });
      } else if (scanResult) {
        onScanComplete?.(scanResult);
        const status = scanResult.action && scanResult.action === "allow" ? "safe" : "threat";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiResponse.id ? { ...msg, securityStatus: status } : msg
          ),
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
    <div className="flex flex-col h-full bg-transparent relative">
      {/* Messages Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} items-start gap-3`}
          >
           {message.role === "ai" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mt-1">
                <Bot size={24} className="text-green-500" />
              </div>
            )}            
            <div
              className={`${
                message.role === "user"
                  ? "chat-message-user"
                  : "chat-message-ai"
                } max-w-[90%] md:max-w-[80%]`}
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
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mt-1">
                <User size={24} className="text-green-500" />
              </div>
            )}            
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mt-1">
            <Bot size={24} className="text-green-500" />
          </div>
            <div className="chat-message-ai">
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Input Area */}
      <div className="border-t border-green-900/30 p-3 md:p-6 bg-black/60 backdrop-blur-md">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              className="w-full pr-12 md:pr-40 bg-black/40 border-green-500/30 text-green-400 placeholder:text-green-700/50 focus-visible:ring-green-500/50 font-mono"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-900/30 text-green-400 text-xs px-2 md:px-3 py-1.5 rounded-full border border-green-500/30 font-medium pointer-events-none select-none flex items-center gap-1.5 max-w-[150px]">
              <Bot size={12} className="flex-shrink-0" />
              <span className="truncate hidden md:inline">{selectedModel}</span>
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            className="flex items-center justify-center w-12 h-10 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg -translate-y-0 hover:-translate-y-1"
            title="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
