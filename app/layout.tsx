import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import "./globals.css";
import { getUserSession } from '@/lib/session'
import { SessionProvider } from '@/lib/SessionProvider';
import Header from "./ui/Header"
import Footer from "./ui/Footer"

export const metadata: Metadata = {
  title: "Agri Connect",
  description: "Platform for direct farmer and consumer relations",
  icons: {
    icon: '/agri-conn-logo.png' // Make sure this starts with a slash!
  }
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
            {/* The Header and Footer will now manage their own visibility */}
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}