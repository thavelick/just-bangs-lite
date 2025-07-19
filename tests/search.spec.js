const { getQueryParam } = require("../public_html/search.js");

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
