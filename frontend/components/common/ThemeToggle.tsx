"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import type { ThemeId } from "@/lib/theme";

export default function ThemeToggle() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = (id: ThemeId) => {
    setTheme(id);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative" id="theme-toggle-wrapper">
      {/* Trigger button */}
      <button
        id="theme-toggle-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Switch colour theme"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="
          flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
          bg-[var(--color-surface)] border border-[var(--color-border)]
          text-gray-400 hover:text-white
          hover:border-[var(--color-accent)]
          transition-all duration-200 text-sm select-none
        "
      >
        <span className="text-base leading-none" aria-hidden="true">
          {theme.icon}
        </span>
        <span className="hidden sm:inline font-medium text-xs tracking-wide">
          {theme.label}
        </span>
        {/* Chevron */}
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="
            absolute right-0 top-full mt-2 w-48
            bg-[var(--color-surface)] border border-[var(--color-border)]
            rounded-xl shadow-2xl overflow-hidden
            animate-fade-in z-[9999]
          "
        >
          <div className="p-1.5 space-y-0.5">
            {themes.map((t) => {
              const isActive = t.id === theme.id;
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={isActive}
                  id={`theme-option-${t.id}`}
                  onClick={() => handleSelect(t.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                    transition-all duration-150 text-left
                    ${
                      isActive
                        ? "bg-[var(--color-accent-10)] text-[var(--color-accent)]"
                        : "text-gray-400 hover:text-white hover:bg-[var(--color-surface-alt)]"
                    }
                  `}
                >
                  {/* Colour swatch */}
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 ring-1 ring-white/10"
                    style={{ backgroundColor: t.vars["--color-accent"] }}
                  />
                  <span className="flex-1 font-medium">{t.label}</span>
                  {/* Active checkmark */}
                  {isActive && (
                    <svg
                      className="w-3.5 h-3.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-[var(--color-border)] text-[10px] text-gray-600 text-center">
            Theme saved automatically
          </div>
        </div>
      )}
    </div>
  );
}
