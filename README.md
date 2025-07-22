# Just Bangs Lite

A lightweight, client-side search tool with bang shortcuts. This JavaScript version of [just-bangs](https://github.com/thavelick/just-bangs) runs entirely in the browser with no server dependencies.

## Features

- **Client-side only**: No server required - works from any web server or locally
- **Bang shortcuts**: Use `query gh!` syntax for quick searches
- **Browser integration**: Add as a search engine with query parameter support
- **Back button support**: Search terms persist when navigating back
- **Responsive design**: Clean interface that works on desktop and mobile
- **Dark mode support**: Automatic system detection with manual toggle
- **PWA support**: Installable app with caching and offline functionality (for use with local/offline search providers)

## Usage

### Basic Search

- `just bangs gh!` → Search GitHub for "just bangs"
- `!gh just bangs` → Also works with bang at the start
- `python w!` → Search Wikipedia for "python"
- `flask pypi!` → Search PyPI for "flask"

### Supported Bangs

**Common:**

- `g!` → Google
- `ddg!` → DuckDuckGo
- `d!` → DuckDuckGo Lite (default fallback)
- `gh!` → GitHub (search)
- `ghr!` → GitHub (direct repo/user URLs)
- `w!` → Wikipedia
- `a!` → Amazon
- `pypi!` → PyPI

**Specialized:**

- `al!` → Arch Linux docs
- `cl!` → Craigslist
- `e!` → eBay
- `jw!` → JustWatch
- `k!` → Kiwix
- `m!` → Marginalia Search
- `py!` → Python docs
- `sg!` → StoryGraph
- `wb!` → Wayback Machine
- `ytt!` → YouTube Transcript
- `x!` → SearXNG

## Installation

### Local Usage

1. Download `index.html`
2. Open in your browser or serve from any web server
3. Start searching!

### Browser Search Engine

Add as a custom search engine in your browser:

- **URL**: `https://your-domain.com/path/to/index.html?q=%s`
- **Local**: `file:///path/to/index.html?q=%s`

### Web Server

Place `index.html` in any directory on your web server. Works great as a subdirectory install.

## Development

### Configuration

To add or modify search bangs, edit the `bangs` object in `public_html/search.js`:

```javascript
const bangs = {
  trigger: "https://example.com/search?q={{{s}}}",
  gh: "https://github.com/search?q={{{s}}}",
  // ... more bangs
};
```

- **Key**: Bang trigger (use only lowercase a-z characters)
- **Value**: Search URL template with `{{{s}}}` placeholder for the search term
- The `{{{s}}}` placeholder gets replaced with the URL-encoded search query

### Settings

Configure your default search engine via the hamburger menu (☰) in the top-left corner. Select from any available bang and changes are saved automatically.

### Build Commands

```bash
make dev     # Start development server on port 8000
make test    # Run unit tests
make format  # Auto-format code
make lint    # Check code style
make check   # Run formatting and linting checks
```

No build process or external dependencies required for the core application.

## License

GNU Affero General Public License v3.0 - same as the original just-bangs project.

## Created By

- [Idiomdrottning](https://idiomdrottning.org/about) - original idea for bang redirects website, custom bangs concept
- [Tristan Havelick](https://tristanhavelick.com) - ongoing programming and enhancement

## Related Projects

- [just-bangs](https://github.com/thavelick/just-bangs) - The original Python server-based version
