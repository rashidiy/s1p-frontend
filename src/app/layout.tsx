import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "S1P - CRM for Call Centers",
    template: "%s | S1P",
  },
  description: "CRM platform for call centers. Manage contacts, leads, deals, and calls with Telegram integration. Built for the CIS market.",
  openGraph: {
    title: "S1P - CRM for Call Centers",
    description: "CRM platform for call centers. Manage contacts, leads, deals, and calls with Telegram integration.",
    type: "website",
    siteName: "S1P",
  },
  twitter: {
    card: "summary",
    title: "S1P - CRM for Call Centers",
    description: "CRM platform for call centers with Telegram integration.",
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#08090a",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="theme-color" content="#08090a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={inter.className} style={{ backgroundColor: '#08090a' }}>
        <NextIntlClientProvider messages={messages}>
          <AntdProvider>{children}</AntdProvider>
        </NextIntlClientProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
            style: { borderRadius: '12px' },
          }}
        />
      </body>
    </html>
  );
}
