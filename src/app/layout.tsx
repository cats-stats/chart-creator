import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "'Cats Stats - Basketball Chart Utility",
};

const robotoCondensed = Roboto_Condensed({
  weight: "variable",
  variable: "--font-robotoCondensed",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${robotoCondensed.variable}`}>
        {children}
      </body>
    </html>
  );
}
