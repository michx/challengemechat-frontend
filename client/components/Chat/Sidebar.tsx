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
} from "lucide-react";

interface SidebarProps {
  onModelSelect: (model: string) => void;
  onCategoryItemSelect: (item: string) => void;
  selectedModel: string;
  onFontSizeChange?: (size: "sm" | "base" | "lg" | "xl") => void;
  onClearChat?: () => void;
  currentFontSize?: "sm" | "base" | "lg" | "xl";
}

const MODELS = [
  { name: "Gemini", icon: Sparkles },
  { name: "ChatGPT", icon: MessageCircle },
  { name: "Claude", icon: Brain },
  { name: "Custom Model", icon: Zap },
];

const FONT_LABELS = [
  { size: "sm", label: "S" },
  { size: "base", label: "M" },
  { size: "lg", label: "L" },
  { size: "xl", label: "XL" },
] as const;

const CATEGORIES = {
  Ethics: {
    items: [
      "Fairness",
      "Transparency",
      "Accountability",
      "Privacy",
      "Bias Detection",
    ],
    icon: Shield,
  },
  Cyber: {
    items: [
      "Threat Detection",
      "Vulnerability Assessment",
      "Incident Response",
      "Security Hardening",
      "Penetration Testing",
    ],
    icon: Zap,
  },
  Toxic: {
    items: [
      "Content Moderation",
      "Toxicity Detection",
      "Harmful Content Filter",
      "Safe Mode",
      "Sensitivity Analysis",
    ],
    icon: AlertTriangle,
  },
};

export function Sidebar({
  onModelSelect,
  onCategoryItemSelect,
  selectedModel,
  onFontSizeChange,
  onClearChat,
  currentFontSize = "base",
}: SidebarProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col">
      {/* Models Section */}
      <div className="p-4 border-b border-sidebar-border">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70 bg-yellow-300 px-3 py-2 rounded-lg">
          Models
        </h3>
        <div className="space-y-2">
          {MODELS.map(({ name, icon: IconComponent }) => (
            <button
              key={name}
              onClick={() => onModelSelect(name)}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                selectedModel === name
                  ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                  : "bg-gray-700 text-white hover:bg-gray-600 shadow-md"
              }`}
            >
              <IconComponent size={16} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70 bg-red-400 px-3 py-2 rounded-lg">
          Categories
        </h3>
        <div className="space-y-2">
          {Object.entries(CATEGORIES).map(
            ([category, { items, icon: IconComponent }]) => (
              <div key={category}>
                <button
                  onClick={() =>
                    setExpandedCategory(
                      expandedCategory === category ? null : category,
                    )
                  }
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-700 text-white hover:bg-gray-600 shadow-md flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <IconComponent size={16} />
                    {category}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      expandedCategory === category ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Submenu */}
                {expandedCategory === category && (
                  <div className="mt-2 ml-2 space-y-1 border-l-2 border-blue-500 pl-3">
                    {items.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          onCategoryItemSelect(item);
                          setExpandedCategory(null);
                        }}
                        className="block w-full text-left px-3 py-1.5 text-sm rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors duration-150 shadow-sm"
                      >
                        {item}
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

        {/* Clear Chat Button */}
        <button
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
