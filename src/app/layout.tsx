import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Vara — Regulation, decoded.",
  description:
    "Regulatory change intelligence for SRA-regulated UK law firms. Monitor, interpret, and act on compliance updates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-vara-dark">{children}</body>
    </html>
  );
}
