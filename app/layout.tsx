import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import "./globals.css";
import { getUserSession } from '@/lib/session';
import { SessionProvider } from '@/lib/SessionProvider';
import Header from "./ui/Header";
import Footer from "./ui/Footer";
import AIAssistantDrawer from "./ui/AIAssistantDrawer";

export const metadata: Metadata = {
  title: "Agri Connect",
  description: "Platform for direct farmer and consumer relations",
  icons: {
    icon: '/agri-conn-logo.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getUserSession();

  return (
    <html lang="en">
      <body className="relative h-screen flex flex-col">
        <NextIntlClientProvider>
          <SessionProvider session={session}>
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <AIAssistantDrawer />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}