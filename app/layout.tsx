import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Harness 的 9 层参考架构",
  description: "检查清单与自测",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
