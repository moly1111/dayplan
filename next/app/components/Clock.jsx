"use client";

import { useState, useEffect } from 'react';

function formatTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

export default function Clock() {
  const [time, setTime] = useState('--:--:--');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(formatTime(now));
    };
    
    tick(); // 立即显示一次
    const interval = setInterval(tick, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="xkm-clock" className="xkm-clock">
      {time}
    </div>
  );
}

