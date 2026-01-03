import "./globals.css";

export const metadata = {
  title: "dayplan (Next.js)",
  description: "Minimal planner - Next.js version (WIP)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}

