import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NaijaPredictor",
  description: "A Nigerian-centric parimutuel prediction market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="container" style={{ padding: '2rem 1.5rem' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
