import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Fraunces, Caveat } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import { MobileAtmosphereProvider } from "@/lib/mobileAtmosphere";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dayflow — Personal Organizer",
  description:
    "Desktop life dashboard for tasks, money, learning, habits, schedule, and daily focus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${fraunces.variable} ${caveat.variable}`}
    >
      <body className="min-h-screen text-[var(--foreground)] bg-[var(--background)] antialiased selection:bg-[var(--sidebar)] selection:text-white">
        <AuthProvider>
          <MobileAtmosphereProvider>{children}</MobileAtmosphereProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

