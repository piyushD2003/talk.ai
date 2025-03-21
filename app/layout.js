import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ModalProvider } from "@/context/ModalContext";

export const metadata = {
  title: "AI Based Job Cracker",
  description: "AI Based Job Cracker",
};

export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <body className="bg-gradient-to-r from-slate-500 to-slate-800">
        <SessionWrapper>
        <ModalProvider>
          <Navbar/>
          <div className="min-h-screen pt-[1.70cm]">{children}</div>
          <Footer/>
          </ModalProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
