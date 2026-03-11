import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Eye, EyeOff, Check, Bot, Shield, Globe, Database, Library } from "lucide-react";
import { getCategoryItems, saveCategoryItems } from "@/config/categories";

interface APIKeys {
  openaiKey: string;
  geminiKey: string;
  claudeKey: string;
  huggingfaceKey: string;
  prismaAirsKey: string;
  ollamaEndpoint: string;
  prismaAirsProfileName: string;
  prismaAirsProfileId: string;
  customEndpoint: string;
  customHeaders: string;
  enableSecurityCheck: boolean;
  prismaAirsEndpoint: string;
}

export default function Settings() {
  const navigate = useNavigate();
  const [apiKeys, setApiKeys] = useState<APIKeys>(() => {
    try {
      const defaults = {
        openaiKey: "",
        geminiKey: "",
        claudeKey: "",
        ollamaEndpoint: "http://localhost:11434",
        huggingfaceKey: "",
        customEndpoint: "",
        customHeaders: "",
        prismaAirsKey: "",
        prismaAirsProfileName: "",
        prismaAirsProfileId: "",
        enableSecurityCheck: true,
        prismaAirsEndpoint: "http://localhost:5001",
      };
      const saved = localStorage.getItem("apiKeys");
      return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
    } catch {
      return {
        openaiKey: "",
        geminiKey: "",
        claudeKey: "",
        ollamaEndpoint: "http://localhost:11434",
        huggingfaceKey: "",
        customEndpoint: "",
        customHeaders: "",
        prismaAirsKey: "",
        prismaAirsProfileName: "",
        prismaAirsProfileId: "",
        enableSecurityCheck: true,
        prismaAirsEndpoint: "http://localhost:5001",
      };
    }
  });

  const [categoryItemsJson, setCategoryItemsJson] = useState(() => {
    const items = getCategoryItems();
    return JSON.stringify(items, null, 2);
  });

  const [showKeys, setShowKeys] = useState({
    openai: false,
    gemini: false,
    claude: false,
    huggingface: false,
    prismaAirs: false,
  });

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleKeyChange = (provider: keyof APIKeys, value: string | boolean) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
    setError("");
  };

  const handleSave = async () => {
    try {
      // Save to localStorage
      localStorage.setItem("apiKeys", JSON.stringify(apiKeys));

      try {
        const parsedItems = JSON.parse(categoryItemsJson);
        saveCategoryItems(parsedItems);
      } catch (e) {
        setError("Invalid JSON format for category items.");
        return;
      }

      // Send to backend to set environment variables
      const response = await fetch("/api/settings/save-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: apiKeys,
        }),
      });

      if (!response.ok) {
        setError((prev) => prev ? prev + " | Failed to save API keys to server." : "Failed to save API keys to server.");
        return;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
            <p className="text-gray-500 mt-1">
              Configure your AI providers and security preferences
            </p>
          </div>
          <button
            onClick={handleSave}
            className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Main Providers */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Bot className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">AI Providers</h2>
              </div>
              <div className="p-6 space-y-8">
                {/* Google Gemini */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Google Gemini
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKeys.gemini ? "text" : "password"}
                        value={apiKeys.geminiKey}
                        onChange={(e) => handleKeyChange("geminiKey", e.target.value)}
                        placeholder="AIza..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                      <button
                        onClick={() =>
                          setShowKeys((prev) => ({ ...prev, gemini: !prev.gemini }))
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys.gemini ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Get key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a>
                    </p>
                    <p className="text-xs text-gray-500">Model: Gemini 2.0 Flash (hardcoded)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom & Security */}
          <div className="space-y-6">
            {/* Prisma Cloud AI Runtime Security */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h2 className="font-semibold text-gray-900">Security & Compliance</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg mb-4">
                  Configure Prisma Cloud AI Runtime Security to scan prompts and responses for threats.
                </div>

                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900">
                      Enable Security Scan
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Automatically scan prompts and responses
                    </p>
                  </div>
                  <button
                    onClick={() => handleKeyChange("enableSecurityCheck", !apiKeys.enableSecurityCheck)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                      apiKeys.enableSecurityCheck ? "bg-blue-600" : "bg-gray-200"
                    }`}
                    type="button"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        apiKeys.enableSecurityCheck ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    x-pan-token (API Key)
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys.prismaAirs ? "text" : "password"}
                      value={apiKeys.prismaAirsKey}
                      onChange={(e) =>
                        handleKeyChange("prismaAirsKey", e.target.value)
                      }
                      placeholder="Enter your Prisma Cloud API Key"
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                    <button
                      onClick={() =>
                        setShowKeys((prev) => ({
                          ...prev,
                          prismaAirs: !prev.prismaAirs,
                        }))
                      }
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showKeys.prismaAirs ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Profile Name
                    </label>
                    <input
                      type="text"
                      value={apiKeys.prismaAirsProfileName}
                      onChange={(e) =>
                        handleKeyChange("prismaAirsProfileName", e.target.value)
                      }
                      placeholder="e.g., My-Security-Profile"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Profile ID
                    </label>
                    <input
                      type="text"
                      value={apiKeys.prismaAirsProfileId}
                      onChange={(e) =>
                        handleKeyChange("prismaAirsProfileId", e.target.value)
                      }
                      placeholder="Optional if Name is provided"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Prisma AIRS Endpoint
                  </label>
                  <input
                    type="text"
                    value={apiKeys.prismaAirsEndpoint}
                    onChange={(e) =>
                      handleKeyChange("prismaAirsEndpoint", e.target.value)
                    }
                    placeholder="http://localhost:5001"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Custom Prompts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Library className="w-5 h-5 text-orange-600" />
                <h2 className="font-semibold text-gray-900">Prompt Library</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg">
                  Edit the JSON below to customize the prompt categories (Ethics, Cyber, Toxic).
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category Items (JSON)
                  </label>
                  <textarea
                    value={categoryItemsJson}
                    onChange={(e) =>
                      setCategoryItemsJson(e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-mono text-sm"
                    rows={15}
                  />
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> API keys are stored locally in your browser
                and sent securely to the server. Never share your API keys with
                others.
              </p>
            </div>
          </div>
        </div>

        {/* Mobile Save Button */}
        <div className="md:hidden mt-8">
          <button
            onClick={handleSave}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save Changes
          </button>
        </div>

        {/* Success Toast */}
        {saved && (
          <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-5 z-50">
            <Check size={18} className="text-green-400" />
            <span className="font-medium">Settings saved successfully</span>
          </div>
        )}
      </div>
    </div>
  );
}
