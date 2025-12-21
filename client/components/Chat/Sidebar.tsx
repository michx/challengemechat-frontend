import { useState } from "react";
import { ChevronDown, Trash2 } from "lucide-react";

interface SidebarProps {
  onModelSelect: (model: string) => void;
  onCategoryItemSelect: (item: string) => void;
  selectedModel: string;
  onFontSizeChange?: (size: "sm" | "base" | "lg" | "xl") => void;
  onClearChat?: () => void;
  currentFontSize?: "sm" | "base" | "lg" | "xl";
}

const MODELS = ["Gemini", "ChatGPT", "Claude", "Custom Model"];
const FONT_SIZES = ["sm", "base", "lg", "xl"] as const;

const CATEGORIES = {
  Ethics: [
    "Fairness",
    "Transparency",
    "Accountability",
    "Privacy",
    "Bias Detection",
  ],
  Cyber: [
    "Threat Detection",
    "Vulnerability Assessment",
    "Incident Response",
    "Security Hardening",
    "Penetration Testing",
  ],
  Toxic: [
    "Content Moderation",
    "Toxicity Detection",
    "Harmful Content Filter",
    "Safe Mode",
    "Sensitivity Analysis",
  ],
};

export function Sidebar({
  onModelSelect,
  onCategoryItemSelect,
  selectedModel,
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
    </div>
  );
}
