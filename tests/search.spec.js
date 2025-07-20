const {
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
} = require("../public_html/search.js");

describe("buildSearchUrl", () => {
  test("replaces template placeholder with encoded search term", () => {
    const template = "https://example.com/search?q={{{s}}}";
    const result = buildSearchUrl(template, "hello world");
    expect(result).toBe("https://example.com/search?q=hello%20world");
  });

  test("preserves slashes for path-based URLs", () => {
    const template = "https://example.com/{{{s}}}";
    const result = buildSearchUrl(template, "path/to/resource");
    expect(result).toBe("https://example.com/path/to/resource");
  });
});

describe("getQueryParam", () => {
  const originalLocation = global.window?.location;

  beforeEach(() => {
    delete global.window;
    global.window = {
      location: {
        search: "",
      },
    };
  });

  afterEach(() => {
    global.window = originalLocation;
  });

  test("returns null for missing parameter", () => {
    global.window.location.search = "?foo=bar";
    expect(getQueryParam("missing")).toBeNull();
  });

  test("returns value for existing parameter", () => {
    global.window.location.search = "?q=test+query";
    expect(getQueryParam("q")).toBe("test query");
  });

  test("handles empty search string", () => {
    global.window.location.search = "";
    expect(getQueryParam("q")).toBeNull();
  });

  test("returns empty string for empty query parameter", () => {
    global.window.location.search = "?q=";
    expect(getQueryParam("q")).toBe("");
  });
});

describe("processBang", () => {
  let mockWindow;

  beforeEach(() => {
    mockWindow = { localStorage: null };
  });

  test("processes !-prefix format with Google bang", () => {
    const result = processBang("!g javascript tutorial");
    expect(result).toBe(
      "https://www.google.com/search?q=javascript%20tutorial",
    );
  });

  test("processes !-suffix format with Wikipedia bang", () => {
    const result = processBang("machine learning w!");
    expect(result).toBe(
      "https://en.wikipedia.org/wiki/Special:Search?search=machine%20learning",
    );
  });

  test("processes GitHub bang with special characters", () => {
    const result = processBang("!gh react hooks");
    expect(result).toBe("https://github.com/search?q=react%20hooks");
  });

  test("falls back to DuckDuckGo for unknown search", () => {
    const result = processBang("regular search query", mockWindow);
    expect(result).toBe(
      "https://lite.duckduckgo.com/lite?q=regular%20search%20query&kl=us-en",
    );
  });

  test("falls back to DuckDuckGo for unknown bang", () => {
    const result = processBang("!unknown search term", mockWindow);
    expect(result).toBe(
      "https://lite.duckduckgo.com/lite?q=!unknown%20search%20term&kl=us-en",
    );
  });

  test("falls back to DuckDuckGo for bang without search term", () => {
    const result = processBang("!gh", mockWindow);
    expect(result).toBe("https://lite.duckduckgo.com/lite?q=!gh&kl=us-en");
  });

  test("truncates extremely long queries to 2000 characters", () => {
    const longQuery = "a".repeat(2500);
    const result = processBang(longQuery, mockWindow);
    const expected =
      "https://lite.duckduckgo.com/lite?q=" +
      encodeURIComponent("a".repeat(2000)) +
      "&kl=us-en";
    expect(result).toBe(expected);
  });
});

describe("buildFallbackUrl", () => {
  test("builds URL using default bang when no localStorage", () => {
    const mockWindow = { localStorage: null };
    const result = buildFallbackUrl("test query", mockWindow);
    expect(result).toBe(
      "https://lite.duckduckgo.com/lite?q=test%20query&kl=us-en",
    );
  });
});

describe("getDefaultBang", () => {
  test("returns default bang when no localStorage", () => {
    const mockWindow = { localStorage: null };
    const result = getDefaultBang(mockWindow);
    expect(result).toBe("d");
  });

  test.each([
    ["localStorage exists but no default-bang key", null, "d"],
    ["localStorage has valid bang", "g", "g"],
    ["localStorage has invalid bang", "invalid", "d"],
  ])(
    "returns correct bang when %s",
    (_description, localStorageValue, expected) => {
      const mockWindow = { localStorage: { getItem: () => localStorageValue } };
      const result = getDefaultBang(mockWindow);
      expect(result).toBe(expected);
    },
  );
});

