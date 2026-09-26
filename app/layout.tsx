import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "CE Strategies — Crisis Response Informatics",
  description: "Disaster triage and situational awareness platform for 2013 Calgary flood data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
          CE Strategies Disaster Informatics Challenge • Powered by Next.js & PostgreSQL
        </footer>
      </body>
    </html>
  );
}
