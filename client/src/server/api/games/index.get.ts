import type { Game, PaginatedGamesResponse } from "~/src/types/game";
import {
  formatGameItem,
  type ApiResponse,
  type GameApiItem,
  type GameStats,
} from "../../utils/game";

export default defineEventHandler(
  async (event): Promise<PaginatedGamesResponse> => {
    const config = useRuntimeConfig(event);
    const apiBase = config.gameApiUrl;
    const origin = apiBase.replace("/api/v1", "");
    const { page = 1, limit = 12, genre, search } = getQuery(event);
    try {
      const res = await $fetch<ApiResponse<GameApiItem[]>>(`${apiBase}/games`, {
        params: {
          page,
          limit,
          ...(genre ? { genre } : {}),
          ...(typeof search === "string" && search.trim()
            ? { search: search.trim() }
            : {}),
        },
      });

      const games: Game[] = await Promise.all(
        (res.data || []).map(async (item) => {
          try {
            const stats = await $fetch<ApiResponse<GameStats>>(
              `${apiBase}/games/${item.id}/stats`,
            );
            return formatGameItem({ ...item, ...stats.data }, origin);
          } catch {
            return formatGameItem(item, origin);
          }
        }),
      );

      const meta = res._metadata ?? {};

      return {
        games,
        pagination: {
          page: Number(meta.page || page),
          limit: Number(meta.limit || limit),
          total: Number(meta.total || games.length),
          totalPages: Number(meta.totalPages || 1),
        },
      };
    } catch (err: unknown) {
      throw createError({
        statusCode:
          typeof err === "object" &&
          err !== null &&
          "statusCode" in err &&
          typeof err.statusCode === "number"
            ? err.statusCode
            : 500,
        statusMessage: "Could not load games",
      });
    }
  },
);
