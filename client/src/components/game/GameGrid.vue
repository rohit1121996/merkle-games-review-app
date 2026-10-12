<template>
  <div class="game-grid-container">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.game-grid-container {
  @include responsive-grid(280px, $spacing-xl);
}
</style>
