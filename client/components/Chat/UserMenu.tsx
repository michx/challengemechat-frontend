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
        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-lg active:translate-y-0"
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
          <div className="absolute top-12 right-0 z-50 w-48 bg-background border border-border rounded-lg shadow-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30">
              <p className="text-sm font-semibold text-foreground">User Menu</p>
              <p className="text-xs text-muted-foreground mt-1">
                user@example.com
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors duration-150 flex items-center gap-2 active:scale-95"
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
