import { describe, expect, test } from "bun:test";

const {
  SaveMessage,
  SettingsDialog,
  SettingOption,
} = require("../../public_html/search.js");

describe("Web Components", () => {
  describe("SaveMessage", () => {
    test("renders with correct class, id, and text content", () => {
      // Register the custom element
      customElements.define("save-message", SaveMessage);

      document.body.innerHTML = "<save-message></save-message>";

      const saveMessage = document.querySelector("save-message");
      expect(saveMessage?.classList.contains("save-message")).toBe(true);
      expect(saveMessage?.id).toBe("save-message");
      expect(saveMessage?.textContent).toBe("✓ Changes saved automatically");
    });
  });

  // TODO: Add SettingsDialog tests
  // TODO: Add SettingOption tests
});
