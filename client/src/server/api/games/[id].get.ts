import type { Game } from "~/src/types/game";
import { getErrorStatusCode } from "~/src/utils/error";
import {
  formatGameItem,
  type ApiResponse,
  type GameApiItem,
} from "../../utils/game";

export default defineEventHandler(async (event): Promise<Game> => {
  const config = useRuntimeConfig(event);
  const apiBase = config.gameApiUrl;
  const origin = apiBase.replace("/api/v1", "");

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Game ID is required",
    });
  }

  try {
    const res = await $fetch<ApiResponse<GameApiItem>>(
      `${apiBase}/games/${id}`,
    );
    return formatGameItem(res.data, origin);
  } catch (error: unknown) {
    throw createError({
      statusCode: getErrorStatusCode(error) || 404,
      statusMessage: `Game #${id} not found`,
    });
  }
});
