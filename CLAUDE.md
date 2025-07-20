# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Just Bangs Lite is a client-side search tool with bang shortcuts (e.g., `python w!` → Wikipedia search). It's a dependency-free JavaScript application that runs entirely in the browser with automatic dark mode support.

## Key Architecture

### Modular Structure
- **`public_html/search.js`**: Core library containing all search functions with dependency injection pattern
- **`public_html/main.js`**: Simple entry point that calls `initialize()`
- **`public_html/index.html`**: Loads both scripts sequentially (search.js then main.js)

### Dependency Injection Pattern
Functions that use browser objects (like `window`) accept them as parameters for testability. Most commonly this is a `windowObj = window` parameter:
```javascript
function someFunction(param, windowObj = window) { ... }
```

The `= window` default parameter makes the real browser object the default, allowing seamless browser usage while enabling tests to pass mock objects.

### Testing Without package.json
- Uses Jest via `npx jest` with custom configuration
- CommonJS exports in search.js for Node.js compatibility: `module.exports = { ... }`
- Test files in `tests/` directory with `.spec.js` extension
- All functions tested with mock browser objects as needed

## Development Commands

### Essential Commands
```bash
make dev        # Start Python HTTP server on port 8000
make test       # Run Jest unit tests
make format     # Auto-format code with Biome
make lint       # Check linting with Biome
make check      # Run both formatting and linting checks
```

### Running Specific Tests
```bash
# Run single test file
npx jest tests/search.spec.js -c '{"testMatch":["**/tests/**/*.spec.js"]}'

# Run specific test pattern
npx jest -t "processBang" -c '{"testMatch":["**/tests/**/*.spec.js"]}'
```

## Code Quality Tools

### Biome Configuration
- **Tool**: Biome (replaces ESLint + Prettier)
- **Config**: `biome.json` - 2-space indentation, space-based formatting
- **GitHub Actions**: `code-quality.yml` workflow runs `biome check` and fails builds on issues

### Module System
- **Browser**: Regular script tags (no ES6 modules due to Jest compatibility issues)
- **Tests**: CommonJS require/module.exports
- **No package.json**: By design - staying dependency-free except for Jest

## Bang System

### Adding New Bangs
Modify the `bangs` array in `search.js`:
```javascript
{
  t: "gh",  // trigger
  u: "https://github.com/search?q={{{s}}}"  // URL template
}
```

### Search Processing Flow
1. `processBang(query)` - Parses `!bang` or `term bang!` syntax
2. `performSearch(query, windowObj)` - Sets hash and redirects
3. `initialize(windowObj)` - Entry point: redirects if query param exists, else sets up UI

## Testing Guidelines

### Browser Object Injection
Always pass mock browser objects to test functions that interact with DOM, location, or other browser APIs:
```javascript
const mockWindow = {
  document: { getElementById: jest.fn() },
  location: { search: "?q=test", href: "", hash: "" }
};
```

### Current Test Coverage
- `getQueryParam`: URL parameter parsing
- `processBang`: Bang syntax processing and fallbacks
- `performSearch`: Hash setting and redirection
- `setupUI`: Event listener setup and hash population
- `initialize`: Query param detection and app initialization

## Development Best Practices

### CSS Guidelines
- Always put styles in style.css, never inline