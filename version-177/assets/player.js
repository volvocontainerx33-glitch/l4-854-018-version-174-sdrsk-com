(function () {
  function setupPlayer(player) {
    var video = player.querySelector("video[data-src]");
    var button = player.querySelector(".player-start");
    var status = player.querySelector("[data-player-status]");
    var hlsInstance = null;
    var started = false;

    if (!video || !button) {
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setStatus("浏览器已阻止自动播放，请再次点击视频播放。 ");
        });
      }
    }

    function initHls() {
      var src = video.getAttribute("data-src");

      if (!src) {
        setStatus("当前影片未绑定播放源。 ");
        return;
      }

      player.classList.add("is-playing");
      setStatus("正在加载播放源...");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          started = true;
          setStatus("播放源加载完成。 ");
          playVideo();
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus("网络异常，正在重试加载。 ");
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus("媒体解码异常，正在恢复。 ");
            hlsInstance.recoverMediaError();
          } else {
            setStatus("播放源加载失败，请稍后重试。 ");
            hlsInstance.destroy();
          }
        });
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        started = true;
        video.addEventListener("loadedmetadata", playVideo, { once: true });
        setStatus("正在使用浏览器原生 HLS 播放。 ");
        return;
      }

      video.src = src;
      started = true;
      setStatus("当前浏览器需要 HLS 支持，已尝试直接加载播放源。 ");
      playVideo();
    }

    function handleStart() {
      if (started) {
        player.classList.add("is-playing");
        playVideo();
        return;
      }
      initHls();
    }

    button.addEventListener("click", handleStart);
    video.addEventListener("click", function () {
      if (!started) {
        handleStart();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
    });
  } else {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(setupPlayer);
  }
})();
