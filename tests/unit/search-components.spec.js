import { describe, expect, test, mock, beforeAll } from "bun:test";

const {
  SaveMessage,
  SettingsDialog,
  SettingOption,
} = require("../../public_html/search.js");

describe("Web Components", () => {
  beforeAll(() => {
    // Register all components once for all tests
    customElements.define("save-message", SaveMessage);
    customElements.define("settings-dialog", SettingsDialog);
    customElements.define("setting-option", SettingOption);
  });
  describe("SaveMessage", () => {
    test("renders with correct class, id, and text content", () => {
      document.body.innerHTML = "<save-message></save-message>";

      const saveMessage = document.querySelector("save-message");
      expect(saveMessage?.classList.contains("save-message")).toBe(true);
      expect(saveMessage?.id).toBe("save-message");
      expect(saveMessage?.textContent).toBe("✓ Changes saved automatically");
    });
  });

  describe("SettingsDialog", () => {
    test("renders with correct structure and content", () => {
      document.body.innerHTML = "<settings-dialog></settings-dialog>";

      const settingsDialog = document.querySelector("settings-dialog");
      
      const header = settingsDialog?.querySelector(".settings-header");
      expect(header).toBeTruthy();
      
      const closeButton = settingsDialog?.querySelector(".close-button");
      expect(closeButton).toBeTruthy();
      expect(closeButton?.textContent).toBe("×");
      
      const saveMessage = settingsDialog?.querySelector("save-message");
      expect(saveMessage).toBeTruthy();
      
      const body = settingsDialog?.querySelector(".settings-body");
      expect(body).toBeTruthy();
      
      const bangList = settingsDialog?.querySelector(".bang-list");
      expect(bangList).toBeTruthy();
    });

    test("handles bang selection with localStorage", () => {
      const mockStorage = {
        getItem: () => "d", // default bang
        setItem: mock(),
      };
      const mockWindow = {
        localStorage: mockStorage,
        customElements: {
          define: () => {},
        },
      };

      document.body.innerHTML = "<settings-dialog></settings-dialog>";

      const settingsDialog = document.querySelector("settings-dialog");
      settingsDialog.setWindow(mockWindow);
      settingsDialog.render();

      const googleOption = settingsDialog.querySelector('setting-option[bang-key="g"]');
      expect(googleOption).toBeTruthy();
      
      googleOption.setWindow(mockWindow);
      googleOption.connectedCallback(); // Manually trigger render
      
      const googleRadio = googleOption.querySelector('input[value="g"]');
      expect(googleRadio).toBeTruthy();
      
      googleRadio.checked = true;
      googleRadio.dispatchEvent(new Event("change", { bubbles: true }));

      expect(mockStorage.setItem).toHaveBeenCalledWith("default-bang", "g");
    });
  });

  describe("SettingOption", () => {
    test("renders with correct structure and attributes", () => {
      document.body.innerHTML = `<setting-option bang-key="g" bang-url="https://www.google.com/search?q={{{s}}}" bang-description="Google Search"></setting-option>`;

      const settingOption = document.querySelector("setting-option");
      settingOption.connectedCallback(); // Manually trigger render

      const settingRow = settingOption.querySelector(".setting-row");
      expect(settingRow).toBeTruthy();

      const bangTrigger = settingOption.querySelector(".bang-trigger");
      expect(bangTrigger).toBeTruthy();
      expect(bangTrigger.textContent).toBe("g!");

      const bangDescription = settingOption.querySelector(".bang-description");
      expect(bangDescription).toBeTruthy();
      expect(bangDescription.textContent).toBe("Google Search");
      expect(bangDescription.title).toBe("https://www.google.com/search?q={{{s}}}");

      const radio = settingOption.querySelector('input[type="radio"]');
      expect(radio).toBeTruthy();
      expect(radio.name).toBe("default-bang");
      expect(radio.value).toBe("g");
      expect(radio.checked).toBe(false);
    });

    test("handles selected attribute and change events", () => {
      const mockStorage = {
        setItem: mock(),
      };
      const mockWindow = {
        localStorage: mockStorage,
      };

      document.body.innerHTML = `<setting-option bang-key="w" bang-url="https://en.wikipedia.org/wiki/Special:Search?search={{{s}}}" bang-description="Wikipedia" selected></setting-option>`;

      const settingOption = document.querySelector("setting-option");
      settingOption.setWindow(mockWindow);
      settingOption.connectedCallback(); // Manually trigger render

      const radio = settingOption.querySelector('input[type="radio"]');
      expect(radio.checked).toBe(true);

      radio.checked = false;
      radio.dispatchEvent(new Event("change", { bubbles: true }));

      radio.checked = true;
      radio.dispatchEvent(new Event("change", { bubbles: true }));

      expect(mockStorage.setItem).toHaveBeenCalledWith("default-bang", "w");
    });
  });
});
