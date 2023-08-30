import { AuthProvider } from "@/context/AuthProvider";
import OpenAIProvider from "@/context/OpenAIProvider";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Check that PostHog is client-side
if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

export default function App({ Component, pageProps }: AppProps) {
  if (typeof window !== "undefined") {
    const isDarkSet = localStorage.theme === "dark";
    const isThemeStored = "theme" in localStorage;
    const isDarkPrefered = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (isDarkSet || (!isThemeStored && isDarkPrefered)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return (
    <>
      <PostHogProvider client={posthog}>
        <AuthProvider>
          <OpenAIProvider>
            <Component {...pageProps} />
          </OpenAIProvider>
        </AuthProvider>
        <Analytics />
      </PostHogProvider>
    </>
  );
}
