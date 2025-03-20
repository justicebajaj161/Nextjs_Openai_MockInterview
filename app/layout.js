import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Mock Interview Model",
  description: "AI Mock Interview Model is an application made by Aditya and Manish, using next.js and openai. This can take interview of students based on their role and skill",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="luxury">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
