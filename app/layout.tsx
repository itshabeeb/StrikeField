import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lightning Risk Assessment",
  description: "Interactive IEC 62305 engineering screening dashboard",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
