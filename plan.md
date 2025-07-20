# localStorage Default Bang Configuration - Implementation Plan

## Overview
Implement localStorage-based configuration for default search engine, allowing users to set their preferred fallback search (e.g., Google, DuckDuckGo) instead of hardcoded DuckDuckGo Lite. Users can configure via `localStorage.setItem('default-bang', 'g')` with automatic fallback to 'd' (DuckDuckGo Lite) if not set.

## File Structure Changes

### Modified Files
- `public_html/search.js` - Add localStorage logic and modify `processBang()` function
- `tests/search.spec.js` - Add comprehensive tests for localStorage functionality

### New Files
- None required

## New Functions

### `getDefaultBang(windowObj = window)`
**Purpose**: Retrieve user's preferred default bang from localStorage with fallback  
**Parameters**: `windowObj = window` (dependency injection for testability)  
**Returns**: String representing bang code ('d', 'g', 'x', etc.)  
**Logic**: 
```javascript
function getDefaultBang(windowObj = window) {
  const storage = windowObj.localStorage;
  const userDefault = storage ? storage.getItem('default-bang') : null;
  return userDefault && bangs[userDefault] ? userDefault : 'd';
}
```

### `buildFallbackUrl(searchTerm, windowObj = window)`
**Purpose**: Build fallback search URL using user's configured default bang  
**Parameters**: `searchTerm` (string), `windowObj = window` (dependency injection)  
**Returns**: Complete search URL string  
**Logic**: Get default bang, look up URL template, build search URL

## Implementation Strategy

### Current System Analysis
- **Location**: `FALLBACK_SEARCH_URL` constant (search.js:1-2)
- **Usage**: `processBang()` function (search.js:37, 43, 64)
- **Behavior**: All non-bang searches fallback to hardcoded DuckDuckGo Lite

### New Approach
1. **Replace constant with function**: Remove `FALLBACK_SEARCH_URL`, use `buildFallbackUrl()`
2. **localStorage integration**: Check `localStorage.getItem('default-bang')` with validation
3. **Graceful degradation**: Fall back to 'd' if localStorage unavailable or invalid bang
4. **Maintain compatibility**: No breaking changes to existing bang syntax

### Dependency Injection Compliance
- All new functions accept `windowObj = window` parameter
- Functions access `windowObj.localStorage` for storage operations
- Enables testing with mock localStorage objects

## Code Modifications

### search.js Changes

1. **Remove hardcoded constant** (lines 1-2):
```diff
- const FALLBACK_SEARCH_URL =
-   "https://lite.duckduckgo.com/lite?q={{{s}}}&kl=us-en";
```

2. **Add new functions** (insert after line 31):
```javascript
function getDefaultBang(windowObj = window) {
  const storage = windowObj.localStorage;
  const userDefault = storage ? storage.getItem('default-bang') : null;
  return userDefault && bangs[userDefault] ? userDefault : 'd';
}

function buildFallbackUrl(searchTerm, windowObj = window) {
  const defaultBang = getDefaultBang(windowObj);
  const bangUrl = bangs[defaultBang];
  return buildSearchUrl(bangUrl, searchTerm);
}
```

3. **Update processBang function** (lines 37, 43, 64):
```diff
- return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed.substring(0, 2000));
+ return buildFallbackUrl(trimmed.substring(0, 2000), windowObj);

- return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed);
+ return buildFallbackUrl(trimmed, windowObj);

- return buildSearchUrl(FALLBACK_SEARCH_URL, trimmed);
+ return buildFallbackUrl(trimmed, windowObj);
```

4. **Add windowObj parameter to processBang**:
```diff
- function processBang(query) {
+ function processBang(query, windowObj = window) {
```

5. **Update function calls** (lines 77, 128):
```diff
- const url = processBang(query);
+ const url = processBang(query, windowObj);
```

6. **Update module exports** (add new functions to exports):
```diff
module.exports = {
  getQueryParam,
  processBang,
  performSearch,
  setupUI,
  initialize,
  buildSearchUrl,
+ getDefaultBang,
+ buildFallbackUrl,
  toggleDarkMode,
  // ... rest of exports
};
```

## Testing Strategy

### New Test Cases
1. **`getDefaultBang()` function**:
   - Returns 'd' when localStorage is empty/unavailable
   - Returns 'd' when localStorage contains invalid bang
   - Returns correct bang when localStorage contains valid bang
   - Handles localStorage exceptions gracefully

