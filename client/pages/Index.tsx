import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Chat/Sidebar";
import { ChatWindow } from "@/components/Chat/ChatWindow";
import { RightSidebar } from "@/components/Chat/RightSidebar";
import { UserMenu } from "@/components/Chat/UserMenu";
import { Button } from "@/components/ui/button";
import { getDynamicCategoryGroups, CategoryGroup } from "@/config/categories";
import SettingsPage from "./Settings";

export default function Index() {
  const navigate = useNavigate();
  const selectedProvider = "gemini";
  const selectedModel = "gemini-2.5-flash-lite";
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [clearChatTrigger, setClearChatTrigger] = useState(0);
  const [chatState, setChatState] = useState({ isLoading: false, isScanning: false });
  const [scanResult, setScanResult] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);

  const [totalTokens, setTotalTokens] = useState(0);
  useEffect(() => {
    setCategoryGroups(getDynamicCategoryGroups());
  }, []);

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
    setCategoryGroups(getDynamicCategoryGroups());
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
    <div className="h-screen flex flex-col bg-background overflow-hidden font-mono dark">
    {/* Global Header */}
    <div className="flex-none border-b border-border px-4 py-2 bg-background flex items-center justify-between z-20 relative">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-primary/10 border border-primary/20">
            <div className="w-2 h-2 bg-green-500 animate-pulse" />
            <span className="text-xs font-bold tracking-widest text-primary">NET_ACTIVE</span>
        </div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight uppercase">
            Challenge<span className="text-primary">_</span>ME<span className="text-primary">_</span>Chat
            <span className="hidden md:inline text-xs text-muted-foreground ml-2 font-normal">by Palo Alto Networks</span>
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center border-r border-border pr-6 mr-2">
            <img src="https://upload.wikimedia.org/wikipedia/commons/d/de/PaloAltoNetworks_2020_Logo.svg" alt="Palo Alto Networks Logo" className="h-4 invert" />
        </div>
        <UserMenu 
          onLogout={handleLogout} 
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
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
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Left Sidebar */}
        <div className="hidden md:block w-64 border-r border-border flex-shrink-0">
          <Sidebar
            onCategoryItemSelect={handleCategoryItemSelect}
            categoryGroups={categoryGroups}
            onFontSizeChange={setFontSize}
            onClearChat={handleClearChat}
            currentFontSize={fontSize}
          />
        </div>


        {/* Mobile Sidebar Overlay */}
        {mobileDrawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileDrawerOpen(false)}
            />
            <div className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar-background border-r border-sidebar-border z-50 md:hidden overflow-y-auto">
              <Sidebar
                onCategoryItemSelect={handleCategoryItemSelect}
                categoryGroups={categoryGroups}
                onFontSizeChange={setFontSize}
                onClearChat={handleClearChat}
                currentFontSize={fontSize}
              />
            </div>
        </>
        )}

        {/* Main Chat Area */}
        <div
          className="flex-1 flex flex-col min-w-0 overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.pexels.com/photos/163100/matrix-wallpaper-163100.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="flex-1 flex min-w-0 overflow-hidden">
            {/* Chat Window */}
            <div className="flex-1 flex flex-col min-w-0">
              <ChatWindow
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                selectedCategory={selectedCategory}
                categoryGroups={categoryGroups}
                fontSize={fontSize}
                onClearChat={clearChatTrigger}
                onStateChange={setChatState}
                onTokenCountChange={setTotalTokens}
                onScanComplete={setScanResult}
              />
            </div>

          {/* Right Sidebar */}
          <RightSidebar 
            categoryGroups={categoryGroups}
            selectedCategory={selectedCategory} 
            isLoading={chatState.isLoading}
            isScanning={chatState.isScanning}
            scanResult={scanResult}
            totalTokens={totalTokens}
          />
          </div>
        </div>
      </div>
      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
          <div className="bg-background w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden relative flex flex-col border border-border animate-in fade-in zoom-in-95 duration-200 rounded-none">
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={handleSettingsClose}
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-background">
              <SettingsPage />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
