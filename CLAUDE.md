# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Just Bangs Lite is a client-side search tool with bang shortcuts (e.g., `python w!` → Wikipedia search). It's a dependency-free JavaScript application that runs entirely in the browser with automatic dark mode support.

## Key Architecture

### Modular Structure
- **`public_html/search.js`**: Core library containing all search functions with dependency injection pattern
- **`public_html/main.js`**: Simple entry point that ONLY calls `initialize()` - no additional code or functions
- **`public_html/index.html`**: Loads both scripts sequentially (search.js then main.js)

**IMPORTANT**: main.js exists solely to separate the function library (search.js) from execution for test compatibility. Adding any additional code or functions to main.js will break this separation and cause testing issues.

### Dependency Injection Pattern
Functions that use browser objects (like `window`) accept them as parameters for testability. Most commonly this is a `windowObj = window` parameter:
```javascript
function someFunction(param, windowObj = window) { ... }
```

The `= window` default parameter makes the real browser object the default, allowing seamless browser usage while enabling tests to pass mock objects.

### Testing Without Dependencies
- **Unit tests**: Uses Bun test runner via `bun test` - no package.json required
- **Integration tests**: Uses Playwright via `bunx playwright test` for browser automation
- CommonJS exports in search.js for Node.js compatibility: `module.exports = { ... }`
- Unit test files in `tests/unit/` directory with `.spec.js` extension
- Integration test files in `tests/integration/` directory with `.spec.js` extension
- All unit tests use mock browser objects for isolation

## Development Commands

### Essential Commands
```bash
make dev        # Starts Python HTTP server on port 8000. Don't run this. Ask me if you think it needs to be started
make test       # Run unit tests with Bun
make format     # Auto-format code with Biome
make lint       # Check linting with Biome
make check      # Run both formatting and linting checks
```

### Running Specific Tests
```bash
# Run unit tests only
make test-unit

# Run integration tests only (requires dev server on port 8000)
make test-integration

# Run all tests
make test-all

# Run single test file
bun test tests/unit/search.spec.js

# Run specific test pattern
bun test -t "processBang"
```

## Code Quality Tools

### Biome Configuration
- **Tool**: Biome (replaces ESLint + Prettier)
- **Config**: `biome.json` - 2-space indentation, space-based formatting
- **GitHub Actions**: `code-quality.yml` workflow runs `biome check` and fails builds on issues

### Module System
- **Browser**: Regular script tags (no ES6 modules for broader compatibility)
- **Tests**: CommonJS require/module.exports (Bun supports both)
- **No package.json**: Pure dependency-free JavaScript with external test runner

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
  document: { getElementById: () => {} },
  location: { search: "?q=test", href: "", hash: "" }
};
```

## Progressive Web App (PWA)

### Cache Versioning
Service worker uses versioned static cache (`just-bangs-static-v1`). Increment version numbers (v1→v2) when static assets change or need to force cache refresh.

## Development Workflow

### Git Workflow
- Write meaningful commit messages based on conversation context (focus on "why" not just "what")
- Always work on new branches, not main
- Include ticket numbers in commits and PRs when working on tickets
- When user says "Review time":
  a. Make sure we're not on main branch
  b. Commit what we've done
  c. Push to remote
  d. Create a PR with `gh`
- When user says "merge", do a gh pr merge with a merge commit and use the option to delete local and remote branches
- Before merging a branch, if plan.md exists and implementation is complete, ask if plan.md should be deleted first

### Pre-Commit Checklist
Before any commit:
1. Run `make check` to verify code style and linting
2. Run `make test` to ensure all tests pass
3. Verify the application still works with `make dev`
4. Write a descriptive commit message based on our conversation

## Development Best Practices

### CSS Guidelines
- Always put styles in style.css, never inline

### PWA Caching Control
Development caching behavior can be controlled via URL parameters:
- Default: No caching on localhost/127.0.0.1/192.168.x (dev-friendly)
- `?cache=force` - Enable caching on local development
- `?cache=disable` - Disable caching in production (for testing)

### Implementation Planning Process
When asked to plan an implementation, follow the standardized process documented in `PLANNING.md`.
