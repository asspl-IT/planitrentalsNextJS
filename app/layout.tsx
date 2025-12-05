"use client";

import "./globals.css";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { CartProvider } from "@/context/cartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900" suppressHydrationWarning={true}>
        <CategoriesProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-[100px] min-h-screen">
              {children}
            </main>

            <Footer />
          </CartProvider>
        </CategoriesProvider>
      </body>
    </html>
  );
}