describe("performSearch", () => {
  let mockWindow;

  beforeEach(() => {
    mockWindow = {
      location: {
        hash: "",
        href: "",
      },
    };
  });

  test("sets location hash and redirects for valid query", () => {
    performSearch("javascript tutorial", mockWindow);

    expect(mockWindow.location.hash).toBe("#q=javascript%20tutorial");
    expect(mockWindow.location.href).toBe(
      "https://lite.duckduckgo.com/lite?q=javascript%20tutorial&kl=us-en",
    );
  });

  test("sets location hash and redirects for bang query", () => {
    performSearch("!g react hooks", mockWindow);

    expect(mockWindow.location.hash).toBe("#q=!g%20react%20hooks");
    expect(mockWindow.location.href).toBe(
      "https://www.google.com/search?q=react%20hooks",
    );
  });

  test("handles empty query", () => {
    performSearch("", mockWindow);

    expect(mockWindow.location.hash).toBe("#q=");
    expect(mockWindow.location.href).toBe(
      "https://lite.duckduckgo.com/lite?q=&kl=us-en",
    );
  });
});

describe("setupUI", () => {
  let mockWindow;
  let mockSearchInput;
  let mockSearchButton;

  beforeEach(() => {
    mockSearchInput = {
      value: "",
      addEventListener: jest.fn(),
    };

    mockSearchButton = {
      addEventListener: jest.fn(),
    };

    const mockDocument = {
      getElementById: jest.fn((id) => {
        if (id === "searchInput") return mockSearchInput;
        if (id === "searchButton") return mockSearchButton;
        return null;
      }),
    };

    mockWindow = {
      document: mockDocument,
      location: {
        hash: "",
        href: "",
      },
    };
  });

  test("sets up event listeners for search input and button", () => {
    setupUI(mockWindow);

    expect(mockSearchButton.addEventListener).toHaveBeenCalledWith(
      "click",
      expect.any(Function),
    );
    expect(mockSearchInput.addEventListener).toHaveBeenCalledWith(
      "keypress",
      expect.any(Function),
    );
  });

  test("populates search input from location hash", () => {
    mockWindow.location.hash = "#q=test%20query";
    setupUI(mockWindow);

    expect(mockSearchInput.value).toBe("test query");
  });

  test("handles empty location hash", () => {
    mockWindow.location.hash = "";
    setupUI(mockWindow);

    expect(mockSearchInput.value).toBe("");
  });
});

describe("initialize", () => {
  let mockWindow;
  let mockDocument;

  beforeEach(() => {
    mockDocument = {
      addEventListener: jest.fn(),
    };

    mockWindow = {
      document: mockDocument,
      location: {
        search: "",
        href: "",
        hash: "",
      },
    };
  });

  test("redirects immediately when query parameter exists", () => {
    mockWindow.location.search = "?q=test+search";

    initialize(mockWindow);

    expect(mockWindow.location.href).toBe(
      "https://lite.duckduckgo.com/lite?q=test%20search&kl=us-en",
    );
    expect(mockDocument.addEventListener).not.toHaveBeenCalled();
  });

  test("redirects for bang query parameter", () => {
    mockWindow.location.search = "?q=!g+javascript";

    initialize(mockWindow);

    expect(mockWindow.location.href).toBe(
      "https://www.google.com/search?q=javascript",
    );
    expect(mockDocument.addEventListener).not.toHaveBeenCalled();
  });

  test("sets up DOMContentLoaded listener when no query parameter", () => {
    mockWindow.location.search = "";

    initialize(mockWindow);

    expect(mockWindow.location.href).toBe("");
    expect(mockDocument.addEventListener).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
    );
  });

  test("redirects when query parameter is empty string", () => {
    mockWindow.location.search = "?q=";

    initialize(mockWindow);

    expect(mockWindow.location.href).toBe(
      "https://lite.duckduckgo.com/lite?q=&kl=us-en",
    );
    expect(mockDocument.addEventListener).not.toHaveBeenCalled();
  });
});

describe("toggleDarkMode", () => {
  let mockHTML;

  beforeEach(() => {
    mockHTML = {
      classList: {
        contains: jest.fn(),
        remove: jest.fn(),
        add: jest.fn(),
      },
    };

    global.document = {
      documentElement: mockHTML,
    };
  });

  afterEach(() => {
    delete global.document;
  });

  test("switches from dark-mode to light-mode", () => {
    mockHTML.classList.contains.mockReturnValue(true);

    toggleDarkMode();

    expect(mockHTML.classList.remove).toHaveBeenCalledWith("dark-mode");
    expect(mockHTML.classList.add).toHaveBeenCalledWith("light-mode");
  });

  test("switches from light-mode to dark-mode", () => {
    mockHTML.classList.contains.mockReturnValue(false);

    toggleDarkMode();

    expect(mockHTML.classList.remove).toHaveBeenCalledWith("light-mode");
    expect(mockHTML.classList.add).toHaveBeenCalledWith("dark-mode");
  });

  test("switches from no class to dark-mode", () => {
    mockHTML.classList.contains.mockReturnValue(false);

    toggleDarkMode();

    expect(mockHTML.classList.remove).toHaveBeenCalledWith("light-mode");
    expect(mockHTML.classList.add).toHaveBeenCalledWith("dark-mode");
  });
});

