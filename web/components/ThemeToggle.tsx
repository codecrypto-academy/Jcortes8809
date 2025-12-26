"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    // Detectar tema inicial del DOM y localStorage
    const savedTheme = localStorage.getItem("theme");
    const isDark = document.documentElement.classList.contains("dark");

    // Usar el tema guardado o el del DOM
    const currentTheme = savedTheme as "light" | "dark" || (isDark ? "dark" : "light");
    setTheme(currentTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    // Leer el tema actual del DOM para evitar desfases
    const currentIsDark = document.documentElement.classList.contains("dark");
    const newTheme = currentIsDark ? "light" : "dark";

    // Actualizar DOM
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Actualizar estado
    setTheme(newTheme);

    // Guardar en localStorage
    localStorage.setItem("theme", newTheme);
  };

  // Evitar flash de contenido durante hidratación
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        disabled
      >
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
