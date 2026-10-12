import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type EventHandler = (event: Record<string, unknown>) => Promise<unknown>;

let getGames: EventHandler;
let getGame: EventHandler;

beforeAll(async () => {
  getGames = (await import("~/src/server/api/games/index.get"))
    .default as EventHandler;
  getGame = (await import("~/src/server/api/games/[id].get"))
    .default as EventHandler;
});

const makeHttpError = (options: {
  statusCode: number;
  statusMessage: string;
}) =>
  Object.assign(new Error(options.statusMessage), {
    statusCode: options.statusCode,
    statusMessage: options.statusMessage,
  });

describe("games API handlers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let runtimeConfigMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    runtimeConfigMock = vi.fn(() => ({
      gameApiUrl: "https://api.example/api/v1",
    }));
    vi.stubGlobal("$fetch", fetchMock);
    vi.stubGlobal("useRuntimeConfig", runtimeConfigMock);
    vi.stubGlobal(
      "getQuery",
      vi.fn(() => ({ page: "2", limit: "5" })),
    );
    vi.stubGlobal(
      "getRouterParam",
      vi.fn((_event: unknown, name: string) =>
        name === "id" ? "42" : undefined,
      ),
    );
    vi.stubGlobal("createError", vi.fn(makeHttpError));
  });

  describe("GET /api/games", () => {
    it("maps backend games, adds stats, and returns pagination", async () => {
      fetchMock
        .mockResolvedValueOnce({
          data: [
            {
              id: 42,
              title: "Example",
              release_date: "2024-04-01",
              images: [{ image_type: "Cover", image_url: "/cover.jpg" }],
            },
          ],
          _metadata: { page: 2, limit: 5, total: 6, totalPages: 2 },
        })
        .mockResolvedValueOnce({
          data: { average_rating: 4.5, total_reviews: 4 },
        });

      const response = await getGames({});

      expect(fetchMock).toHaveBeenNthCalledWith(
        1,
        "https://api.example/api/v1/games",
        { params: { page: "2", limit: "5" } },
      );
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "https://api.example/api/v1/games/42/stats",
      );
      expect(response).toEqual({
        games: [
          expect.objectContaining({
            id: "42",
            image: "https://api.example/cover.jpg",
            rating: { average: 4.5, count: 4 },
          }),
        ],
        pagination: { page: 2, limit: 5, total: 6, totalPages: 2 },
      });
    });

    it("forwards the selected genre ID to the backend", async () => {
      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({ page: "1", limit: "12", genre: "7" })),
      );
      fetchMock.mockResolvedValueOnce({ data: [], _metadata: {} });

      await getGames({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games",
        { params: { page: "1", limit: "12", genre: "7" } },
      );
    });

    it("forwards a trimmed search term with the selected genre", async () => {
      vi.stubGlobal(
        "getQuery",
        vi.fn(() => ({
          page: "1",
          limit: "12",
          genre: "7",
          search: "  Zelda  ",
        })),
      );
      fetchMock.mockResolvedValueOnce({ data: [], _metadata: {} });

      await getGames({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games",
        {
          params: { page: "1", limit: "12", genre: "7", search: "Zelda" },
        },
      );
    });

    it("uses game review data when an individual stats request fails", async () => {
      fetchMock
        .mockResolvedValueOnce({
          data: [
            {
              id: 8,
              title: "Reviewed",
              release_date: "2023-03-12",
              reviews: [
                { id: 1, rating: 4 },
                { id: 2, rating: 5 },
              ],
            },
          ],
          _metadata: { page: 1, limit: 12, total: 1, totalPages: 1 },
        })
        .mockRejectedValueOnce(new Error("Stats unavailable"));

      const response = await getGames({});

      expect(response).toEqual(
        expect.objectContaining({
          games: [
            expect.objectContaining({
              id: "8",
              rating: { count: 2, average: 4.5 },
            }),
          ],
        }),
      );
    });

    it("returns an empty page when the backend has no games", async () => {
      fetchMock.mockResolvedValueOnce({ data: [], _metadata: {} });

      const response = await getGames({});

      expect(response).toEqual({
        games: [],
        pagination: { page: 2, limit: 5, total: 0, totalPages: 1 },
      });
    });

    it("converts a backend failure into a 500-level API error", async () => {
      fetchMock.mockRejectedValue(new Error("Connection refused"));

      await expect(getGames({})).rejects.toMatchObject({
        statusCode: 500,
        statusMessage: "Could not load games",
      });
    });
  });

  describe("GET /api/games/:id", () => {
    it("maps and returns one game", async () => {
      fetchMock.mockResolvedValueOnce({
        data: {
          id: 42,
          title: "Example",
          release_date: "2024-04-01",
        },
      });

      const response = await getGame({});

      expect(fetchMock).toHaveBeenCalledWith(
        "https://api.example/api/v1/games/42",
      );
      expect(response).toEqual(
        expect.objectContaining({
          id: "42",
          title: "Example",
          rating: { count: 0, average: 0 },
        }),
      );
    });

    it("rejects a request without a game ID", async () => {
      vi.stubGlobal(
        "getRouterParam",
        vi.fn(() => undefined),
      );

      await expect(getGame({})).rejects.toMatchObject({
        statusCode: 400,
        statusMessage: "Game ID is required",
      });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("preserves the upstream status code for a failed game request", async () => {
      fetchMock.mockRejectedValue(
        Object.assign(new Error("Not found"), { statusCode: 404 }),
      );

      await expect(getGame({})).rejects.toMatchObject({
        statusCode: 404,
        statusMessage: "Game #42 not found",
      });
    });
  });
});
