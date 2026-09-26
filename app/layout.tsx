import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SmoothScroll } from "@/components/smooth-scroll";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
});

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
    <html lang="en" className={`dark ${hankenGrotesk.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased flex">
        <SmoothScroll>
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
