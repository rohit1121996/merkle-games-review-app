import type {
  Game,
  GenreOption,
  PaginationInfo,
  PaginatedGamesResponse,
} from "~/src/types/game";
import { getErrorMessage } from "~/src/utils/error";

export const useGames = () => {
  const games = ref<Game[]>([]);
  const pagination = ref<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });
  const loading = ref(false);
  const error = ref<string | null>(null);
  const genres = ref<GenreOption[]>([]);
  const genresLoading = ref(false);
  const genresError = ref<string | null>(null);

  const fetchGames = async (
    page = 1,
    genreId?: number,
    searchTerm?: string,
  ) => {
    loading.value = true;
    error.value = null;
    try {
      const search = searchTerm?.trim();
      const data = await $fetch<PaginatedGamesResponse>("/api/games", {
        params: {
          page,
          limit: 12,
          ...(genreId ? { genre: genreId } : {}),
          ...(search ? { search } : {}),
        },
      });
      games.value = data.games;
      pagination.value = data.pagination;
      return data;
    } catch (err: unknown) {
      error.value = getErrorMessage(err) || "Failed to load games";
      return { games: [], pagination: pagination.value };
    } finally {
      loading.value = false;
    }
  };

  const fetchGenres = async () => {
    genresLoading.value = true;
    genresError.value = null;
    try {
      genres.value = await $fetch<GenreOption[]>("/api/genres");
    } catch (err: unknown) {
      genresError.value = getErrorMessage(err) || "Failed to load genres";
    } finally {
      genresLoading.value = false;
    }
  };

  const fetchGameDetails = async (id: string): Promise<Game> => {
    return await $fetch<Game>(`/api/games/${id}`);
  };

  return {
    games,
    pagination,
    loading,
    error,
    genres,
    genresLoading,
    genresError,
    fetchGames,
    fetchGenres,
    fetchGameDetails,
  };
};
