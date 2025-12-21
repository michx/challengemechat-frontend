import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Chat/Sidebar";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { Button } from "@/components/ui/button";

export default function Index() {
  const [selectedModel, setSelectedModel] = useState("ChatGPT");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleCategoryItemSelect = (item: string) => {
    setSelectedCategory(item);
    setMobileDrawerOpen(false);
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 border-r border-border flex-shrink-0">
        <Sidebar
          onModelSelect={setSelectedModel}
          onCategoryItemSelect={handleCategoryItemSelect}
          selectedModel={selectedModel}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between border-b border-border px-4 py-3 bg-background">
          <h1 className="text-lg font-semibold text-foreground">
            {selectedModel}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="md:hidden"
          >
            {mobileDrawerOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {mobileDrawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="fixed left-0 top-16 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border z-50 md:hidden overflow-y-auto">
              <Sidebar
                onModelSelect={(model) => {
                  setSelectedModel(model);
                  setMobileDrawerOpen(false);
                }}
                onCategoryItemSelect={handleCategoryItemSelect}
                selectedModel={selectedModel}
              />
            </div>
          </>
        )}

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatWindow
            selectedModel={selectedModel}
            selectedCategory={selectedCategory}
          />
        </div>
      </div>
    </div>
  );
}
