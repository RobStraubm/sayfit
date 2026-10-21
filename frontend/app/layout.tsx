import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/system/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SayFit — AI Nutrition Logbook",
  description: "Voice-to-nutrition food logger powered by AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full`}
      style={{ fontFamily: "var(--font-inter, system-ui, sans-serif)" }}
    >
      <body className="h-full overflow-hidden bg-[#0A0A0F] text-[#E8E8F0]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
