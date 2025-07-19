const bangs = [
  {
    t: "al",
    u: "https://kiwix.tristanhavelick.com/search?content=archlinux_en_all_nopic_2022-05&pattern={{{s}}}",
  },
  {
    t: "cl",
    u: "https://denver.craigslist.org/search/?query={{{s}}}",
  },
  {
    t: "d",
    u: "https://lite.duckduckgo.com/lite?q={{{s}}}&kl=us-en",
  },
  {
    t: "e",
    u: "https://www.ebay.com/sch/i.html?_nkw={{{s}}}&rt=nc&LH_ItemCondition=4",
  },
  {
    t: "jw",
    u: "https://www.justwatch.com/us/search?q={{{s}}}",
  },
  {
    t: "k",
    u: "https://kiwix.tristanhavelick.com/search?pattern={{{s}}}",
  },
  {
    t: "lg",
    u: "http://libgen.is/search.php?req={{{s}}}",
  },
  {
    t: "lgf",
    u: "http://libgen.is/fiction/?q={{{s}}}",
  },
  {
    t: "m",
    u: "https://search.marginalia.nu/search?query={{{s}}}",
  },
  {
    t: "py",
    u: "https://kiwix.tristanhavelick.com/search?content=python-3.10.2&pattern={{{s}}}",
  },
  {
    t: "sg",
    u: "https://app.thestorygraph.com/browse?search_term={{{s}}}",
  },
  {
    t: "ytt",
    u: "https://youtranscript.tristanhavelick.com/search?search_term={{{s}}}",
  },
  {
    t: "x",
    u: "https://searxng.tristanhavelick.com/search?q={{{s}}}",
  },
  {
    t: "gh",
    u: "https://github.com/search?q={{{s}}}",
  },
  {
    t: "g",
    u: "https://www.google.com/search?q={{{s}}}",
  },
  {
    t: "ddg",
    u: "https://duckduckgo.com/?q={{{s}}}",
  },
  {
    t: "a",
    u: "https://www.amazon.com/s?k={{{s}}}",
  },
  {
    t: "pypi",
    u: "https://pypi.org/search/?q={{{s}}}",
  },
  {
    t: "w",
    u: "https://en.wikipedia.org/wiki/Special:Search?search={{{s}}}",
  },
];

function processBang(query) {
  const trimmed = query.trim();

  if (trimmed.startsWith("!")) {
    const spaceIndex = trimmed.indexOf(" ");
    if (spaceIndex === -1) {
      return null;
    }

    const bangTag = trimmed.substring(1, spaceIndex);
    const searchTerm = trimmed.substring(spaceIndex + 1).trim();

    const bang = bangs.find((b) => b.t === bangTag);
    if (bang) {
      return bang.u.replace(/{{{s}}}/g, encodeURIComponent(searchTerm));
    }
  }
  const bangMatch = trimmed.match(/^(.+)\s+(\w+)!$/);
  if (bangMatch) {
    const searchTerm = bangMatch[1].trim();
    const bangTag = bangMatch[2];

    const bang = bangs.find((b) => b.t === bangTag);
    if (bang) {
      return bang.u.replace(/{{{s}}}/g, encodeURIComponent(searchTerm));
    }
  }
  return `https://lite.duckduckgo.com/lite?q=${encodeURIComponent(trimmed)}&kl=us-en`;
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

  document
    .getElementById("searchButton")
    .addEventListener("click", () =>
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

function initialize(windowObj = window) {
  const queryParam = getQueryParam("q", windowObj);
  if (queryParam) {
    const url = processBang(queryParam);
    if (url) {
      redirect(url);
    }
  } else {
    windowObj.document.addEventListener("DOMContentLoaded", () =>
      setupUI(windowObj),
    );
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getQueryParam,
    processBang,
    performSearch,
    setupUI,
    initialize,
  };
}
