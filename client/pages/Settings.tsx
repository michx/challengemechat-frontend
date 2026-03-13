import { useState } from "react";
import { Save, Check, Library, Key } from "lucide-react";
import { getCategoryItems, saveCategoryItems } from "@/config/categories";
import { apiSettings } from "@/config/settings";

export default function Settings() {
  const [categoryItemsJson, setCategoryItemsJson] = useState(() => {
    const items = getCategoryItems();
    return JSON.stringify(items, null, 2);
  });

  const [prismaApiKey, setPrismaApiKey] = useState(() => localStorage.getItem("prismaApiKey") || "");
  const [prismaAirsEndpoint, setPrismaAirsEndpoint] = useState(() => localStorage.getItem("prismaAirsEndpoint") || "");
  const [prismaAirsProfileId, setPrismaAirsProfileId] = useState(() => localStorage.getItem("prismaAirsProfileId") || "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      try {
        const parsedItems = JSON.parse(categoryItemsJson);
        saveCategoryItems(parsedItems);
        localStorage.setItem("prismaApiKey", prismaApiKey);
        localStorage.setItem("prismaAirsEndpoint", prismaAirsEndpoint);
        localStorage.setItem("prismaAirsProfileId", prismaAirsProfileId);
      } catch (e) {
        setError("Invalid JSON format for category items.");
        return;
      }

      // Send to backend to set environment variables
      const response = await fetch("/api/settings/save-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keys: {
            ...apiSettings,
            prismaAirsKey: prismaApiKey,
            prismaAirsEndpoint: prismaAirsEndpoint,
            prismaAirsProfileId: prismaAirsProfileId,
          },
          models: {},
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
              Configure your prompt library
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

        {/* API Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Key className="w-5 h-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900">API Configuration</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Prisma AIRS API Key</label>
                <input
                  type="password"
                  value={prismaApiKey}
                  onChange={(e) => setPrismaApiKey(e.target.value)}
                  placeholder="Enter your Prisma Cloud API Key"
                  className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm font-mono"
                />
                <p className="text-xs text-gray-500">Required for real-time security scanning.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Prisma AIRS API URL</label>
                <input
                  type="text"
                  value={prismaAirsEndpoint}
                  onChange={(e) => setPrismaAirsEndpoint(e.target.value)}
                  placeholder="e.g., http://localhost:5001"
                  className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm font-mono"
                />
                <p className="text-xs text-gray-500">The endpoint for the Prisma AIRS service.</p>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">Prisma AIRS Profile ID</label>
                <input
                  type="text"
                  value={prismaAirsProfileId}
                  onChange={(e) => setPrismaAirsProfileId(e.target.value)}
                  placeholder="Enter your Prisma AIRS Profile ID"
                  className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition text-sm font-mono"
                />
                <p className="text-xs text-gray-500">The security profile ID to use for scanning.</p>
              </div>
            </div>
          </div>
        </div>

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
