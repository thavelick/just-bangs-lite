# Settings Dialog Web Components Refactor Plan

## Overview
Refactor the existing settings dialog from traditional DOM manipulation to modern Web Components architecture. This will improve code organization, maintainability, and reusability while preserving existing functionality and styling.

## File Structure Changes
**Modified Files:**
- `public_html/search.js` - Replace settings functions with web components
- No new files created (following project's single-file approach)

## Current Settings Implementation Analysis
**Existing Functions (lines 226-324):**
- `toggleSettingsPanel()` - Shows/hides settings dialog
- `buildSettingsPanel()` - Builds HTML string for settings content  
- `handleDefaultBangChange()` - Handles radio button changes
- `showSaveMessage()` - Shows temporary save confirmation
- `setupSettingsEventListeners()` - Sets up event delegation
- `initializeSettings()` - Initializes settings on page load

**HTML Structure:**
- Static `.settings-panel` and `.settings-content` divs in index.html
- Dynamic content injected via innerHTML

## New Web Components

### 1. SettingsDialog (Custom Element)
**Function:** `createSettingsDialog(windowObj = window)`
- Extends HTMLElement
- Encapsulates entire settings dialog behavior
- Replaces `buildSettingsPanel()` and `setupSettingsEventListeners()`
- Methods: `show()`, `hide()`, `toggle()`, `render()`

### 2. SettingOption (Custom Element)  
**Function:** `createSettingOption(windowObj = window)`
- Represents individual bang selection row
- Contains bang trigger, URL display, and radio button
- Handles its own change events
- Methods: `setSelected()`, `getValue()`

### 3. SaveMessage (Custom Element)
**Function:** `createSaveMessage(windowObj = window)`
- Shows temporary "saved" confirmation
- Auto-hides after timeout
- Methods: `show()`, `hide()`

## Implementation Strategy

### Phase 1: Create Web Component Base Classes
- Define custom elements following project patterns
- Implement dependency injection for `windowObj`
- Create component registration functions
- Maintain CommonJS exports for Jest compatibility

### Phase 2: Implement Settings Dialog Component
- Convert `buildSettingsPanel()` to component render method
- Move event listeners to component lifecycle methods  
- Preserve existing CSS classes and styling
- Maintain backdrop click and close button behavior

### Phase 3: Implement Child Components
- Convert bang list items to SettingOption components
- Implement SaveMessage component with existing styling
- Ensure radio button grouping works correctly
- Maintain localStorage integration

### Phase 4: Update Integration Points
- Modify `initializeSettings()` to instantiate components
- Update hamburger menu click handler
- Preserve existing API (`toggleSettingsPanel()` wrapper)
- Test component registration and instantiation

## Code Modifications

### Replace Functions:
```javascript
// OLD: String-based HTML building
function buildSettingsPanel(windowObj = window) { ... }

// NEW: Component-based rendering  
class SettingsDialog extends HTMLElement { 
  render() { ... }
}
```

### Maintain API Compatibility:
```javascript
// Keep existing function for backward compatibility
function toggleSettingsPanel(windowObj = window) {
  const dialog = windowObj.document.querySelector('settings-dialog');
  dialog?.toggle();
}
```

### Component Registration:
```javascript  
function registerSettingsComponents(windowObj = window) {
  windowObj.customElements.define('settings-dialog', SettingsDialog);
  windowObj.customElements.define('setting-option', SettingOption);  
  windowObj.customElements.define('save-message', SaveMessage);
}
```

## Testing Strategy

### Unit Tests:
- Mock `windowObj.customElements.define()` calls
- Test component render methods with mock DOM
- Verify event handling with mock event objects
- Test localStorage integration with mock storage
- Ensure CommonJS exports work correctly

### Component Testing:
- Test component instantiation and registration
- Verify component lifecycle methods  
- Test component communication (parent/child)
- Validate HTML output matches existing structure

### Integration Testing:
- Test hamburger menu → dialog interaction
- Verify radio button selection behavior
- Test localStorage persistence
- Confirm backdrop click closing works
- Test keyboard navigation and accessibility

## Implementation Checklist

### Phase 1: Infrastructure
- [x] Create SettingsDialog component class
- [x] Create SettingOption component class  
- [x] Create SaveMessage component class
- [x] Implement component registration function
- [x] Add CommonJS exports for new components

### Phase 2: Core Dialog Component
- [x] Convert buildSettingsPanel() to SettingsDialog.render()
- [x] Move event listeners to component methods
- [x] Implement show/hide/toggle methods
- [x] Test basic dialog functionality

### Phase 3: Child Components  
- [x] Implement SettingOption component rendering
- [x] Add radio button change handling to SettingOption
- [x] Implement SaveMessage auto-hide behavior
- [x] Test component interactions

### Phase 4: Integration
- [x] Update initializeSettings() for components
- [x] Modify HTML template to use custom elements
- [x] Test hamburger menu integration
- [x] Verify localStorage functionality preserved

### Phase 5: Quality Assurance
- [x] Run `make test` - ensure all tests pass
- [x] Run `make check` - verify code style
- [x] Fix CSS grid layout with `display: contents` for custom elements
- [x] Test manual functionality vs original behavior
- [x] Test accessibility features (keyboard nav, screen readers)
- [x] Verify mobile responsive behavior
- [x] Test dark mode styling preservation
- [x] Fix Firefox caching issues and confirm cross-browser compatibility

## Test Coverage Gap (TODO)

**CRITICAL**: The Web Components refactor significantly reduced test coverage for settings functionality.

### Missing Test Coverage:
- **`SettingsDialog`** - HTML generation, show/hide/toggle behavior, localStorage integration
- **`SettingOption`** - Radio button rendering, selection state, change event handling  
- **`SaveMessage`** - Show/hide behavior, timeout functionality, CSS class management
- **`registerSettingsComponents()`** - Component registration and error handling

### OLD vs NEW Coverage:
- **Before**: 7 comprehensive tests covering `buildSettingsPanel()`, `handleDefaultBangChange()`, `setupSettingsEventListeners()`
- **After**: 0 tests for Web Components (requires DOM environment)

### Restoration Plan (Future Work):
1. **Add jsdom Support** - Enable DOM environment for Jest testing
   - Install `jsdom` as dev dependency 
   - Configure Jest to use jsdom test environment
   - Update test configuration in `package.json` or Jest config

2. **Restore Web Component Tests** - Once jsdom is available:
   - Import Web Components in test file
   - Test component rendering and HTML output
   - Test event handling and localStorage integration  
   - Test component lifecycle methods (connectedCallback, etc.)
   - Test error handling and graceful degradation

3. **Verification Steps**:
   - Achieve same or better test coverage than before refactor
   - All tests should pass with DOM APIs available
   - Manual testing should remain unchanged

### Why This Matters:
- Settings dialog is core functionality that must work reliably
- localStorage integration is critical for user preferences
- Event handling bugs could break the entire settings system
- Regression testing is impossible without proper coverage

## Future Maintenance

### New Concepts Introduced:
- **Web Components**: Custom HTML elements with encapsulated behavior
- **Component Lifecycle**: Registration, instantiation, rendering cycle  
- **Event Bubbling**: Components handle their own events vs delegation
- **Declarative HTML**: Components defined in HTML vs JavaScript strings

### Ongoing Considerations:
- New settings features can be added as new components
- Component reusability for potential future dialogs
- Better separation of concerns vs monolithic functions
- **Testing requires DOM environment** - jsdom or similar needed for meaningful Web Component tests