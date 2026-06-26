"use client"

import { useTheme } from "next-themes"
import { Toaster as HotToaster } from "react-hot-toast"

export function Toaster() {
  const { theme } = useTheme()

  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#1f2937" : "#ffffff",
          color: theme === "dark" ? "#ffffff" : "#1f2937",
          border: theme === "dark" ? "1px solid #374151" : "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "12px 16px",
        },
        success: {
          iconTheme: {
            primary: theme === "dark" ? "#10b981" : "#10b981",
            secondary: theme === "dark" ? "#ffffff" : "#ffffff",
          },
        },
        error: {
          iconTheme: {
            primary: theme === "dark" ? "#ef4444" : "#ef4444",
            secondary: theme === "dark" ? "#ffffff" : "#ffffff",
          },
        },
      }}
    />
  )
}