2. **`buildFallbackUrl()` function**:
   - Builds correct URL using default bang
   - Uses user's configured default bang
   - Falls back to DuckDuckGo when localStorage unavailable

3. **`processBang()` integration**:
   - Uses configured default for non-bang searches
   - Maintains existing bang functionality
   - Handles localStorage unavailable scenarios

### Mock Objects
```javascript
const mockWindowWithStorage = {
  localStorage: {
    getItem: jest.fn(),
    setItem: jest.fn()
  }
};

const mockWindowWithoutStorage = {};
```

## Implementation Checklist

### Phase 1: Core Infrastructure
- [x] Remove `FALLBACK_SEARCH_URL` constant
- [x] Add `getDefaultBang()` function with dependency injection
- [x] Add `buildFallbackUrl()` function with dependency injection
- [x] Update module exports to include new functions

### Phase 2: Integration
- [x] Add `windowObj` parameter to `processBang()` function
- [x] Replace all `FALLBACK_SEARCH_URL` usage with `buildFallbackUrl()` calls
- [x] Update `performSearch()` and `initialize()` to pass `windowObj` to `processBang()`
- [x] Verify no breaking changes to existing functionality

### Phase 3: Testing
- [x] Write tests for `getDefaultBang()` with various localStorage states
- [x] Write tests for `buildFallbackUrl()` with different default bangs
- [x] Write integration tests for `processBang()` with localStorage scenarios (confirmed existing tests cover this)
- [x] Test edge cases: localStorage exceptions, invalid bangs, missing localStorage

### Phase 4: Documentation
- [x] Update README.md with localStorage default bang configuration instructions
- [x] Add examples of how to set and clear default bang

### Phase 5: Manual Verification
- [x] Test default behavior (no localStorage): should use DuckDuckGo Lite
- [x] Test setting `localStorage.setItem('default-bang', 'g')`: should use Google
- [x] Test setting invalid bang: should fall back to DuckDuckGo Lite
- [x] Test in browsers with localStorage disabled: should gracefully degrade (covered by unit tests)
- [x] Verify existing bang functionality unchanged (`!g search term`, `search term g!`)

### Phase 6: Quality Assurance
- [x] Run `make check` (formatting and linting)
- [x] Run `make test` (all tests pass)
- [x] Test with `make dev` (application works correctly)
- [x] Regression testing: verify no existing functionality broken

## Manual Testing Instructions

### Setup Test Cases
```javascript
// Test Case 1: Default behavior
localStorage.removeItem('default-bang');
// Search "test" should go to DuckDuckGo Lite

// Test Case 2: Google as default
localStorage.setItem('default-bang', 'g');
// Search "test" should go to Google

// Test Case 3: Invalid bang
localStorage.setItem('default-bang', 'invalid');
// Search "test" should fall back to DuckDuckGo Lite

// Test Case 4: Bang searches unchanged
localStorage.setItem('default-bang', 'g');
// Search "!w test" should still go to Wikipedia
// Search "test w!" should still go to Wikipedia
```

## Future Maintenance

### Ongoing Requirements
- **Bang validation**: When new bangs are added to `bangs` object, they automatically become valid defaults
- **Backwards compatibility**: Always maintain 'd' as ultimate fallback for users without localStorage
- **Documentation**: Update README.md to document localStorage configuration option

### Concepts for Future Developers
- **localStorage integration**: Uses `windowObj.localStorage` for dependency injection compatibility
- **Graceful degradation**: Application works without localStorage support
- **Bang validation**: Only bangs that exist in `bangs` object are valid defaults
- **Testing pattern**: Mock `windowObj.localStorage` for comprehensive test coverage

### Future UI Enhancement
This implementation provides the foundation for a future settings UI. Consider adding:
- **Settings dropdown/form**: Allow users to select default bang from dropdown instead of console
- **Settings persistence**: UI would use the same localStorage keys established here
- **Settings page**: Dedicated configuration page with default bang selection
- **Reset option**: UI button to clear localStorage and return to default behavior

The current localStorage implementation is designed to be UI-agnostic and will work seamlessly with any future interface additions.

### Version Considerations
- **No service worker changes needed**: This feature doesn't modify static assets
- **No cache invalidation required**: Changes are runtime behavior only