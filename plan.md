# PWA Implementation Plan - Issue #5

## Overview
Add Progressive Web App support to Just Bangs Lite while maintaining the existing dependency-free, testable architecture.

## File Structure Changes

### New Files
```
public_html/
├── manifest.json          # PWA manifest for installability
└── sw.js                 # Service worker for caching
```

### Modified Files
```
public_html/
├── index.html            # Add manifest link
├── search.js             # Add PWA functions with dependency injection
└── main.js              # Call PWA registration
tests/
└── search.spec.js        # Add PWA function tests
```

## New Functions (following dependency injection pattern)

### In search.js

#### `isServiceWorkerSupported(windowObj = window)`
- **Purpose**: Check if service worker API is available
- **Returns**: Boolean
- **Testing**: Pass mock window object without navigator.serviceWorker
- **Location**: Add to search.js exports

#### `registerServiceWorker(windowObj = window)`
- **Purpose**: Register service worker with error handling
- **Parameters**: windowObj for dependency injection
- **Returns**: Promise<void>
- **Testing**: Mock navigator.serviceWorker.register
- **Error handling**: Graceful degradation if registration fails
- **Location**: Add to search.js exports

#### `initializePWA(windowObj = window)`
- **Purpose**: Initialize all PWA features (called from main.js)
- **Flow**: Check support → Register service worker
- **Testing**: Mock all dependencies
- **Location**: Add to search.js exports

## Service Worker Strategy (sw.js)

### Cache Strategy
- **Static Cache**: `just-bangs-static-v1` for HTML, CSS, JS, manifest
- **Dynamic Cache**: `just-bangs-dynamic-v1` for search requests/bangs data

**Cache Versioning**: Version numbers (v1, v2, etc.) should be updated when:
- Static assets change (HTML, CSS, JS modifications)
- Cache strategy changes
- Service worker logic changes
- Need to force cache refresh for all users

Incrementing version numbers ensures old cached content is properly invalidated and new content is fetched.

**Note**: Document this cache versioning strategy in CLAUDE.md for future reference.

### Caching Approach
1. **Install Event**: Cache static assets
2. **Fetch Event**:
   - Cache-first for static assets (HTML, CSS, JS)
   - Network-first for external searches
   - Cache bangs data for offline functionality
3. **Activate Event**: Clean up old caches

## Manifest Configuration (manifest.json)

Basic PWA manifest with app metadata.

**Icon Strategy**: ✅ Use ❗ (exclamation point emoji) as the app icon:
- ✅ Created scalable SVG icon with red exclamation mark on transparent background
- ✅ Single SVG file (`icon.svg`) scales to any size needed
- ✅ Provides a clear visual connection to "bangs"

## Code Modifications

### index.html
```html
<head>
  <!-- Add manifest link -->
  <link rel="manifest" href="manifest.json">
  <!-- Existing content -->
</head>
```

### main.js
**CONSTRAINT**: main.js must remain minimal - it exists only to separate the function library from execution for Jest compatibility. We cannot add any additional code or functions to main.js.

**Solution**: PWA initialization will be called from within the existing `initialize()` function in search.js during the DOMContentLoaded event.

### search.js - New Functions
- `isServiceWorkerSupported(windowObj = window)` - Check if service worker API is available
- `registerServiceWorker(windowObj = window)` - Register service worker with error handling
- `initializePWA(windowObj = window)` - Initialize all PWA features
- Modify existing `initialize()` function to call `initializePWA()` during DOMContentLoaded

## Testing Strategy

### New Test Cases
```javascript
describe('PWA Functions', () => {
  test('isServiceWorkerSupported returns false without serviceWorker', () => {
    const mockWindow = { navigator: {} };
    expect(isServiceWorkerSupported(mockWindow)).toBe(false);
  });

  test('registerServiceWorker handles unsupported browsers', async () => {
    const mockWindow = { navigator: {} };
    await expect(registerServiceWorker(mockWindow)).resolves.toBeUndefined();
  });

  test('registerServiceWorker calls navigator.serviceWorker.register', async () => {
    const mockRegister = jest.fn().mockResolvedValue({});
    const mockWindow = {
      navigator: { serviceWorker: { register: mockRegister } }
    };

    await registerServiceWorker(mockWindow);
    expect(mockRegister).toHaveBeenCalledWith('/sw.js');
  });
});
```

## Implementation Checklist

### Phase 1: Core PWA Files
- [x] Create `public_html/manifest.json` with app metadata (name, short_name, icons, etc.)
- [x] Create `public_html/sw.js` with service worker implementation
  - [x] Add static cache with versioned name (`just-bangs-static-v1`)
  - [x] Add dynamic cache with versioned name (`just-bangs-dynamic-v1`)
  - [x] Implement install event handler (cache static assets)
  - [x] Implement fetch event handler (cache-first strategy)
  - [x] Implement activate event handler (cleanup old caches)
- [x] Add manifest link to `public_html/index.html` head section

