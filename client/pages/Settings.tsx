import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Eye, EyeOff, Check, Bot, Shield, Globe, Database } from "lucide-react";

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
}

interface ModelSelection {
  openaiModel: string;
  geminiModel: string;
  claudeModel: string;
  ollamaModel: string;
}

const DEFAULT_MODELS: ModelSelection = {
  openaiModel: "gpt-4o",
  geminiModel: "gemini-2.0-flash",
  claudeModel: "claude-3-5-sonnet-20241022",
  ollamaModel: "llama3",
};

const PROVIDER_MODELS = {
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
  ollama: [
    { label: "Llama 3", value: "llama3" },
    { label: "Mistral", value: "mistral" },
    { label: "Gemma", value: "gemma" },
    { label: "Phi 3", value: "phi3" },
  ],
};

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
      };
    }
  });

  const [models, setModels] = useState<ModelSelection>(() => {
    try {
      const saved = localStorage.getItem("modelSelection");
      return saved ? JSON.parse(saved) : DEFAULT_MODELS;
    } catch {
      return DEFAULT_MODELS;
    }
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

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    setApiKeys((prev) => ({ ...prev, [provider]: value }));
    setError("");
  };

  const handleModelChange = (provider: keyof ModelSelection, value: string) => {
    setModels((prev) => ({ ...prev, [provider]: value }));
  };

  const handleSave = async () => {
    try {
      // Save to localStorage
      localStorage.setItem("apiKeys", JSON.stringify(apiKeys));
      localStorage.setItem("modelSelection", JSON.stringify(models));

      // Send to backend to set environment variables
      const response = await fetch("/api/settings/save-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: apiKeys,
          models: models,
        }),
      });

      if (!response.ok) {
        setError("Failed to save settings");
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
                {/* OpenAI */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    OpenAI
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKeys.openai ? "text" : "password"}
                        value={apiKeys.openaiKey}
                        onChange={(e) => handleKeyChange("openaiKey", e.target.value)}
                        placeholder="sk-..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                      <button
                        onClick={() =>
                          setShowKeys((prev) => ({ ...prev, openai: !prev.openai }))
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys.openai ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <select
                      value={models.openaiModel}
                      onChange={(e) =>
                        handleModelChange("openaiModel", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50"
                    >
                      {PROVIDER_MODELS.openai.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Get key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com</a>
                    </p>
                  </div>
                </div>

                {/* Google Gemini */}
                <div className="pt-6 border-t border-gray-100">
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
                    <select
                      value={models.geminiModel}
                      onChange={(e) =>
                        handleModelChange("geminiModel", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50"
                    >
                      {PROVIDER_MODELS.gemini.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Get key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a>
                    </p>
                  </div>
                </div>

                {/* Anthropic Claude */}
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Anthropic Claude
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKeys.claude ? "text" : "password"}
                        value={apiKeys.claudeKey}
                        onChange={(e) => handleKeyChange("claudeKey", e.target.value)}
                        placeholder="sk-ant-..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                      <button
                        onClick={() =>
                          setShowKeys((prev) => ({ ...prev, claude: !prev.claude }))
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys.claude ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <select
                      value={models.claudeModel}
                      onChange={(e) =>
                        handleModelChange("claudeModel", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50"
                    >
                      {PROVIDER_MODELS.claude.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500">
                      Get key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
                    </p>
                  </div>
                </div>

                {/* Ollama */}
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ollama (Local)
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={apiKeys.ollamaEndpoint}
                        onChange={(e) => handleKeyChange("ollamaEndpoint", e.target.value)}
                        placeholder="http://localhost:11434"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                    </div>
                    <select
                      value={models.ollamaModel}
                      onChange={(e) =>
                        handleModelChange("ollamaModel", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition bg-gray-50"
                    >
                      {PROVIDER_MODELS.ollama.map((model) => (
                        <option key={model.value} value={model.value}>
                          {model.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* HuggingFace */}
                <div className="pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    HuggingFace
                  </label>
                  <div className="space-y-3">
                    <div className="relative">
                      <input
                        type={showKeys.huggingface ? "text" : "password"}
                        value={apiKeys.huggingfaceKey}
                        onChange={(e) => handleKeyChange("huggingfaceKey", e.target.value)}
                        placeholder="hf_..."
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                      />
                      <button
                        onClick={() =>
                          setShowKeys((prev) => ({ ...prev, huggingface: !prev.huggingface }))
                        }
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showKeys.huggingface ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Get key from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">huggingface.co</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Custom & Security */}
          <div className="space-y-6">
            {/* Custom API */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <h2 className="font-semibold text-gray-900">Custom Endpoints</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={apiKeys.customEndpoint}
                    onChange={(e) =>
                      handleKeyChange("customEndpoint", e.target.value)
                    }
                    placeholder="https://api.example.com/v1/chat"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Headers (JSON)
                  </label>
                  <textarea
                    value={apiKeys.customHeaders}
                    onChange={(e) =>
                      handleKeyChange("customHeaders", e.target.value)
                    }
                    placeholder='{"Authorization": "Bearer token"}'
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition font-mono text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </div>

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
