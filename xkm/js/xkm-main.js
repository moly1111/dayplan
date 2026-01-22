function formatTime(date) {
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const mi = pad(date.getMinutes());
    const ss = pad(date.getSeconds());
    // 使用「日期 · 时间」形式，视觉上把日期和时间分开一些
    return `${yyyy}-${mm}-${dd} · ${hh}:${mi}:${ss}`;
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

  function initMusicPlayer() {
    const musicBtn = document.getElementById("music-btn");
    const rainMusic = document.getElementById("rain-music");
    const volumeSlider = document.getElementById("volume-slider");
    
    if (!musicBtn || !rainMusic) return;

    // 初始化音量（默认50%）
    if (volumeSlider) {
      rainMusic.volume = volumeSlider.value / 100;
      
      // 音量滑块变化时更新音频音量
      volumeSlider.addEventListener("input", (e) => {
        rainMusic.volume = e.target.value / 100;
      });
    }

    // 点击按钮切换播放/暂停
    musicBtn.addEventListener("click", () => {
      if (rainMusic.paused) {
        rainMusic.play().catch(err => {
          console.error("播放音乐失败:", err);
        });
        musicBtn.classList.add("playing");
      } else {
        rainMusic.pause();
        musicBtn.classList.remove("playing");
      }
    });

    // 监听音频播放状态，同步按钮状态
    rainMusic.addEventListener("play", () => {
      musicBtn.classList.add("playing");
    });

    rainMusic.addEventListener("pause", () => {
      musicBtn.classList.remove("playing");
    });

    // 处理音频加载错误
    rainMusic.addEventListener("error", (e) => {
      console.error("音频加载失败:", e);
      musicBtn.classList.remove("playing");
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initMusicPlayer();
    console.log("xkm-main ready");
  });
  