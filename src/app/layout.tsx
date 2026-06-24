import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { StoreProvider } from "@/lib/store-context";
import { LanguageProvider } from "@/lib/i18n-context";

export const metadata: Metadata = {
  title: "Interlub | Plataforma Global de Extrusión de Aluminio",
  description: "Plataforma centralizada de gestión de plantas de extrusión de aluminio — Interlub Group",
  keywords: "extrusión aluminio, lubricación industrial, Interlub, prensas, gestión de plantas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          <LanguageProvider>
            <StoreProvider>
              {children}
            </StoreProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
