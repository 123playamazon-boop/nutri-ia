import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Nutri IA — Sua dieta personalizada com IA",
  description: "Plano alimentar personalizado, diário nutricional e nutricionista IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geist.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background">{children}</div>
      </body>
    </html>
  );
}
