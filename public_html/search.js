const DEFAULT_BANG = "d";

const bangs = {
  al: "https://kiwix.tristanhavelick.com/search?content=archlinux_en_all_nopic_2022-05&pattern={{{s}}}",
  cl: "https://denver.craigslist.org/search/?query={{{s}}}",
  d: "https://lite.duckduckgo.com/lite?q={{{s}}}&kl=us-en",
  e: "https://www.ebay.com/sch/i.html?_nkw={{{s}}}&rt=nc&LH_ItemCondition=4",
  jw: "https://www.justwatch.com/us/search?q={{{s}}}",
  k: "https://kiwix.tristanhavelick.com/search?pattern={{{s}}}",
  m: "https://search.marginalia.nu/search?query={{{s}}}",
  py: "https://kiwix.tristanhavelick.com/search?content=python-3.10.2&pattern={{{s}}}",
  sg: "https://app.thestorygraph.com/browse?search_term={{{s}}}",
  ytt: "https://youtranscript.tristanhavelick.com/search?search_term={{{s}}}",
  x: "https://searxng.tristanhavelick.com/search?q={{{s}}}",
  gh: "https://github.com/search?q={{{s}}}",
  ghr: "https://github.com/{{{s}}}",
  wb: "https://web.archive.org/web/{{{s}}}",
  g: "https://www.google.com/search?q={{{s}}}",
  ddg: "https://duckduckgo.com/?q={{{s}}}",
  a: "https://www.amazon.com/s?k={{{s}}}",
  pypi: "https://pypi.org/search/?q={{{s}}}",
  w: "https://en.wikipedia.org/wiki/Special:Search?search={{{s}}}",
};

function buildSearchUrl(urlTemplate, searchTerm) {
  const encoded = encodeURIComponent(searchTerm);
  // Preserve slashes for URLs that need path segments
  const fixed = encoded.replace(/%2F/g, "/");
  return urlTemplate.replace(/{{{s}}}/g, fixed);
}

function getDefaultBang(windowObj = window) {
  const storage = windowObj.localStorage;
  const userDefault = storage ? storage.getItem("default-bang") : null;
  return userDefault && bangs[userDefault] ? userDefault : DEFAULT_BANG;
}

function buildFallbackUrl(searchTerm, windowObj = window) {
  const defaultBang = getDefaultBang(windowObj);
  const bangUrl = bangs[defaultBang];
  return buildSearchUrl(bangUrl, searchTerm);
}

function processBang(query, windowObj = window) {
  const trimmed = query.trim();

  if (trimmed.length > 2000) {
    return buildFallbackUrl(trimmed.substring(0, 2000), windowObj);
  }

  if (trimmed.startsWith("!")) {
    const spaceIndex = trimmed.indexOf(" ");
    if (spaceIndex === -1) {
      return buildFallbackUrl(trimmed, windowObj);
    }

    const bangTag = trimmed.substring(1, spaceIndex);
    const searchTerm = trimmed.substring(spaceIndex + 1).trim();

    const bangUrl = bangs[bangTag];
    if (bangUrl) {
      return buildSearchUrl(bangUrl, searchTerm);
    }
  }
  const bangMatch = trimmed.match(/^(.+)\s+(\w+)!$/);
  if (bangMatch) {
    const searchTerm = bangMatch[1].trim();
    const bangTag = bangMatch[2];

    const bangUrl = bangs[bangTag];
    if (bangUrl) {
      return buildSearchUrl(bangUrl, searchTerm);
    }
  }
  return buildFallbackUrl(trimmed, windowObj);
}

function getQueryParam(key, windowObj = window) {
  const urlParams = new URLSearchParams(windowObj.location.search);
  return urlParams.get(key);
}

function redirect(url, windowObj = window) {
  windowObj.location.href = url;
}

function performSearch(query, windowObj = window) {
  const url = processBang(query, windowObj);
  if (url) {
    windowObj.location.hash = `#q=${encodeURIComponent(query)}`;
    redirect(url, windowObj);
  }
}

function setupUI(windowObj = window) {
  const document = windowObj.document;
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");

  if (!searchInput || !searchButton) return;

  searchButton.addEventListener("click", () =>
    performSearch(searchInput.value, windowObj),
  );

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      performSearch(searchInput.value, windowObj);
    }
  });

  if (windowObj.location.hash) {
    const hashParams = new URLSearchParams(
      windowObj.location.hash.substring(1),
    );
    const hashQuery = hashParams.get("q");
    if (hashQuery) {
      searchInput.value = decodeURIComponent(hashQuery);
    }
  }
}

function toggleDarkMode() {
  const html = document.documentElement;

  if (html.classList.contains("dark-mode")) {
    html.classList.remove("dark-mode");
    html.classList.add("light-mode");
  } else {
    html.classList.remove("light-mode");
    html.classList.add("dark-mode");
  }
}

function initialize(windowObj = window) {
  const queryParam = getQueryParam("q", windowObj);
  if (queryParam !== null) {
    const url = processBang(queryParam, windowObj);
    if (url) {
      redirect(url, windowObj);
    }
  } else {
    windowObj.document.addEventListener("DOMContentLoaded", () => {
      setupUI(windowObj);
      initializeDarkModeToggle(windowObj);
      initializePWA(windowObj);
      initializeSettings(windowObj);
    });
  }
}

