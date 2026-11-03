import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Caveat } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Personal Life & Finance Organizer",
  description:
    "Private, mobile-friendly command center for tasks, schedule, debts, budgets, career growth, habits, and daily focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${caveat.variable}`}>
      <body className="min-h-screen text-[#1A1D20] bg-[#F7F5F0] antialiased selection:bg-[#191D23] selection:text-white">
        {children}
      </body>
    </html>
  );
}

