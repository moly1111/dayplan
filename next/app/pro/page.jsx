"use client";
import "../globals.css";

export default function ProPage() {
  return (
    <main className="page-shell">
      <h1 className="page-title">dayplan Pro 工具区（Next.js 版本 - WIP）</h1>
      <p className="page-subtitle">
        将来这里会集成各种公开工具（专注计时器、统计分析等），目前暂时只是占位页面。
      </p>
      <div className="link-list">
        <a href="/pro">查看当前静态版 /pro 页面（如果有）</a>
        <a href="/">返回 dayplan 首页</a>
      </div>
    </main>
  );
}

