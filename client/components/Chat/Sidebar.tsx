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

const FONT_SIZES = ["sm", "base", "lg", "xl"] as const;
const FONT_ICONS = ["A", "A", "A", "A"];

const CATEGORIES = {
  Ethics: { items: ["Fairness", "Transparency", "Accountability", "Privacy", "Bias Detection"], icon: Shield },
  Cyber: { items: ["Threat Detection", "Vulnerability Assessment", "Incident Response", "Security Hardening", "Penetration Testing"], icon: Zap },
  Toxic: { items: ["Content Moderation", "Toxicity Detection", "Harmful Content Filter", "Safe Mode", "Sensitivity Analysis"], icon: AlertTriangle },
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
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70">
          Models
        </h3>
        <div className="space-y-2">
          {MODELS.map((model) => (
            <button
              key={model}
              onClick={() => onModelSelect(model)}
              className={`sidebar-button-secondary w-full ${
                selectedModel === model
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : ""
              }`}
            >
              {model}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70">
          Categories
        </h3>
        <div className="space-y-2">
          {Object.entries(CATEGORIES).map(([category, items]) => (
            <div key={category}>
              <button
                onClick={() =>
                  setExpandedCategory(
                    expandedCategory === category ? null : category,
                  )
                }
                className="sidebar-button-secondary w-full flex items-center justify-between group"
              >
                <span>{category}</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    expandedCategory === category ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Submenu */}
              {expandedCategory === category && (
                <div className="mt-2 ml-2 space-y-1 border-l border-sidebar-border pl-3">
                  {items.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        onCategoryItemSelect(item);
                        setExpandedCategory(null);
                      }}
                      className="block w-full text-left px-3 py-1.5 text-sm rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-150"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Section - Font Size and Clear Chat */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {/* Font Size Control */}
        <div>
          <label className="text-xs font-semibold text-sidebar-foreground mb-2 block uppercase tracking-wider opacity-70">
            Font Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => onFontSizeChange?.(size)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                  currentFontSize === size
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-opacity-80"
                }`}
                title={`${size} font size`}
              >
                {size === "sm" ? "S" : size === "base" ? "M" : size === "lg" ? "L" : "XL"}
              </button>
            ))}
          </div>
        </div>

        {/* Clear Chat Button */}
        <button
          onClick={onClearChat}
          className="sidebar-button-secondary w-full flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          <span>Clear Chat</span>
        </button>
      </div>
    </div>
  );
}
