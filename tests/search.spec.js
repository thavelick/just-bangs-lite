const {
  getQueryParam,
  processBang,
  performSearch,
  setupUI,
} = require("../public_html/search.js");

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
});

describe("processBang", () => {
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
    const result = processBang("regular search query");
    expect(result).toBe(
      "https://lite.duckduckgo.com/lite?q=regular%20search%20query&kl=us-en",
    );
  });

  test("falls back to DuckDuckGo for unknown bang", () => {
    const result = processBang("!unknown search term");
    expect(result).toBe(
      "https://lite.duckduckgo.com/lite?q=!unknown%20search%20term&kl=us-en",
    );
  });
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
