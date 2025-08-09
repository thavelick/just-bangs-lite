const DEFAULT_BANG = "d";

const bangs = {
  al: {
    url: "https://kiwix.tristanhavelick.com/search?content=archlinux_en_all_nopic_2022-05&pattern={{{s}}}",
    description: "ArchLinux Wiki",
  },
  cl: {
    url: "https://denver.craigslist.org/search/?query={{{s}}}",
    description: "Denver Craigslist",
  },
  d: {
    url: "https://lite.duckduckgo.com/lite?q={{{s}}}&kl=us-en",
    description: "DuckDuckGo Lite",
  },
  e: {
    url: "https://www.ebay.com/sch/i.html?_nkw={{{s}}}&rt=nc&LH_ItemCondition=4",
    description: "eBay (used items)",
  },
  jw: {
    url: "https://www.justwatch.com/us/search?q={{{s}}}",
    description: "JustWatch (streaming search)",
  },
  k: {
    url: "https://kiwix.tristanhavelick.com/search?pattern={{{s}}}",
    description: "Kiwix Offline Content",
  },
  m: {
    url: "https://search.marginalia.nu/search?query={{{s}}}",
    description: "Marginalia Search",
  },
  py: {
    url: "https://kiwix.tristanhavelick.com/search?content=python-3.10.2&pattern={{{s}}}",
    description: "Python Documentation",
  },
  sg: {
    url: "https://app.thestorygraph.com/browse?search_term={{{s}}}",
    description: "The StoryGraph (books)",
  },
  ytt: {
    url: "https://youtranscript.tristanhavelick.com/search?search_term={{{s}}}",
    description: "YouTube Transcript Search",
  },
  x: {
    url: "https://searxng.tristanhavelick.com/search?q={{{s}}}",
    description: "SearXNG",
  },
  gh: {
    url: "https://github.com/search?q={{{s}}}",
    description: "GitHub Search",
  },
  ghr: {
    url: "https://github.com/{{{s}}}",
    description: "GitHub Repository",
  },
  wb: {
    url: "https://web.archive.org/web/{{{s}}}",
    description: "Wayback Machine",
  },
  g: {
    url: "https://www.google.com/search?q={{{s}}}",
    description: "Google Search",
  },
  ddg: {
    url: "https://duckduckgo.com/?q={{{s}}}",
    description: "DuckDuckGo",
  },
  a: {
    url: "https://www.amazon.com/s?k={{{s}}}",
    description: "Amazon",
  },
  pypi: {
    url: "https://pypi.org/search/?q={{{s}}}",
    description: "Python Package Index",
  },
  w: {
    url: "https://en.wikipedia.org/wiki/Special:Search?search={{{s}}}",
    description: "Wikipedia",
  },
  i: {
    url: "https://duckduckgo.com/?q={{{s}}}&iax=images&ia=images",
    description: "DuckDuckGo Images",
  },
  yt: {
    url: "https://www.youtube.com/results?search_query={{{s}}}",
    description: "YouTube",
  },
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
  const bangUrl = bangs[defaultBang].url;
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

    const bang = bangs[bangTag];
    if (bang) {
      return buildSearchUrl(bang.url, searchTerm);
    }
  }
  const bangMatch = trimmed.match(/^(.+)\s+(\w+)!$/);
  if (bangMatch) {
    const searchTerm = bangMatch[1].trim();
    const bangTag = bangMatch[2];

    const bang = bangs[bangTag];
    if (bang) {
      return buildSearchUrl(bang.url, searchTerm);
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

function toggleDarkMode(windowObj = window) {
  const html = windowObj.document.documentElement;
  const storage = windowObj?.localStorage ?? null;

  if (html.classList.contains("dark-mode")) {
    html.classList.remove("dark-mode");
    html.classList.add("light-mode");
    if (storage) storage.setItem("darkMode", "light");
  } else {
    html.classList.remove("light-mode");
    html.classList.add("dark-mode");
    if (storage) storage.setItem("darkMode", "dark");
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

function initializeContentPage(windowObj = window) {
  windowObj.document.addEventListener("DOMContentLoaded", () => {
    initializeDarkModeToggle(windowObj);
  });
}

function initializeDarkModeToggle(windowObj = window) {
  const html = windowObj.document.documentElement;
  const storage = windowObj.localStorage;
  const savedMode = storage ? storage.getItem("darkMode") : null;
  const prefersDark = windowObj.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches;

  if (savedMode === "dark" || (savedMode === null && prefersDark)) {
    html.classList.add("dark-mode");
  } else if (savedMode === "light" || (savedMode === null && !prefersDark)) {
    html.classList.add("light-mode");
  }

  const toggleButton = windowObj.document.querySelector(".dark-mode-toggle");
  if (!toggleButton) return;

  toggleButton.addEventListener("click", () => toggleDarkMode(windowObj));
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
  const settingsDialog = windowObj.document.querySelector("settings-dialog");
  if (settingsDialog && typeof settingsDialog.toggle === "function") {
    settingsDialog.toggle();
  } else {
    // Fallback for when components aren't registered yet
    const panel = windowObj.document.querySelector(".settings-panel");
    if (!panel) return;
    const isHidden = panel.getAttribute("aria-hidden") === "true";
    panel.setAttribute("aria-hidden", isHidden ? "false" : "true");
  }
}

function showSaveMessage(windowObj = window) {
  const saveMessage = windowObj.document.getElementById("save-message");
  if (saveMessage) {
    saveMessage.classList.add("visible");
    windowObj.setTimeout(() => {
      saveMessage.classList.remove("visible");
    }, 2000);
  }
}

function initializeSettings(windowObj = window) {
  registerSettingsComponents(windowObj);

  const settingsDialog = windowObj.document.querySelector("settings-dialog");
  if (settingsDialog) {
    settingsDialog.setWindow(windowObj);
  }

  // Set up hamburger button listener
  const hamburgerButton = windowObj.document.querySelector(".hamburger-menu");
  if (hamburgerButton) {
    hamburgerButton.addEventListener("click", () =>
      toggleSettingsPanel(windowObj),
    );
  }
}

const SettingsDialogBase =
  typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SettingsDialog extends SettingsDialogBase {
  constructor() {
    super();
    this.windowObj = typeof window !== "undefined" ? window : null;
  }

  setWindow(windowObj) {
    this.windowObj = windowObj;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const currentDefault = getDefaultBang(this.windowObj);
    const sortedBangs = Object.entries(bangs).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    let html = `
      <div class="settings-header">
        <h2>
          Settings
          <button class="close-button" type="button" aria-label="Close settings">×</button>
        </h2>
        <save-message>✓ Changes saved automatically</save-message>
      </div>
      <div class="settings-body">
        <h3>Default Search Engine</h3>
        <div class="bang-list">
    `;

    for (const [bangKey, bangData] of sortedBangs) {
      const isSelected = bangKey === currentDefault;
      html += `<setting-option bang-key="${bangKey}" bang-url="${bangData.url}" bang-description="${bangData.description}"${isSelected ? " selected" : ""}></setting-option>`;
    }

    html += `
        </div>
      </div>
    `;

    this.innerHTML = html;
  }

  setupEventListeners() {
    this.addEventListener("click", (event) => {
      if (event.target.classList.contains("close-button")) {
        this.hide();
      }
    });
  }

  show() {
    this.closest(".settings-panel")?.setAttribute("aria-hidden", "false");
  }

  hide() {
    this.closest(".settings-panel")?.setAttribute("aria-hidden", "true");
  }

  toggle() {
    const panel = this.closest(".settings-panel");
    if (!panel) return;
    const isHidden = panel.getAttribute("aria-hidden") === "true";
    panel.setAttribute("aria-hidden", isHidden ? "false" : "true");
  }
}

const SettingOptionBase =
  typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SettingOption extends SettingOptionBase {
  constructor() {
    super();
    this.windowObj = typeof window !== "undefined" ? window : null;
  }

  setWindow(windowObj) {
    this.windowObj = windowObj;
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  render() {
    const bangKey = this.getAttribute("bang-key");
    const bangUrl = this.getAttribute("bang-url");
    const bangDescription = this.getAttribute("bang-description");
    const isSelected = this.hasAttribute("selected");

    this.innerHTML = `
      <div class="setting-row">
        <div class="bang-trigger">${bangKey}!</div>
        <div class="bang-description" title="${bangUrl}">${bangDescription}</div>
        <input type="radio" name="default-bang" value="${bangKey}" class="bang-radio"${isSelected ? " checked" : ""}>
      </div>
    `;
  }

  setupEventListeners() {
    const radio = this.querySelector('input[type="radio"]');
    if (radio) {
      radio.addEventListener("change", (event) => {
        this.handleChange(event);
      });
    }
  }

  handleChange(event) {
    if (event.target.name === "default-bang") {
      const storage = this.windowObj.localStorage;
      if (storage) {
        storage.setItem("default-bang", event.target.value);
        const saveMessage =
          this.closest("settings-dialog")?.querySelector("save-message");
        if (saveMessage && typeof saveMessage.show === "function") {
          saveMessage.show();
        }
      }
    }
  }

  setSelected(selected) {
    // This method is called before render(), so just update the attribute
    if (selected) {
      this.setAttribute("selected", "");
    } else {
      this.removeAttribute("selected");
    }
  }

  getValue() {
    return this.getAttribute("bang-key");
  }
}

const SaveMessageBase =
  typeof HTMLElement !== "undefined" ? HTMLElement : class {};

class SaveMessage extends SaveMessageBase {
  constructor() {
    super();
    this.windowObj = typeof window !== "undefined" ? window : null;
  }

  setWindow(windowObj) {
    this.windowObj = windowObj;
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.classList.add("save-message");
    this.id = "save-message";
    if (!this.textContent) {
      this.textContent = "✓ Changes saved automatically";
    }
  }

  show() {
    this.classList.add("visible");
    this.windowObj.setTimeout(() => {
      this.hide();
    }, 2000);
  }

  hide() {
    this.classList.remove("visible");
  }
}

function registerSettingsComponents(windowObj = window) {
  if (typeof windowObj.customElements !== "undefined") {
    windowObj.customElements.define("settings-dialog", SettingsDialog);
    windowObj.customElements.define("setting-option", SettingOption);
    windowObj.customElements.define("save-message", SaveMessage);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getQueryParam,
    processBang,
    performSearch,
    setupUI,
    initialize,
    initializeContentPage,
    buildSearchUrl,
    getDefaultBang,
    buildFallbackUrl,
    toggleDarkMode,
    initializeDarkModeToggle,
    isServiceWorkerSupported,
    registerServiceWorker,
    initializePWA,
    toggleSettingsPanel,
    showSaveMessage,
    initializeSettings,
    shouldEnableCaching,
    SettingsDialog,
    SettingOption,
    SaveMessage,
    registerSettingsComponents,
  };
}