### Phase 2: JavaScript Integration
- [x] Add `isServiceWorkerSupported(windowObj = window)` function to search.js
- [x] Add `registerServiceWorker(windowObj = window)` function to search.js
- [x] Add `initializePWA(windowObj = window)` function to search.js
- [x] Modify existing `initialize()` function to call `initializePWA()` during DOMContentLoaded
- [x] Add new PWA functions to module.exports in search.js
- [x] Verify main.js remains unchanged (only calls `initialize()`)

### Phase 3: Testing & Documentation
- [x] Add PWA function tests to `tests/search.spec.js`
  - [x] Test `isServiceWorkerSupported` with mock objects
  - [x] Test `registerServiceWorker` with mock navigator
  - [x] Test `initializePWA` function
- [x] Run existing tests to ensure no regression
- [x] Document PWA cache versioning strategy in CLAUDE.md

### Phase 4: Manual Verification
- [x] **Service Worker Registration**: Check DevTools → Application → Service Workers
- [x] **Cache Verification**: Check DevTools → Application → Cache Storage for `just-bangs-static-v1` cache
- [x] **Offline Testing**: Set network to offline, verify app still loads and searches work
- [x] **Install Prompt**: Verify install icon appears in browser address bar
- [x] **Manifest Verification**: Check DevTools → Application → Manifest shows correct data
- [x] **Installed App Behavior**: Install and verify standalone window behavior
- [x] **Cross-browser Testing**: Test PWA features in Chrome, Firefox, Safari

### Phase 5: Quality Assurance
- [x] Run `make check` (formatting and linting)
- [x] Run `make test` (all tests pass)
- [x] Verify existing functionality unchanged (search, bangs, dark mode)
- [x] Test graceful degradation in browsers without service worker support

## Manual PWA Testing

### How to Verify PWA is Working (vs Regular Web App)

**Service Worker Registration:**
- Open browser DevTools → Application tab → Service Workers
- Should see `sw.js` registered and running
- Status should show "activated and running"

**Cache Verification:**
- DevTools → Application tab → Storage → Cache Storage
- Should see `just-bangs-static-v1` and `just-bangs-dynamic-v1` caches
- Static cache should contain HTML, CSS, JS, manifest files

**Offline Testing:**
- Load the app normally (all assets cached)
- DevTools → Network tab → Set to "Offline"
- Refresh page - should still load from cache
- Try searching with cached bangs - should work offline

**Install Prompt Testing:**
- Chrome: Look for install icon in address bar
- Desktop: Should show "Install Just Bangs Lite" option
- Mobile: Should trigger "Add to Home Screen" prompt

**Manifest Verification:**
- DevTools → Application tab → Manifest
- Should show app name, icons, theme colors
- "Add to homescreen" section should show installability status

**Installed App Behavior:**
- After installing, app should open in standalone window (no browser UI)
- Should have app icon on desktop/home screen
- Should behave like native app

## Progressive Enhancement Principles

- **Graceful Degradation**: PWA features fail silently in unsupported browsers
- **No Breaking Changes**: Existing functionality remains unchanged
- **Optional Enhancement**: App works with or without PWA features
- **Lightweight**: Minimal overhead for browsers that don't support PWA

## Benefits After Implementation

- **Installability**: Can be installed as native app
- **Offline Functionality**: Cached bangs work offline
- **Performance**: Faster load times after first visit
- **Mobile Experience**: App-like behavior on mobile devices
- **Progressive**: Works everywhere, enhanced where supported

## Service Worker Refactor - Post PWA Implementation

### Overview
Extract service worker logic into a testable library file following the same dependency injection pattern used in search.js/main.js.

### Goals
- Make service worker functions unit testable
- Follow existing codebase patterns (lib file + minimal entry point)
- Maintain all existing functionality
- Add proper test coverage for service worker logic

### Implementation Plan

#### Phase 1: Create Service Worker Library
- [x] Create `public_html/service-worker-lib.js` with testable functions
- [x] Move constants (STATIC_CACHE_NAME, STATIC_ASSETS) to lib file
- [x] Extract `installHandler(caches, self)` with dependency injection
- [x] Extract `activateHandler(caches, self)` with dependency injection
- [x] Add CommonJS exports for testing compatibility

#### Phase 2: Simplify Service Worker Entry Point
- [x] Refactor `public_html/service-worker.js` to use `importScripts()`
- [x] Keep only event listeners and calls to lib functions
- [x] Maintain fetch handler in service worker (just event binding)
- [x] Verify service worker loads and functions correctly

#### Phase 3: Add Unit Tests
- [x] Add service worker lib tests to `tests/service-worker-lib.spec.js`
- [x] Test `installHandler` with mock caches and self objects
- [x] Test `activateHandler` with mock caches and self objects  
- [x] Test error handling scenarios
- [x] Verify constants are exported correctly

#### Phase 4: Verification
- [x] Run `make test` to ensure all tests pass
- [x] Run `make check` for code quality
- [x] Manual PWA testing (install, offline, caching)
- [x] Verify no regressions in existing functionality
