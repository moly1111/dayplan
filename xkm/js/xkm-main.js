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
  
  function initClock() {
    const clock = document.getElementById("xkm-clock");
    if (!clock) return;
    const tick = () => {
      const now = new Date();
      clock.textContent = formatTime(now);
    };
    tick();
    setInterval(tick, 1000);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initClock();
    console.log("xkm-main ready");
  });
  