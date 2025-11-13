// components/ClientProviders.tsx
"use client";

import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import TagManager from "react-gtm-module";

interface ClientProvidersProps {
  children: React.ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  useEffect(() => {
    // Initialize Google Tag Manager
    TagManager.initialize({ gtmId: "GTM-TF6SLFN" });
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="rounded-lg shadow-lg"
        bodyClassName="text-sm font-medium"
      />

      {/* Render Children */}
      {children}
    </>
  );
}