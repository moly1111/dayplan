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
    const fireMusic = document.getElementById("fire-music");
    const volumeSlider = document.getElementById("volume-slider");
    
    if (!musicBtn || !rainMusic || !fireMusic) {
      console.error("音乐播放器初始化失败: 缺少必要元素", { musicBtn, rainMusic, fireMusic });
      return;
    }

    // 获取当前白噪音类型设置
    const settings = typeof Storage !== 'undefined' ? Storage.getSettings() : {};
    const whiteNoiseType = settings.whiteNoiseType || 'rain';
    let currentMusic = whiteNoiseType === 'fire' ? fireMusic : rainMusic;

    // 检查音频源
    const rainSource = rainMusic.querySelector("source");
    const fireSource = fireMusic.querySelector("source");
    if (rainSource) {
      console.log("雨声音频文件路径:", rainSource.src);
    }
    if (fireSource) {
      console.log("篝火声音频文件路径:", fireSource.src);
    }

    // 初始化音量（默认50%）
    if (volumeSlider) {
      const volume = volumeSlider.value / 100;
      rainMusic.volume = volume;
      fireMusic.volume = volume;
      
      // 音量滑块变化时更新音频音量
      volumeSlider.addEventListener("input", (e) => {
        const newVolume = e.target.value / 100;
        rainMusic.volume = newVolume;
        fireMusic.volume = newVolume;
      });
    }

    // 监听音频加载状态
    function setupAudioListeners(audio, name) {
      audio.addEventListener("loadstart", () => {
        console.log(`开始加载${name}音频文件`);
      });

      audio.addEventListener("loadeddata", () => {
        console.log(`${name}音频数据加载完成`);
        if (audio.duration && audio.duration < 0.1) {
          console.warn(`警告: ${name}音频文件可能不完整，时长过短:`, audio.duration);
        }
      });

      audio.addEventListener("canplay", () => {
        console.log(`${name}音频可以播放`);
      });

      audio.addEventListener("loadedmetadata", () => {
        console.log(`${name}音频元数据加载完成`, {
          duration: audio.duration,
          readyState: audio.readyState
        });
      });

      audio.addEventListener("play", () => {
        console.log(`${name}音频开始播放`);
        musicBtn.classList.add("playing");
      });

      audio.addEventListener("pause", () => {
        // 只有当两个音频都暂停时才移除 playing 状态
        if (rainMusic.paused && fireMusic.paused) {
          musicBtn.classList.remove("playing");
        }
      });
    }

    setupAudioListeners(rainMusic, "雨声");
    setupAudioListeners(fireMusic, "篝火声");

    // 点击按钮切换播放/暂停
    musicBtn.addEventListener("click", () => {
      // 获取当前设置的白噪音类型
      const currentSettings = typeof Storage !== 'undefined' ? Storage.getSettings() : {};
      const currentType = currentSettings.whiteNoiseType || 'rain';
      const activeMusic = currentType === 'fire' ? fireMusic : rainMusic;
      
      if (activeMusic.paused) {
        // 停止另一个音频
        if (currentType === 'fire') {
          rainMusic.pause();
        } else {
          fireMusic.pause();
        }
        
        console.log("尝试播放音频，当前状态:", {
          paused: activeMusic.paused,
          readyState: activeMusic.readyState,
          networkState: activeMusic.networkState,
          type: currentType
        });
        activeMusic.play().catch(err => {
          console.error("播放音乐失败:", err);
          console.error("错误详情:", {
            name: err.name,
            message: err.message,
            code: activeMusic.error?.code,
            message: activeMusic.error?.message
          });
          musicBtn.classList.remove("playing");
        });
        musicBtn.classList.add("playing");
      } else {
        activeMusic.pause();
        musicBtn.classList.remove("playing");
      }
    });

    // 处理音频加载错误
    function setupErrorHandler(audio, name) {
      audio.addEventListener("error", (e) => {
        const error = audio.error;
        let errorMsg = `${name}音频加载失败`;
        
        if (error) {
          switch(error.code) {
            case 1: // MEDIA_ERR_ABORTED
              errorMsg = `${name}音频加载被中止`;
              break;
            case 2: // MEDIA_ERR_NETWORK
              errorMsg = `网络错误，无法加载${name}音频文件`;
              break;
            case 3: // MEDIA_ERR_DECODE
              errorMsg = `${name}音频文件解码失败（文件可能损坏或不完整）`;
              break;
            case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
              errorMsg = `${name}音频格式不支持或文件路径错误`;
              break;
            default:
              errorMsg = `${name}音频加载失败: ${error.message || "未知错误"}`;
          }
        }
        
        const source = audio.querySelector("source");
        console.error(errorMsg, {
          code: error?.code,
          message: error?.message,
          networkState: audio.networkState,
          readyState: audio.readyState,
          src: source?.src,
          duration: audio.duration
        });
        
        // 如果文件太小，提示可能是文件未完整上传
        if (audio.duration !== undefined && audio.duration < 0.1) {
          console.error(`⚠️ ${name}文件可能不完整！建议：`);
          console.error("1. 压缩音频文件到更小尺寸（推荐 < 10MB）");
          console.error("2. 或使用外部 CDN 存储音频文件");
          console.error("3. 或检查部署日志确认文件是否完整上传");
        }
        
        // 只有当两个音频都出错时才移除 playing 状态
        if (rainMusic.error && fireMusic.error) {
          musicBtn.classList.remove("playing");
        }
      });
    }

    setupErrorHandler(rainMusic, "雨声");
    setupErrorHandler(fireMusic, "篝火声");
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initMusicPlayer();
    console.log("xkm-main ready");
  });
  