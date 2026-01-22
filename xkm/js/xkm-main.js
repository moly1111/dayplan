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
    
    if (!musicBtn || !rainMusic) {
      console.error("音乐播放器初始化失败: 缺少必要元素", { musicBtn, rainMusic });
      return;
    }

    // 检查音频源
    const audioSource = rainMusic.querySelector("source");
    if (audioSource) {
      console.log("音频文件路径:", audioSource.src);
    }

    // 初始化音量（默认50%）
    if (volumeSlider) {
      rainMusic.volume = volumeSlider.value / 100;
      
      // 音量滑块变化时更新音频音量
      volumeSlider.addEventListener("input", (e) => {
        rainMusic.volume = e.target.value / 100;
      });
    }

    // 监听音频加载状态
    rainMusic.addEventListener("loadstart", () => {
      console.log("开始加载音频文件");
    });

    rainMusic.addEventListener("loadeddata", () => {
      console.log("音频数据加载完成");
      // 检查文件大小
      if (rainMusic.duration && rainMusic.duration < 0.1) {
        console.warn("警告: 音频文件可能不完整，时长过短:", rainMusic.duration);
      }
    });

    rainMusic.addEventListener("canplay", () => {
      console.log("音频可以播放");
    });

    rainMusic.addEventListener("loadedmetadata", () => {
      console.log("音频元数据加载完成", {
        duration: rainMusic.duration,
        readyState: rainMusic.readyState
      });
    });

    // 点击按钮切换播放/暂停
    musicBtn.addEventListener("click", () => {
      if (rainMusic.paused) {
        console.log("尝试播放音频，当前状态:", {
          paused: rainMusic.paused,
          readyState: rainMusic.readyState,
          networkState: rainMusic.networkState,
          src: audioSource?.src
        });
        rainMusic.play().catch(err => {
          console.error("播放音乐失败:", err);
          console.error("错误详情:", {
            name: err.name,
            message: err.message,
            code: rainMusic.error?.code,
            message: rainMusic.error?.message
          });
          musicBtn.classList.remove("playing");
        });
        musicBtn.classList.add("playing");
      } else {
        rainMusic.pause();
        musicBtn.classList.remove("playing");
      }
    });

    // 监听音频播放状态，同步按钮状态
    rainMusic.addEventListener("play", () => {
      console.log("音频开始播放");
      musicBtn.classList.add("playing");
    });

    rainMusic.addEventListener("pause", () => {
      musicBtn.classList.remove("playing");
    });

    // 处理音频加载错误
    rainMusic.addEventListener("error", (e) => {
      const error = rainMusic.error;
      let errorMsg = "音频加载失败";
      
      if (error) {
        switch(error.code) {
          case 1: // MEDIA_ERR_ABORTED
            errorMsg = "音频加载被中止";
            break;
          case 2: // MEDIA_ERR_NETWORK
            errorMsg = "网络错误，无法加载音频文件";
            break;
          case 3: // MEDIA_ERR_DECODE
            errorMsg = "音频文件解码失败（文件可能损坏或不完整）";
            break;
          case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
            errorMsg = "音频格式不支持或文件路径错误";
            break;
          default:
            errorMsg = `音频加载失败: ${error.message || "未知错误"}`;
        }
      }
      
      console.error(errorMsg, {
        code: error?.code,
        message: error?.message,
        networkState: rainMusic.networkState,
        readyState: rainMusic.readyState,
        src: audioSource?.src,
        duration: rainMusic.duration
      });
      
      // 如果文件太小，提示可能是文件未完整上传
      if (rainMusic.duration !== undefined && rainMusic.duration < 0.1) {
        console.error("⚠️ 文件可能不完整！Vercel 可能没有完整上传大文件（185MB）。建议：");
        console.error("1. 压缩音频文件到更小尺寸（推荐 < 10MB）");
        console.error("2. 或使用外部 CDN 存储音频文件");
        console.error("3. 或检查 Vercel 部署日志确认文件是否完整上传");
      }
      
      musicBtn.classList.remove("playing");
    });
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initMusicPlayer();
    console.log("xkm-main ready");
  });
  