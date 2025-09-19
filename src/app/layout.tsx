import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-provider";
import ColorProvider from "@/components/providers/color-provider";
import LoadingProvider from "@/components/providers/loading-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "S.N. Pvt. Industrial Training Institute",
  description: "Approved by Directorate of Technical Education, Govt. of Rajasthan. Affiliated to NCVT (DGE&T) Govt. of India since 2009",
  icons: {
    icon: '/snitilogo.png',
    shortcut: '/snitilogo.png',
    apple: '/snitilogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LoadingProvider>
          <ColorProvider>
            <AuthSessionProvider>
              {children}
              <Toaster />
            </AuthSessionProvider>
          </ColorProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
