import { afterEach, vi } from "vitest";

vi.stubGlobal("defineEventHandler", (handler: unknown) => handler);

afterEach(() => {
  vi.unstubAllGlobals();
});