describe("initializeDarkModeToggle", () => {
  let mockHTML;
  let mockWindow;
  let mockToggleButton;

  beforeEach(() => {
    mockHTML = {
      classList: {
        add: jest.fn(),
      },
    };

    mockToggleButton = {
      addEventListener: jest.fn(),
    };

    mockWindow = {
      document: {
        documentElement: mockHTML,
        querySelector: jest.fn().mockReturnValue(mockToggleButton),
      },
      matchMedia: jest.fn(),
    };
  });

  test.each([
    [true, "dark-mode"],
    [false, "light-mode"],
  ])(
    "when system prefers dark=%s, adds %s class and sets up event handler",
    (prefersDark, expectedClass) => {
      mockWindow.matchMedia.mockReturnValue({ matches: prefersDark });

      initializeDarkModeToggle(mockWindow);

      expect(mockWindow.matchMedia).toHaveBeenCalledWith(
        "(prefers-color-scheme: dark)",
      );
      expect(mockHTML.classList.add).toHaveBeenCalledWith(expectedClass);
      expect(mockWindow.document.querySelector).toHaveBeenCalledWith(
        ".dark-mode-toggle",
      );
      expect(mockToggleButton.addEventListener).toHaveBeenCalledWith(
        "click",
        toggleDarkMode,
      );
    },
  );

  test("handles missing toggle button gracefully", () => {
    mockWindow.matchMedia.mockReturnValue({ matches: false });
    mockWindow.document.querySelector.mockReturnValue(null);

    expect(() => initializeDarkModeToggle(mockWindow)).not.toThrow();
    expect(mockWindow.document.querySelector).toHaveBeenCalledWith(
      ".dark-mode-toggle",
    );
  });
});

describe("PWA Functions", () => {
  describe("isServiceWorkerSupported", () => {
    test("returns true when serviceWorker is supported", () => {
      const mockWindow = {
        navigator: {
          serviceWorker: {},
        },
      };
      expect(isServiceWorkerSupported(mockWindow)).toBe(true);
    });

    test("returns false when serviceWorker is not supported", () => {
      const mockWindow = {
        navigator: {},
      };
      expect(isServiceWorkerSupported(mockWindow)).toBe(false);
    });

    test("returns false when navigator is not available", () => {
      const mockWindow = {};
      expect(isServiceWorkerSupported(mockWindow)).toBe(false);
    });
  });

  describe("registerServiceWorker", () => {
    let consoleSpy;

    beforeEach(() => {
      consoleSpy = {
        log: jest.spyOn(console, "log").mockImplementation(),
        error: jest.spyOn(console, "error").mockImplementation(),
      };
    });

    afterEach(() => {
      consoleSpy.log.mockRestore();
      consoleSpy.error.mockRestore();
    });

    test("does nothing when service worker is not supported", async () => {
      const mockWindow = {
        navigator: {},
      };

      await registerServiceWorker(mockWindow);

      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    test("registers service worker successfully", async () => {
      const mockRegistration = { scope: "/" };
      const mockRegister = jest.fn().mockResolvedValue(mockRegistration);
      const mockWindow = {
        navigator: {
          serviceWorker: {
            register: mockRegister,
          },
        },
      };

      await registerServiceWorker(mockWindow);

      expect(mockRegister).toHaveBeenCalledWith("/service-worker.js");
      expect(consoleSpy.log).toHaveBeenCalledWith(
        "Service Worker registered successfully:",
        mockRegistration,
      );
    });

    test("handles service worker registration failure", async () => {
      const mockError = new Error("Registration failed");
      const mockRegister = jest.fn().mockRejectedValue(mockError);
      const mockWindow = {
        navigator: {
          serviceWorker: {
            register: mockRegister,
          },
        },
      };

      await registerServiceWorker(mockWindow);

      expect(mockRegister).toHaveBeenCalledWith("/service-worker.js");
      expect(consoleSpy.error).toHaveBeenCalledWith(
        "Service Worker registration failed:",
        mockError,
      );
    });
  });

  describe("initializePWA", () => {
    test("calls registerServiceWorker when service worker is supported", () => {
      const mockRegister = jest.fn().mockResolvedValue({});
      const mockWindow = {
        navigator: {
          serviceWorker: {
            register: mockRegister,
          },
        },
      };

      initializePWA(mockWindow);

      expect(mockRegister).toHaveBeenCalledWith("/service-worker.js");
    });

    test("does nothing when service worker is not supported", () => {
      const mockWindow = {
        navigator: {},
      };

      expect(() => initializePWA(mockWindow)).not.toThrow();
    });
  });
});
