import { AlertCircle, Info, Loader2, Scan, CheckCircle, AlertTriangle, Siren, Sigma } from "lucide-react";
import { CategoryGroup } from "@/config/categories";

interface RightSidebarProps {
  selectedCategory?: string;
  isLoading?: boolean;
  categoryGroups: CategoryGroup[];
  isScanning?: boolean;
  scanResult?: any;
  totalTokens?: number;
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

export function RightSidebar({ selectedCategory, isLoading, isScanning, scanResult, categoryGroups, totalTokens }: RightSidebarProps) {
  const selectedItem = categoryGroups.flatMap((g) => g.items).find(
    (i) => i.name === selectedCategory,
  );

  const explanation = selectedItem ? selectedItem.description : DEFAULT_EXPLANATION;

  return (
    <div className="hidden lg:block w-80 bg-background border-l border-border flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-transparent">
        <div className="flex items-start gap-2">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <h2 className="text-lg font-bold text-foreground">
            {explanation.title}
          </h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 flex flex-col">
        {/* Description */}
        <div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation.description}
          </p>
        </div>
        {selectedItem ? (
            <div className="h-64 overflow-y-auto p-3 bg-secondary border border-border rounded-md shadow-inner text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedItem.text}
            </div>
          ) : (
            <ul className="space-y-2">
              {explanation.details.map((detail, index) => (
                <li key={index} className="flex gap-3 text-sm">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                  </div>
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          )}


        {/* Chat Status Section */}
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h3 className="text-sm font-bold text-foreground mb-3">Chat Status</h3>
          
          {/* Token Counter */}
          <div className="flex items-center gap-3 p-3 bg-secondary border border-border rounded-lg mb-3">
            <Sigma size={20} className="text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-muted-foreground flex-1">Conversation Tokens</span>
            <span className="text-sm font-bold text-foreground">{totalTokens || 0}</span>
          </div>

          {/* Good Status */}
          {(!scanResult || (scanResult.action === "allow" && scanResult.category === "benign")) && (
            <div className="flex items-center gap-2 p-3 bg-green-900/30 border border-green-500/20 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
              <span className="text-sm font-medium text-green-300">Status: Good</span>
            </div>
          )}

          {/* Warning Status */}
          {scanResult && scanResult.action === "allow" && scanResult.category === "malicious" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-yellow-900/30 border border-yellow-500/20 rounded-lg">
                <AlertTriangle size={20} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-300">Status: Warning</span>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary p-2 rounded border border-border">
                <p className="font-semibold mb-1">Detections:</p>
                <p>Prompt: {JSON.stringify(scanResult.prompt_detected || "None")}</p>
                <p>Response: {JSON.stringify(scanResult.response_detected || "None")}</p>
              </div>
            </div>
          )}

          {/* Alarm Status */}
          {scanResult && scanResult.action !== "allow" && scanResult.category === "malicious" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-500/20 rounded-lg">
                <Siren size={20} className="text-red-600" />
                <span className="text-sm font-medium text-red-300">Status: Alarm</span>
              </div>
              <div className="text-xs text-muted-foreground bg-secondary p-2 rounded border border-border">
                <p className="font-semibold mb-1">Detections:</p>
                <p>Prompt: {JSON.stringify(scanResult.prompt_detected || "None")}</p>
                <p>Response: {JSON.stringify(scanResult.response_detected || "None")}</p>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-auto pt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-xs text-primary/80 flex gap-2">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>
              Select different category items to see their specific
              explanations.
            </span>
          </p>
        </div>
      </div>

      {/* Status Indicator */}
      {(isLoading || isScanning) && (
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-background/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-border animate-in fade-in slide-in-from-bottom-2">
          {isLoading ? (
            <>
              <Loader2 size={16} className="text-blue-600 animate-spin" />
              <span className="text-xs font-medium text-blue-600">Receiving response...</span>
            </>
          ) : (
            <>
              <Scan size={16} className="text-purple-600 animate-pulse" />
              <span className="text-xs font-medium text-purple-600">Scanning with Palo Alto Networks...</span>
            </>
          )}
        </div>
      )}      
    </div>
  );
}