function initializeDarkModeToggle(windowObj = window) {
  const html = windowObj.document.documentElement;
  const prefersDark = windowObj.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  if (prefersDark) {
    html.classList.add("dark-mode");
  } else {
    html.classList.add("light-mode");
  }

  const toggleButton = windowObj.document.querySelector(".dark-mode-toggle");
  if (!toggleButton) return;

  toggleButton.addEventListener("click", toggleDarkMode);
}

function isServiceWorkerSupported(windowObj = window) {
  return !!(windowObj.navigator && "serviceWorker" in windowObj.navigator);
}

async function registerServiceWorker(windowObj = window) {
  if (!isServiceWorkerSupported(windowObj)) {
    return;
  }

  try {
    const registration = await windowObj.navigator.serviceWorker.register(
      "./service-worker.js",
    );
    console.log("Service Worker registered successfully:", registration);
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
}

function shouldEnableCaching(windowObj = window) {
  const urlParams = new URLSearchParams(windowObj.location.search);
  const cacheParam = urlParams.get("cache");

  // Explicit override via URL parameter
  if (cacheParam === "force") return true;
  if (cacheParam === "disable") return false;

  // Default: disable caching on local development
  const isLocal =
    windowObj.location.hostname === "localhost" ||
    windowObj.location.hostname === "127.0.0.1" ||
    windowObj.location.hostname.startsWith("192.168.");

  return !isLocal;
}

function initializePWA(windowObj = window) {
  if (isServiceWorkerSupported(windowObj) && shouldEnableCaching(windowObj)) {
    registerServiceWorker(windowObj);
  }
}

function toggleSettingsPanel(windowObj = window) {
  const panel = windowObj.document.querySelector(".settings-panel");
  if (!panel) return;

  const isHidden = panel.getAttribute("aria-hidden") === "true";
  panel.setAttribute("aria-hidden", isHidden ? "false" : "true");
}

function buildSettingsPanel(windowObj = window) {
  const currentDefault = getDefaultBang(windowObj);

  let html = `
    <div class="settings-header">
      <h2>
        Settings
        <button class="close-button" type="button" aria-label="Close settings">×</button>
      </h2>
      <p class="save-message" id="save-message">✓ Changes saved automatically</p>
    </div>
    <div class="settings-body">
      <h3>Default Search Engine</h3>
      <div class="bang-list">
  `;

  for (const [bangKey, bangUrl] of Object.entries(bangs)) {
    const isChecked = bangKey === currentDefault ? " checked" : "";
    html += `
      <div class="bang-trigger">${bangKey}!</div>
      <div class="bang-url">${bangUrl}</div>
      <input type="radio" name="default-bang" value="${bangKey}" class="bang-radio"${isChecked}>
    `;
  }

  html += `
      </div>
    </div>
  `;
  return html;
}

function handleDefaultBangChange(event, windowObj = window) {
  if (event.target.name === "default-bang") {
    const storage = windowObj.localStorage;
    if (storage) {
      storage.setItem("default-bang", event.target.value);
      showSaveMessage(windowObj);
    }
  }
}

function showSaveMessage(windowObj = window) {
  const saveMessage = windowObj.document.getElementById("save-message");
  if (saveMessage) {
    saveMessage.classList.add("visible");
    setTimeout(() => {
      saveMessage.classList.remove("visible");
    }, 2000);
  }
}

function setupSettingsEventListeners(windowObj = window) {
  const hamburgerButton = windowObj.document.querySelector(".hamburger-menu");
  const settingsPanel = windowObj.document.querySelector(".settings-panel");

  if (hamburgerButton) {
    hamburgerButton.addEventListener("click", () =>
      toggleSettingsPanel(windowObj),
    );
  }

  if (settingsPanel) {
    settingsPanel.addEventListener("click", (event) => {
      // Close on backdrop click
      if (event.target === settingsPanel) {
        toggleSettingsPanel(windowObj);
      }
      // Close on close button click
      if (event.target.classList.contains("close-button")) {
        toggleSettingsPanel(windowObj);
      }
    });

    settingsPanel.addEventListener("change", (event) => {
      handleDefaultBangChange(event, windowObj);
    });
  }
}

function initializeSettings(windowObj = window) {
  const settingsContent = windowObj.document.querySelector(".settings-content");
  if (settingsContent) {
    settingsContent.innerHTML = buildSettingsPanel(windowObj);
  }
  setupSettingsEventListeners(windowObj);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getQueryParam,
    processBang,
    performSearch,
    setupUI,
    initialize,
    buildSearchUrl,
    getDefaultBang,
    buildFallbackUrl,
    toggleDarkMode,
    initializeDarkModeToggle,
    isServiceWorkerSupported,
    registerServiceWorker,
    initializePWA,
    toggleSettingsPanel,
    buildSettingsPanel,
    handleDefaultBangChange,
    showSaveMessage,
    setupSettingsEventListeners,
    initializeSettings,
    shouldEnableCaching,
  };
}
