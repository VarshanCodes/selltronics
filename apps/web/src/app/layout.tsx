import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import Footer from "../components/Footer";
import BottomMobileNav from "./components/BottomMobileNav";

export const metadata: Metadata = {
  title: "SellTronics | Buy & Sell Used Electronics",
  description: "The premium re-commerce platform for your devices.",
  icons: {
    icon: [
      { url: 'https://ik.imagekit.io/mzpoxy1gg/Picsart_26-10-27_16-51-36-713.png' },
      { url: '/icon.png' },
      { url: '/favicon.ico' },
    ],
    apple: [
      { url: 'https://ik.imagekit.io/mzpoxy1gg/Picsart_26-10-27_16-51-36-713.png' },
      { url: '/apple-icon.png' },
    ],
    shortcut: ['https://ik.imagekit.io/mzpoxy1gg/Picsart_26-10-27_16-51-36-713.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-space bg-[#F3ECFF] min-h-screen text-[#1E1B29] flex flex-col pb-16 sm:pb-0">
        <Navbar />
        
        {/* Main content takes up the remaining space */}
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        <BottomMobileNav />
        <Analytics />
      </body>
    </html>
  );
}
