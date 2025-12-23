import { useState } from "react";
import {
  ChevronDown,
  Trash2,
  Sparkles,
  MessageCircle,
  Brain,
  Zap,
  Shield,
  AlertTriangle,
  Type,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CATEGORY_GROUPS } from "@/config/categories";


interface SidebarProps {
  onModelSelect: (provider: string, model: string) => void;
  onCategoryItemSelect: (item: string) => void;
  selectedModel: string;
  selectedProvider: string;
  onFontSizeChange?: (size: "sm" | "base" | "lg" | "xl") => void;
  onClearChat?: () => void;
  currentFontSize?: "sm" | "base" | "lg" | "xl";
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

const FONT_LABELS = [
  { size: "sm", label: "S" },
  { size: "base", label: "M" },
  { size: "lg", label: "L" },
  { size: "xl", label: "XL" },
] as const;


export function Sidebar({
  onModelSelect,
  onCategoryItemSelect,
  selectedModel,
  selectedProvider,
  onFontSizeChange,
  onClearChat,
  currentFontSize = "base",
}: SidebarProps) {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [openModelMenu, setOpenModelMenu] = useState<string | null>(null);

  return (
    <div className="h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-[5px_0_30px_rgba(0,0,0,0.3)] relative z-20">
      {/* Providers Section */}
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70 bg-yellow-300 px-3 py-2 rounded-lg">
          AI Provider
        </h3>
        <div className="space-y-2">
          {PROVIDERS.map(({ name, id, icon: IconComponent }) => (
            <div key={id} className="relative">
              <button
                onClick={() =>
                  setOpenModelMenu(openModelMenu === id ? null : id)
                }
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  selectedProvider === id
                    ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600 shadow-md"
                }`}
              >
                <IconComponent size={16} />
                <span>{name}</span>
                <ChevronDown
                  size={14}
                  className={`ml-auto transition-transform duration-200 ${
                    openModelMenu === id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Model Selection Pop-up Menu */}
              {openModelMenu === id && (
                <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-500 pl-3">
                {PROVIDER_MODELS[id].map((model) => (
                   <button
                      key={model.value}
                      onClick={() => {
                        onModelSelect(id, model.value);
                        setOpenModelMenu(null);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded-md text-white transition-colors duration-150 shadow-sm ${
                        selectedModel === model.value
                        ? "bg-blue-600 hover:bg-blue-500"
                        : "bg-gray-600 hover:bg-gray-500"
                      }`}
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

      {/* Categories Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70 bg-red-400 px-3 py-2 rounded-lg">
          Categories
        </h3>
        <div className="space-y-2">
        {CATEGORY_GROUPS.map(
            (group) => (
              <div key={group.name}>
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === group.name ? null : group.name,
                     )
                  }
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-white shadow-md flex items-center justify-between group ${
                    group.color || "bg-gray-700 hover:bg-gray-600"
                  }`}              >
                  <span className="flex items-center gap-2">
                  <group.icon size={16} />
                    {group.name}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedCategory === group.name ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {expandedCategory === group.name && (
                  <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-500 pl-3">
                    {group.items.map((item) => (
                      <button
                        key={item.name}
                        onClick={() => {
                          onCategoryItemSelect(item.name);
                          setExpandedCategory(null);
                        }}
                        className={'block w-full text-left px-3 py-1.5 text-sm rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors duration-150 shadow-sm  ${item.color || "bg-gray-700 hover:bg-gray-600"}>'}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </div>
      </div>

      {/* Footer Section - Font Size and Clear Chat */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {/* Font Size Control */}
        <div>
          <label className="text-xs font-semibold text-sidebar-foreground mb-2 block uppercase tracking-wider opacity-70 flex items-center gap-2">
            <Type size={14} />
            Font Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FONT_LABELS.map(({ size: fontSize, label }) => (
              <button
                key={fontSize}
                onClick={() => onFontSizeChange?.(fontSize)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 shadow-sm ${
                  currentFontSize === fontSize
                    ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
                title={`${fontSize} font size`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Settings Button */}
        <button
          onClick={() => navigate("/settings")}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-purple-600 text-white hover:bg-purple-700 shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>

        {/* Clear Chat Button */}
        <button
          type="button"        
          onClick={onClearChat}
          className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-700 text-white hover:bg-gray-600 shadow-md flex items-center justify-center gap-2 active:scale-95"
        >
          <Trash2 size={16} />
          <span>Clear Chat</span>
        </button>
      </div>
    </div>
  );
}
