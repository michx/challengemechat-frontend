import { useState } from "react";
import { Sidebar } from "@/components/Chat/Sidebar";
import { ChatWindow } from "@/components/Chat/ChatWindow";

export default function Index() {
  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const [selectedCategory, setSelectedCategory] = useState<string>();

  const handleCategoryItemSelect = (item: string) => {
    setSelectedCategory(item);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r border-border flex-shrink-0">
        <Sidebar
          onModelSelect={setSelectedModel}
          onCategoryItemSelect={handleCategoryItemSelect}
          selectedModel={selectedModel}
        />
      </div>

      {/* Mobile Sidebar - Drawer can be added here if needed */}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatWindow
          selectedModel={selectedModel}
          selectedCategory={selectedCategory}
        />
      </div>
    </div>
  );
}
