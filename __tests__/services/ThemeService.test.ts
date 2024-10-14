import {
  getCachedTheme,
  setCachedTheme,
} from "../../src/services/ThemeService";
import { ThemeCacheData } from "../../src/types/internal/ThemeCacheData";
import { config } from "../../config";

jest.mock("../../config", () => ({
  config: {
    DEFAULT_URL: "http://localhost:mock",
    DEFAULT_EXPIRATION: "60", // or whatever default you need
    CACHE_KEY_PREFIX: "VITE_THEME_CACHE_KEY_PREFIX", // Mock the prefix here
  },
}));

const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

describe("ThemeService", () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("should cache a theme correctly", () => {
    const themeData: ThemeCacheData = {
      settings: {
        general: {
          primaryColor: 'blue',
        }
      },
      inlineStyles: {
        tooltipStyle: { backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '5px' },
      },
      cssStylesText: ".example { color: red; }",
      cacheDate: Math.floor(Date.now() / 1000),
    };

    const id = "theme1";
    const version = "1.0";
    const cacheKey = `${config.CACHE_KEY_PREFIX}_${id}_${version}`;

    setCachedTheme(
      id,
      version,
      themeData.settings,
      themeData.inlineStyles,
      themeData.cssStylesText
    );

    const cachedTheme = localStorage.getItem(cacheKey);
    expect(cachedTheme).not.toBeNull();
  });

});
