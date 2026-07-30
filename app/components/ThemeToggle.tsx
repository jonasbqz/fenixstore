"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.add("light-theme");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light-theme");
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "light") {
      document.documentElement.classList.add("light-theme");
    } else {
      document.documentElement.classList.remove("light-theme");
    }
  }

  if (!mounted) {
    return (
      <div className="h-8 w-15 rounded-full bg-zinc-900 border border-zinc-800 shrink-0" />
    );
  }

  const isLight = theme === "light";

  return (
    <div className="flex items-center gap-1.5 shrink-0 select-none">
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggleTheme}
        className={`relative h-8 w-14 rounded-full p-1 transition-colors duration-300 flex items-center justify-between cursor-pointer border ${
          isLight
            ? "bg-amber-100 border-amber-300 shadow-inner"
            : "bg-[#131622] border-[#2f3549] shadow-inner"
        }`}
        title={isLight ? "Cambiar a Modo Oscuro 🌙" : "Cambiar a Modo Claro ☀️"}
      >
        <Moon className={`h-3.5 w-3.5 z-10 transition-colors ml-0.5 ${isLight ? "text-slate-400" : "text-[#f5b942]"}`} />
        <Sun className={`h-3.5 w-3.5 z-10 transition-colors mr-0.5 ${isLight ? "text-amber-600" : "text-zinc-600"}`} />

        {/* THUMB DESLIZANTE ESTILO INTERRUPTOR TÁCTIL */}
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`absolute top-0.5 bottom-0.5 w-6 rounded-full shadow-md ${
            isLight
              ? "right-0.5 bg-amber-500"
              : "left-0.5 bg-[#f5b942]"
          }`}
        />
      </button>
    </div>
  );
}
