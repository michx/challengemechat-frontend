import { AlertCircle, Info } from "lucide-react";
import { CATEGORY_GROUPS } from "@/config/categories";

interface RightSidebarProps {
  selectedCategory?: string;
}



const DEFAULT_EXPLANATION = {
  title: "Welcome to AI Chat Hub",
  description:
    "Select a category from the left sidebar to explore different AI capabilities and features.",
  details: [
    "Ethics: Ensure fair, transparent, and accountable AI",
    "Cyber: Protect systems from threats and vulnerabilities",
    "Toxic: Filter and moderate harmful content",
  ],
};

export function RightSidebar({ selectedCategory }: RightSidebarProps) {
  const selectedItem = CATEGORY_GROUPS.flatMap((g) => g.items).find(
    (i) => i.name === selectedCategory,
  );

  const explanation = selectedItem ? selectedItem.description : DEFAULT_EXPLANATION;

  return (
    <div className="hidden lg:block w-80 bg-gradient-to-b from-blue-50 to-indigo-50 border-l border-border flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-white">
        <div className="flex items-start gap-2">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <h2 className="text-lg font-bold text-gray-900">
            {explanation.title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Description */}
        <div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {explanation.description}
          </p>
        </div>

        {/* Details List */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
            Key Points
          </h3>
          <ul className="space-y-2">
            {explanation.details.map((detail, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-gray-700">{detail}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Info Box */}
        <div className="mt-auto pt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-xs text-blue-900 flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Select different category items to see their specific
              explanations.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
