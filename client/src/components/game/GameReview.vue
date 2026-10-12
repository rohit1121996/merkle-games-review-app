<template>
  <article class="game-review">
    <header class="review-header">
      <div class="reviewer-info">
        <strong>{{ review.username }}</strong>
        <div
          class="review-rating"
          role="img"
          :aria-label="`Rated ${review.rating} out of 5`"
        >
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= review.rating }"
            aria-hidden="true"
            >★</span
          >
        </div>
      </div>
    </header>
    <p class="review-text">{{ review.text }}</p>
  </article>
</template>

<script setup lang="ts">
import type { GameReview } from "~/src/types/game";
defineProps({
  review: {
    type: Object as () => GameReview,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;

.game-review {
  background-color: $bg-color;
  padding: $spacing-md;
  border-radius: $border-radius;
  border: 1px solid $border-color;
  margin-bottom: $spacing-md;

  .review-header {
    margin-bottom: $spacing-sm;

    .reviewer-info {
      display: flex;
      justify-content: space-between;
      align-items: center;

      strong {
        color: $text-main;
      }
    }
  }

  .review-rating {
    color: $border-color;
    font-size: $font-size-sm;

    .star.filled {
      color: $warning;
    }
  }

  .review-text {
    color: $text-muted;
    font-size: $font-size-sm;
  }
}
</style>
