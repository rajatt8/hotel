import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hotel Midway",
  description: "Luxury hotel booking website - Book your stay at Hotel Midway",
  keywords: "hotel, booking, rooms, luxury hotel, hotel midway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="google-site-verification" content="0d4Ci9NCslJZERuorzyNgeACNWDT3OLF34bZjCH3p_o" />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}