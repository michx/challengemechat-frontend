import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "ai";
  timestamp: Date;
}

interface ChatWindowProps {
  selectedModel: string;
  selectedCategory?: string;
  fontSize: "sm" | "base" | "lg" | "xl";
  onClearChat?: number;
}

export function ChatWindow({
  selectedModel,
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedCategory) {
      setInput((prev) => {
        if (prev && !prev.endsWith(" ")) {
          return `${prev} ${selectedCategory}`;
        }
        return selectedCategory;
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (onClearChat !== undefined && onClearChat > 0) {
      setMessages([
        {
          id: "1",
          content: `Hi! I'm using ${selectedModel}. How can I help you today?`,
          role: "ai",
          timestamp: new Date(),
        },
      ]);
      setInput("");
    }
  }, [onClearChat, selectedModel]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `I received your message about "${userMessage.content}" using ${selectedModel}. This is a demo response.`,
        role: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
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
          {selectedCategory && `Category: ${selectedCategory}`}
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
