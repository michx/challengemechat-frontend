import { useState } from "react";
import { User, LogOut } from "lucide-react";

interface UserMenuProps {
  onLogout?: () => void;
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    onLogout?.();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white transition-all duration-200 hover:bg-blue-700 hover:-translate-y-1 shadow-md hover:shadow-lg active:translate-y-0"
        title="User Menu"
      >
        <User size={20} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 right-0 z-50 w-48 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <p className="text-sm font-semibold text-gray-900">User Menu</p>
              <p className="text-xs text-gray-600 mt-1">user@example.com</p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 transition-colors duration-150 flex items-center gap-2 active:scale-95"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
