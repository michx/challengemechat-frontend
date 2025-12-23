import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Chat/Sidebar";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { RightSidebar } from "@/components/Chat/RightSidebar";
import { UserMenu } from "@/components/Chat/UserMenu";
import { Button } from "@/components/ui/button";

export default function Index() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState("openai");
  const [selectedModel, setSelectedModel] = useState("gpt-4o");
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [clearChatTrigger, setClearChatTrigger] = useState(0);

  const handleModelSelect = (provider: string, model: string) => {
    setSelectedProvider(provider);
    setSelectedModel(model);
    setMobileDrawerOpen(false);
  };

  const handleCategoryItemSelect = (item: string) => {
    setSelectedCategory(item);
    setMobileDrawerOpen(false);
  };

  const handleClearChat = () => {
    setClearChatTrigger((prev) => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userPhone");
    navigate("/login");
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
    {/* Global Header */}
    <div className="flex-none border-b border-border px-6 py-4 bg-background flex items-center justify-between shadow-sm z-20 relative">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Chat Hub</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Increase your AI Safety
        </p>
      </div>
      <div className="flex items-center gap-3">
        <UserMenu onLogout={handleLogout} />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="md:hidden"
        >
          {mobileDrawerOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block w-64 border-r border-border flex-shrink-0">
          <Sidebar
            onModelSelect={handleModelSelect}
            onCategoryItemSelect={handleCategoryItemSelect}
            selectedModel={selectedModel}
            selectedProvider={selectedProvider}
            onFontSizeChange={setFontSize}
            onClearChat={handleClearChat}
            currentFontSize={fontSize}
          />



        {/* Mobile Sidebar Overlay */}
        {mobileDrawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border z-50 md:hidden overflow-y-auto">
              <Sidebar
                onModelSelect={handleModelSelect}
                onCategoryItemSelect={handleCategoryItemSelect}
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                onFontSizeChange={setFontSize}
                onClearChat={handleClearChat}
                currentFontSize={fontSize}
              />
            </div>
          </>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
         {/* Chat Window */}
          <div className="flex-1 flex flex-col min-w-0">
            <ChatWindow
              selectedModel={selectedModel}
              selectedProvider={selectedProvider}
              selectedCategory={selectedCategory}
              fontSize={fontSize}
              onClearChat={clearChatTrigger}
            />
          </div>

          {/* Right Sidebar */}
          <RightSidebar selectedCategory={selectedCategory} />
        </div>
      </div>
    </div>
  );
}
