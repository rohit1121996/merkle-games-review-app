<template>
  <div
    class="game-rating-container"
    role="img"
    :aria-label="`Average rating ${rating.average} out of 5 from ${rating.count} reviews`"
  >
    <div class="stars" aria-hidden="true">
      <span
        v-for="i in 5"
        :key="i"
        class="star"
        :class="{ filled: i <= Math.round(rating.average) }"
        >★</span
      >
    </div>
    <span class="rating-text">
      <strong>{{ rating.average }}</strong> ({{ rating.count }})
    </span>
  </div>
</template>

<script setup lang="ts">
import type { GameRating } from "~/src/types/game";

defineProps({
  rating: {
    type: Object as () => GameRating,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-rating-container {
  @include flex-center;
  justify-content: flex-start;
  gap: $spacing-xs;
  font-size: $font-size-sm;
  color: $text-muted;

  .stars {
    color: $border-color;

    .star.filled {
      color: $warning;
    }
  }

  strong {
    color: $text-main;
  }
}
</style>
