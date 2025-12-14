import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

describe("getSiteUrl", () => {
  const originalWindow = global.window;
  const originalEnv = process.env;
  const g = globalThis as any;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
  });

  it("should return NEXT_PUBLIC_SITE_URL if set", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://custom-domain.com";

    // Remove window to simulate server-side
    delete g.window;

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("https://custom-domain.com");
  });

  it("should return production URL for non-localhost origins", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    // Mock window.location
    g.window = {
      location: {
        origin: "https://docuflow-azure.vercel.app",
      },
    };

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("https://docuflow-azure.vercel.app");
  });

  it("should return localhost for development environment", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    // Mock window.location for localhost
    g.window = {
      location: {
        origin: "http://localhost:3000",
      },
    };

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("should return localhost for 127.0.0.1", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    g.window = {
      location: {
        origin: "http://127.0.0.1:3000",
      },
    };

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("http://127.0.0.1:3000");
  });

  it("should return production URL as fallback on server-side", async () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;

    delete g.window;

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("https://docuflow-azure.vercel.app");
  });

  it("should prioritize env variable over window.location", async () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://env-domain.com";

    g.window = {
      location: {
        origin: "https://different-domain.com",
      },
    };

    const { getSiteUrl } = await import("../lib/getSiteUrl");
    expect(getSiteUrl()).toBe("https://env-domain.com");
  });
});

