<template>
  <NuxtLink :to="`/games/${game.id}`" class="game-card">
    <article>
      <div class="image-container">
        <GameImage :src="game.image" :alt="`${game.title}`" />
      </div>
      <div class="content">
        <h3 class="title">{{ game.title }}</h3>
        <p class="release-date">{{ formatDate(game.releaseDate) }}</p>
        <div class="meta-data">
          <GameRating :rating="game.rating" />
        </div>
        <GameGenres :genres="game.genres" class="genres" />
      </div>
    </article>
  </NuxtLink>
</template>

<script setup lang="ts">
import type { Game } from "~/src/types/game";
import { formatDate } from "~/src/utils/date";
import GameImage from "~/src/components/common/GameImage.vue";
import GameRating from "~/src/components/game/GameRating.vue";
import GameGenres from "~/src/components/game/GameGenres.vue";

defineProps({
  game: {
    type: Object as () => Game,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-card {
  display: block;
  background-color: $card-bg;
  border-radius: $border-radius-lg;
  overflow: hidden;
  box-shadow: $box-shadow;
  text-decoration: none;
  color: inherit;
  @include transition(transform, box-shadow);

  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-hover;
    text-decoration: none;
  }

  .image-container {
    height: 200px;
    width: 100%;
  }

  .content {
    padding: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;

    .title {
      font-size: $font-size-lg;
      color: $text-main;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .release-date {
      font-size: $font-size-sm;
      color: $text-muted;
      margin: 0;
    }

    .meta-data {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .genres {
      margin-top: auto;
    }
  }
}
</style>
