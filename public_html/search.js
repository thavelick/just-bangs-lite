const FALLBACK_SEARCH_URL =
  "https://lite.duckduckgo.com/lite?q={{{s}}}&kl=us-en";

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

function processBang(query) {
  const trimmed = query.trim();

  if (trimmed.length > 2000) {
    return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed.substring(0, 2000));
  }

  if (trimmed.startsWith("!")) {
    const spaceIndex = trimmed.indexOf(" ");
    if (spaceIndex === -1) {
      return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed);
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
  return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed);
}

function getQueryParam(key, windowObj = window) {
  const urlParams = new URLSearchParams(windowObj.location.search);
  return urlParams.get(key);
}

function redirect(url, windowObj = window) {
  windowObj.location.href = url;
}

function performSearch(query, windowObj = window) {
  const url = processBang(query);
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
    const url = processBang(queryParam);
    if (url) {
      redirect(url, windowObj);
    }
  } else {
    windowObj.document.addEventListener("DOMContentLoaded", () => {
      setupUI(windowObj);
      initializeDarkModeToggle(windowObj);
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
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getQueryParam,
    processBang,
    performSearch,
    setupUI,
    initialize,
    buildSearchUrl,
    toggleDarkMode,
    initializeDarkModeToggle,
  };
}
