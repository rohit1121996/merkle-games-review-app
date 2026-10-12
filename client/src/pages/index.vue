<template>
  <div class="index-page">
    <form class="search-form" role="search" @submit.prevent="submitSearch">
      <label class="visually-hidden" for="game-search">
        Search games by title
      </label>
      <input
        id="game-search"
        v-model="searchInput"
        type="search"
        placeholder="Search games by title..."
        autocomplete="off"
      />
      <button class="search-button" type="submit" :disabled="loading">
        Search
      </button>
      <button
        v-if="searchInput || appliedSearch"
        class="clear-search-button"
        type="button"
        :disabled="loading"
        @click="clearSearch"
      >
        Clear
      </button>
    </form>

    <div class="filters-container">
      <h2>Featured Games</h2>
      <div class="controls-filters">
        <div class="sort-control-filter">
          <label for="sort-select">Sort by:</label>
          <select id="sort-select" v-model="sortBy">
            <option value="rating">Average Rating (Highest)</option>
            <option value="releaseDate">Release Date (Newest)</option>
          </select>
        </div>
        <div class="genre-control-filter">
          <label for="genre-select">Genre:</label>
          <select
            id="genre-select"
            v-model="selectedGenre"
            :disabled="genresLoading || genres.length === 0"
          >
            <option value="">All genres</option>
            <option v-for="genre in genres" :key="genre.id" :value="genre.id">
              {{ genre.name }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <p v-if="genresError" class="genre-error" role="alert">
      {{ genresError }}
    </p>

    <LoadingState v-if="loading && !games.length" message="Loading games..." />
    <ErrorState
      v-else-if="error && !games.length"
      :message="error"
      :retry="
        () =>
          fetchGames(pagination.page, selectedGenre || undefined, appliedSearch)
      "
    />
    <EmptyState v-else-if="!sortedGames.length" message="No games found." />

    <div v-else>
      <GameGrid>
        <GameCard v-for="game in sortedGames" :key="game.id" :game="game" />
      </GameGrid>
      <nav
        v-if="pagination.totalPages > 1"
        class="pagination"
        aria-label="Games pagination"
      >
        <button
          class="page-btn"
          :disabled="pagination.page <= 1 || loading"
          @click="changePage(pagination.page - 1)"
        >
          &larr; Prev
        </button>
        <span class="page-info">
          Page <strong>{{ pagination.page }}</strong> of
          <strong>{{ pagination.totalPages }}</strong>
        </span>

        <button
          class="page-btn"
          :disabled="pagination.page >= pagination.totalPages || loading"
          @click="changePage(pagination.page + 1)"
        >
          Next &rarr;
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useGames } from "~/src/composables/useGames";
import { sortGames, type SortOption } from "~/src/utils/sorting";
import GameGrid from "~/src/components/game/GameGrid.vue";
import GameCard from "~/src/components/game/GameCard.vue";
import LoadingState from "~/src/components/common/LoadingState.vue";
import ErrorState from "~/src/components/common/ErrorState.vue";
import EmptyState from "~/src/components/common/EmptyState.vue";

const {
  games,
  pagination,
  loading,
  error,
  genres,
  genresLoading,
  genresError,
  fetchGames,
  fetchGenres,
} = useGames();
const sortBy = ref<SortOption>("rating");
const selectedGenre = ref<number | "">("");
const searchInput = ref("");
const appliedSearch = ref("");

await Promise.all([fetchGames(pagination.value.page), fetchGenres()]);

const sortedGames = computed(() => {
  return sortGames(games.value, sortBy.value);
});

const changePage = async (page: number) => {
  await fetchGames(page, selectedGenre.value || undefined, appliedSearch.value);
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

watch(selectedGenre, () => {
  void fetchGames(1, selectedGenre.value || undefined, appliedSearch.value);
});

const submitSearch = () => {
  appliedSearch.value = searchInput.value.trim();
  void fetchGames(1, selectedGenre.value || undefined, appliedSearch.value);
};

const clearSearch = () => {
  searchInput.value = "";
  appliedSearch.value = "";
  void fetchGames(1, selectedGenre.value || undefined);
};
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.index-page {
  .search-form {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    max-width: 42rem;
    margin: 0 auto $spacing-xl;
    padding: $spacing-sm;
    background-color: $card-bg;
    border: 1px solid $border-color;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow;

    input {
      flex: 1;
      min-width: 0;
      padding: $spacing-sm $spacing-md;
      color: $text-main;
      background: transparent;
      border: 0;
      font: inherit;

      &:focus-visible {
        outline: 2px solid $primary;
        outline-offset: 2px;
      }
    }

    .search-button,
    .clear-search-button {
      padding: $spacing-sm $spacing-md;
      border: 1px solid transparent;
      border-radius: calc($border-radius - 0.125rem);
      font: inherit;
      font-weight: 600;
      cursor: pointer;
      transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .search-button {
      color: var(--color-on-primary);
      background-color: $primary;

      &:hover:not(:disabled) {
        background-color: $primary-hover;
      }
    }

    .clear-search-button {
      color: $text-muted;
      background-color: transparent;
      border-color: $border-color;

      &:hover:not(:disabled) {
        color: $text-main;
        border-color: $primary;
      }
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .filters-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-xl;
    flex-wrap: wrap;
    gap: $spacing-md;
    h2 {
      font-size: $font-size-xl;
      font-size: $font-size-xl;
      font-weight: 700;
      color: $text-main;
    }
    .controls-filters {
      display: flex;
      gap: $spacing-md;
      flex-wrap: wrap;

      .sort-control-filter,
      .genre-control-filter {
        display: flex;
        align-items: center;
        gap: $spacing-md;
        padding: $spacing-sm $spacing-md;
        background-color: $card-bg;
        border: 1px solid $border-color;
        border-radius: $border-radius;
        box-shadow: $box-shadow;

        label {
          font-size: $font-size-sm;
          font-weight: 600;
          color: $text-muted;
          white-space: nowrap;
        }

        @media (max-width: $screen-sm) {
          .search-form {
            align-items: stretch;

            .search-button,
            .clear-search-button {
              padding-inline: $spacing-sm;
            }
          }
        }

        select {
          min-width: 12rem;
          padding: $spacing-sm 2rem $spacing-sm $spacing-md;
          border: 1px solid $border-color;
          border-radius: calc($border-radius - 0.125rem);
          font-family: inherit;
          font-size: $font-size-sm;
          background-color: $bg-color;
          color: $text-main;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;

          &:hover {
            border-color: $primary;
          }

          &:focus-visible {
            border-color: $primary;
            outline: 2px solid color-mix(in srgb, $primary 25%, transparent);
            outline-offset: 2px;
          }
        }
      }

      @media (max-width: $screen-sm) {
        align-items: stretch;
        .sort-control-filter,
        .genre-control-filter {
          justify-content: space-between;
          width: 100%;
          select {
            min-width: 0;
            flex: 1;
          }
        }
      }
    }
  }

  .genre-error {
    margin: -$spacing-md 0 $spacing-lg;
    color: $danger;
    font-size: $font-size-sm;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: $spacing-md;
    margin-top: $spacing-xxl;
    padding: $spacing-md 0;

    .page-btn {
      padding: $spacing-sm $spacing-lg;
      background-color: $card-bg;
      border: 1px solid $border-color;
      border-radius: $border-radius;
      color: $text-main;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        border-color: $primary;
        color: $primary;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-info {
      font-size: $font-size-sm;
      color: $text-muted;

      strong {
        color: $text-main;
      }
    }
  }
}
</style>
