import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RapidRide - Cab Booking App",
  description: "Book your cab instantly with Stripe & Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-[#07080a] text-zinc-100 min-h-screen`}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
