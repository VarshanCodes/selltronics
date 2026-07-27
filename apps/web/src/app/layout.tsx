import "./globals.css";
import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "SellTronics | Buy & Sell Used Electronics",
  description: "The premium re-commerce platform for your devices.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-space bg-[#F3ECFF] min-h-screen text-[#1E1B29] flex flex-col">
        <Navbar />
        
        {/* Main content takes up the remaining space */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}
