"use client";

import "./globals.css";
import { CategoriesProvider } from "@/context/CategoriesContext";
import { CartProvider } from "@/context/cartContext"; // ✅ Import this
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <CategoriesProvider>
          <CartProvider> {/* ✅ Wrap everything that uses useCart */}
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
