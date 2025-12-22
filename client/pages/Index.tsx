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
    <div className="h-screen flex bg-background overflow-hidden">
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
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Header - Right Side */}
        <div className="hidden md:flex items-center justify-end border-b border-border px-6 py-4 bg-background">
          <UserMenu onLogout={handleLogout} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between border-b border-border px-4 py-3 bg-background">
          <h1 className="text-lg font-semibold text-foreground">
            {selectedModel}
          </h1>
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

        {/* Chat Window and Right Sidebar Container */}
        <div className="flex-1 flex min-w-0 overflow-hidden">
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
