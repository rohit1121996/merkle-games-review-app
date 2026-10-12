<template>
  <div class="loading-state-container" role="status" aria-live="polite">
    <div class="spinner"></div>
    <p>{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  message: {
    type: String,
    default: "Loading...",
  },
});
</script>

<style lang="scss" scoped>
@use "~/assets/scss/variables" as *;
@use "~/assets/scss/mixins" as *;

.loading-state-container {
  @include flex-center;
  flex-direction: column;
  padding: $spacing-xl;
  color: $text-muted;

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid $border-color;
    border-top-color: $primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: $spacing-md;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
