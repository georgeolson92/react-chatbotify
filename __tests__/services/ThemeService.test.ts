import {
  getCachedTheme,
  setCachedTheme,
} from "../../src/services/ThemeService";
import { ThemeCacheData } from "../../src/types/internal/ThemeCacheData";
import { viteConfig } from "../../viteconfig";

jest.mock("../../viteconfig", () => ({
  viteConfig: {
    DEFAULT_URL: "http://localhost:mock",
    DEFAULT_EXPIRATION: "60",
    CACHE_KEY_PREFIX: "VITE_THEME_CACHE_KEY_PREFIX",
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
    const cacheKey = `${viteConfig.CACHE_KEY_PREFIX}_${id}_${version}`;

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

  test("should retrieve cached theme before expiration", () => {
    const themeData: ThemeCacheData = {
      settings: {},
      inlineStyles: {},
      cssStylesText: ".example { color: red; }",
      cacheDate: Math.floor(Date.now() / 1000),
    };

    const id = "theme1";
    const version = "1.0";
    const cacheDuration = 60;

    setCachedTheme(
      id,
      version,
      themeData.settings,
      themeData.inlineStyles,
      themeData.cssStylesText
    );

    const cachedTheme = getCachedTheme(id, version, cacheDuration);
    expect(cachedTheme).not.toBeNull();
    expect(cachedTheme?.cssStylesText).toBe(themeData.cssStylesText);
  });

  test("should handle invalid JSON in cache", () => {
    const id = "theme1";
    const version = "1.0";
    const cacheKey = `${viteConfig.CACHE_KEY_PREFIX}_${id}_${version}`;
  
    localStorage.setItem(cacheKey, "invalid json");
  
    const cachedTheme = getCachedTheme(id, version, 60);
    expect(cachedTheme).toBeNull();
  });
  
  test("should cache theme with the correct key", () => {
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
    const cacheKey = `${viteConfig.CACHE_KEY_PREFIX}_${id}_${version}`;
  
    setCachedTheme(
      id,
      version,
      themeData.settings,
      themeData.inlineStyles,
      themeData.cssStylesText
    );
  
    const cachedTheme = localStorage.getItem(cacheKey);
    expect(cachedTheme).not.toBeNull();
    
    expect(cachedTheme).toBe(JSON.stringify(themeData)); 
  });
  
  test("should cache theme with different versions separately", () => {
    const themeDataV1: ThemeCacheData = {
      settings: {},
      inlineStyles: {},
      cssStylesText: ".example { color: red; }",
      cacheDate: Math.floor(Date.now() / 1000),
    };
  
    const themeDataV2: ThemeCacheData = {
      settings: {},
      inlineStyles: {},
      cssStylesText: ".example { color: blue; }",
      cacheDate: Math.floor(Date.now() / 1000),
    };
  
    const id = "theme1";
    const version1 = "1.0";
    const version2 = "2.0";
  
    setCachedTheme(id, version1, themeDataV1.settings, themeDataV1.inlineStyles, themeDataV1.cssStylesText);
    setCachedTheme(id, version2, themeDataV2.settings, themeDataV2.inlineStyles, themeDataV2.cssStylesText);
  
    const cachedThemeV1 = getCachedTheme(id, version1, 60);
    const cachedThemeV2 = getCachedTheme(id, version2, 60);
  
    expect(cachedThemeV1?.cssStylesText).toBe(themeDataV1.cssStylesText);
    expect(cachedThemeV2?.cssStylesText).toBe(themeDataV2.cssStylesText);
    expect(cachedThemeV1?.cssStylesText).not.toBe(cachedThemeV2?.cssStylesText); // Ensure they are different
  });
  

});
