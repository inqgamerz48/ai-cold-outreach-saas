import type { Metadata } from "next";
import { Cinzel, Manrope } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NEXUS | Lead Generation Engine",
  description: "Advanced Data Extraction & Intelligence System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${cinzel.variable} ${manrope.variable} font-body bg-void text-primary antialiased`}>
        <div className="flex bg-void min-h-screen">
          <Sidebar />
          <main className="ml-64 flex-1 relative z-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
