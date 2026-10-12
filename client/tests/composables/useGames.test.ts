import { ref } from "vue";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Game, PaginatedGamesResponse } from "~/src/types/game";
import { makeGame } from "../fixtures/game";
import { useGames } from "~/src/composables/useGames";

const makeResponse = (
  games: Game[] = [makeGame()],
): PaginatedGamesResponse => ({
  games,
  pagination: {
    page: 2,
    limit: 12,
    total: 25,
    totalPages: 3,
  },
});

describe("useGames", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("ref", ref);
    vi.stubGlobal("$fetch", fetchMock);
  });

  it("loads a page and updates games and pagination", async () => {
    const response = makeResponse();
    fetchMock.mockResolvedValue(response);
    const store = useGames();

    await expect(store.fetchGames(2)).resolves.toBe(response);

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      params: { page: 2, limit: 12 },
    });
    expect(store.games.value).toEqual(response.games);
    expect(store.pagination.value).toEqual(response.pagination);
    expect(store.error.value).toBeNull();
    expect(store.loading.value).toBe(false);
  });

  it("filters games by genre ID", async () => {
    fetchMock.mockResolvedValue(makeResponse());
    const store = useGames();

    await store.fetchGames(1, 7);

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      params: { page: 1, limit: 12, genre: 7 },
    });
  });

  it("searches games by title while preserving the genre filter", async () => {
    fetchMock.mockResolvedValue(makeResponse());
    const store = useGames();

    await store.fetchGames(1, 7, "  Zelda  ");

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      params: { page: 1, limit: 12, genre: 7, search: "Zelda" },
    });
  });

  it("omits an empty search term", async () => {
    fetchMock.mockResolvedValue(makeResponse());
    const store = useGames();

    await store.fetchGames(1, undefined, "  ");

    expect(fetchMock).toHaveBeenCalledWith("/api/games", {
      params: { page: 1, limit: 12 },
    });
  });

  it("loads genre options", async () => {
    const genres = [{ id: 7, name: "Adventure" }];
    fetchMock.mockResolvedValue(genres);
    const store = useGames();

    await store.fetchGenres();

    expect(fetchMock).toHaveBeenCalledWith("/api/genres");
    expect(store.genres.value).toEqual(genres);
    expect(store.genresError.value).toBeNull();
    expect(store.genresLoading.value).toBe(false);
  });

  it("reports genre loading errors", async () => {
    fetchMock.mockRejectedValue({ statusMessage: "Service unavailable" });
    const store = useGames();

    await store.fetchGenres();

    expect(store.genresError.value).toBe("Service unavailable");
    expect(store.genresLoading.value).toBe(false);
  });

  it("sets loading while a request is pending", async () => {
    let resolveRequest!: (response: PaginatedGamesResponse) => void;
    fetchMock.mockReturnValue(
      new Promise<PaginatedGamesResponse>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const store = useGames();

    const request = store.fetchGames(1);
    expect(store.loading.value).toBe(true);

    resolveRequest(makeResponse());
    await request;

    expect(store.loading.value).toBe(false);
  });

  it("clears an earlier error when starting a new request", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    const store = useGames();
    await store.fetchGames();
    expect(store.error.value).toBe("offline");

    fetchMock.mockResolvedValueOnce(makeResponse());
    await store.fetchGames(2);

    expect(store.error.value).toBeNull();
    expect(store.games.value).toHaveLength(1);
  });

  it("returns an empty response and stores the server status message on failure", async () => {
    fetchMock.mockRejectedValue({ statusMessage: "Service unavailable" });
    const store = useGames();

    const response = await store.fetchGames(3);

    expect(response).toEqual({
      games: [],
      pagination: store.pagination.value,
    });
    expect(store.error.value).toBe("Service unavailable");
    expect(store.loading.value).toBe(false);
  });

  it("uses the error message or a generic message when no status message exists", async () => {
    const store = useGames();
    fetchMock.mockRejectedValueOnce(new Error("Network error"));
    await store.fetchGames();
    expect(store.error.value).toBe("Network error");

    fetchMock.mockRejectedValueOnce({});
    await store.fetchGames();
    expect(store.error.value).toBe("Failed to load games");
  });

  it("fetches game details by ID", async () => {
    const game = makeGame();
    fetchMock.mockResolvedValue(game);
    const store = useGames();

    await expect(store.fetchGameDetails(game.id)).resolves.toBe(game);
    expect(fetchMock).toHaveBeenCalledWith(`/api/games/${game.id}`);
  });
});
