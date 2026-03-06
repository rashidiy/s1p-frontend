import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdProvider } from "@/components/providers/AntdProvider";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "S1P - Customer Relationship Management",
  description: "CRM application for managing customer relationships and calls",
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
      <body className={inter.className}>
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
