const {
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
  buildSettingsPanel,
  handleDefaultBangChange,
  showSaveMessage,
  setupSettingsEventListeners,
  initializeSettings,
  shouldEnableCaching,
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

  test("saves dark mode preference to localStorage", () => {
    const mockStorage = { setItem: jest.fn() };
    global.window = { localStorage: mockStorage };
    mockHTML.classList.contains.mockReturnValue(false);

    toggleDarkMode();

    expect(mockStorage.setItem).toHaveBeenCalledWith("darkMode", "dark");

    delete global.window;
  });

  test("saves light mode preference to localStorage", () => {
    const mockStorage = { setItem: jest.fn() };
    global.window = { localStorage: mockStorage };
    mockHTML.classList.contains.mockReturnValue(true);

    toggleDarkMode();

    expect(mockStorage.setItem).toHaveBeenCalledWith("darkMode", "light");

    delete global.window;
  });

  test("handles missing localStorage gracefully", () => {
    global.window = {};
    mockHTML.classList.contains.mockReturnValue(false);

    expect(() => toggleDarkMode()).not.toThrow();

    delete global.window;
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
      mockWindow.localStorage = null;
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

  test.each([
    ["dark", "dark-mode"],
    ["light", "light-mode"],
  ])(
    "when localStorage has saved preference '%s', uses that over system preference",
    (savedMode, expectedClass) => {
      mockWindow.localStorage = {
        getItem: jest.fn().mockReturnValue(savedMode),
      };
      mockWindow.matchMedia.mockReturnValue({ matches: false });

      initializeDarkModeToggle(mockWindow);

      expect(mockWindow.localStorage.getItem).toHaveBeenCalledWith("darkMode");
      expect(mockHTML.classList.add).toHaveBeenCalledWith(expectedClass);
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

describe("initializeContentPage", () => {
  test("adds DOMContentLoaded event listener", () => {
    const mockWindow = {
      document: {
        addEventListener: jest.fn(),
      },
    };

    initializeContentPage(mockWindow);

    expect(mockWindow.document.addEventListener).toHaveBeenCalledWith(
      "DOMContentLoaded",
      expect.any(Function),
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

      expect(mockRegister).toHaveBeenCalledWith("./service-worker.js");
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

      expect(mockRegister).toHaveBeenCalledWith("./service-worker.js");
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
        location: {
          search: "",
          hostname: "example.com",
        },
      };

      initializePWA(mockWindow);

      expect(mockRegister).toHaveBeenCalledWith("./service-worker.js");
    });

    test("does nothing when service worker is not supported", () => {
      const mockWindow = {
        navigator: {},
      };

      expect(() => initializePWA(mockWindow)).not.toThrow();
    });
  });
});

describe("Settings Functions", () => {
  describe("toggleSettingsPanel", () => {
    test("shows panel when hidden", () => {
      const mockPanel = {
        getAttribute: jest.fn().mockReturnValue("true"),
        setAttribute: jest.fn(),
      };
      const mockWindow = {
        document: {
          querySelector: jest.fn().mockReturnValue(mockPanel),
        },
      };

      toggleSettingsPanel(mockWindow);

      expect(mockPanel.setAttribute).toHaveBeenCalledWith(
        "aria-hidden",
        "false",
      );
    });

    test("hides panel when visible", () => {
      const mockPanel = {
        getAttribute: jest.fn().mockReturnValue("false"),
        setAttribute: jest.fn(),
      };
      const mockWindow = {
        document: {
          querySelector: jest.fn().mockReturnValue(mockPanel),
        },
      };

      toggleSettingsPanel(mockWindow);

      expect(mockPanel.setAttribute).toHaveBeenCalledWith(
        "aria-hidden",
        "true",
      );
    });

    test("does nothing when panel not found", () => {
      const mockWindow = {
        document: {
          querySelector: jest.fn().mockReturnValue(null),
        },
      };

      expect(() => toggleSettingsPanel(mockWindow)).not.toThrow();
    });
  });

  describe("buildSettingsPanel", () => {
    test("generates HTML with current default selected", () => {
      const mockWindow = {
        localStorage: {
          getItem: jest.fn().mockReturnValue("g"),
        },
      };

      const html = buildSettingsPanel(mockWindow);

      expect(html).toContain("<h2>");
      expect(html).toContain("Settings");
      expect(html).toContain("close-button");
      expect(html).toContain("Default Search Engine");
      expect(html).toContain('name="default-bang"');
      expect(html).toContain("g!");
      expect(html).toContain("checked");
      expect(html).toContain("d!");
    });

    test("defaults to 'd' when no localStorage", () => {
      const mockWindow = {
        localStorage: null,
      };

      const html = buildSettingsPanel(mockWindow);

      expect(html).toContain('value="d"');
      expect(html).toContain("checked");
    });
  });

  describe("handleDefaultBangChange", () => {
    test("saves selection to localStorage", () => {
      const mockStorage = {
        setItem: jest.fn(),
      };
      const mockWindow = {
        localStorage: mockStorage,
        document: {
          getElementById: jest.fn().mockReturnValue(null),
        },
      };
      const mockEvent = {
        target: {
          name: "default-bang",
          value: "g",
        },
      };

      handleDefaultBangChange(mockEvent, mockWindow);

      expect(mockStorage.setItem).toHaveBeenCalledWith("default-bang", "g");
    });

    test("does nothing for non-default-bang events", () => {
      const mockStorage = {
        setItem: jest.fn(),
      };
      const mockWindow = {
        localStorage: mockStorage,
      };
      const mockEvent = {
        target: {
          name: "other-input",
          value: "g",
        },
      };

      handleDefaultBangChange(mockEvent, mockWindow);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    test("handles missing localStorage gracefully", () => {
      const mockWindow = {
        localStorage: null,
      };
      const mockEvent = {
        target: {
          name: "default-bang",
          value: "g",
        },
      };

      expect(() =>
        handleDefaultBangChange(mockEvent, mockWindow),
      ).not.toThrow();
    });
  });

  describe("showSaveMessage", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test("shows and hides save message", () => {
      const mockMessage = {
        classList: {
          add: jest.fn(),
          remove: jest.fn(),
        },
      };
      const mockWindow = {
        document: {
          getElementById: jest.fn().mockReturnValue(mockMessage),
        },
      };

      showSaveMessage(mockWindow);

      expect(mockMessage.classList.add).toHaveBeenCalledWith("visible");

      jest.advanceTimersByTime(2000);

      expect(mockMessage.classList.remove).toHaveBeenCalledWith("visible");
    });

    test("handles missing message element gracefully", () => {
      const mockWindow = {
        document: {
          getElementById: jest.fn().mockReturnValue(null),
        },
      };

      expect(() => showSaveMessage(mockWindow)).not.toThrow();
    });
  });

  describe("setupSettingsEventListeners", () => {
    test("attaches event listeners when elements exist", () => {
      const mockHamburger = {
        addEventListener: jest.fn(),
      };
      const mockPanel = {
        addEventListener: jest.fn(),
      };
      const mockWindow = {
        document: {
          querySelector: jest.fn((selector) => {
            if (selector === ".hamburger-menu") return mockHamburger;
            if (selector === ".settings-panel") return mockPanel;
            return null;
          }),
        },
      };

      setupSettingsEventListeners(mockWindow);

      expect(mockHamburger.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(mockPanel.addEventListener).toHaveBeenCalledWith(
        "click",
        expect.any(Function),
      );
      expect(mockPanel.addEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    test("handles missing elements gracefully", () => {
      const mockWindow = {
        document: {
          querySelector: jest.fn().mockReturnValue(null),
        },
      };

      expect(() => setupSettingsEventListeners(mockWindow)).not.toThrow();
    });
  });

  describe("initializeSettings", () => {
    test("sets content and sets up listeners", () => {
      const mockContent = {
        innerHTML: "",
      };
      const mockWindow = {
        document: {
          querySelector: jest.fn((selector) => {
            if (selector === ".settings-content") return mockContent;
            return null;
          }),
        },
        localStorage: {
          getItem: jest.fn().mockReturnValue("d"),
        },
      };

      initializeSettings(mockWindow);

      expect(mockContent.innerHTML).toContain("Settings");
      expect(mockContent.innerHTML).toContain("Default Search Engine");
    });

    test("handles missing content element gracefully", () => {
      const mockWindow = {
        document: {
          querySelector: jest.fn().mockReturnValue(null),
        },
      };

      expect(() => initializeSettings(mockWindow)).not.toThrow();
    });
  });

  describe("shouldEnableCaching", () => {
    const testCases = [
      // [hostname, queryString, expected, description]
      ["localhost", "?cache=force", true, "cache=force parameter returns true"],
      [
        "example.com",
        "?cache=disable",
        false,
        "cache=disable parameter returns false",
      ],
      ["localhost", "", false, "localhost hostname returns false"],
      ["127.0.0.1", "", false, "127.0.0.1 hostname returns false"],
      ["192.168.1.100", "", false, "192.168.x hostname returns false"],
      ["example.com", "", true, "production hostname returns true"],
    ];

    test.each(testCases)(
      "hostname: %s, query: %s -> %s (%s)",
      (hostname, search, expected, _description) => {
        const mockWindow = {
          location: { hostname, search },
        };

        expect(shouldEnableCaching(mockWindow)).toBe(expected);
      },
    );
  });
});
