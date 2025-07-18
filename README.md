# Just Bangs Lite

A lightweight, client-side search tool with bang shortcuts. This JavaScript version of [just-bangs](https://github.com/thavelick/just-bangs) runs entirely in the browser with no server dependencies.

## Features

- **Client-side only**: No server required - works from any web server or locally
- **Bang shortcuts**: Use `query gh!` syntax for quick searches
- **Browser integration**: Add as a search engine with query parameter support
- **Back button support**: Search terms persist when navigating back
- **Responsive design**: Clean interface that works on desktop and mobile

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
- `gh!` → GitHub
- `w!` → Wikipedia
- `a!` → Amazon
- `pypi!` → PyPI

**Specialized:**

- `al!` → Arch Linux docs
- `cl!` → Craigslist
- `e!` → eBay
- `jw!` → JustWatch
- `k!` → Kiwix
- `lg!` → Library Genesis
- `lgf!` → Library Genesis Fiction
- `m!` → Marginalia Search
- `py!` → Python docs
- `sg!` → StoryGraph
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

The entire application is contained in a single HTML file with embedded CSS and JavaScript. No build process or dependencies required.

## License

GNU Affero General Public License v3.0 - same as the original just-bangs project.

## Related Projects

- [just-bangs](https://github.com/thavelick/just-bangs) - The original Python server-based version
