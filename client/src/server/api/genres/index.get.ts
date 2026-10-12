import type { GenreOption } from "~/src/types/game";
import { getErrorStatusCode } from "~/src/utils/error";
import type { ApiResponse } from "../../utils/game";

export default defineEventHandler(async (event): Promise<GenreOption[]> => {
  const config = useRuntimeConfig(event);
  const apiBase = String(config.gameApiUrl || "http://localhost:8000/api/v1");

  try {
    const response = await $fetch<ApiResponse<GenreOption[]>>(
      `${apiBase}/genres`,
    );
    return response.data.map(({ id, name }) => ({ id, name }));
  } catch (error: unknown) {
    throw createError({
      statusCode: getErrorStatusCode(error) || 500,
      statusMessage: "Could not load genres",
    });
  }
});
