// public/static/app.js

window.addEventListener("load", async () => {

  // ── Init Scramjet ──
  const { ScramjetController } = $scramjetLoadController();
  const scramjet = new ScramjetController({
    files: {
      wasm: "/scram/scramjet.wasm.wasm",
      all:  "/scram/scramjet.all.js",
      sync: "/scram/scramjet.sync.js",
    },
  });
  await scramjet.init();

  // ── Register Service Worker ──
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }

  // ── Init BareMux transport ──
  const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
  await connection.setTransport("/epoxy/index.mjs", [
    { wisp: `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}/wisp/` },
  ]);

  // ── DOM refs ──
  const homepage   = document.getElementById("homepage");
  const frameWrap  = document.getElementById("frame-wrap");
  const frame      = document.getElementById("proxy-frame");
  const urlBar     = document.getElementById("url-bar");
  const goBtn      = document.getElementById("go-btn");
  const homeInput  = document.getElementById("home-input");
  const homeGo     = document.getElementById("home-go");
  const btnBack    = document.getElementById("btn-back");
  const btnFwd     = document.getElementById("btn-fwd");
  const btnReload  = document.getElementById("btn-reload");
  const homeLink   = document.getElementById("home-link");
  const loadBar    = document.getElementById("load-bar");

  // ── Helpers ──
  function toUrl(raw) {
    raw = raw.trim();
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    if (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})(\/.*)?$/.test(raw)) return "https://" + raw;
    return "https://www.google.com/search?q=" + encodeURIComponent(raw);
  }

  function showLoading() {
    loadBar.style.display = "block";
    loadBar.style.width = "0%";
    setTimeout(() => loadBar.style.width = "70%", 50);
  }

  function doneLoading() {
    loadBar.style.width = "100%";
    setTimeout(() => {
      loadBar.style.display = "none";
      loadBar.style.width = "0%";
    }, 300);
  }

  function navigate(raw) {
    const url = toUrl(raw);
    if (!url) return;

    const proxied = scramjet.encodeUrl(url);

    // Switch to frame view
    homepage.style.display  = "none";
    frameWrap.style.display = "block";

    showLoading();
    frame.src = proxied;
    urlBar.value = url;

    btnReload.disabled = false;
    updateNavBtns();
  }

  function updateNavBtns() {
    try {
      btnBack.disabled = !frame.contentWindow?.history?.length || frame.src === "about:blank";
      btnFwd.disabled  = true; // can't reliably detect fwd
    } catch(e) {
      btnBack.disabled = false;
    }
  }

  // ── Frame events ──
  frame.addEventListener("load", () => {
    doneLoading();

    // Try to read URL from iframe and update bar
    try {
      const frameUrl = frame.contentWindow?.location?.href;
      if (frameUrl && frameUrl !== "about:blank") {
        const decoded = scramjet.decodeUrl?.(frameUrl) || frameUrl;
        urlBar.value = decoded;
      }
    } catch(e) {}

    updateNavBtns();
    btnBack.disabled = false;
  });

  // ── Nav button actions ──
  btnBack.addEventListener("click", () => {
    try { frame.contentWindow.history.back(); } catch(e) {}
  });

  btnFwd.addEventListener("click", () => {
    try { frame.contentWindow.history.forward(); } catch(e) {}
  });

  btnReload.addEventListener("click", () => {
    showLoading();
    try { frame.contentWindow.location.reload(); } catch(e) {
      frame.src = frame.src;
    }
  });

  // ── Home link ──
  homeLink.addEventListener("click", () => {
    frameWrap.style.display = "none";
    homepage.style.display  = "flex";
    frame.src = "about:blank";
    urlBar.value = "";
    btnReload.disabled = true;
    btnBack.disabled   = true;
    btnFwd.disabled    = true;
  });

  // ── Top bar go ──
  goBtn.addEventListener("click", () => navigate(urlBar.value));
  urlBar.addEventListener("keydown", e => { if (e.key === "Enter") navigate(urlBar.value); });

  // ── Homepage go ──
  homeGo.addEventListener("click", () => navigate(homeInput.value));
  homeInput.addEventListener("keydown", e => { if (e.key === "Enter") navigate(homeInput.value); });

});
