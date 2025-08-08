const { JSDOM } = require('jsdom');

// Set up jsdom HTMLElement globally before importing components
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
global.HTMLElement = dom.window.HTMLElement;

const { SaveMessage } = require("../public_html/search.js");

describe("SaveMessage Component", () => {
  test("can be instantiated", () => {
    const saveMessage = new SaveMessage();
    expect(saveMessage).toBeInstanceOf(SaveMessage);
  });

  test("render method works with real DOM properties", () => {
    const saveMessage = new SaveMessage();
    
    saveMessage.render();
    
    expect(saveMessage.classList.contains('save-message')).toBe(true);
    expect(saveMessage.id).toBe('save-message');
    expect(saveMessage.textContent).toBe('✓ Changes saved automatically');
  });

  test("show and hide methods work", () => {
    const testDom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`);
    const { window } = testDom;
    
    const saveMessage = new SaveMessage();
    saveMessage.setWindow(window);
    
    let timeoutCallback;
    window.setTimeout = jest.fn((callback, delay) => {
      timeoutCallback = callback;
      expect(delay).toBe(2000);
    });
    
    // Test show
    saveMessage.show();
    expect(saveMessage.classList.contains('visible')).toBe(true);
    expect(window.setTimeout).toHaveBeenCalled();
    
    // Execute timeout callback to test hide
    timeoutCallback();
    expect(saveMessage.classList.contains('visible')).toBe(false);
    
    // Test explicit hide
    saveMessage.show(); // make visible first
    saveMessage.hide();
    expect(saveMessage.classList.contains('visible')).toBe(false);
  });
});