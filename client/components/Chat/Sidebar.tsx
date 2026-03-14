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
  Database,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CategoryGroup } from "@/config/categories";

interface SidebarProps {
  onCategoryItemSelect: (item: string) => void;
  categoryGroups: CategoryGroup[];
  onFontSizeChange?: (size: "sm" | "base" | "lg" | "xl") => void;
  onClearChat?: () => void;
  currentFontSize?: "sm" | "base" | "lg" | "xl";
}

const FONT_LABELS = [
  { size: "sm", label: "S" },
  { size: "base", label: "M" },
  { size: "lg", label: "L" },
  { size: "xl", label: "XL" },
] as const;

export function Sidebar({
  onCategoryItemSelect,
  categoryGroups,
  onFontSizeChange,
  onClearChat,
  currentFontSize = "base",
}: SidebarProps) {
  const navigate = useNavigate();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  return (
    <div className="h-full bg-sidebar-background text-sidebar-foreground border-r border-sidebar-border flex flex-col shadow-[5px_0_30px_rgba(0,0,0,0.3)] relative z-20">
      {/* Categories Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-sidebar-foreground mb-3 uppercase tracking-wider opacity-70 bg-red-700 px-3 py-2 rounded-lg">
          Categories
        </h3>
        <div className="space-y-2">
        {categoryGroups.map(
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
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded-md text-white bg-gray-600 hover:bg-gray-500 transition-colors duration-150 shadow-sm  ${item.color || "bg-gray-700 hover:bg-gray-600"}`}
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
