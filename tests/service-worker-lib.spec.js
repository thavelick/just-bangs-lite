const {
  installHandler,
  activateHandler,
  STATIC_CACHE_NAME,
  STATIC_ASSETS,
} = require("../public_html/service-worker-lib.js");

describe("Service Worker Library", () => {
  describe("constants", () => {
    test("STATIC_CACHE_NAME is defined", () => {
      expect(STATIC_CACHE_NAME).toBe("just-bangs-static-v1");
    });

    test("STATIC_ASSETS includes all required files", () => {
      const expectedAssets = [
        "/",
        "/index.html",
        "/search.js",
        "/main.js",
        "/style.css",
        "/manifest.json",
        "/icon.svg",
        "/service-worker.js",
        "/service-worker-lib.js",
      ];
      expect(STATIC_ASSETS).toEqual(expectedAssets);
    });
  });

  describe("installHandler", () => {
    let mockCache;
    let mockCaches;
    let mockSelf;
    let consoleSpy;

    beforeEach(() => {
      mockCache = {
        addAll: jest.fn().mockResolvedValue(undefined),
      };
      mockCaches = {
        open: jest.fn().mockResolvedValue(mockCache),
      };
      mockSelf = {
        skipWaiting: jest.fn().mockResolvedValue(undefined),
      };
      consoleSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    test("opens cache and adds all static assets", async () => {
      await installHandler(mockCaches, mockSelf);

      expect(mockCaches.open).toHaveBeenCalledWith(STATIC_CACHE_NAME);
      expect(mockCache.addAll).toHaveBeenCalledWith(STATIC_ASSETS);
      expect(mockSelf.skipWaiting).toHaveBeenCalled();
    });

    test("handles cache open failure", async () => {
      const error = new Error("Cache open failed");
      mockCaches.open.mockRejectedValue(error);

      await installHandler(mockCaches, mockSelf);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Service Worker: Failed to cache static assets",
        error,
      );
      expect(mockSelf.skipWaiting).not.toHaveBeenCalled();
    });

    test("handles addAll failure", async () => {
      const error = new Error("AddAll failed");
      mockCache.addAll.mockRejectedValue(error);

      await installHandler(mockCaches, mockSelf);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Service Worker: Failed to cache static assets",
        error,
      );
      expect(mockSelf.skipWaiting).not.toHaveBeenCalled();
    });
  });

  describe("activateHandler", () => {
    let mockCaches;
    let mockSelf;

    beforeEach(() => {
      mockCaches = {
        keys: jest.fn(),
        delete: jest.fn().mockResolvedValue(true),
      };
      mockSelf = {
        clients: {
          claim: jest.fn().mockResolvedValue(undefined),
        },
      };
    });

    test("deletes old caches and claims clients", async () => {
      const cacheNames = [
        "just-bangs-static-v1",
        "old-cache-v1",
        "another-old-cache",
      ];
      mockCaches.keys.mockResolvedValue(cacheNames);

      await activateHandler(mockCaches, mockSelf);

      expect(mockCaches.keys).toHaveBeenCalled();
      expect(mockCaches.delete).toHaveBeenCalledWith("old-cache-v1");
      expect(mockCaches.delete).toHaveBeenCalledWith("another-old-cache");
      expect(mockCaches.delete).not.toHaveBeenCalledWith(
        "just-bangs-static-v1",
      );
      expect(mockSelf.clients.claim).toHaveBeenCalled();
    });

    test("handles no old caches", async () => {
      mockCaches.keys.mockResolvedValue(["just-bangs-static-v1"]);

      await activateHandler(mockCaches, mockSelf);

      expect(mockCaches.delete).not.toHaveBeenCalled();
      expect(mockSelf.clients.claim).toHaveBeenCalled();
    });

    test("handles empty cache list", async () => {
      mockCaches.keys.mockResolvedValue([]);

      await activateHandler(mockCaches, mockSelf);

      expect(mockCaches.delete).not.toHaveBeenCalled();
      expect(mockSelf.clients.claim).toHaveBeenCalled();
    });
  });
});
